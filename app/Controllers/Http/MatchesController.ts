import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import { badRequestResponse, notFoundResponse, successfulResponse } from 'App/Helpers/Responses'
import CreateMatchValidator from 'App/Validators/CreateMatchValidator'
import User from 'App/Models/User'
import Match from 'App/Models/Match'
import { DateTime } from 'luxon'
import UpdateMatchValidator from 'App/Validators/UpdateMatchValidator'
import Pet from 'App/Models/Pet'
import GetMatchValidator from 'App/Validators/GetMatchValidator'

export default class MatchesController {
	public async createMatch({ auth, response, request }: HttpContextContract) {
		const { pet_id } = await request.validate(CreateMatchValidator)

		try {
			const user: User | null = auth.user ?? null

			if (!user) {
				Logger.error({ err: new Error('Not found') }, 'user is not found')
				return notFoundResponse({ response, message: 'User is not found' })
			}

			const petExists = await Pet.query().where('uuid', pet_id).whereNull('deleted_at').first()

			if (!petExists) {
				throw new Error('Pet not found')
			}

			const breeder_uuid = user.uuid

			const match = new Match()
			match.petUuid = pet_id
			match.uuid = pet_id
			match.breederUuid = breeder_uuid

			await match.save()

			return successfulResponse({
				response,
				message: 'successfully created match',
			})
		} catch (error) {
			Logger.error({ err: error }, 'Failed to create new Match')
			return badRequestResponse({
				response,
				message: 'Failed to create new Match',
				error: error.message ?? error,
			})
		}
	}
	public async getMatches({ auth, request, response }: HttpContextContract) {
		const { accepted } = await request.validate(GetMatchValidator)

		try {
			const user: User | null = auth.user ?? null

			if (!user) {
				Logger.error({ err: new Error('Not found') }, 'user is not found')
				throw new Error('User not found')
			}

			const matchesQuery = Match.query()

			if (accepted) {
				matchesQuery.where('accepted', accepted)
			}

			const matches = await matchesQuery
				.where('breeder_uuid', user.uuid)
				.whereNull('deleted_at')
				.preload('breeder')
				.preload('pet')

				Logger.info('queries', matches)

			return successfulResponse({
				response,
				message: 'successfully fetched matches',
				data: matches,
			})
		} catch (error) {
			Logger.error({ err: error }, 'Failed to fetch matches')
			return badRequestResponse({
				response,
				message: 'Failed to fetch new Match',
				error: error.message ?? error,
			})
		}
	}
	public async getSingleMatch({ auth, response, request }: HttpContextContract) {
		try {
			const user: User | null = auth.user ?? null

			if (!user) {
				Logger.error({ err: new Error('Not found') }, 'user is not found')
				throw new Error('User not found')
			}

			const matchId = request.param('uuid')

			const match = await Match.query()
				.where('uuid', matchId)
				.where('breeder_uuid', user.uuid)
				.whereNull('deleted_at')
				.preload('breeder')
				.preload('pet')
				.first()

			if (!match) {
				throw new Error('match not found')
			}

			return successfulResponse({ response, message: 'successfully fetched match', data: match })
		} catch (error) {
			Logger.error({ err: error }, 'Failed to get single match')
			return badRequestResponse({
				response,
				message: 'Failed to get single Match',
				error,
			})
		}
	}
	public async updateMatch({ auth, response, request }: HttpContextContract) {
		try {
			const user: User | null = auth.user ?? null

			if (!user) {
				Logger.error({ err: new Error('Not found') }, 'user is not found')
				throw new Error('User not found')
			}

			const matchId = request.param('uuid')

			const { accepted } = await request.validate(UpdateMatchValidator)

			const match = await Match.query()
				.where('uuid', matchId)
				.where('breeder_uuid', user.uuid)
				.whereNull('deleted_at')
				.first()

			if (!match) {
				throw new Error('match not found')
			}

			match.accepted = accepted
			await match.save()

			return successfulResponse({ response, message: 'successfully updated match' })
		} catch (error) {
			Logger.error({ err: error }, 'Failed to update Match')
			return badRequestResponse({
				response,
				message: 'Failed to update Match',
				error: error.message ?? error,
			})
		}
	}
	public async deleteMatch({ auth, response, request }: HttpContextContract) {
		try {
			const matchId = request.param('uuid')
			const user: User | null = auth.user ?? null

			if (!user) {
				Logger.error({ err: new Error('Not found') }, 'user is not found')
				throw new Error('User not found')
			}

			const match = await Match.query()
				.where('uuid', matchId)
				.where('breeder_uuid', user.uuid)
				.whereNull('deleted_at')
				.first()

			if (!match) {
				throw new Error('match not found')
			}

			match.deleted_at = DateTime.now()
			await match.save()

			return successfulResponse({ response, message: 'successfully deleted match' })
		} catch (error) {
			Logger.error({ err: error }, 'Failed to delete Match')
			return badRequestResponse({
				response,
				message: 'Failed to delete Match',
				error: error.message ?? error,
			})
		}
	}
}
