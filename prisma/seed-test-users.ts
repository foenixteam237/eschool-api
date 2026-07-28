import { PrismaClient, UserRole, UserStatus, TeacherStatus, StudentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomPhone(prefix = '+237 6') {
  const n = () => Math.floor(10 + Math.random() * 90).toString();
  return `${prefix} ${n()} ${n()} ${n()} ${n()}`;
}

// Helper pour le composite unique User @@unique([schoolId,email])
const userWhere = (schoolId: string, email: string) => ({
  schoolId_email: { schoolId, email },
});

async function seedUsers() {
  console.log('🌱 Création des utilisateurs de test (compatible multi-école + superadmin plateforme)...\n');

  // 0) School (obligatoire)
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

  console.log(`🏫 School OK: ${school.name} (${school.id})`);

  // Passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 0.1) SUPERADMIN (plateforme, sans schoolId)
  console.log('\n🛡️ Création du SUPERADMIN (plateforme)...');
  const superAdminEmail = 'superadmin@eschool.com';
  const superAdminPlainPassword = 'superadmin123';
  const superAdminPassword = await bcrypt.hash(superAdminPlainPassword, 10);

  // ✅ On upsert via platformEmail (unique global) => le plus safe
  const superAdminUser = await prisma.user.upsert({
    where: { platformEmail: superAdminEmail },
    update: {
      email: superAdminEmail,
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
      phone: randomPhone('+237 6'),
      avatar: null,

      // Platform flags
      isPlatformUser: true,
      platformEmail: superAdminEmail,

      // Pas de tenant
      schoolId: null,
    },
    create: {
      email: superAdminEmail,
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
      phone: randomPhone('+237 6'),
      avatar: null,

      // Platform flags
      isPlatformUser: true,
      platformEmail: superAdminEmail,

      // Pas de tenant
      schoolId: null,
    },
  });

  console.log('✅ SUPERADMIN créé/MAJ:', superAdminUser.email);

  // ✅ Accès contrôlé du SUPERADMIN à l’école (SANS finance/personnel/élèves)
  await prisma.schoolAccess.upsert({
    where: {
      userId_schoolId: {
        userId: superAdminUser.id,
        schoolId: school.id,
      },
    },
    update: {
      canManageSchool: true,
      canViewAcademics: true,

      // Confidentialité: OFF
      canViewFinance: false,
      canViewPersonnel: false,
      canViewStudents: false,
    },
    create: {
      userId: superAdminUser.id,
      schoolId: school.id,
      canManageSchool: true,
      canViewAcademics: true,

      // Confidentialité: OFF
      canViewFinance: false,
      canViewPersonnel: false,
      canViewStudents: false,
    },
  });

  console.log('🔒 SchoolAccess SUPERADMIN créé/MAJ (finance/personnel/élèves = OFF)');

  // 1) ADMIN
  console.log('\n👨‍💼 Création de l’administrateur (tenant école)...');
  const adminEmail = 'admin@eschool.com';

  const adminUser = await prisma.user.upsert({
    where: userWhere(school.id, adminEmail),
    update: {
      password: hashedPassword,
      firstName: 'Ahmed',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: randomPhone('+237 6'),
      avatar: null,
      schoolId: school.id,

      // sécurité si jamais un ancien enregistrement était "platform"
      isPlatformUser: false,
      platformEmail: null,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Ahmed',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: randomPhone('+237 6'),
      avatar: null,
      schoolId: school.id,
    },
  });

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {
      department: 'Administration Générale',
      schoolId: school.id,
    },
    create: {
      userId: adminUser.id,
      department: 'Administration Générale',
      schoolId: school.id,
    },
  });

  console.log('✅ Admin créé/MAJ:', adminUser.email);

  // 2) TEACHERS
  console.log('\n👨‍🏫 Création des professeurs...');
  const teacherPassword = await bcrypt.hash('teacher123', 10);

  const teachers: { userId: string; teacherId: string; email: string }[] = [];

  for (let i = 1; i <= 3; i++) {
    const email = `teacher${i}@eschool.com`;

    const teacherUser = await prisma.user.upsert({
      where: userWhere(school.id, email),
      update: {
        password: teacherPassword,
        firstName: `Professeur${i}`,
        lastName: `Nom${i}`,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        phone: randomPhone('+237 6'),
        schoolId: school.id,

        isPlatformUser: false,
        platformEmail: null,
      },
      create: {
        email,
        password: teacherPassword,
        firstName: `Professeur${i}`,
        lastName: `Nom${i}`,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        phone: randomPhone('+237 6'),
        schoolId: school.id,
      },
    });

    const teacher = await prisma.teacher.upsert({
      where: { employeeId: `EMP00${i}` },
      update: {
        userId: teacherUser.id,
        schoolId: school.id,
        specialization: i === 1 ? 'Mathématiques' : i === 2 ? 'Français' : 'Sciences',
        qualifications: 'Licence',
        status: TeacherStatus.ACTIVE,
        hireDate: new Date('2024-01-01T00:00:00.000Z'),
      },
      create: {
        userId: teacherUser.id,
        schoolId: school.id,
        employeeId: `EMP00${i}`,
        specialization: i === 1 ? 'Mathématiques' : i === 2 ? 'Français' : 'Sciences',
        qualifications: 'Licence',
        status: TeacherStatus.ACTIVE,
        hireDate: new Date('2024-01-01T00:00:00.000Z'),
      },
    });

    teachers.push({ userId: teacherUser.id, teacherId: teacher.id, email });
    console.log(`✅ Professeur créé/MAJ: ${email}`);
  }

  // 3) STUDENTS
  console.log('\n👨‍🎓 Création des élèves...');
  const studentPassword = await bcrypt.hash('student123', 10);

  const students: { userId: string; studentId: string; email: string }[] = [];

  for (let i = 1; i <= 5; i++) {
    const email = `student${i}@eschool.com`;

    const studentUser = await prisma.user.upsert({
      where: userWhere(school.id, email),
      update: {
        password: studentPassword,
        firstName: `Élève${i}`,
        lastName: `Nom${i}`,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        phone: randomPhone('+237 6'),
        schoolId: school.id,

        isPlatformUser: false,
        platformEmail: null,
      },
      create: {
        email,
        password: studentPassword,
        firstName: `Élève${i}`,
        lastName: `Nom${i}`,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        phone: randomPhone('+237 6'),
        schoolId: school.id,
      },
    });

    const stu = await prisma.student.upsert({
      where: { studentId: `STU00${i}` },
      update: {
        userId: studentUser.id,
        schoolId: school.id,
        status: StudentStatus.ACTIVE,
        enrollmentDate: new Date('2025-09-01T00:00:00.000Z'),
      },
      create: {
        userId: studentUser.id,
        schoolId: school.id,
        studentId: `STU00${i}`,
        status: StudentStatus.ACTIVE,
        enrollmentDate: new Date('2025-09-01T00:00:00.000Z'),
      },
    });

    students.push({ userId: studentUser.id, studentId: stu.id, email });
    console.log(`✅ Élève créé/MAJ: ${email}`);
  }

  // 4) PARENTS
  console.log('\n👨‍👩‍👧 Création des parents...');
  const parentPassword = await bcrypt.hash('parent123', 10);

  const parents: { userId: string; parentId: string; email: string }[] = [];

  for (let i = 1; i <= 3; i++) {
    const email = `parent${i}@eschool.com`;

    const parentUser = await prisma.user.upsert({
      where: userWhere(school.id, email),
      update: {
        password: parentPassword,
        firstName: `Parent${i}`,
        lastName: `Nom${i}`,
        role: UserRole.PARENT,
        status: UserStatus.ACTIVE,
        phone: randomPhone('+237 6'),
        schoolId: school.id,

        isPlatformUser: false,
        platformEmail: null,
      },
      create: {
        email,
        password: parentPassword,
        firstName: `Parent${i}`,
        lastName: `Nom${i}`,
        role: UserRole.PARENT,
        status: UserStatus.ACTIVE,
        phone: randomPhone('+237 6'),
        schoolId: school.id,
      },
    });

    const parent = await prisma.parent.upsert({
      where: { userId: parentUser.id },
      update: { schoolId: school.id },
      create: { userId: parentUser.id, schoolId: school.id },
    });

    parents.push({ userId: parentUser.id, parentId: parent.id, email });
    console.log(`✅ Parent créé/MAJ: ${email}`);
  }

  // 5) Lier Parents <-> Enfants (ParentStudent)
  console.log('\n🔗 Liaison parents ↔ élèves...');

  const linkPlan = [
    { parentIndex: 0, studentIndexes: [0, 1], relation: 'tuteur' },
    { parentIndex: 1, studentIndexes: [2], relation: 'père' },
    { parentIndex: 2, studentIndexes: [3, 4], relation: 'mère' },
  ];

  for (const plan of linkPlan) {
    const parent = parents[plan.parentIndex];
    for (const sIdx of plan.studentIndexes) {
      const student = students[sIdx];

      await prisma.parentStudent.upsert({
        where: {
          parentId_studentId: {
            parentId: parent.parentId,
            studentId: student.studentId,
          },
        },
        update: { relation: plan.relation },
        create: {
          parentId: parent.parentId,
          studentId: student.studentId,
          relation: plan.relation,
        },
      });
    }
  }

  console.log('✅ Liens parents-enfants OK');

  // 6) Afficher les credentials
  console.log('\n' + '='.repeat(60));
  console.log('📝 CREDENTIALS DE TEST');
  console.log('='.repeat(60));

  console.log('\n🛡️ SUPERADMIN (plateforme):');
  console.log(`  Email: ${superAdminEmail}`);
  console.log(`  Mot de passe: ${superAdminPlainPassword}`);
  console.log('  Accès école demo: OUI (academics/config)');
  console.log('  Accès élèves/personnel/finance: NON');

  console.log('\n🔐 ADMIN (école):');
  console.log('  Email: admin@eschool.com');
  console.log('  Mot de passe: password123');

  console.log('\n🔐 TEACHERS:');
  for (let i = 1; i <= 3; i++) {
    console.log(`  Email: teacher${i}@eschool.com  | Mot de passe: teacher123`);
  }

  console.log('\n🔐 STUDENTS:');
  for (let i = 1; i <= 5; i++) {
    console.log(`  Email: student${i}@eschool.com  | Mot de passe: student123`);
  }

  console.log('\n🔐 PARENTS:');
  for (let i = 1; i <= 3; i++) {
    console.log(`  Email: parent${i}@eschool.com  | Mot de passe: parent123`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Seed Users terminé avec succès !');
  console.log('='.repeat(60) + '\n');
}

seedUsers()
  .catch((e) => {
    console.error('❌ Erreur lors du seed Users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
