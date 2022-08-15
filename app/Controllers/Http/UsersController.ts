import Mail from "@ioc:Adonis/Addons/Mail";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";
import { v4 as uuidv4 } from "uuid";
import Hash from "@ioc:Adonis/Core/Hash";
import {
  successfulResponse,
  badResponse,
  unauthorizedResponse,
} from "../../Helpers/Responses";
import VerifyUser from "App/Models/VerifyUser";
import LoginValidator from "App/Validators/LoginValidator";
import SignupValidator from "App/Validators/SignupValidator";

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    try {
      const { email, password } = await request.validate(LoginValidator);

      const user = await User.query()
        .where("email", email)
        .whereNull("deleted_at")
        .first();

      if (!user) {
        return unauthorizedResponse({
          response,
          message: "Invalid email or password",
        });
      }

      if (!(await Hash.verify(user.password, password))) {
        return unauthorizedResponse({
          response,
          message: "Invalid email or password",
        });
      }

      const token = await auth
        .use("api")
        .generate(user, { expiresIn: "30mins" });

      if (user.status === "pending") {
        return unauthorizedResponse({
          response,
          message: `Kindly verify your account to proceed`,
        });
      } else if (user.status === "banned") {
        return unauthorizedResponse({
          response,
          message: `Your account has been banned, kindly contact support`,
        });
      }

      return successfulResponse({
        response,
        message: "Successfully Logged In",
        data: {
          token,
          user,
        },
      });
    } catch (error) {
      console.log("login error", error.messages);
      return badResponse({
        response,
        message: "Unsuccessul Login",
        error,
      });
    }
  }
  public async signup({ request, response }: HttpContextContract) {
    try {
      const { firstName, lastName, email, password, phoneNumber } =
        await request.validate(SignupValidator);
      const userId = uuidv4();

      const emailExists = await User.query().where("email", email).first();

      if (emailExists) {
        return badResponse({
          response,
          message: "Email address exists. Use another",
        });
      }

      await Database.transaction(async (trx) => {
        let user = new User();
        user.email = email;
        user.phone = phoneNumber;
        user.password = password;
        user.firstName = firstName;
        user.lastName = lastName;
        user.uuid = userId;
        await user.useTransaction(trx).save();

        const token = uuidv4();
        const verifyUsers = new VerifyUser();
        verifyUsers.email = email;
        verifyUsers.user_id = userId;
        verifyUsers.token = token;
        await verifyUsers.useTransaction(trx).save();

        await Mail.sendLater((message) => {
          const data = {
            user: user.firstName,
            url: `https://petmate.herokuapp.com/api/v1/verify-user/${token}`,
          };
          message
            .from("support@thegridtrade.com")
            .to(user.email)
            .subject("Verification Email")
            .htmlView("emails/verify", data);
        });
      });

      return response.status(201).json({
        status: true,
        message: "User account successfully created",
      });
    } catch (error) {
      console.log("Signup error ==>", error);
      return badResponse({
        response,
        message: "account creation unsuccessful",
        error,
      });
    }
  }

  public async verify({ request, response }: HttpContextContract) {
    try {
      const { token } = request.params();
      const verifyUser = await VerifyUser.query().where("token", token).first();

      if (!verifyUser) {
        return badResponse({
          response,
          message: "Invalid token",
        });
      }

      const user = await User.query().where("email", verifyUser.email).first();

      if (!user) {
        return badResponse({
          response,
          message: "Invalid user token",
        });
      }

      user.status = "approved";
      const saveUser = user.save();
      const deleteToken = verifyUser.delete();

      Promise.all([saveUser, deleteToken]);

      return successfulResponse({
        response,
        message: "User successfully verified",
      });
    } catch (error) {
      return badResponse({
        response,
        message: "Bad request, try again",
        error,
      });
    }
  }

  public async details({ auth, response }: HttpContextContract) {
    try {
      const user = auth.user;
      if (!user) {
        return unauthorizedResponse({
          response,
          message: "Kindly login to view this resource",
        });
      }

      const userData = await User.query()
        .where("uuid", user.uuid)
        .whereNull("deleted_at")
        .first();

      return successfulResponse({
        response,
        message: "User details successfully retrieved",
        data: { userData },
      });
    } catch (error) {
      console.log("user retrieval error", error);
      return badResponse({
        response,
        message: "Something went wrong",
      });
    }
  }

  public async resendVerificationLink({
    request,
    response,
  }: HttpContextContract) {
    const { email } = request.all();

    const emailTokenExists = await VerifyUser.query()
      .where("email", email)
      .preload("user")
      .first();

    if (!emailTokenExists) {
      return badResponse({
        response,
        message: "Something went wrong",
      });
    }

    const user = emailTokenExists.user;

    await Mail.sendLater((message) => {
      const data = {
        user: user.firstName,
        url: `https://gridcryptotrade.herokuapp.com/api/v1/verify-user/${emailTokenExists.token}`,
      };
      message
        .from("support@thegridtrade.com")
        .to(emailTokenExists.email)
        .subject("Verification Email")
        .htmlView("verify", data);
    });

    return successfulResponse({
      response,
      message: "Verification link has been resent",
    });
  }

  public async changePassword({
    auth,
    request,
    response,
  }: HttpContextContract) {
    const user = auth.user;
    if (!user) {
      return unauthorizedResponse({
        response,
        message: "Invalid user credentials",
      });
    }
    const { oldPassword, newPassword } = request.all();
    const res = await auth
      .use("api")
      .verifyCredentials(user.email, oldPassword);

    if (!res) {
      return unauthorizedResponse({
        response,
        message: "Old password incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    return successfulResponse({
      response,
      message: "Password changed successfully.",
    });
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use("api").revoke();
    return successfulResponse({
      response,
      message: "Successfully Logged Out",
    });
  }
}
