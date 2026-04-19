import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthTokensAndPin1700000001000 implements MigrationInterface {
  name = 'AuthTokensAndPin1700000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Refresh tokens table
    await queryRunner.query(`
      CREATE TABLE refresh_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "tokenHash" VARCHAR NOT NULL UNIQUE,
        "expiresAt" TIMESTAMP NOT NULL,
        revoked BOOLEAN NOT NULL DEFAULT false,
        "deviceInfo" VARCHAR,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens("tokenHash")`);
    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_user ON refresh_tokens("userId")`);

    // PIN hash column on users (set after first OTP verify)
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "pinHash" VARCHAR`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS "pinHash"`);
    await queryRunner.query(`DROP TABLE IF EXISTS refresh_tokens`);
  }
}
