import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';

const state ={}

// SEARCH CTRL

const controlSearch = async() => {
	//1.- Get query from view
	const query = searchView.getInput();

	if (query) {
		// 2.- New search obj and add to state
		state.search = new Search(query);

		// 3.- Prepare UI for results
		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchRes); 

		try {
			// 4.- Search for recipes
			await state.search.getResults();

			// 5.- Render results to UI
			clearLoader();
			searchView.renderResults(state.search.result);
		} catch(err){
			alert("Something went wrong with search");
			clearLoader();
		}
	}
};


elements.searchForm.addEventListener('submit', e => {
	e.preventDefault();
	controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
	const btn = e.target.closest('.btn-inline');
	if (btn) {
		const goToPage = parseInt(btn.dataset.goto, 10);
		searchView.clearResults();
		searchView.renderResults(state.search.result, goToPage);
	}
});


// RECIPE CTRL

const ctrlRecipe = async() => {
	// Get id from url
	const id = window.location.hash.replace("#", '');
	console.log(id);

	if (id) {
		// Prepare UI for changes
		recipeView.clearRecipe();
		renderLoader(elements.recipe);

		// Highlight selectrd search
		if (state.search) searchView.highlightSelected(id);

		// Create recipe obj
		state.recipe = new Recipe(id);

		try {
			// Get recipe data
			await state.recipe.getRecipe();
			state.recipe.parseIngredients();


			// Calculate serving time
			state.recipe.calcTime();
			state.recipe.calcServing();

			// Render recipe
			clearLoader();
			recipeView.renderRecipe(state.recipe);

		} catch(err) {
			alert("Something went wrong with recipe!");
		}
	}
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, ctrlRecipe));

// Handling recipe buttons clicks
elements.recipe.addEventListener('click', e => {
	if (e.target.matches('.btn-decrease, .btn-decrease *')) {
		// Decrease button gets clicked
		if (state.recipe.servings > 1) {
			state.recipe.updateServings('dec');	
			recipeView.updateServingIngredients(state.recipe);
		}
	} else if (e.target.matches('.btn-increase, .btn-increase *')) {
		// Increase button gets clicked
		state.recipe.updateServings('inc');
		recipeView.updateServingIngredients(state.recipe);
	}
	console.log(state.recipe);
});