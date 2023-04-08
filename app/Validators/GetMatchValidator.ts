import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class GetMatchValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    accepted: schema.boolean.optional()
  })

  public messages: CustomMessages = {}
}
