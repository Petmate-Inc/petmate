import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateMatchValidator {
	constructor(protected ctx: HttpContextContract) {}
	public schema = schema.create({
		pet_id : schema.string.optional(),
		accepted: schema.boolean.optional()
	})

	public messages: CustomMessages = {}
}
