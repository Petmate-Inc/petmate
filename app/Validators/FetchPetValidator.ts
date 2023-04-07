import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class FetchPetValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    pet_breed: schema.string.optional(),
    name: schema.string.optional(),
    age: schema.number.optional(),
    gender: schema.string.optional(),
    type: schema.string.optional(),
    search: schema.string.optional()
  })


  public messages: CustomMessages = {}
}
