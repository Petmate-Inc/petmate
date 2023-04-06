import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import { badRequestResponse, notFoundResponse } from 'App/Helpers/Responses'
import CreateMatchValidator from 'App/Validators/CreateMatchValidator'
import User from 'App/Models/User'
import Match from 'App/Models/Match'

export default class MatchesController {
	public async createMatch({ auth, response, request }: HttpContextContract) {
		const { pet_id } = await request.validate(CreateMatchValidator)

		try {
			const user: User | null = auth.user ?? null

			if (!user) {
				Logger.error({ err: new Error('Not found') }, 'user is not found')
				return notFoundResponse({ response, message: 'User is not found' })
			}

			const petId = pet_id
			const breeder_id = user.uuid

			const match = new Match()
			match.pet_id = pet_id
			match.uuid = petId
			match.breeder_id = breeder_id

			await match.save()
		} catch (error) {
			Logger.error({ err: error }, 'Failed to create new Match')
			return badRequestResponse({
				response,
				message: 'Failed to create new Match',
				error,
			})
		}
	}
}
