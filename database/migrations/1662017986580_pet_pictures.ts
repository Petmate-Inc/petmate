import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PetPictures extends BaseSchema {
	protected tableName = 'pet_pictures'

	public async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments('id')
			table.string('uuid').unique()
			table.string('pet_id').references('pets.uuid')
			table.string('image_url')
			table.boolean('is_primary').defaultTo(false)
			table.timestamps()
			table.timestamp('deleted_at')
		})
	}

	public async down() {
		this.schema.dropTable(this.tableName)
	}
}
