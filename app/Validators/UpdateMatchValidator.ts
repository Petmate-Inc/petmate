import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateMatchValidator {
	constructor(protected ctx: HttpContextContract) {}

	public schema = schema.create({
		accepted: schema.boolean(),
	})

	public messages: CustomMessages = {}
}
