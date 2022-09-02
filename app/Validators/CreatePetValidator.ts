import { schema } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreatePetValidator {
	constructor(protected ctx: HttpContextContract) {}

	public schema = schema.create({
		age: schema.number(),
		age_period: schema.enum(['days', 'weeks', 'months', 'years']),
		classification: schema.string(),
		breed: schema.string(),
		weight: schema.number.optional(),
		color: schema.string(),
		primary_image_url: schema.string(),
		name: schema.string(),
		gender: schema.enum(['male', 'female']),
	})

	public messages = {}
}
