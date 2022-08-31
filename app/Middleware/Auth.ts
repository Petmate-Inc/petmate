import { GuardsList } from '@ioc:Adonis/Addons/Auth'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { unauthorizedResponse } from 'App/Helpers/Responses'

export default class AuthMiddleware {
  protected redirectTo = '/login'

  protected async authenticate(auth: HttpContextContract['auth'], guards: (keyof GuardsList)[]) {
    let guardLastAttempted: string | undefined

    for (let guard of guards) {
      guardLastAttempted = guard

      if (await auth.use(guard).check()) {
        auth.defaultGuard = guard
        return true
      }
    }
  }

  public async handle(
    { auth, request, response }: HttpContextContract,
    next: () => Promise<void>,
    customGuards: (keyof GuardsList)[],
  ) {
    const guards = customGuards.length ? customGuards : [auth.name]
    await this.authenticate(auth, guards)

    const user = auth.user
    if (!user) {
      return unauthorizedResponse({
        response,
        message: 'Please login to access',
      })
    }
    if (user.status === 'approved') {
      request.updateBody({
        ...request.all(),
        user,
      })
      await next()
    } else if (user.status === 'pending') {
      return unauthorizedResponse({
        response,
        message: `Kindly verify your account to proceed`,
      })
    } else if (user.status === 'banned') {
      return unauthorizedResponse({
        response,
        message: `Your account has been banned, kindly contact support`,
      })
    }
  }
}
