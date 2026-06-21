import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueIndexToPaymentSourceId1755945600000
  implements MigrationInterface
{
  name = 'AddUniqueIndexToPaymentSourceId1755945600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear índice UNIQUE en payment_source.sourceId
    // Idempotente: si el índice ya existe, la migración no falla
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_source_sourceId" ON "payment_source" ("sourceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: eliminar el índice UNIQUE
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_payment_source_sourceId"`,
    );
  }
}
