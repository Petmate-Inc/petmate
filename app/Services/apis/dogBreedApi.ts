import axios from 'axios'

const dogBreedApi = axios.create({
	baseURL: 'https://dogapi.dog/api/v2',
	headers: { 'Content-Type': 'application/json' },
	timeout: 1000,
	// .. other options
})

export default dogBreedApi
