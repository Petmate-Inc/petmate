import Route from '@ioc:Adonis/Core/Route'

const defaultMessage = {
	status: true,
	msg: 'Welcome to PetMate API',
	data: {
		name: 'PetMate',
		version: '1.0.0',
	},
}
Route.get('/', async () => {
	return defaultMessage
})

Route.get('/api/v1/', async () => {
	return defaultMessage
})

Route.group(() => {
	Route.post('login', 'UsersController.login')
	Route.post('signup', 'UsersController.signup')
	Route.post('g', 'UsersController.verify')
	Route.post('resend-otp', 'UsersController.resendOtp')
	Route.get('verify-user/:token', 'UsersController.verify')
	Route.post('resend-verification-link', 'UsersController.resendVerificationLink')
	Route.post('recover-password', 'UsersController.forgotPassword')
	Route.patch('change-password', 'UsersController.changePassword').middleware('auth')
	Route.post('reset-password', 'UsersController.resetPassword')

	// social authentication
	Route.group(() => {
		Route.get('google', 'UsersController.getGoogleAuthLink')
		Route.get('facebook', 'UsersController.getFacebookAuthLink')
	}).prefix('auth/')

	// handle social auth callbacks
	Route.group(() => {
		Route.get('facebook', 'UsersController.handleFacebookAuthCallback')
		Route.get('google', 'UsersController.handleGoogleAuthCallback')
	}).prefix('callback/')

	Route.group(() => {
		Route.get('details', 'UsersController.details')
		Route.get('/pets', 'PetsController.fetchMyPets')
		Route.patch('/update-password', 'UsersController.updatePassword')
		Route.patch('/', 'UsersController.update')
		Route.delete('/', 'UsersController.delete')
	})
		.middleware('auth')
		.prefix('user/')

	Route.group(() => {
		Route.get('/', 'PetsController.fetchAllPets')
		Route.get('/dog-breeds', 'PetsController.fetchDogBreeds')
		Route.get('/:uuid', 'PetsController.fetchSinglePet')
		Route.post('/', 'PetsController.createPet')
		Route.post('/upload-image', 'PetsController.uploadPetImage')
		Route.patch('/:uuid', 'PetsController.updatePet')
		Route.delete('/:uuid', 'PetsController.deletePet')
	})
		.middleware('auth')
		.prefix('pets/')
}).prefix('/api/v1/')
