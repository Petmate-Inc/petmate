import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import User from './User'
import Pet from './Pet'

export default class Match extends BaseModel {
	@beforeSave()
	public static async addUUID(user: Match) {
		if (!user.uuid) {
			user.uuid = uuidv4()
		}
	}

	@column()
	public id: number

	@column({ isPrimary: true })
	public uuid: string

	@column()
	public petUuid: string

	@column()
	public breederUuid: string

	@belongsTo(() => User, { foreignKey: 'breederUuid', localKey: 'uuid' })
	public breeder: BelongsTo<typeof User>

	@belongsTo(() => Pet)
	public pet: BelongsTo<typeof Pet>

	@column()
	public accepted: boolean

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@column.dateTime()
	public deleted_at: DateTime
}
