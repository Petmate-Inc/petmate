import { schema } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ChangePasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    oldPassword: schema.string(),
    newPassword: schema.string(),
  })

  public messages = {}
}
