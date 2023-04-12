import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { badRequestResponse } from 'App/Helpers/Responses'
import Logger from '@ioc:Adonis/Core/Logger'

export default class VetsController {
	public async vetClinics({ response }: HttpContextContract) {
		try {
			const axios = require('axios')

			let config = {
				method: 'get',
				url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522%2C151.1957362&radius=1500&type=veterinary_care&keyword=vet_clinics&key=YOUR_API_KEY',
				headers: {},
			}

			axios(config)
				.then(function (response) {
					console.log(JSON.stringify(response.data))
				})
				.catch(function (error) {
					console.log(error)
				})
		} catch (error) {
			Logger.error({ err: error }, 'could not get location')
			return badRequestResponse({
				response,
				message: 'could not find location',
				error,
			})
		}
	}
}
