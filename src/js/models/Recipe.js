import axios from 'axios';
import { key, proxy } from '../config';

export default class Recipe {
	constructor(id) {
		this.id = id
	}

	async getRecipe() {
		try{
			const res = await axios(`${proxy}/https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
			this.title = res.data.recipe.title;
			this.author = res.data.recipe.publisher;
			this.img = res.data.recipe.image_url;
			this.url = res.data.recipe.source_url;
			this.ingredients = res.data.recipe.ingredients;
		} catch(err) {
			console.log(err)
		}
	}

	calcTime() {
		const numImg = this.ingredients.length;
		const periods = Math.ceil(numImg / 3);
		this.time = periods * 15;
	}

	calcServing() {
		this.servings = 4;
	}

	parseIngredients() {
		const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons','teaspoon', 'cups', 'ponds'];
		const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
		const units = [...unitsShort, 'kg', 'g'];

		const newIngredients = this.ingredients.map(el => {
			// Uniform units
			let ingredient = el.toLowerCase();
			unitsLong.forEach((unit, i) => {
				ingredient = ingredient.replace(unit, unitsShort[i]);
			});

			// Remove parantheses
			ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

			// Parses ingredients into count, unit and ingredient
			const arrIng = ingredient.split(' ');
			const unitIndex =  arrIng.findIndex(el2 => units.includes(el2));

			let objIng;
			if (unitIndex > -1) {
				// There is a unit
				const arrCount = arrIng.slice(0, unitIndex);

				let count;

				if (arrCount.length === 1) {
					count = eval(arrIng[0].replace('-', '+'));
				} else {
					count = eval(arrIng.slice(0, unitIndex).join('+'));
				}

				objIng = {
					count,
					unit: arrIng[unitIndex],
					ingredient: arrIng.slice(unitIndex + 1).join(' ')
				};
				
			} else if(parseInt(arrIng[0], 10)) {
				// There is not unit, but 1st element is number
				objIng = {
					count: parseInt(arrIng[0], 10),
					unit: '',
					ingredient: arrIng.slice(1).join(' ')
				}
			} else if(unitIndex === -1) {
				// There is no unit and no number in 1st position
				objIng = {
					count: 1,
					unit: '',
					ingredient
				}
			}


			return objIng;
		});
		this.ingredients = newIngredients;
	}

	updateServings(type) {
		// Serving
		const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

		// Ingredients
		this.ingredients.forEach(ing => {
			ing.count *= (newServings / this.servings);
		});

		this.servings = newServings;

	}

}