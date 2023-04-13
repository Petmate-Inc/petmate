import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { badRequestResponse, successfulResponse } from 'App/Helpers/Responses'
import Logger from '@ioc:Adonis/Core/Logger'
import geolocation from 'geolocation'
import nearbySearch from 'App/Services/apis/googleMapApi'
import Env from '@ioc:Adonis/Core/Env'

export default class VetsController {
	public async vetClinics({ response }: HttpContextContract) {

		const API_KEY = Env.get('GOOGOE_NEARBY_API')

		try {
			const navigate = geolocation.getCurrentPosition
			const lat = navigate.latitude
			const lng = navigate.longitude

			const getNearbyLocation = await nearbySearch({
				url: `location=${lat}%${lng}&radius=1500&type=veterinary_care&keyword=vet_clinics&key=${API_KEY}`,
				method: 'GET',
			})

            const data = getNearbyLocation.data
            return successfulResponse({
                response,
                message: "successful response",
                data
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
