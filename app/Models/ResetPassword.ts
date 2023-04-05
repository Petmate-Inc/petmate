import { DateTime } from 'luxon'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'

export default class ResetPassword extends BaseModel {
	@beforeSave()
	public static async addUUID(resetPassword: ResetPassword) {
		if (!resetPassword.uuid) {
			resetPassword.uuid = uuidv4()
		}
	}
	@column({ isPrimary: true })
	public id: number

	@column()
	public uuid: string

	@column()
	public token: number

	@column()
	public email: string

	@column.dateTime({ autoCreate: true })
	public created_at: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updated_at: DateTime

	@column.dateTime()
	public deleted_at: DateTime
}
