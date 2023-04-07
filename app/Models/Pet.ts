import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import PetPicture from './PetPicture'
import VetCard from './VetCard'
import User from './User'

export default class Pet extends BaseModel {
	@column()
	public id: number

	@column({ isPrimary: true })
	public uuid: string

	@column()
	public age: number

	@column()
	public age_period: string

	@column()
	public classification: string

	@column()
	public breed: string

	@column()
	public weight: number

	@column()
	public color: string

	@column()
	public name: string

	@column()
	public gender: string

	@hasMany(() => PetPicture, { foreignKey: 'petId', localKey: 'uuid' })
	public pictures: HasMany<typeof PetPicture>

	@hasOne(() => VetCard)
	public vetCard: HasOne<typeof VetCard>

	@column()
	public ownerId: string

	@hasOne(() => User, { foreignKey: 'uuid', localKey: 'ownerId' })
	public owner: HasOne<typeof User>

	@column()
	public verificationStatus: string

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime

	@column.dateTime()
	public deletedAt: DateTime
}
