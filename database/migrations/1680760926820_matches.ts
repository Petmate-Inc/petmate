import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateMatches extends BaseSchema {
	protected tableName = 'matches'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id')
			table.string('uuid')
			table.string('pet_uuid')
			table.string('breeder_uuid').references('uuid').inTable('users')
			table.boolean('accepted').defaultTo(false)
			table.timestamp('created_at', { useTz: true })
			table.timestamp('updated_at', { useTz: true })
			table.timestamp('deleted_at', { useTz: true }).nullable()
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
