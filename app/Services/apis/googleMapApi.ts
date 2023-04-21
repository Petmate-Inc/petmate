import axios from 'axios'

const nearbySearch = axios.create({
	baseURL: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?',
	headers: {
		//  Authorization: `<Your Auth Token>`,
		'Content-Type': 'application/json',
	},
	timeout: 1000,
	// .. other options
})

export default nearbySearch
