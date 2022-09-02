import { schema } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePetValidator {
	constructor(protected ctx: HttpContextContract) {}

	public schema = schema.create({
		age: schema.number.optional(),
		age_period: schema.string.optional(),
		breed: schema.string.optional(),
		weight: schema.number.optional(),
		color: schema.string.optional(),
		name: schema.string.optional(),
		gender: schema.enum.optional(['male', 'female']),
		classification: schema.string.optional(),
	})

	public messages = {}
}
