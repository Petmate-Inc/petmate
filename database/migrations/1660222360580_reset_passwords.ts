import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class ResetPasswords extends BaseSchema {
  protected tableName = "reset_passwords";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("uuid", 255).unique().notNullable();
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
