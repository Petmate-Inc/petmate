import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import dogBreedApi from 'App/Services/apis/dogBreedApi'
import { badRequestResponse, successfulResponse } from 'App/Helpers/Responses'

export default class DogbreedController {
	public async getBreed({ response }: HttpContextContract) {
		try {
			const createBreed = await dogBreedApi({
				url: '/breeds',
				method: 'GET',
			})

			const data = createBreed.data

			return successfulResponse({
				response,
				message: 'successful',
				data,
			})
		} catch (error) {
			return badRequestResponse({
				response,
				message: 'cannot find route',
				error,
			})
		}
	}

	public async updateBreed({ response, request }: HttpContextContract) {
		try {
			const createBreed = await dogBreedApi({
				url: '/',
				method: 'get',
			})

			// const data = createBreed.data

			const data = createBreed.data.data.map(({ id }) => {
                id.find((e) => {
                    if (e == request.params().id) {
                        return e
                    }
                })
			})
			return successfulResponse({
				response,
				message: 'successful',
				data,
			})
		} catch (error) {
			return badRequestResponse({
				response,
				message: 'cannot find route',
				error,
			})
		}
	}

	public async getFact({ response }: HttpContextContract) {
		try {
			const createBreed = await dogBreedApi({
				url: '/facts',
				method: 'GET',
			})

			const data = createBreed.data
			return successfulResponse({
				response,
				message: 'successful',
				data,
			})
		} catch (error) {
			return badRequestResponse({
				response,
				message: 'cannot find route',
				error,
			})
		}
	}

	public async getGroup({ response }: HttpContextContract) {
		try {
			const createBreed = await dogBreedApi({
				url: '/groups',
				method: 'GET',
			})

			const data = createBreed.data
			return successfulResponse({
				response,
				message: 'successful',
				data,
			})
		} catch (error) {
			return badRequestResponse({
				response,
				message: 'cannot find route',
				error,
			})
		}
	}
}
