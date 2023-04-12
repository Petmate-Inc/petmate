import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { badRequestResponse } from 'App/Helpers/Responses'
import Logger from '@ioc:Adonis/Core/Logger'
import geolocation from 'geolocation'

export default class VetsController {
	public async vetClinics({ response }: HttpContextContract) {
		try {
            const navigate = geolocation.getCurrentPosition
            const lat = navigate.latitude
            const lng = navigate.longitude

			const axios = require('axios')

			let config = {
				method: 'get',
				url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522%2C151.1957362&radius=1500&type=veterinary_care&keyword=vet_clinics&key=YOUR_API_KEY',
				headers: {},
                // The google url has a default longitude and latitude so I did this, I don't know if its correct though I couldn't find such in the documentation
				url2: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%${lng}&radius=1500&type=veterinary_care&keyword=vet_clinics&key=YOUR_API_KEY`,
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
