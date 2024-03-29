import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Pets extends BaseSchema {
	protected tableName = 'pets'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id')
			table.string('uuid').unique()
			table.double('age')
			table.enum('age_period', ['days', 'weeks', 'months', 'years'])
			table.string('classification')
			table.string('breed')
			table.double('weight')
			table.string('color')
			table.string('name')
			table.enum('gender', ['male', 'female'])
			table
				.enum('verification_status', ['verified', 'verification_ongoing', 'unverified'])
				.defaultTo('unverified')
			table.string('owner_id').references('uuid').inTable('users')
			table.timestamps()
			table.timestamp('deleted_at')
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
