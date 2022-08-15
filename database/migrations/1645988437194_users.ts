import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class UsersSchema extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table.string("uuid", 255).unique();
      table.string("email", 255).unique();
      table.string("phone");
      table.string("password", 180);
      table.string("remember_me_token").nullable();
      table
        .enum("status", ["approved", "pending", "banned"])
        .defaultTo("pending");
      table
        .enum("user_group", ["user", "admin", "super-admin"])
        .defaultTo("user");
      table.string("first_name");
      table.string("last_name");
      table.string("address");
      table.string("city");
      table.string("state");
      table.string("country");
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
      table.timestamp("deleted_at").nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
