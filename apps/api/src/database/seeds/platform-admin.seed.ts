import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRole, UserLevel } from '@techfield/types';

export async function seedPlatformAdmin(dataSource: DataSource) {
  const usersRepo = dataSource.getRepository(User);

  const existing = await usersRepo.findOne({
    where: { phone: '+521000000000' },
  });

  if (existing) {
    console.log('Platform admin already seeded, skipping.');
    return;
  }

  // Seed platform admin (Vemontech internal)
  const admin = usersRepo.create({
    name: 'Vemontech Admin',
    phone: '+521000000000',
    phoneVerified: true,
    role: UserRole.PLATFORM_ADMIN,
    zoneCity: 'García',
    zoneState: 'Nuevo León',
    zoneCountry: 'MX',
    specialties: [],
    referralCode: 'VEMON01',
    totalPoints: 9999,
    level: UserLevel.ELITE,
    activityScore: 100,
    lastActivityAt: new Date(),
  });

  await usersRepo.save(admin);
  console.log(`  ✓ Platform admin created (referral code: VEMON01)`);

  // Seed first technician for testing with the admin's referral code
  const techExisting = await usersRepo.findOne({ where: { phone: '+521111111111' } });
  if (!techExisting) {
    const tech = usersRepo.create({
      name: 'Técnico Demo',
      phone: '+521111111111',
      phoneVerified: true,
      role: UserRole.TECHNICIAN,
      zoneCity: 'Monterrey',
      zoneState: 'Nuevo León',
      zoneCountry: 'MX',
      specialties: ['installation', 'revision'],
      referrerId: admin.id,
      referralCode: 'TECH01',
      totalPoints: 0,
      level: UserLevel.NOVATO,
      activityScore: 100,
      lastActivityAt: new Date(),
    });
    await usersRepo.save(tech);
    console.log(`  ✓ Demo technician created (referral code: TECH01)`);
  }
}
