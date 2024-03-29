import { v4 as uuidv4 } from 'uuid'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
	badRequestResponse,
	createdResponse,
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
import UpdatePetValidator from 'App/Validators/UpdatePetValidator'
import FetchPetValidator from 'App/Validators/FetchPetValidator'

export default class PetsController {
	public async fetchAllPets({ request, response }: HttpContextContract) {
		try {
			const { breed, name, age, gender, classification, search } = await request.validate(
				FetchPetValidator,
			)

			const pets = Pet.query()

			if (breed) {
				pets.where('breed', breed)
			}

			if (name) {
				pets.where('name', name)
			}

			if (age) {
				pets.where('age', '>=', age)
			}

			if (gender) {
				pets.where('gender', gender)
			}

			if (classification) {
				pets.where('classification', classification)
			}

			if (search) {
				pets
					.where('classification', 'like', `%${search}%`)
					.orWhere('breed', 'like', `%${search}%`)
					.orWhere('color', 'like', `%${search}%`)
					.orWhere('name', 'like', `%${search}%`)
			}

			const res = await pets.whereNull('deleted_at').preload('owner').preload('pictures')

			const formattedResponse = res.map((pet) => {
				return {
					uuid: pet.uuid,
					id: pet.id,
					name: pet.name,
					breeder: pet.owner.firstName + ' ' + pet.owner.lastName,
					age: pet.age,
					location: pet.owner.address,
					breed: pet.breed,
					breed_group: pet.classification,
					image: pet.pictures.find((item) => item.isPrimary)?.imageUrl,
					gallery: pet.pictures.map((data) => data?.imageUrl),
					age_period: 'months',
					classification: 'dog',
					weight: null,
					color: 'black and brown',
					gender: 'male',
					verification_status: 'unverified',
					ownerId: pet.ownerId,
					owner: pet.owner,
				}
			})

			return successfulResponse({
				response,
				message: 'successfully fetched all pets',
				data: formattedResponse,
			})
		} catch (error) {
			Logger.error({ err: error }, 'Failed to fetch all pets')
			return badRequestResponse({
				response,
				message: 'failed to fetch all pets',
			})
		}
	}

	public async fetchSinglePet({ request, response }: HttpContextContract) {
		try {
			const petId = request.param('uuid')

			const pet = await Pet.query()
				.where('uuid', petId)
				.whereNull('deleted_at')
				.preload('owner')
				.preload('pictures')
				.first()

			if (!pet) {
				return notFoundResponse({
					response,
					message: 'pet not found',
				})
			}

			return successfulResponse({
				response,
				message: 'successfully fetched pet data',
				data: pet,
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
			pet.ownerId = owner.uuid
			await pet.save()

			const petPicture = new PetPicture()
			petPicture.imageUrl = primary_image_url
			petPicture.petId = petId
			petPicture.isPrimary = true
			await petPicture.save()

			return createdResponse({
				response,
				message: 'successfully created pet',
			})
		} catch (error) {
			Logger.error({ err: error }, 'failed to create pet')
			return badRequestResponse({
				response,
				message: 'failed to create pet',
			})
		}
	}

	public async updatePet({ auth, request, response }: HttpContextContract) {
		const { age, age_period, classification, breed, weight, color, name, gender } =
			await request.validate(UpdatePetValidator)
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

			if (age) {
				pet.age = age
			}

			if (age_period) {
				pet.age_period = age_period
			}

			if (weight) {
				pet.weight = weight
			}

			if (color) {
				pet.color = color
			}

			if (classification) {
				pet.classification = classification
			}

			if (breed) {
				pet.breed = breed
			}

			if (name) {
				pet.name = name
			}

			if (gender) {
				pet.gender = gender
			}

			await pet.save()
			return successfulResponse({ response, message: 'Successfully updated pet' })
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
