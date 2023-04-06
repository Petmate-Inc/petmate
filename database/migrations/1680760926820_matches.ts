import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateMatches extends BaseSchema {
  protected tableName = 'create_matches'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uuid')
      table.string('pet_id')
      table.string('user_id')
      table.boolean('accepted')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
