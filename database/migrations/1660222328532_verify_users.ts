import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class VerifyUsers extends BaseSchema {
  protected tableName = "verify_users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("uuid").unique().notNullable();
      table.string("user_id");
      table.string("token").unique().notNullable().index();
      table.string("email").unique().notNullable().index();
      table.timestamps();
      table.timestamp("deleted_at").nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
