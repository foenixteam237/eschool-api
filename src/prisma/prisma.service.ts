import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnected = false;
  private readonly inMemoryStore: Map<string, Map<string, any>> = new Map();

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    super(dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined);
    this.initializeInMemorySeed();

    // Wrap the service in a Proxy to seamlessly fallback to in-memory store if DB is offline
    return new Proxy(this, {
      get: (target: any, prop: string | symbol) => {
        if (typeof prop === 'string' && prop in target) {
          const original = target[prop];
          if (typeof original === 'function') {
            return (...args: any[]) => {
              try {
                const result = original.apply(target, args);
                if (result && typeof result.catch === 'function') {
                  return result.catch((err: any) => {
                    if (this.isConnectionError(err)) {
                      return this.handleMockOperation(prop, args[0]);
                    }
                    throw err;
                  });
                }
                return result;
              } catch (err: any) {
                if (this.isConnectionError(err)) {
                  return this.handleMockOperation(prop, args[0]);
                }
                throw err;
              }
            };
          }
          if (typeof original === 'object' && original !== null) {
            return this.createModelProxy(prop, original);
          }
          return original;
        }

        if (typeof prop === 'string' && !prop.startsWith('$')) {
          return this.createModelProxy(prop, null);
        }

        return target[prop];
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('Database connected successfully');
    } catch (error: any) {
      this.isConnected = false;
      this.logger.warn(
        `[AI Studio] Database offline (${error.message?.slice(0, 80)}...) — in-memory mock active`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      try {
        await this.$disconnect();
      } catch {
        // ignore disconnect errors
      }
    }
  }

  private isConnectionError(err: any): boolean {
    if (!err) return false;
    const msg = String(err.message || err);
    return (
      !this.isConnected ||
      msg.includes("Can't reach database server") ||
      msg.includes('Connection refused') ||
      msg.includes('connection error') ||
      msg.includes('ECONNREFUSED')
    );
  }

  private createModelProxy(modelName: string, originalModel: any) {
    return new Proxy(originalModel || {}, {
      get: (_target: any, method: string) => {
        if (!this.isConnected || !originalModel || !originalModel[method]) {
          return async (args: any) => this.handleMockModelCall(modelName, method, args);
        }

        return async (args: any) => {
          try {
            return await originalModel[method](args);
          } catch (err: any) {
            if (this.isConnectionError(err)) {
              return await this.handleMockModelCall(modelName, method, args);
            }
            throw err;
          }
        };
      },
    });
  }

  private async handleMockOperation(prop: string, ..._args: any[]) {
    void _args;
    this.logger.warn(`Fallback execution for: ${prop}`);
    return null;
  }

  private getTable(modelName: string): Map<string, any> {
    const key = modelName.toLowerCase();
    if (!this.inMemoryStore.has(key)) {
      this.inMemoryStore.set(key, new Map());
    }
    return this.inMemoryStore.get(key)!;
  }

  private async handleMockModelCall(
    modelName: string,
    method: string,
    args: any = {},
  ): Promise<any> {
    const table = this.getTable(modelName);

    switch (method) {
      case 'findMany': {
        let items = Array.from(table.values());
        if (args?.where) {
          items = items.filter((item) => this.matchFilter(item, args.where));
        }
        if (args?.skip) {
          items = items.slice(args.skip);
        }
        if (args?.take) {
          items = items.slice(0, args.take);
        }
        return items.map((item) => this.expandRelations(modelName, item, args?.include));
      }

      case 'findUnique':
      case 'findFirst': {
        const items = Array.from(table.values());
        let item = null;
        if (args?.where) {
          if (args.where.id && table.has(args.where.id)) {
            item = table.get(args.where.id);
          } else {
            item = items.find((i) => this.matchFilter(i, args.where)) || null;
          }
        } else {
          item = items[0] || null;
        }
        return item ? this.expandRelations(modelName, item, args?.include) : null;
      }

      case 'create': {
        const id =
          args?.data?.id || `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newItem = {
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...args?.data,
        };

        if (args?.data?.user?.create) {
          const userTable = this.getTable('user');
          const userId = `usr_${Date.now()}`;
          const rawPass = args.data.user.create.password || 'password123';
          const hashedPassword = bcrypt.hashSync(rawPass, 10);
          const newUser = {
            id: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...args.data.user.create,
            password: hashedPassword,
          };
          userTable.set(userId, newUser);
          newItem.userId = userId;
          delete newItem.user;
        }

        table.set(id, newItem);
        return this.expandRelations(modelName, newItem, args?.include);
      }

      case 'update': {
        const existing = args?.where?.id ? table.get(args.where.id) : null;
        if (!existing) {
          const items = Array.from(table.values());
          const found = items.find((i) => this.matchFilter(i, args?.where));
          if (!found) return null;
          const updated = { ...found, ...args?.data, updatedAt: new Date() };
          table.set(found.id, updated);
          return this.expandRelations(modelName, updated, args?.include);
        }
        const updated = { ...existing, ...args?.data, updatedAt: new Date() };
        table.set(existing.id, updated);
        return this.expandRelations(modelName, updated, args?.include);
      }

      case 'delete': {
        const item = args?.where?.id ? table.get(args.where.id) : null;
        if (item) {
          table.delete(item.id);
          return item;
        }
        return { id: args?.where?.id || 'deleted' };
      }

      case 'count': {
        let items = Array.from(table.values());
        if (args?.where) {
          items = items.filter((item) => this.matchFilter(item, args.where));
        }
        return items.length;
      }

      case 'upsert': {
        const existing = await this.handleMockModelCall(modelName, 'findFirst', {
          where: args?.where,
        });
        if (existing) {
          return this.handleMockModelCall(modelName, 'update', {
            where: { id: existing.id },
            data: args.update,
          });
        }
        return this.handleMockModelCall(modelName, 'create', { data: args.create });
      }

      default:
        return null;
    }
  }

  private matchFilter(item: any, where: any): boolean {
    if (!where || typeof where !== 'object') return true;
    for (const [key, filter] of Object.entries(where)) {
      if (filter === undefined) continue;
      const value = item[key];
      if (typeof filter === 'object' && filter !== null) {
        if ('in' in filter && Array.isArray((filter as any).in)) {
          if (!(filter as any).in.includes(value)) return false;
        } else if ('gte' in filter || 'lte' in filter) {
          const dVal = new Date(value).getTime();
          if ((filter as any).gte && dVal < new Date((filter as any).gte).getTime()) return false;
          if ((filter as any).lte && dVal > new Date((filter as any).lte).getTime()) return false;
        } else if ('id' in filter) {
          if (value !== (filter as any).id && item[key + 'Id'] !== (filter as any).id) return false;
        }
      } else {
        if (value !== filter) return false;
      }
    }
    return true;
  }

  private expandRelations(modelName: string, item: any, include: any): any {
    if (!include || typeof include !== 'object') return { ...item };
    const expanded = { ...item };

    if (include.user && item.userId) {
      expanded.user = this.getTable('user').get(item.userId) || null;
    }
    if (include.student && item.studentId) {
      expanded.student = this.getTable('student').get(item.studentId) || null;
      if (expanded.student?.userId) {
        expanded.student.user = this.getTable('user').get(expanded.student.userId) || null;
      }
    }
    if (include.teacher && item.teacherId) {
      expanded.teacher = this.getTable('teacher').get(item.teacherId) || null;
      if (expanded.teacher?.userId) {
        expanded.teacher.user = this.getTable('user').get(expanded.teacher.userId) || null;
      }
    }
    if (include.class && item.classId) {
      expanded.class = this.getTable('class').get(item.classId) || null;
    }
    if (include.subject && item.subjectId) {
      expanded.subject = this.getTable('subject').get(item.subjectId) || null;
    }
    if (include.classes && (modelName === 'school' || modelName === 'schoolyear')) {
      const allClasses = Array.from(this.getTable('class').values());
      expanded.classes = allClasses.filter(
        (c) => c.schoolId === item.id || c.schoolYearId === item.id,
      );
    }
    if (include.teachers && modelName === 'school') {
      const allTeachers = Array.from(this.getTable('teacher').values());
      expanded.teachers = allTeachers.filter((t) => t.schoolId === item.id);
    }
    if (include.students && modelName === 'school') {
      const allStudents = Array.from(this.getTable('student').values());
      expanded.students = allStudents.filter((s) => s.schoolId === item.id);
    }
    if (include.students && modelName === 'class') {
      const allStudents = Array.from(this.getTable('student').values());
      expanded.students = allStudents.filter((s) => s.classId === item.id);
    }
    if (include.subjects && modelName === 'class') {
      const allSubjects = Array.from(this.getTable('subject').values());
      expanded.subjects = allSubjects.filter((s) => s.classId === item.id);
    }
    if (include.timetable && modelName === 'class') {
      const allSlots = Array.from(this.getTable('timetable').values());
      expanded.timetable = allSlots.filter((t) => t.classId === item.id);
    }
    if (include.grades && modelName === 'student') {
      const allGrades = Array.from(this.getTable('grade').values());
      expanded.grades = allGrades.filter((g) => g.studentId === item.id);
    }
    if (include.attendance && modelName === 'student') {
      const allAtt = Array.from(this.getTable('attendance').values());
      expanded.attendance = allAtt.filter((a) => a.studentId === item.id);
    }
    if (include.payments && modelName === 'student') {
      const allPay = Array.from(this.getTable('payment').values());
      expanded.payments = allPay.filter((p) => p.studentId === item.id);
    }
    if (include.transactions && modelName === 'payment') {
      const allTx = Array.from(this.getTable('transaction').values());
      expanded.transactions = allTx.filter((t) => t.paymentId === item.id);
    }
    if (include.school && item.schoolId) {
      expanded.school = this.getTable('school').get(item.schoolId) || null;
    }
    if (include.submittedByUser && item.submittedByUserId) {
      expanded.submittedByUser = this.getTable('user').get(item.submittedByUserId) || null;
    }
    if (include.subscription && modelName === 'school') {
      const allSubs = Array.from(this.getTable('subscription').values());
      expanded.subscription = allSubs.find((s) => s.schoolId === item.id) || null;
    }
    if (include.supportTickets && modelName === 'school') {
      const allTickets = Array.from(this.getTable('supportticket').values());
      expanded.supportTickets = allTickets.filter((t) => t.schoolId === item.id);
    }

    return expanded;
  }

  private initializeInMemorySeed() {
    const hashedAdminPassword = bcrypt.hashSync('admin123', 10);
    const hashedTeacherPassword = bcrypt.hashSync('teacher123', 10);
    const hashedStudentPassword = bcrypt.hashSync('student123', 10);

    // 0. Établissements Scolaires (MINESEC Schools)
    const schools = this.getTable('school');
    schools.set('sch_1', {
      id: 'sch_1',
      name: 'Lycée Général Leclerc de Yaoundé',
      code: 'LGL-YDE-001',
      address: 'Quartier Administratif, BP 1024 Yaoundé',
      phone: '+237 222 21 00 01',
      email: 'contact@lgl-yaounde.cm',
      ville: 'Yaoundé',
      region: 'Centre',
      slogan: 'Travail - Discipline - Succès',
      timezone: 'Africa/Douala',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    schools.set('sch_2', {
      id: 'sch_2',
      name: 'Lycée Bilingue de Deido',
      code: 'LBD-DLA-002',
      address: 'Deido Grand Moulin, Douala',
      phone: '+237 233 42 00 02',
      email: 'contact@lb-deido.cm',
      ville: 'Douala',
      region: 'Littoral',
      slogan: 'Excellence bilingue et citoyenneté',
      timezone: 'Africa/Douala',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    schools.set('sch_3', {
      id: 'sch_3',
      name: 'Lycée Classique de Bafoussam',
      code: 'LCB-BAF-003',
      address: 'Quartier Haoussa, Bafoussam',
      phone: '+237 233 44 00 03',
      email: 'direction@lycee-bafoussam.cm',
      ville: 'Bafoussam',
      region: 'Ouest',
      slogan: 'Science et Vertu',
      timezone: 'Africa/Douala',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 1. Users
    const users = this.getTable('user');
    users.set('usr_admin_1', {
      id: 'usr_admin_1',
      email: 'admin@eschool.com',
      password: hashedAdminPassword,
      firstName: 'Proviseur',
      lastName: 'Directeur',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+237 690 00 00 01',
      schoolId: 'sch_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    users.set('usr_teacher_1', {
      id: 'usr_teacher_1',
      email: 'teacher1@eschool.com',
      password: hashedTeacherPassword,
      firstName: 'Jean-Paul',
      lastName: 'Kamdem',
      role: 'TEACHER',
      status: 'ACTIVE',
      phone: '+237 690 00 00 02',
      schoolId: 'sch_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    users.set('usr_teacher_2', {
      id: 'usr_teacher_2',
      email: 'teacher2@eschool.com',
      password: hashedTeacherPassword,
      firstName: 'Marie',
      lastName: 'Ngo Bisseck',
      role: 'TEACHER',
      status: 'ACTIVE',
      phone: '+237 690 00 00 05',
      schoolId: 'sch_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    users.set('usr_student_1', {
      id: 'usr_student_1',
      email: 'student1@eschool.com',
      password: hashedStudentPassword,
      firstName: 'Paul',
      lastName: 'Biya Jr',
      role: 'STUDENT',
      status: 'ACTIVE',
      phone: '+237 690 00 00 03',
      schoolId: 'sch_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    users.set('usr_student_2', {
      id: 'usr_student_2',
      email: 'student2@eschool.com',
      password: hashedStudentPassword,
      firstName: 'Brenda',
      lastName: 'Eyenga',
      role: 'STUDENT',
      status: 'ACTIVE',
      phone: '+237 690 00 00 04',
      schoolId: 'sch_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. School Year
    const schoolYears = this.getTable('schoolyear');
    schoolYears.set('sy_2025_2026', {
      id: 'sy_2025_2026',
      name: '2025-2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Teachers
    const teachers = this.getTable('teacher');
    teachers.set('tch_1', {
      id: 'tch_1',
      userId: 'usr_teacher_1',
      employeeId: 'EMP001',
      specialization: 'Mathématiques & Informatique',
      qualifications: 'DIPES II Mathématiques (ENS Yaoundé)',
      status: 'ACTIVE',
      schoolId: 'sch_1',
      hireDate: new Date('2021-09-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    teachers.set('tch_2', {
      id: 'tch_2',
      userId: 'usr_teacher_2',
      employeeId: 'EMP002',
      specialization: 'Lettres Bilingues (Français & Anglais)',
      qualifications: 'Master Lettres Modernes',
      status: 'ACTIVE',
      schoolId: 'sch_1',
      hireDate: new Date('2022-09-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Classes (MINESEC Levels & Series)
    const classes = this.getTable('class');
    classes.set('cls_1', {
      id: 'cls_1',
      name: 'Terminale C',
      level: 'Terminale',
      section: 'Scientifique (Maths & Physique)',
      capacity: 35,
      status: 'ACTIVE',
      schoolYearId: 'sy_2025_2026',
      teacherId: 'tch_1',
      schoolId: 'sch_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    classes.set('cls_2', {
      id: 'cls_2',
      name: '1ère D',
      level: 'Première',
      section: 'Scientifique (Sciences Biologiques)',
      capacity: 40,
      status: 'ACTIVE',
      schoolYearId: 'sy_2025_2026',
      teacherId: 'tch_1',
      schoolId: 'sch_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    classes.set('cls_3', {
      id: 'cls_3',
      name: '3ème Espagnol',
      level: 'Troisième',
      section: 'Premier Cycle Général',
      capacity: 45,
      status: 'ACTIVE',
      schoolYearId: 'sy_2025_2026',
      teacherId: 'tch_2',
      schoolId: 'sch_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    classes.set('cls_4', {
      id: 'cls_4',
      name: '6ème A',
      level: 'Sixième',
      section: 'Observation et Initiation',
      capacity: 50,
      status: 'ACTIVE',
      schoolYearId: 'sy_2025_2026',
      teacherId: 'tch_2',
      schoolId: 'sch_2',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. Subjects (MINESEC Courses)
    const subjects = this.getTable('subject');
    subjects.set('sbj_1', {
      id: 'sbj_1',
      name: 'Mathématiques',
      code: 'MATH-TC',
      credits: 6,
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    subjects.set('sbj_2', {
      id: 'sbj_2',
      name: 'Physique-Chimie',
      code: 'PC-TC',
      credits: 5,
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    subjects.set('sbj_3', {
      id: 'sbj_3',
      name: 'Français',
      code: 'FRAN-TC',
      credits: 3,
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    subjects.set('sbj_4', {
      id: 'sbj_4',
      name: 'Anglais',
      code: 'ANG-TC',
      credits: 3,
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    subjects.set('sbj_5', {
      id: 'sbj_5',
      name: 'Informatique & TIC',
      code: 'INFO-TC',
      credits: 2,
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    subjects.set('sbj_6', {
      id: 'sbj_6',
      name: 'Sciences de la Vie et de la Terre (SVTEEHB)',
      code: 'SVT-1D',
      credits: 4,
      classId: 'cls_2',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 6. Timetable (Emplois du temps)
    const timetable = this.getTable('timetable');
    timetable.set('tt_1', {
      id: 'tt_1',
      dayOfWeek: 'MONDAY',
      startTime: '07:30',
      endTime: '09:30',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    timetable.set('tt_2', {
      id: 'tt_2',
      dayOfWeek: 'MONDAY',
      startTime: '09:45',
      endTime: '11:45',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    timetable.set('tt_3', {
      id: 'tt_3',
      dayOfWeek: 'TUESDAY',
      startTime: '07:30',
      endTime: '09:30',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    timetable.set('tt_4', {
      id: 'tt_4',
      dayOfWeek: 'WEDNESDAY',
      startTime: '07:30',
      endTime: '11:45',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    timetable.set('tt_5', {
      id: 'tt_5',
      dayOfWeek: 'THURSDAY',
      startTime: '07:30',
      endTime: '09:30',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    timetable.set('tt_6', {
      id: 'tt_6',
      dayOfWeek: 'FRIDAY',
      startTime: '07:30',
      endTime: '11:45',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 7. Students (Élèves)
    const students = this.getTable('student');
    students.set('std_1', {
      id: 'std_1',
      userId: 'usr_student_1',
      studentId: 'STU001',
      status: 'ACTIVE',
      enrollmentDate: new Date('2025-09-01'),
      classId: 'cls_1',
      schoolId: 'sch_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    students.set('std_2', {
      id: 'std_2',
      userId: 'usr_student_2',
      studentId: 'STU002',
      status: 'ACTIVE',
      enrollmentDate: new Date('2025-09-01'),
      classId: 'cls_1',
      schoolId: 'sch_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 8. Grades (Notes)
    const grades = this.getTable('grade');
    grades.set('grd_1', {
      id: 'grd_1',
      score: 16.5,
      maxScore: 20,
      status: 'PUBLISHED',
      studentId: 'std_1',
      subjectId: 'sbj_1',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    grades.set('grd_2', {
      id: 'grd_2',
      score: 15.0,
      maxScore: 20,
      status: 'PUBLISHED',
      studentId: 'std_1',
      subjectId: 'sbj_2',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    grades.set('grd_3', {
      id: 'grd_3',
      score: 13.5,
      maxScore: 20,
      status: 'PUBLISHED',
      studentId: 'std_1',
      subjectId: 'sbj_3',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    grades.set('grd_4', {
      id: 'grd_4',
      score: 14.0,
      maxScore: 20,
      status: 'PUBLISHED',
      studentId: 'std_2',
      subjectId: 'sbj_1',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 9. Attendance (Présence & Absences)
    const attendance = this.getTable('attendance');
    attendance.set('att_1', {
      id: 'att_1',
      date: new Date(),
      status: 'PRESENT',
      remarks: 'Présent à l appel du matin',
      studentId: 'std_1',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 10. Payments (Frais de scolarité & APEE)
    const payments = this.getTable('payment');
    payments.set('pay_1', {
      id: 'pay_1',
      amount: 45000,
      type: 'TUITION',
      status: 'PAID',
      dueDate: new Date('2025-10-01'),
      paidDate: new Date('2025-09-15'),
      description: 'Frais de scolarité - 1ère tranche',
      studentId: 'std_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    payments.set('pay_2', {
      id: 'pay_2',
      amount: 25000,
      type: 'ACTIVITY_FEE',
      status: 'PAID',
      dueDate: new Date('2025-10-15'),
      paidDate: new Date('2025-10-10'),
      description: 'Contribution annuelle APEE (Association des Parents d Élèves)',
      studentId: 'std_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    payments.set('pay_3', {
      id: 'pay_3',
      amount: 35000,
      type: 'TUITION',
      status: 'PENDING',
      dueDate: new Date('2026-02-15'),
      paidDate: null,
      description: 'Frais de scolarité - 2ème tranche',
      studentId: 'std_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 11. Transactions (Mobile Money MTN / Orange)
    const transactions = this.getTable('transaction');
    transactions.set('tx_1', {
      id: 'tx_1',
      amount: 45000,
      method: 'MTN_MOMO',
      reference: 'MOMO-2025-YDE-001',
      notes: 'Paiement scolarité par MTN Mobile Money validé',
      paymentId: 'pay_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    transactions.set('tx_2', {
      id: 'tx_2',
      amount: 25000,
      method: 'ORANGE_MONEY',
      reference: 'OM-2025-YDE-042',
      notes: 'Paiement contribution APEE par Orange Money validé',
      paymentId: 'pay_2',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 12. SuperAdmin User
    const hashedSuperAdminPassword = bcrypt.hashSync('superadmin123', 10);
    users.set('usr_superadmin_1', {
      id: 'usr_superadmin_1',
      email: 'superadmin@eschool.com',
      password: hashedSuperAdminPassword,
      firstName: 'Directeur Plateforme',
      lastName: 'SaaS Concepteur',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      phone: '+237 699 00 00 00',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 13. Subscriptions (Abonnements SaaS des établissements)
    const subscriptions = this.getTable('subscription');
    const now = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 1);

    subscriptions.set('sub_1', {
      id: 'sub_1',
      schoolId: 'sch_1',
      plan: 'ANNUEL_PREMIUM',
      status: 'ACTIVE',
      amount: 500000,
      currency: 'XAF',
      durationMonths: 12,
      startDate: now,
      endDate: nextYear,
      createdAt: now,
      updatedAt: now,
    });

    subscriptions.set('sub_2', {
      id: 'sub_2',
      schoolId: 'sch_2',
      plan: 'ANNUEL_STANDARD',
      status: 'ACTIVE',
      amount: 350000,
      currency: 'XAF',
      durationMonths: 12,
      startDate: now,
      endDate: nextYear,
      createdAt: now,
      updatedAt: now,
    });

    // 14. Support Tickets (Problèmes et demandes soumis par les écoles)
    const supportTickets = this.getTable('supportticket');
    supportTickets.set('st_1', {
      id: 'st_1',
      schoolId: 'sch_1',
      submittedByUserId: 'usr_admin_1',
      subject: 'Demande d ajout de la série F4 Génie Civil',
      description:
        'Nous souhaitons inscrire des élèves en spécialité F4 pour la rentrée du 2nd trimestre.',
      priority: 'MEDIUM',
      status: 'OPEN',
      adminResponse: null,
      createdAt: now,
      updatedAt: now,
    });
  }
}
