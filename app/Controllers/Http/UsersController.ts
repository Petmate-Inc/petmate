import Mail from '@ioc:Adonis/Addons/Mail'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { v4 as uuidv4 } from 'uuid'
import Hash from '@ioc:Adonis/Core/Hash'
import {
	successfulResponse,
	badRequestResponse,
	unauthorizedResponse,
	notFoundResponse,
	deletedResponse,
} from '../../Helpers/Responses'
import VerifyUser from 'App/Models/VerifyUser'
import LoginValidator from 'App/Validators/LoginValidator'
import SignupValidator from 'App/Validators/SignupValidator'
import ResendOtpValidator from 'App/Validators/ResendOtpValidator'
import Logger from '@ioc:Adonis/Core/Logger'
import SendOtpValidator from 'App/Validators/SendOtpValidator'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'
import ChangePasswordValidator from 'App/Validators/ChangePasswordValidator'
import { DateTime } from 'luxon'
import { generateOtp } from 'App/Utils/generateOtp'
import { Request } from '@adonisjs/core/build/standalone'

export default class AuthController {
	public async login({ auth, request, response }: HttpContextContract) {
		try {
			const { email, password } = await request.validate(LoginValidator)

			const user = await User.query().where('email', email).whereNull('deleted_at').first()

			if (!user) {
				Logger.error({err: new Error("Invalid email or password")}, "Invalid email or password when the user is not found")
				return unauthorizedResponse({
					response,
					message: 'Invalid email or password',
				})
			}

			if (!(await Hash.verify(user.password, password))) {
				Logger.error({err: new Error("Invalid email or password")}, "Invalid email or password if password does not match exixting password")
				return unauthorizedResponse({
					response,
					message: 'Invalid email or password',
				})
			}

			const token = await auth.use('api').generate(user, { expiresIn: '30mins' })

			if (user.status === 'pending') {
				Logger.error({err: new Error("Account not verified")}, "Account not verified when user has not verified their email")
				return unauthorizedResponse({
					response,
					message: `Kindly verify your account to proceed`,
				})
			} else if (user.status === 'banned') {
				Logger.error({err: new Error("Account is banned")}, "This account is banned , kindly contact support")
				return unauthorizedResponse({
					response,
					message: `Your account has been banned, kindly contact support`,
				})
			}

			return successfulResponse({
				response,
				message: 'Successfully Logged In',
				data: {
					token,
					user,
				},
			})
		} catch (error) {
			console.log('login error', error.messages)
			Logger.error({err: error.messages}, "The Login us unsuccessful")
			return badRequestResponse({
				response,
				message: 'Unsuccessul Login',
				error,
			})
		}
	}
	public async signup({ request, response }: HttpContextContract) {
		try {
			const { firstName, lastName, email, password, phoneNumber } = await request.validate(
				SignupValidator,
			)
			const userId = uuidv4()

			const emailExists = await User.query().where('email', email).first()

			if (emailExists) {
				Logger.error({err: new Error("Email alredy aexist")}, "Email address provided already exist in the database")
				return badRequestResponse({
					response,
					message: 'Email address exists. Use another',
				})
			}

			await Database.transaction(async (trx) => {
				let user = new User()
				user.email = email
				user.phone = phoneNumber
				user.password = password
				user.firstName = firstName
				user.lastName = lastName
				user.uuid = userId
				await user.useTransaction(trx).save()

				const token = generateOtp()
				const verifyUsers = new VerifyUser()
				verifyUsers.email = email
				verifyUsers.user_id = userId
				verifyUsers.token = token
				await verifyUsers.useTransaction(trx).save()

				await Mail.sendLater((message) => {
					const data = {
						user: user.firstName,
						otp: token,
					}
					message
						.from('support@petmatehq.com')
						.to(user.email)
						.subject('Verification Email')
						.htmlView('emails/verify', data)
				})
			})

			return response.status(201).json({
				status: true,
				message: 'User account successfully created',
			})
		} catch (error) {
			Logger.error({err: error}, "Account creation was unsuccessful")
			console.log('Signup error ==>', error)
			return badRequestResponse({
				response,
				message: 'account creation unsuccessful',
				error,
			})
		}
	}


