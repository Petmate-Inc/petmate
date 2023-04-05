import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ResetPasswordValidator {
	constructor(protected ctx: HttpContextContract) {}

	public schema = schema.create({
		otp: schema.number(),
		newPassword: schema.string({}, [rules.minLength(9), rules.confirmed('confirmNewPassword')]),
	})

	public messages: CustomMessages = {}
}
