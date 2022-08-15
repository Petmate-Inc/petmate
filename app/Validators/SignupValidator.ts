import { schema } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class SignupValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    firstName: schema.string(),
    lastName: schema.string(),
    email: schema.string(),
    password: schema.string(),
    phoneNumber: schema.string(),
  });

  public messages = {};
}
