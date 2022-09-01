import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PetsController {
  public async fetchAllPets({}: HttpContextContract) {}

  public async fetchSinglePet({}: HttpContextContract) {}

  public async createPet({}: HttpContextContract) {}

  public async updatePet({}: HttpContextContract) {}

  public async deletePet({}: HttpContextContract) {}
}
