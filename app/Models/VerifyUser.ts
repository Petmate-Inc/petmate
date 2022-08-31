import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import User from './User'

export default class VerifyUser extends BaseModel {
  @beforeSave()
  public static async addUUID(verifyUser: VerifyUser) {
    if (!verifyUser.uuid) {
      verifyUser.uuid = uuidv4()
    }
  }

  @column()
  public id: number

  @column({ isPrimary: true })
  public uuid: string

  @column()
  public user_id: string

  @column()
  public email: string

  @column()
  public token: string

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime({})
  public deletedAt: DateTime
}
