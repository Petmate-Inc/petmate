import { schema } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    phone: schema.string.optional(),
    firstName: schema.string.optional(),
    lastName: schema.string.optional(),
    address: schema.string.optional(),
    city: schema.string.optional(),
    state: schema.string.optional(),
    country: schema.string.optional(),
  })

  public messages = {}
}
