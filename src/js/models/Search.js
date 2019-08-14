import axios from 'axios';

export default class Search {
	constructor(query) {
		this.query = query;
	}

	async getResults(query) {
		const proxy = "https://cors-anywhere.herokuapp.com"
		const key = "d8813d23937391bfbaa225a22ac28f40"
		try {
			const res = await axios(`${proxy}/https://www.food2fork.com/api/search?key=${key}&q=${this.query}`)
			this.result = res.data.recipes;
		} catch(err){
			alert(err);
		}
	}

}