	public async verify({ request, response }: HttpContextContract) {
		try {
			const { token } = request.params()
			const verifyUser = await VerifyUser.query().where('token', token).first()

			if (!verifyUser) {
				Logger.error({err: new Error("Invalid token")}, "token is invalid")
				return badRequestResponse({
					response,
					message: 'Invalid token',
				})
			}

			const user = await User.query().where('email', verifyUser.email).first()

			if (!user) {
				return badRequestResponse({
					response,
					message: 'Invalid user token',
				})
			}

			user.status = 'approved'
			const saveUser = user.save()
			const deleteToken = verifyUser.delete()

			Promise.all([saveUser, deleteToken])

			return successfulResponse({
				response,
				message: 'User successfully verified',
			})
		} catch (error) {
			return badRequestResponse({
				response,
				message: 'Bad request, try again',
				error,
			})
		}
	}

	public async details({ auth, response }: HttpContextContract) {
		try {
			const user = auth.user
			if (!user) {
				return unauthorizedResponse({
					response,
					message: 'Kindly login to view this resource',
				})
			}

			const userData = await User.query().where('uuid', user.uuid).whereNull('deleted_at').first()

			return successfulResponse({
				response,
				message: 'User details successfully retrieved',
				data: { userData },
			})
		} catch (error) {
			console.log('user retrieval error', error)
			return badRequestResponse({
				response,
				message: 'Something went wrong',
			})
		}
	}

	public async resendOtp({ request, response }: HttpContextContract) {
		const { email } = await request.validate(ResendOtpValidator)

		const emailTokenExists = await VerifyUser.query().where('email', email).preload('user').first()

		if (!emailTokenExists) {
			Logger.error({err: new Error("OTP expired or invalid")}, "request new otp code, previous code is invalid or expired")
			return badRequestResponse({
				response,
				message: 'request new otp code, previous code is invalid or expired',
			})
		}

		const user = emailTokenExists.user

		await Mail.sendLater((message) => {
			const data = {
				user: user.firstName,
				otp: emailTokenExists.token,
			}
			message
				.from('support@petmate.ng')
				.to(emailTokenExists.email)
				.subject('Verification Email')
				.htmlView('emails/verify', data)
		})

		return successfulResponse({
			response,
			message: 'OTP code has been resent',
		})
	}

	public async sendOtp({ request, response }: HttpContextContract) {
		try {
			const { email } = await request.validate(SendOtpValidator)
			await Database.transaction(async (trx) => {
				const token = generateOtp()
				const verifyUsers = new VerifyUser()
				verifyUsers.email = email
				verifyUsers.token = token
				await verifyUsers.useTransaction(trx).save()

				await Mail.sendLater((message) => {
					const data = {
						user: 'there',
						otp: token,
					}
					message
						.from('support@petmate.ng')
						.to(email)
						.subject('Verification Email')
						.htmlView('emails/verify', data)
				})
			})
		} catch (error) {
			Logger.error({ err: error }, 'failed to send otp')
			return badRequestResponse({ response, message: 'failed to send OTP', error })
		}
	}

	public async updatePassword({ auth, request, response }: HttpContextContract) {
		const { oldPassword, newPassword } = await request.validate(ChangePasswordValidator)

		try {
			const user = auth.user
			if (!user) {
				return unauthorizedResponse({
					response,
					message: 'Invalid user credentials',
				})
			}

			const res = await auth.use('api').verifyCredentials(user.email, oldPassword)

			if (!res) {
				return unauthorizedResponse({
					response,
					message: 'Old password incorrect',
				})
			}

			user.password = newPassword
			await user.save()

			return successfulResponse({
				response,
				message: 'Password changed successfully.',
			})
		} catch (error) {
			return badRequestResponse({ response, message: 'failed to update password', error })
		}
	}

	public async update({ auth, request, response }: HttpContextContract) {
		try {
			const { phone, firstName, lastName, address, city, state, country } = await request.validate(
				UpdateUserValidator,
			)

			const user: User | null = auth.user ?? null

			if (!user) {
				return notFoundResponse({ response, message: 'User not found' })
			}

			if (phone) {
				user.phone = phone
			}

			if (firstName) {
				user.firstName = firstName
			}

			if (lastName) {
				user.lastName = lastName
			}

			if (address) {
				user.address = address
			}

			if (city) {
				user.city = city
			}

			if (state) {
				user.state = state
			}

			if (country) {
				user.country = country
			}

			await user.save()

			return successfulResponse({ response, message: 'Successfully updated user profile' })
		} catch (error) {
			return badRequestResponse({ response, message: 'failed to update user', error })
		}
	}

