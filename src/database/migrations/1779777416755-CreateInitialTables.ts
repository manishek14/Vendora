import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1779777416755 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL UNIQUE,
        "description" character varying,
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "phone" character varying UNIQUE,
        "email" character varying UNIQUE,
        "password" character varying,
        "isPhoneVerified" boolean NOT NULL DEFAULT false,
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "fullName" character varying,
        "avatar" character varying,
        "isBanned" boolean NOT NULL DEFAULT false,
        "totalPurchaseAmount" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "addresses" (
        "id" SERIAL NOT NULL,
        "province" character varying NOT NULL,
        "city" character varying NOT NULL,
        "fullAddress" character varying NOT NULL,
        "postalCode" character varying(10) NOT NULL,
        "lat" double precision,
        "lng" double precision,
        "isDefault" boolean NOT NULL DEFAULT false,
        "userId" integer,
        CONSTRAINT "PK_addresses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_addresses_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "userId" integer NOT NULL,
        "roleId" integer NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("userId", "roleId"),
        CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`CREATE INDEX "IDX_users_phone" ON "users" ("phone") WHERE "phone" IS NOT NULL;`);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email") WHERE "email" IS NOT NULL;`);
    await queryRunner.query(`CREATE INDEX "IDX_addresses_user" ON "addresses" ("userId");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_roles";`);
    await queryRunner.query(`DROP TABLE "addresses";`);
    await queryRunner.query(`DROP TABLE "users";`);
    await queryRunner.query(`DROP TABLE "roles";`);
  }
}