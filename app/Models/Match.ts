import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, column, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'

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
  public pet_id: string

  @column()
  public user_id: string

  @column()
  public accepted: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
	public deleted_at: DateTime

  @beforeSave()
	public static async hashPassword(user: User) {
		if (user.$dirty.password) {
			user.password = await Hash.make(user.password)
		}
	}
}
