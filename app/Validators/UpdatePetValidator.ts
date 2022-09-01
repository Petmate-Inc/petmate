import { schema } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdatePetValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    age: schema.number.optional(),
    breed: schema.string(),
    weight: schema.number.optional(),
    color: schema.string.optional(),
    primary_image_url: schema.string.prototype(),
    name: schema.string.optional(),
  })

  public messages = {}
}
