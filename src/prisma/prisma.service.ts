import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnected = false;
  private readonly inMemoryStore: Map<string, Map<string, any>> = new Map();

  constructor() {
    super();
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
          // If accessing a model property (e.g. user, student, teacher, grade, class, etc.)
          if (typeof original === 'object' && original !== null) {
            return this.createModelProxy(prop, original);
          }
          return original;
        }

        // If the property is not on PrismaClient, treat it as a dynamic model proxy
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
      this.logger.warn(`[AI Studio] Database offline (${error.message?.slice(0, 80)}...) — in-memory mock active`);
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
    const self = this;

    return new Proxy(originalModel || {}, {
      get: (_target: any, method: string) => {
        if (!self.isConnected || !originalModel || !originalModel[method]) {
          return async (args: any) => self.handleMockModelCall(modelName, method, args);
        }

        return async (args: any) => {
          try {
            return await originalModel[method](args);
          } catch (err: any) {
            if (self.isConnectionError(err)) {
              return await self.handleMockModelCall(modelName, method, args);
            }
            throw err;
          }
        };
      },
    });
  }

  private async handleMockOperation(prop: string, _args: any) {
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

  private async handleMockModelCall(modelName: string, method: string, args: any = {}): Promise<any> {
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
        const id = args?.data?.id || `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newItem = {
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...args?.data,
        };

        // If nested user creation (e.g. creating student or teacher with nested user)
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
        const existing = await this.handleMockModelCall(modelName, 'findFirst', { where: args?.where });
        if (existing) {
          return this.handleMockModelCall(modelName, 'update', { where: { id: existing.id }, data: args.update });
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
    if (include.students && modelName === 'class') {
      const allStudents = Array.from(this.getTable('student').values());
      expanded.students = allStudents.filter((s) => s.classId === item.id);
    }
    if (include.grades && modelName === 'student') {
      const allGrades = Array.from(this.getTable('grade').values());
      expanded.grades = allGrades.filter((g) => g.studentId === item.id);
    }
    if (include.attendance && modelName === 'student') {
      const allAtt = Array.from(this.getTable('attendance').values());
      expanded.attendance = allAtt.filter((a) => a.studentId === item.id);
    }
    if (include.transactions && modelName === 'payment') {
      const allTx = Array.from(this.getTable('transaction').values());
      expanded.transactions = allTx.filter((t) => t.paymentId === item.id);
    }

    return expanded;
  }

  private initializeInMemorySeed() {
    const hashedAdminPassword = bcrypt.hashSync('admin123', 10);
    const hashedTeacherPassword = bcrypt.hashSync('teacher123', 10);
    const hashedStudentPassword = bcrypt.hashSync('student123', 10);

    // 1. Users
    const users = this.getTable('user');
    users.set('usr_admin_1', {
      id: 'usr_admin_1',
      email: 'admin@eschool.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+237 690 00 00 01',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    users.set('usr_teacher_1', {
      id: 'usr_teacher_1',
      email: 'teacher1@eschool.com',
      password: hashedTeacherPassword,
      firstName: 'Jean',
      lastName: 'Kamdem',
      role: 'TEACHER',
      status: 'ACTIVE',
      phone: '+237 690 00 00 02',
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
      specialization: 'Mathématiques',
      qualifications: 'Master en Sciences',
      status: 'ACTIVE',
      hireDate: new Date('2023-09-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Classes
    const classes = this.getTable('class');
    classes.set('cls_1', {
      id: 'cls_1',
      name: 'Terminale C',
      level: 'Terminale',
      section: 'Scientifique',
      capacity: 35,
      status: 'ACTIVE',
      schoolYearId: 'sy_2025_2026',
      teacherId: 'tch_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. Subjects
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

    // 6. Students
    const students = this.getTable('student');
    students.set('std_1', {
      id: 'std_1',
      userId: 'usr_student_1',
      studentId: 'STU001',
      status: 'ACTIVE',
      enrollmentDate: new Date('2025-09-01'),
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 7. Grades
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

    // 8. Attendance
    const attendance = this.getTable('attendance');
    attendance.set('att_1', {
      id: 'att_1',
      date: new Date(),
      status: 'PRESENT',
      remarks: 'À l heure',
      studentId: 'std_1',
      classId: 'cls_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 9. Payments
    const payments = this.getTable('payment');
    payments.set('pay_1', {
      id: 'pay_1',
      amount: 150000,
      type: 'TUITION',
      status: 'PAID',
      dueDate: new Date('2025-10-01'),
      paidDate: new Date('2025-09-15'),
      description: 'Frais de scolarité - 1ère tranche',
      studentId: 'std_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 10. Transactions
    const transactions = this.getTable('transaction');
    transactions.set('tx_1', {
      id: 'tx_1',
      amount: 150000,
      method: 'MTN_MOMO',
      reference: 'MOMO-2025-001',
      notes: 'Paiement en ligne validé',
      paymentId: 'pay_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
