import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp for UUID generation
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Enums
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('technician', 'company_admin', 'company_technician', 'platform_admin')
    `);
    await queryRunner.query(`
      CREATE TYPE user_level_enum AS ENUM ('novato', 'verificado', 'pro', 'senior', 'elite')
    `);
    await queryRunner.query(`
      CREATE TYPE wo_type_enum AS ENUM ('installation', 'revision', 'support', 'config', 'motor_cut')
    `);
    await queryRunner.query(`
      CREATE TYPE wo_status_enum AS ENUM ('draft', 'in_progress', 'completed', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TYPE evidence_stage_enum AS ENUM ('before', 'during', 'after', 'device', 'other')
    `);
    await queryRunner.query(`
      CREATE TYPE referral_status_enum AS ENUM ('pending', 'active', 'rewarded')
    `);
    await queryRunner.query(`
      CREATE TYPE kb_type_enum AS ENUM ('motor_cut', 'device_config', 'known_issue', 'install_guide')
    `);
    await queryRunner.query(`
      CREATE TYPE kb_status_enum AS ENUM ('draft', 'pending', 'approved', 'rejected')
    `);

    // Users table
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        role user_role_enum NOT NULL DEFAULT 'technician',
        name VARCHAR NOT NULL,
        phone VARCHAR NOT NULL UNIQUE,
        "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
        email VARCHAR,
        "avatarUrl" VARCHAR,
        "zoneCity" VARCHAR,
        "zoneState" VARCHAR,
        "zoneCountry" VARCHAR NOT NULL DEFAULT 'MX',
        specialties JSONB NOT NULL DEFAULT '[]',
        "referrerId" UUID REFERENCES users(id),
        "totalPoints" INTEGER NOT NULL DEFAULT 0,
        level user_level_enum NOT NULL DEFAULT 'novato',
        "activityScore" INTEGER NOT NULL DEFAULT 100,
        "lastActivityAt" TIMESTAMP,
        "isMarketplaceVisible" BOOLEAN NOT NULL DEFAULT true,
        "fcmToken" VARCHAR,
        "referralCode" VARCHAR UNIQUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Referrals table
    await queryRunner.query(`
      CREATE TABLE referrals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "referrerId" UUID NOT NULL REFERENCES users(id),
        "referredId" UUID NOT NULL REFERENCES users(id),
        code VARCHAR NOT NULL UNIQUE,
        status referral_status_enum NOT NULL DEFAULT 'pending',
        "firstOtCompletedAt" TIMESTAMP,
        "pointsGranted" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Work orders table
    await queryRunner.query(`
      CREATE TABLE work_orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug VARCHAR NOT NULL UNIQUE,
        "workspaceId" UUID,
        "technicianId" UUID NOT NULL REFERENCES users(id),
        type wo_type_enum NOT NULL,
        status wo_status_enum NOT NULL DEFAULT 'draft',
        "clientName" VARCHAR NOT NULL,
        "clientPhone" VARCHAR,
        "vehicleBrand" VARCHAR NOT NULL,
        "vehicleModel" VARCHAR NOT NULL,
        "vehicleYear" INTEGER NOT NULL,
        "vehiclePlate" VARCHAR NOT NULL,
        "vehicleColor" VARCHAR,
        "vehicleVin" VARCHAR,
        "deviceBrand" VARCHAR NOT NULL,
        "deviceModel" VARCHAR NOT NULL,
        "deviceImei" VARCHAR NOT NULL,
        "deviceSim" VARCHAR,
        "deviceOperator" VARCHAR,
        "devicePlatform" VARCHAR,
        notes TEXT,
        "clientRating" INTEGER,
        "clientSignatureUrl" VARCHAR,
        latitude DECIMAL,
        longitude DECIMAL,
        address TEXT,
        "isPrivate" BOOLEAN NOT NULL DEFAULT false,
        "completedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Evidences table
    await queryRunner.query(`
      CREATE TABLE evidences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "workOrderId" UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
        stage evidence_stage_enum NOT NULL,
        url VARCHAR NOT NULL,
        "thumbnailUrl" VARCHAR,
        latitude DECIMAL,
        longitude DECIMAL,
        "takenAt" TIMESTAMP,
        "fileSize" INTEGER,
        "uploadedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Points log table
    await queryRunner.query(`
      CREATE TABLE points_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id),
        delta INTEGER NOT NULL,
        reason VARCHAR NOT NULL,
        "referenceId" UUID,
        "scoreAfter" INTEGER NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // User badges table
    await queryRunner.query(`
      CREATE TABLE user_badges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id),
        "badgeKey" VARCHAR NOT NULL,
        "earnedAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE("userId", "badgeKey")
      )
    `);

    // KB entries table
    await queryRunner.query(`
      CREATE TABLE kb_entries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type kb_type_enum NOT NULL,
        title VARCHAR NOT NULL,
        "vehicleBrand" VARCHAR,
        "vehicleModel" VARCHAR,
        "yearFrom" INTEGER,
        "yearTo" INTEGER,
        "deviceBrand" VARCHAR,
        "deviceModel" VARCHAR,
        operator VARCHAR,
        content JSONB NOT NULL DEFAULT '{}',
        photos JSONB NOT NULL DEFAULT '[]',
        "authorId" UUID NOT NULL REFERENCES users(id),
        status kb_status_enum NOT NULL DEFAULT 'pending',
        "approvedBy" UUID REFERENCES users(id),
        "useCount" INTEGER NOT NULL DEFAULT 0,
        "voteCount" INTEGER NOT NULL DEFAULT 0,
        "ratingAvg" DECIMAL NOT NULL DEFAULT 0,
        country VARCHAR NOT NULL DEFAULT 'MX',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // KB votes table
    await queryRunner.query(`
      CREATE TABLE kb_votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "entryId" UUID NOT NULL REFERENCES kb_entries(id) ON DELETE CASCADE,
        "userId" UUID NOT NULL REFERENCES users(id),
        "isUseful" BOOLEAN NOT NULL,
        rating INTEGER,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE("entryId", "userId")
      )
    `);

    // Indexes
    await queryRunner.query(`CREATE INDEX idx_users_phone ON users(phone)`);
    await queryRunner.query(`CREATE INDEX idx_users_referral_code ON users("referralCode")`);
    await queryRunner.query(`CREATE INDEX idx_work_orders_technician ON work_orders("technicianId")`);
    await queryRunner.query(`CREATE INDEX idx_work_orders_slug ON work_orders(slug)`);
    await queryRunner.query(`CREATE INDEX idx_evidences_work_order ON evidences("workOrderId")`);
    await queryRunner.query(`CREATE INDEX idx_points_log_user ON points_log("userId")`);
    await queryRunner.query(`CREATE INDEX idx_kb_entries_type ON kb_entries(type)`);
    await queryRunner.query(`CREATE INDEX idx_kb_entries_status ON kb_entries(status)`);

    // Full-text search index on KB
    await queryRunner.query(`
      CREATE INDEX idx_kb_entries_fts ON kb_entries
      USING GIN(to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce("vehicleBrand",'') || ' ' || coalesce("vehicleModel",'')))
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS kb_votes`);
    await queryRunner.query(`DROP TABLE IF EXISTS kb_entries`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_badges`);
    await queryRunner.query(`DROP TABLE IF EXISTS points_log`);
    await queryRunner.query(`DROP TABLE IF EXISTS evidences`);
    await queryRunner.query(`DROP TABLE IF EXISTS work_orders`);
    await queryRunner.query(`DROP TABLE IF EXISTS referrals`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TYPE IF EXISTS kb_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS kb_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS referral_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS evidence_stage_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS wo_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS wo_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_level_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
  }
}
