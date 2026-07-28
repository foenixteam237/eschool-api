import {
  PrismaClient,
  UserRole,
  UserStatus,
  TeacherStatus,
  StudentStatus,
  CycleCode,
  TrackType,
  PeriodType,
  EvaluationType,
  GradeStatus,
  EnrollmentStatus,
  EnrollmentType,
  FeeType,
  InvoiceStatus,
  PaymentMode,
  PaymentStatus,
  MoMoProvider,
  MoMoStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const userWhere = (schoolId: string, email: string) => ({
  schoolId_email: { schoolId, email },
});

function randomPhone(prefix = '+237 6') {
  const n = () => Math.floor(10 + Math.random() * 90).toString();
  return `${prefix} ${n()} ${n()} ${n()} ${n()}`;
}

function receiptNumber(prefix = 'ES') {
  const now = new Date();
  const year = now.getUTCFullYear();
  const rnd = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${rnd}`;
}

async function main() {
  console.log('🌱 Starting FULL database seed (Cameroun / MINESEC / multi-école)...');

  // ============= 0) SCHOOL (Tenant) =============
  const school = await prisma.school.upsert({
    where: { name: 'eSchool Demo - Cameroun' },
    update: {},
    create: {
      name: 'eSchool Demo - Cameroun',
      code: 'ESCH-CM-001',
      address: 'Quartier Administratif',
      phone: '+237 699 00 00 01',
      email: 'contact@eschool.cm',
      ville: 'Douala',
      region: 'Littoral',
      slogan: 'Éduquer, Former, Réussir',
      timezone: 'Africa/Douala',
    },
  });
  console.log('✅ School:', school.name);

  // ============= 1) SCHOOL YEAR =============
  const schoolYear = await prisma.schoolYear.upsert({
    where: { schoolId_name: { schoolId: school.id, name: '2025-2026' } },
    update: { isActive: true },
    create: {
      schoolId: school.id,
      name: '2025-2026',
      startDate: new Date('2025-09-01T00:00:00.000Z'),
      endDate: new Date('2026-06-30T23:59:59.000Z'),
      isActive: true,
    },
  });
  console.log('✅ SchoolYear:', schoolYear.name);

  // ============= 2) PERIODS (MINESEC) =============
  const periods = [
    { type: PeriodType.TERM, number: 1, label: 'Trimestre 1' },
    { type: PeriodType.TERM, number: 2, label: 'Trimestre 2' },
    { type: PeriodType.TERM, number: 3, label: 'Trimestre 3' },
    { type: PeriodType.SEQUENCE, number: 1, label: 'Séquence 1' },
    { type: PeriodType.SEQUENCE, number: 2, label: 'Séquence 2' },
    { type: PeriodType.YEAR, number: 0, label: 'Annuel' },
  ] as const;

  for (const p of periods) {
    await prisma.period.upsert({
      where: {
        schoolId_schoolYearId_type_number: {
          schoolId: school.id,
          schoolYearId: schoolYear.id,
          type: p.type,
          number: p.number,
        },
      },
      update: { label: p.label },
      create: {
        schoolId: school.id,
        schoolYearId: schoolYear.id,
        type: p.type,
        number: p.number,
        label: p.label,
      },
    });
  }
  console.log('✅ Periods created/updated');


  // ============= 3) REF DATA: Cycles + Levels + Series + Specialties =============
  const pc = await prisma.cycle.upsert({
    where: { code: CycleCode.PC },
    update: { label: 'Premier Cycle' },
    create: { code: CycleCode.PC, label: 'Premier Cycle' },
  });

  const sc = await prisma.cycle.upsert({
    where: { code: CycleCode.SC },
    update: { label: 'Second Cycle' },
    create: { code: CycleCode.SC, label: 'Second Cycle' },
  });

  const levelsData = [
    { code: '6e', order: 1, cycleId: pc.id },
    { code: '5e', order: 2, cycleId: pc.id },
    { code: '4e', order: 3, cycleId: pc.id },
    { code: '3e', order: 4, cycleId: pc.id },
    { code: '2nde', order: 5, cycleId: sc.id },
    { code: '1ere', order: 6, cycleId: sc.id },
    { code: 'Tle', order: 7, cycleId: sc.id },
  ];

  const levels = [];
  for (const l of levelsData) {
    levels.push(
      await prisma.level.upsert({
        where: { code: l.code },
        update: { order: l.order, cycleId: l.cycleId },
        create: { code: l.code, order: l.order, cycleId: l.cycleId },
      })
    );
  }

  const serieA = await prisma.serie.upsert({
    where: { code_type: { code: 'A', type: TrackType.GENERAL } },
    update: { label: 'Littéraire A' },
    create: { code: 'A', type: TrackType.GENERAL, label: 'Littéraire A' },
  });

  const serieC = await prisma.serie.upsert({
    where: { code_type: { code: 'C', type: TrackType.GENERAL } },
    update: { label: 'Scientifique C' },
    create: { code: 'C', type: TrackType.GENERAL, label: 'Scientifique C' },
  });

  const specF4 = await prisma.specialty.upsert({
    where: { code: 'F4' },
    update: { label: 'Génie Civil (F4)' },
    create: { code: 'F4', label: 'Génie Civil (F4)' },
  });

  console.log('✅ Ref data: cycles/levels/series/specialties OK');

  // ============= 4) SUBJECTS =============
  const subjectsSeed = [
    { code: 'MATH', name: 'Mathématiques' },
    { code: 'FR', name: 'Français' },
    { code: 'ANG', name: 'Anglais' },
    { code: 'SVT', name: 'SVT' },
    { code: 'HG', name: 'Histoire-Géographie' },
  ];

  const subjects = [];
  for (const s of subjectsSeed) {
    subjects.push(
      await prisma.subject.upsert({
        where: { code: s.code },
        update: { name: s.name },
        create: { code: s.code, name: s.name },
      })
    );
  }
  console.log('✅ Subjects OK');

  // ============= 5) CLASS TEMPLATES + CLASSES (annual) =============
  const level6e = levels.find((x) => x.code === '6e')!;
  const levelTle = levels.find((x) => x.code === 'Tle')!;

  const templates = [
    { nameTemplate: '6e A', levelId: level6e.id, capacity: 80 },
    { nameTemplate: '6e B', levelId: level6e.id, capacity: 80 },
    { nameTemplate: 'Tle A', levelId: levelTle.id, serieId: serieA.id, capacity: 60 },
    { nameTemplate: 'Tle C', levelId: levelTle.id, serieId: serieC.id, capacity: 60 },
    { nameTemplate: 'Tle F4', levelId: levelTle.id, specialtyId: specF4.id, capacity: 50 },
  ];

  for (const t of templates) {
    await prisma.classTemplate.upsert({
      where: { schoolId_nameTemplate: { schoolId: school.id, nameTemplate: t.nameTemplate } },
      update: {
        capacity: t.capacity,
        levelId: t.levelId,
        serieId: t.serieId ?? null,
        specialtyId: t.specialtyId ?? null,
      },
      create: {
        schoolId: school.id,
        nameTemplate: t.nameTemplate,
        capacity: t.capacity,
        levelId: t.levelId,
        serieId: t.serieId ?? null,
        specialtyId: t.specialtyId ?? null,
      },
    });
  }

  // Create classes for schoolYear from templates
  const classEntities = [];
  for (const t of templates) {
    const [levelCode, section] = t.nameTemplate.split(' ');
    const className = levelCode; // "6e" / "Tle"
    const classSection = section ?? null; // "A" / "B" / "C" / "F4"

    classEntities.push(
      await prisma.class.upsert({
        where: { schoolYearId_name_section: { schoolYearId: schoolYear.id, name: className, section: classSection } },
        update: {
          schoolId: school.id,
          capacity: t.capacity ?? 60,
          levelId: t.levelId ?? null,
          serieId: t.serieId ?? null,
          specialtyId: t.specialtyId ?? null,
        },
        create: {
          schoolId: school.id,
          schoolYearId: schoolYear.id,
          name: className,
          section: classSection,
          capacity: t.capacity ?? 60,
          levelId: t.levelId ?? null,
          serieId: t.serieId ?? null,
          specialtyId: t.specialtyId ?? null,
        },
      })
    );
  }

  console.log('✅ Classes generated:', classEntities.map((c) => `${c.name} ${c.section ?? ''}`.trim()).join(', '));

  // Add classSubjects (same set for demo)
  for (const c of classEntities) {
    let order = 1;
    for (const s of subjects) {
      await prisma.classSubject.upsert({
        where: { classId_subjectId: { classId: c.id, subjectId: s.id } },
        update: { coefficient: s.code === 'MATH' ? 4 : s.code === 'FR' ? 3 : 2, bulletinOrder: order++ },
        create: { classId: c.id, subjectId: s.id, coefficient: s.code === 'MATH' ? 4 : s.code === 'FR' ? 3 : 2, bulletinOrder: order++ },
      });
    }
  }
  console.log('✅ ClassSubjects OK');

  // ============= 6) USERS: admin + teachers + students + parents =============
  const adminPass = await bcrypt.hash('password123', 10);
  const teacherPass = await bcrypt.hash('teacher123', 10);
  const studentPass = await bcrypt.hash('student123', 10);
  const parentPass = await bcrypt.hash('parent123', 10);

  const adminUser = await prisma.user.upsert({
    where: userWhere(school.id, 'admin@eschool.com'),
    update: {
      password: adminPass,
      firstName: 'Ahmed',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: randomPhone(),
      schoolId: school.id,
    },
    create: {
      email: 'admin@eschool.com',
      password: adminPass,
      firstName: 'Ahmed',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: randomPhone(),
      schoolId: school.id,
    },
  });

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: { schoolId: school.id, department: 'Administration' },
    create: { userId: adminUser.id, schoolId: school.id, department: 'Administration' },
  });

  // Teachers
  const teacherProfiles: { teacher: any; user: any }[] = [];
  const teacherSpecs = ['Mathématiques', 'Français', 'Sciences'];

  for (let i = 1; i <= 3; i++) {
    const email = `teacher${i}@eschool.com`;
    const user = await prisma.user.upsert({
      where: userWhere(school.id, email),
      update: {
        password: teacherPass,
        firstName: `Professeur${i}`,
        lastName: `Nom${i}`,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        phone: randomPhone(),
        schoolId: school.id,
      },
      create: {
        email,
        password: teacherPass,
        firstName: `Professeur${i}`,
        lastName: `Nom${i}`,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        phone: randomPhone(),
        schoolId: school.id,
      },
    });

    const teacher = await prisma.teacher.upsert({
      where: { employeeId: `EMP00${i}` },
      update: {
        userId: user.id,
        schoolId: school.id,
        specialization: teacherSpecs[i - 1],
        qualifications: 'Licence',
        status: TeacherStatus.ACTIVE,
        hireDate: new Date('2024-01-01T00:00:00.000Z'),
      },
      create: {
        userId: user.id,
        schoolId: school.id,
        employeeId: `EMP00${i}`,
        specialization: teacherSpecs[i - 1],
        qualifications: 'Licence',
        status: TeacherStatus.ACTIVE,
        hireDate: new Date('2024-01-01T00:00:00.000Z'),
      },
    });

    teacherProfiles.push({ user, teacher });
  }

  // Students
  const studentProfiles: { student: any; user: any }[] = [];
  for (let i = 1; i <= 5; i++) {
    const email = `student${i}@eschool.com`;
    const user = await prisma.user.upsert({
      where: userWhere(school.id, email),
      update: {
        password: studentPass,
        firstName: `Élève${i}`,
        lastName: `Nom${i}`,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        phone: randomPhone(),
        schoolId: school.id,
      },
      create: {
        email,
        password: studentPass,
        firstName: `Élève${i}`,
        lastName: `Nom${i}`,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        phone: randomPhone(),
        schoolId: school.id,
      },
    });

    const student = await prisma.student.upsert({
      where: { studentId: `STU00${i}` },
      update: {
        userId: user.id,
        schoolId: school.id,
        status: StudentStatus.ACTIVE,
        enrollmentDate: new Date('2025-09-01T00:00:00.000Z'),
      },
      create: {
        userId: user.id,
        schoolId: school.id,
        studentId: `STU00${i}`,
        status: StudentStatus.ACTIVE,
        enrollmentDate: new Date('2025-09-01T00:00:00.000Z'),
      },
    });

    studentProfiles.push({ user, student });
  }

  // Parents + links
  const parentProfiles: { parent: any; user: any }[] = [];
  for (let i = 1; i <= 3; i++) {
    const email = `parent${i}@eschool.com`;
    const user = await prisma.user.upsert({
      where: userWhere(school.id, email),
      update: {
        password: parentPass,
        firstName: `Parent${i}`,
        lastName: `Nom${i}`,
        role: UserRole.PARENT,
        status: UserStatus.ACTIVE,
        phone: randomPhone(),
        schoolId: school.id,
      },
      create: {
        email,
        password: parentPass,
        firstName: `Parent${i}`,
        lastName: `Nom${i}`,
        role: UserRole.PARENT,
        status: UserStatus.ACTIVE,
        phone: randomPhone(),
        schoolId: school.id,
      },
    });

    const parent = await prisma.parent.upsert({
      where: { userId: user.id },
      update: { schoolId: school.id },
      create: { userId: user.id, schoolId: school.id },
    });

    parentProfiles.push({ user, parent });
  }

  const linkPlan = [
    { parentIndex: 0, studentIndexes: [0, 1], relation: 'tuteur' },
    { parentIndex: 1, studentIndexes: [2], relation: 'père' },
    { parentIndex: 2, studentIndexes: [3, 4], relation: 'mère' },
  ];

  for (const plan of linkPlan) {
    const parent = parentProfiles[plan.parentIndex].parent;
    for (const sIdx of plan.studentIndexes) {
      const student = studentProfiles[sIdx].student;

      await prisma.parentStudent.upsert({
        where: { parentId_studentId: { parentId: parent.id, studentId: student.id } },
        update: { relation: plan.relation },
        create: { parentId: parent.id, studentId: student.id, relation: plan.relation },
      });
    }
  }
  console.log('✅ Users created (admin/teachers/students/parents) + links');

  // ============= 7) ENROLLMENTS (annual list-of-class) =============
  // Put students into "6e A" for demo
  const class6eA = classEntities.find((c) => c.name === '6e' && c.section === 'A') ?? classEntities[0];

  for (const sp of studentProfiles) {
    await prisma.enrollment.upsert({
      where: { studentId_schoolYearId: { studentId: sp.student.id, schoolYearId: schoolYear.id } },
      update: {
        schoolId: school.id,
        classId: class6eA.id,
        status: EnrollmentStatus.ENROLLED,
        type: EnrollmentType.NEW,
      },
      create: {
        schoolId: school.id,
        studentId: sp.student.id,
        schoolYearId: schoolYear.id,
        classId: class6eA.id,
        status: EnrollmentStatus.ENROLLED,
        type: EnrollmentType.NEW,
      },
    });
  }
  console.log('✅ Enrollments OK (students assigned to a class)');

  // ============= 8) TeacherAssignments + EvaluationParam =============
  // Assign teacher1=Math to class6eA, teacher2=FR, teacher3=SVT
  const t1 = teacherProfiles[0].teacher;
  const t2 = teacherProfiles[1].teacher;
  const t3 = teacherProfiles[2].teacher;

  const subjM = subjects.find((s) => s.code === 'MATH')!;
  const subjF = subjects.find((s) => s.code === 'FR')!;
  const subjS = subjects.find((s) => s.code === 'SVT')!;

  const assignments = [
    { teacherId: t1.id, subjectId: subjM.id },
    { teacherId: t2.id, subjectId: subjF.id },
    { teacherId: t3.id, subjectId: subjS.id },
  ];

  for (const a of assignments) {
    await prisma.teacherAssignment.upsert({
      where: { schoolYearId_classId_subjectId: { schoolYearId: schoolYear.id, classId: class6eA.id, subjectId: a.subjectId } },
      update: { teacherId: a.teacherId },
      create: { schoolYearId: schoolYear.id, classId: class6eA.id, subjectId: a.subjectId, teacherId: a.teacherId },
    });
  }

  // Evaluation params (default for schoolYear)
  await prisma.evaluationParam.upsert({
    where: {
      // Pas de @@unique, donc on fait un findFirst + create si needed
      // On va juste create si absent pour cette schoolYear + school.
      id: '___skip___',
    } as any,
    update: {},
    create: {
      schoolId: school.id,
      schoolYearId: schoolYear.id,
      continuousWeight: 0.4,
      examWeight: 0.6,
      precision: 2,
    },
  }).catch(async () => {
    const exists = await prisma.evaluationParam.findFirst({
      where: { schoolId: school.id, schoolYearId: schoolYear.id, levelId: null, subjectId: null },
    });
    if (!exists) {
      await prisma.evaluationParam.create({
        data: {
          schoolId: school.id,
          schoolYearId: schoolYear.id,
          continuousWeight: 0.4,
          examWeight: 0.6,
          precision: 2,
        },
      });
    }
  });

  console.log('✅ TeacherAssignments + EvaluationParam OK');

  // ============= 9) Evaluations + GradeEntries =============
  // Create a Math ASSIGNMENT (Sequence 1, Term 1) and a Math EXAM (Term 1)
  const evalDevoirMath = await prisma.evaluation.create({
    data: {
      schoolId: school.id,
      schoolYearId: schoolYear.id,
      classId: class6eA.id,
      subjectId: subjM.id,
      teacherId: t1.id,
      type: EvaluationType.ASSIGNMENT,
      term: 1,
      sequence: 1,
      date: new Date('2025-10-10T00:00:00.000Z'),
      outOf: 20,
      description: 'Devoir 1 - Maths',
    },
  });

  const evalCompoMath = await prisma.evaluation.create({
    data: {
      schoolId: school.id,
      schoolYearId: schoolYear.id,
      classId: class6eA.id,
      subjectId: subjM.id,
      teacherId: t1.id,
      type: EvaluationType.EXAM,
      term: 1,
      date: new Date('2025-12-05T00:00:00.000Z'),
      outOf: 20,
      description: 'Composition - Maths (T1)',
    },
  });

  for (const sp of studentProfiles) {
    await prisma.gradeEntry.upsert({
      where: { evaluationId_studentId: { evaluationId: evalDevoirMath.id, studentId: sp.student.id } },
      update: { score: 8 + Math.random() * 10, status: GradeStatus.PUBLISHED },
      create: { evaluationId: evalDevoirMath.id, studentId: sp.student.id, score: 8 + Math.random() * 10, status: GradeStatus.PUBLISHED },
    });

    await prisma.gradeEntry.upsert({
      where: { evaluationId_studentId: { evaluationId: evalCompoMath.id, studentId: sp.student.id } },
      update: { score: 6 + Math.random() * 12, status: GradeStatus.PUBLISHED },
      create: { evaluationId: evalCompoMath.id, studentId: sp.student.id, score: 6 + Math.random() * 12, status: GradeStatus.PUBLISHED },
    });
  }

  console.log('✅ Evaluations + GradeEntries OK');

  // ============= 10) Finance: Fees -> Invoice -> Payment -> MoMo -> Receipt =============
  const tuitionFee = await prisma.fee.create({
    data: {
      schoolId: school.id,
      schoolYearId: schoolYear.id,
      label: 'Frais de scolarité',
      type: FeeType.TUITION,
      amount: 250000,
      isMandatory: true,
      levelId: class6eA.levelId ?? null,
    },
  });

  // Invoice per student is unique([studentId, schoolYearId]), so create/update for student1 only
  const demoStudent = studentProfiles[0].student;

  const invoice = await prisma.invoice.upsert({
    where: { studentId_schoolYearId: { studentId: demoStudent.id, schoolYearId: schoolYear.id } },
    update: { totalAmount: 250000, status: InvoiceStatus.UNPAID },
    create: {
      schoolId: school.id,
      schoolYearId: schoolYear.id,
      studentId: demoStudent.id,
      totalAmount: 250000,
      status: InvoiceStatus.UNPAID,
    },
  });

  await prisma.invoiceLine.upsert({
    where: { invoiceId_label: { invoiceId: invoice.id, label: 'Frais de scolarité' } },
    update: { amount: 250000 },
    create: {
      invoiceId: invoice.id,
      feeId: tuitionFee.id,
      label: 'Frais de scolarité',
      amount: 250000,
      dueDate: new Date('2025-11-15T00:00:00.000Z'),
    },
  });

  const payment = await prisma.payment.create({
    data: {
      schoolId: school.id,
      invoiceId: invoice.id,
      studentId: demoStudent.id,
      parentUserId: parentProfiles[0].user.id,
      amount: 50000,
      mode: PaymentMode.MTN_MOMO,
      status: PaymentStatus.PAID,
      reference: 'PAY-TEST-0001',
      paidAt: new Date(),
    },
  });

  await prisma.mobileMoneyTransaction.create({
    data: {
      schoolId: school.id,
      invoiceId: invoice.id,
      studentId: demoStudent.id,
      paymentId: payment.id,
      provider: MoMoProvider.MTN_MOMO,
      amount: 50000,
      status: MoMoStatus.SUCCESS,
      internalRef: `MMT-${Date.now()}`,
      externalRef: 'MTN-EXT-TEST-REF',
      callbackPayload: { ok: true },
    },
  });

  await prisma.receipt.create({
    data: {
      paymentId: payment.id,
      number: receiptNumber('ES'),
      hash: null,
      pdfUrl: null,
    },
  });

  // Update invoice totals
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { paidAmount: 50000, status: InvoiceStatus.PARTIAL },
  });

  console.log('✅ Finance demo (invoice/payment/momo/receipt) OK');

  console.log('🎉 FULL seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
