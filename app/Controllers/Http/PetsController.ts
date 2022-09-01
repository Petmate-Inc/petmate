import { v4 as uuidv4 } from 'uuid'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
	badRequestResponse,
	deletedResponse,
	notFoundResponse,
	successfulResponse,
} from 'App/Helpers/Responses'
import Logger from '@ioc:Adonis/Core/Logger'
import { uploadImage } from 'App/Services/cloudinary.service'
import Pet from 'App/Models/Pet'
import { DateTime } from 'luxon'
import CreatePetValidator from 'App/Validators/CreatePetValidator'
import PetPicture from 'App/Models/PetPicture'
import User from 'App/Models/User'
import { getDogBreeds } from 'App/Utils/getDogBreeds'

export default class PetsController {
	public async fetchAllPets({ response }: HttpContextContract) {
		try {
			const pets = await Pet.query().whereNull('deleted_at')
			return successfulResponse({
				response,
				message: 'successfully fetched all pets',
				data: pets,
			})
		} catch (error) {
			return badRequestResponse({
				response,
				message: 'failed to fetch all pets',
			})
		}
	}

	public async fetchSinglePet({ request, response }: HttpContextContract) {
		try {
			const petId = request.param('uuid')

			const pet = await Pet.query().where('uuid', petId).whereNull('deleted_at').first()

			if (!pet) {
				return notFoundResponse({
					response,
					message: 'pet not found',
				})
			}

			return successfulResponse({
				response,
				message: 'successfully fetched pet data',
			})
		} catch (error) {
			return badRequestResponse({
				response,
				message: 'failed to fetch pet data',
			})
		}
	}

	public async fetchMyPets({ auth, response }: HttpContextContract) {
		try {
			const user: User | null = auth.user ?? null

			if (!user) {
				throw new Error('User not found')
			}
			const pets = await Pet.query().where('owner_id', user.uuid).whereNull('deleted_at')

			return successfulResponse({
				response,
				message: 'successfully fetched pets',
				data: pets,
			})
		} catch (error) {
			Logger.error({ err: error }, 'failed to fetch pets')
			return badRequestResponse({
				response,
				message: 'failed to fetch pets',
			})
		}
	}

	public async createPet({ auth, request, response }: HttpContextContract) {
		const {
			age,
			age_period,
			classification,
			breed,
			weight,
			color,
			primary_image_url,
			name,
			gender,
		} = await request.validate(CreatePetValidator)

		try {
			const owner = auth.user ?? null
			if (!owner) {
				throw new Error('user not found')
			}
			const petId = uuidv4()
			const pet = new Pet()
			pet.uuid = petId
			pet.classification = classification
			pet.breed = breed

			if (weight) {
				pet.weight = weight
			}

			pet.color = color
			pet.name = name
			pet.gender = gender
			pet.age = age
			pet.age_period = age_period
			pet.owner_id = owner.uuid
			await pet.save()

			const petPicture = new PetPicture()
			petPicture.imageUrl = primary_image_url
			petPicture.petId = petId
			petPicture.isPrimary = true
			await petPicture.save()
		} catch (error) {
			Logger.error({ err: error }, 'failed to create pet')
			return badRequestResponse({
				response,
				message: 'failed to create pet',
			})
		}
	}

	public async updatePet({ auth, request, response }: HttpContextContract) {
		try {
			const petId = request.param('uuid')
			const user: User | null = auth.user ?? null

			if (!user) {
				throw new Error('pet not found')
			}
			const pet = await Pet.query().where('uuid', petId).where('owner_id', user.uuid).first()

			if (!pet) {
				return notFoundResponse({
					response,
					message: 'pet not found',
				})
			}
		} catch (error) {
			Logger.error({ err: error }, 'failed to update pet')
			return badRequestResponse({
				response,
				message: 'failed to update pet',
			})
		}
	}

	public async deletePet({ auth, request, response }: HttpContextContract) {
		try {
			const petId = request.param('uuid')
			const user: User | null = auth.user ?? null

			if (!user) {
				throw new Error('pet not found')
			}

			const pet = await Pet.query().where('uuid', petId).where('owner_id', user.uuid).first()

			if (!pet) {
				return notFoundResponse({
					response,
					message: 'pet not found',
				})
			}

			pet.deletedAt = DateTime.now()

			await pet.save()

			return deletedResponse({
				response,
				message: 'successfully deleted pet',
			})
		} catch (error) {
			Logger.error({ err: error }, 'failed to delete pet')
			return badRequestResponse({
				response,
				message: 'failed to delete pet',
			})
		}
	}

	public async uploadPetImage({ request, response }: HttpContextContract) {
		const imagePath = request.file('image_path')

		if (!imagePath) {
			return badRequestResponse({
				response,
				message: 'imag_path is required',
			})
		}
		try {
			const result = await uploadImage(imagePath.tmpPath, 'pet-images')

			Logger.info({ result }, 'upload image result')

			return successfulResponse({
				response,
				message: 'successfully uploaded image',
				data: { url: result },
			})
		} catch (error) {
			Logger.error({ err: error }, 'failed to upload pet picture')

			return badRequestResponse({
				response,
				message: 'failed to upload pet picture',
			})
		}
	}

	public async fetchDogBreeds({ response }: HttpContextContract) {
		try {
			const dogBreeds = getDogBreeds().map((breed) => {
				return {
					breed: breed.name,
					breed_group: breed.breed_group,
					image: breed.image.url,
					origin: breed.origin,
					temperament: breed.temperament,
				}
			})

			return successfulResponse({
				response,
				message: 'successfully fetched dog breeds',
				data: dogBreeds,
			})
		} catch (error) {
			return badRequestResponse({ response, message: 'failed to fetch dog breeds' })
		}
	}
}
