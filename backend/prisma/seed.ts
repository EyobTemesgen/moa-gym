import { PrismaClient, Role, EmploymentStatus, LockerStatus, IssueStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SAMPLE_WAIVER_TEXT = `FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
MINISTRY OF AGRICULTURE (MoA)
STAFF WELLNESS & FITNESS CENTER — PARTICIPATION AGREEMENT & LIABILITY WAIVER

1. Voluntary Participation: I hereby acknowledge that my participation in physical exercise, group classes, gym equipment utilization, and wellness activities at the MoA Staff Wellness & Fitness Center is entirely voluntary and provided as an institutional employee wellness benefit.

2. Health & Medical Clearance (PAR-Q): I confirm that I have answered the Physical Activity Readiness Questionnaire (PAR-Q) truthfully. If I answered YES to any health condition (such as chest pain, dizziness, bone/joint conditions, high blood pressure), I confirm that I have consulted a qualified physician and obtained medical clearance before undertaking physical activity.

3. Assumption of Risk: I understand that physical fitness training carries inherent physical risks. I agree to inspect all equipment before use, observe safe operating guidelines, and immediately report any damaged equipment to gym attendants.

4. Facility Guidelines: I agree to abide by all center rules:
   a. Check in at the entrance desk using my official MoA Staff QR Pass or Employee ID.
   b. Use designated lockers solely for daily fitness sessions and return keys/clear lockers upon completion.
   c. Wear appropriate athletic attire and clean non-marking sports shoes.
   d. Wipe down gym apparatus after use with provided sanitary wipes.
   e. Be respectful of colleagues, trainers, and facility attendants.

5. Acknowledgment & Consent: By signing electronically below, I state that I have read, understood, and agreed to all terms above.`;

async function main() {
  console.log('🌱 Starting MoA Gym database seed...');

  // 1. System Configuration
  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: {
      maxCapacity: 40,
      waiverText: SAMPLE_WAIVER_TEXT,
    },
    create: {
      id: 1,
      maxCapacity: 40,
      waiverText: SAMPLE_WAIVER_TEXT,
    },
  });
  console.log('✓ SystemConfig seeded (maxCapacity: 40)');

  // 2. Lockers L-01 through L-30
  for (let i = 1; i <= 30; i++) {
    const lockerNum = `L-${String(i).padStart(2, '0')}`;
    await prisma.locker.upsert({
      where: { lockerNumber: lockerNum },
      update: {},
      create: {
        lockerNumber: lockerNum,
        status: LockerStatus.AVAILABLE,
      },
    });
  }
  console.log('✓ 30 Lockers seeded (L-01 to L-30)');

  // 3. HR Employee Roster (15 active employees + 2 admins/attendants)
  const rosterData = [
    {
      employeeId: 'EMP-ADM-01',
      fullName: 'Dr. Girma Bekele',
      department: 'HR & Administration Directorate',
      phone: '+251 91 123 4567',
      email: 'admin@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-DSK-01',
      fullName: 'Tigist Alemayehu',
      department: 'Staff Wellness & Facility Services',
      phone: '+251 92 234 5678',
      email: 'desk@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-001',
      fullName: 'Dawit Yohannes',
      department: 'Agricultural Extension Directorate',
      phone: '+251 91 345 6789',
      email: 'dawit.y@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-002',
      fullName: 'Selamawit Kebede',
      department: 'Horticulture Development Directorate',
      phone: '+251 92 456 7890',
      email: 'selamawit.k@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-003',
      fullName: 'Mulugeta Tadesse',
      department: 'Natural Resource Management Directorate',
      phone: '+251 93 567 8901',
      email: 'mulugeta.t@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-004',
      fullName: 'Aster Mengistu',
      department: 'Livestock & Fishery Development Directorate',
      phone: '+251 91 678 9012',
      email: 'aster.m@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-005',
      fullName: 'Yonas Haile',
      department: 'Planning & Policy Directorate',
      phone: '+251 92 789 0123',
      email: 'yonas.h@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-006',
      fullName: 'Bethlehem Demisse',
      department: 'ICT & Digital Agriculture Directorate',
      phone: '+251 94 890 1234',
      email: 'bethlehem.d@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-007',
      fullName: 'Kassahun Worku',
      department: 'Procurement & Property Administration',
      phone: '+251 91 901 2345',
      email: 'kassahun.w@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-008',
      fullName: 'Hiwot Tesfaye',
      department: 'Finance & Accounts Directorate',
      phone: '+251 93 012 3456',
      email: 'hiwot.t@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-009',
      fullName: 'Ermias Berhanu',
      department: 'Irrigation & Drainage Directorate',
      phone: '+251 91 112 2334',
      email: 'ermias.b@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-010',
      fullName: 'Rahel Abebe',
      department: 'Agricultural Input Supply Directorate',
      phone: '+251 92 223 3445',
      email: 'rahel.a@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-011',
      fullName: 'Getachew Assefa',
      department: 'Internal Audit Directorate',
      phone: '+251 93 334 4556',
      email: 'getachew.a@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-012',
      fullName: 'Meron Solomon',
      department: 'Women, Children & Youth Affairs',
      phone: '+251 94 445 5667',
      email: 'meron.s@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-013',
      fullName: 'Samuel Desta',
      department: 'Plant Health & Regulatory Directorate',
      phone: '+251 91 556 6778',
      email: 'samuel.d@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
    {
      employeeId: 'EMP-MOA-014',
      fullName: 'Genet Fikadu',
      department: 'Disaster Risk Management',
      phone: '+251 92 667 7889',
      email: 'genet.f@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150',
      employmentStatus: EmploymentStatus.INACTIVE, // Demonstrates inactive employee
    },
    {
      employeeId: 'EMP-MOA-015',
      fullName: 'Fikru Wolde',
      department: 'Public Relations & Communication',
      phone: '+251 93 778 8990',
      email: 'fikru.w@moa.gov.et',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      employmentStatus: EmploymentStatus.ACTIVE,
    },
  ];

  for (const emp of rosterData) {
    await prisma.hrEmployeeRoster.upsert({
      where: { employeeId: emp.employeeId },
      update: emp,
      create: emp,
    });
  }
  console.log(`✓ ${rosterData.length} HR Employee Roster records seeded`);

  // 4. Seed User Accounts
  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 4.1 Admin user
  await prisma.user.upsert({
    where: { employeeId: 'EMP-ADM-01' },
    update: { role: Role.ADMIN },
    create: {
      employeeId: 'EMP-ADM-01',
      passwordHash: defaultPassword,
      role: Role.ADMIN,
      waiverSigned: true,
      waiverSignedAt: new Date(),
      emergencyContactName: 'Almaz Bekele',
      emergencyContactPhone: '+251 91 199 8877',
      parqResponses: {
        chestPain: false,
        dizziness: false,
        boneJointCondition: false,
        highBloodPressure: false,
        heartMedication: false,
        recentSurgery: false,
        otherReason: false,
      },
    },
  });
  console.log('✓ HR Admin seeded (admin@moa.gov.et / EMP-ADM-01)');

  // 4.2 Gym Attendant user
  await prisma.user.upsert({
    where: { employeeId: 'EMP-DSK-01' },
    update: { role: Role.GYM_ATTENDANT },
    create: {
      employeeId: 'EMP-DSK-01',
      passwordHash: defaultPassword,
      role: Role.GYM_ATTENDANT,
      waiverSigned: true,
      waiverSignedAt: new Date(),
      emergencyContactName: 'Abebe Alemayehu',
      emergencyContactPhone: '+251 92 288 7766',
      parqResponses: {
        chestPain: false,
        dizziness: false,
        boneJointCondition: false,
        highBloodPressure: false,
        heartMedication: false,
        recentSurgery: false,
        otherReason: false,
      },
    },
  });
  console.log('✓ Gym Attendant seeded (desk@moa.gov.et / EMP-DSK-01)');

  // 4.3 Active Staff Member (Fully onboarded with waiver)
  const staff1 = await prisma.user.upsert({
    where: { employeeId: 'EMP-MOA-001' },
    update: {},
    create: {
      employeeId: 'EMP-MOA-001',
      passwordHash: defaultPassword,
      role: Role.STAFF_MEMBER,
      waiverSigned: true,
      waiverSignedAt: new Date(),
      emergencyContactName: 'Meseret Yohannes',
      emergencyContactPhone: '+251 91 333 4455',
      parqResponses: {
        chestPain: false,
        dizziness: false,
        boneJointCondition: false,
        highBloodPressure: false,
        heartMedication: false,
        recentSurgery: false,
        otherReason: false,
      },
    },
  });
  console.log('✓ Staff Member 1 seeded (dawit.y@moa.gov.et / EMP-MOA-001, Waiver: YES)');

  // 4.4 Staff Member 2 (Registered but waiver NOT signed yet)
  await prisma.user.upsert({
    where: { employeeId: 'EMP-MOA-002' },
    update: {},
    create: {
      employeeId: 'EMP-MOA-002',
      passwordHash: defaultPassword,
      role: Role.STAFF_MEMBER,
      waiverSigned: false,
    },
  });
  console.log('✓ Staff Member 2 seeded (selamawit.k@moa.gov.et / EMP-MOA-002, Waiver: PENDING)');

  // 5. Wellness Classes
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const classes = [
    {
      title: 'Morning Energizer Aerobics',
      instructorName: 'Coach Henok',
      scheduledDate: today,
      startTime: '06:30',
      endTime: '07:30',
      capacity: 15,
    },
    {
      title: 'Midday Core & Flexibility Yoga',
      instructorName: 'Trainer Bethel',
      scheduledDate: today,
      startTime: '12:15',
      endTime: '13:00',
      capacity: 12,
    },
    {
      title: 'Evening Strength & Conditioning',
      instructorName: 'Coach Henok',
      scheduledDate: today,
      startTime: '17:30',
      endTime: '18:45',
      capacity: 20,
    },
  ];

  for (const c of classes) {
    const existing = await prisma.wellnessClass.findFirst({
      where: { title: c.title, scheduledDate: c.scheduledDate },
    });
    if (!existing) {
      await prisma.wellnessClass.create({ data: c });
    }
  }
  console.log('✓ 3 Daily Wellness Classes seeded');

  // 6. Equipment Issue Example
  const existingIssue = await prisma.equipmentIssue.findFirst({
    where: { equipmentName: 'Treadmill #03' },
  });
  if (!existingIssue) {
    await prisma.equipmentIssue.create({
      data: {
        equipmentName: 'Treadmill #03',
        description: 'Running belt alignment slip on incline > 4. Attendant notified maintenance technician.',
        status: IssueStatus.OPEN,
      },
    });
  }
  console.log('✓ Sample equipment issue logged');

  // 7. Initial Gym Registrants (Digitized from the official MoA paper registration form)
  const paperRegistrants = [
    {
      regNumber: 1,
      employeeId: 'EMP-MOA-003',
      fullName: 'ሙሉጌታ አለሙ (Mulugeta Alemu)',
      department: 'ምግብ ዋስትና (Food Security Directorate)',
      phone: '+251 91 234 0001',
      shiftPreference: 'MORNING',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
    {
      regNumber: 2,
      employeeId: 'EMP-MOA-102',
      fullName: 'መሰረት መብራቴ (Meseret Mebrate)',
      department: 'ምግብ ዋስትና (Food Security Directorate)',
      phone: '+251 91 234 0002',
      shiftPreference: 'EVENING',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
    {
      regNumber: 3,
      employeeId: 'EMP-MOA-103',
      fullName: 'ብዙአየሁ አባባው (Bizuayehu Ababawe)',
      department: 'ምግብ ዋስትና (Food Security Directorate)',
      phone: '+251 91 234 0003',
      shiftPreference: 'EVENING',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
    {
      regNumber: 4,
      employeeId: 'EMP-MOA-104',
      fullName: 'ኤርሚያስ ተሾመ (Ermias Teshome)',
      department: 'ጥራት ግብዓት (Quality & Input Directorate)',
      phone: '+251 91 234 0004',
      shiftPreference: 'LUNCH',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
    {
      regNumber: 5,
      employeeId: 'EMP-MOA-105',
      fullName: 'ሰለሞን አለሙ ተወንደኝ (Solomon Alemu)',
      department: 'መሰረታዊ አገልግሎት (Basic Services Directorate)',
      phone: '+251 91 234 0005',
      shiftPreference: 'MORNING',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
    {
      regNumber: 6,
      employeeId: 'EMP-MOA-106',
      fullName: 'ተስፋዬ ታደሰ ገ/ማሪያም (Tesfaye Tadesse)',
      department: 'መሰረታዊ አገልግሎት (Basic Services Directorate)',
      phone: '+251 91 234 0006',
      shiftPreference: 'EVENING',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
    {
      regNumber: 7,
      employeeId: 'EMP-MOA-107',
      fullName: 'ሞላ ተስፋዬ ሊበን (Molla Tesfaye)',
      department: 'መሰረታዊ አገልግሎት (Basic Services Directorate)',
      phone: '+251 91 234 0007',
      shiftPreference: 'EVENING',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
    {
      regNumber: 8,
      employeeId: 'EMP-MOA-108',
      fullName: 'እንዳለካቸው ዛጔ (Endalekachew Zague)',
      department: 'መሰረታዊ አገልግሎት (Basic Services Directorate)',
      phone: '+251 91 234 0008',
      shiftPreference: 'MORNING',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
    {
      regNumber: 9,
      employeeId: 'EMP-MOA-109',
      fullName: 'ዛሬሁን ድንቁ (Zarehun Denku)',
      department: 'መሰረታዊ አገልግሎት (Basic Services Directorate)',
      phone: '+251 91 234 0009',
      shiftPreference: 'EVENING',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
    {
      regNumber: 10,
      employeeId: 'EMP-MOA-001',
      fullName: 'ዳዊት ዮሐንስ (Dawit Yohannes)',
      department: 'መሰረታዊ አገልግሎት (Basic Services Directorate)',
      phone: '+251 91 345 6789',
      shiftPreference: 'MORNING',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
    {
      regNumber: 11,
      employeeId: 'EMP-MOA-111',
      fullName: 'ፍቃዱ ማለደ (Fikadu Malede)',
      department: 'ኢ/ኮ/ቴ/ሥ/አ (ICT & Digital Agriculture)',
      phone: '+251 91 234 0011',
      shiftPreference: 'EVENING',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
    {
      regNumber: 12,
      employeeId: 'EMP-MOA-112',
      fullName: 'ሮማን ተፈራ (Roman Tefera)',
      department: 'የግብርና ግብዓት (Agricultural Input Directorate)',
      phone: '+251 91 234 0012',
      shiftPreference: 'LUNCH',
      registeredBy: 'Tigist Alemayehu (Front Desk)',
      registrationSource: 'PAPER_FORM',
      signatureConfirmed: true,
      status: 'ACTIVE',
    },
  ];

  for (const reg of paperRegistrants) {
    // Ensure HR Roster record exists so employee is fully whitelisted
    await prisma.hrEmployeeRoster.upsert({
      where: { employeeId: reg.employeeId },
      update: {
        fullName: reg.fullName,
        department: reg.department,
        phone: reg.phone,
      },
      create: {
        employeeId: reg.employeeId,
        fullName: reg.fullName,
        department: reg.department,
        phone: reg.phone,
        employmentStatus: EmploymentStatus.ACTIVE,
      },
    });

    // Seed Gym Registration record
    await prisma.gymRegistration.upsert({
      where: { regNumber: reg.regNumber },
      update: reg,
      create: reg,
    });
  }
  console.log(`✓ ${paperRegistrants.length} Official Paper Registrants digitized into Gym Registry`);

  // Ensure PostgreSQL sequence for GymRegistration.regNumber is aligned with highest regNumber
  try {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"GymRegistration"', 'regNumber'), COALESCE(MAX("regNumber"), 1)) FROM "GymRegistration";`
    );
  } catch (seqErr) {
    console.warn('Note: Sequence setval skipped or not needed:', seqErr);
  }

  console.log('\n🎉 MoA Gym database seed completed successfully!');
  console.log('Credentials Summary:');
  console.log('  Admin:         admin@moa.gov.et / Password123! (ID: EMP-ADM-01)');
  console.log('  Gym Attendant: desk@moa.gov.et  / Password123! (ID: EMP-DSK-01)');
  console.log('  Staff Member:  dawit.y@moa.gov.et / Password123! (ID: EMP-MOA-001)');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
