import { DateTime } from "luxon";
import Hash from "@ioc:Adonis/Core/Hash";
import { column, beforeSave, BaseModel } from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuidv4 } from "uuid";
export default class User extends BaseModel {
  @beforeSave()
  public static async addUUID(user: User) {
    if (!user.uuid) {
      user.uuid = uuidv4();
    }
  }

  @column()
  public id: number;

  @column({ isPrimary: true })
  public uuid: string;

  @column()
  public email: string;

  @column()
  public phone: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public rememberMeToken?: string;

  @column()
  public firstName: string;

  @column()
  public lastName: string;

  @column()
  public bvn: number;

  @column()
  public address: string;

  @column()
  public city: string;

  @column()
  public state: string;

  @column()
  public country: string;

  @column()
  public status: string;

  @column()
  public bonus_points: number;

  @column()
  public userGroup: string;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;

  @column.dateTime()
  public deleted_at: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }
}