	public async delete({ auth, response }: HttpContextContract) {
		try {
			const user: User | null = auth.user ?? null

			if (!user) {
				throw new Error('user not found')
			}

			user.deleted_at = DateTime.now()
			await user.save()

			return deletedResponse({ response, message: 'successfully deleted account' })
		} catch (error) {
			return badRequestResponse({ response, message: 'failed to delete account', error })
		}
	}

	public async logout({ auth, response }: HttpContextContract) {
		await auth.use('api').revoke()
		return successfulResponse({
			response,
			message: 'Successfully Logged Out',
		})
	}

	public async getGoogleAuthLink({ ally }) {
		return ally.use('google').redirect()
	}

	public async getFacebookAuthLink({ ally }) {
		return ally.use('facebook').redirect()
	}

	// callbacks for social authentication
	public async handleFacebookAuthCallback({ ally, auth, response }: HttpContextContract) {
		try {
			const facebook = ally.use('facebook')

			/**
			 * User has explicitly denied the login request
			 */
			if (facebook.accessDenied()) {
				Logger.error({err: new Error("Access denied")}, 'Access with facebook auth was denied')

				throw new Error('Access was denied')
			}

			/**
			 * Unable to verify the CSRF state
			 */
			if (facebook.stateMisMatch()) {
				Logger.error({err: new Error("Mismatched error")}, 'Request expired. Retry again')

				throw new Error('Request expired. Retry again')
			}

			/**
			 * There was an unknown error during the redirect
			 */
			if (facebook.hasError()) {
				Logger.error({err: new Error("unkown error")},"Facebook error not specified")
				throw new Error(facebook.getError() ?? 'Error not specified')
			}

			/**
			 * Finally, access the user
			 */
			const facebookUser = await facebook.user()

			/**
			 * Find the user by email or create
			 * a new one
			 */

			if (!facebookUser.email) {
				Logger.error({err: new Error("Email Not found")}, 'no email address associated with this account, try creating account with email and password')

				throw new Error(
					'no email address associated with this account, try creating account with email and password',
				)
			}

			const user = await User.firstOrCreate(
				{
					email: facebookUser.email,
				},
				{
					status: facebookUser.emailVerificationState === 'verified' ? 'approved' : 'pending',
					rememberMeToken: facebookUser.token.token,
				},
			)

			/**
			 * Login user using the web guard
			 */
			await auth.use('api').login(user)

			return successfulResponse({
				response,
				message: 'successfuly handled facebook auth callback',
				data: { user },
			})
		} catch (error) {
			Logger.error({err:error}, 'Bad request')

			return badRequestResponse({
				response,
				message: 'failed to handle facebook auth callback',
				error,
			})
			
		}
	}

	public async handleGoogleAuthCallback({ auth, ally, response }: HttpContextContract) {
		try {
			const google = ally.use('google')

			/**
			 * User has explicitly denied the login request
			 */
			if (google.accessDenied()) {
				Logger.error({err: new Error("Access denied")}, 'Access with google auth was denied')

				throw new Error('Access was denied')
			}

			/**
			 * Unable to verify the CSRF state
			 */
			if (google.stateMisMatch()) {
				Logger.error({err: new Error("Mismatched error")}, 'Request expired. Retry again')

				throw new Error('Request expired. Retry again')
			}

			/**
			 * There was an unknown error during the redirect
			 */
			if (google.hasError()) {
				Logger.error({err: new Error("unkown error")}, "Google error not specified")

				throw new Error(google.getError() ?? 'Error not specified')
			}

			/**
			 * Finally, access the user
			 */
			const googleUser = await google.user()

			/**
			 * Find the user by email or create
			 * a new one
			 */

			if (!googleUser.email) {

				Logger.error({err: new Error("Email Not found")}, 'no email address associated with this account, try creating account with email and password')

				throw new Error(
					'no email address associated with this account, try creating account with email and password',
				)
			}
				const user = await User.firstOrCreate(
					{
						email: googleUser.email,
					},
					{
						status: googleUser.emailVerificationState === 'verified' ? 'approved' : 'pending',
						rememberMeToken: googleUser.token.token,
					},
				)
				/**
				 * Login user using the web guard
				 */
				await auth.use('api').login(user)

				return successfulResponse({
					response,
					message: 'successfuly handled google auth callback',
					data: { user },
				})
			}catch (error) {
				Logger.error({err:error}, 'Bad request')

				return badRequestResponse({
					response,
					message: 'failed to handle google auth callback',
					error,
				})
		}		
	}
}
