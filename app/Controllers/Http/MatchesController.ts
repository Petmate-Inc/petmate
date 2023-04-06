import { v4 as uuidv4 } from 'uuid'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'
import { badRequestResponse, notFoundResponse } from 'App/Helpers/Responses'
import CreateMatchValidator from 'App/Validators/CreateMatchValidator'
import User from 'App/Models/User'
import Pet from 'App/Models/Pet'
import Match from 'App/Models/Match'

export default class MatchesController {

    public async createMatch({auth, response, request}:HttpContextContract){

        const{pet_id, breeder_id, accepted} = await request.validate(CreateMatchValidator)

        try{

            const user: User | null = auth.user ?? null

            if(!user){
                Logger.error({err:new Error('Not found')}, 'user is not found')
                return notFoundResponse({response, message:'User is not found'})
            }

            const petId = uuidv4
			const match = new Match()
            match.uuid = petId
            match.breeder_id = breeder_id
            match.accepted = accepted


        }catch(error){
            Logger.error({err:error}, "Match not created")
            return badRequestResponse({
                response,
                message:'Match is not created',
                error,
            })
        }

    }
}
