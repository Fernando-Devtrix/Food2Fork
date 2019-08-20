import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

const state ={}
window.state = state;
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
			recipeView.renderRecipe(
				state.recipe,
				state.likes.isLiked(id)
			);

		} catch(err) {
			alert("Something went wrong with recipe!");
		}
	}
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, ctrlRecipe));

// LIST CTRL

const controlList = () => {
	// Create a list obj if there is not
	if (!state.list) state.list = new List();

	// Add ingredient to the list and UI
	state.recipe.ingredients.forEach(el => {
		const item = state.list.addItem(el.count, el.unit, el.ingredient);
		listView.renderItem(item);
	});
}

// Handling delete and update list item events
elements.shopping.addEventListener('click', e => {
	const id = e.target.closest('.shopping__item').dataset.itemid;

	// Handle the delete button
	if (e.target.matches('.shopping__delete, .shopping__delete *')) {
		// Delete from state
		state.list.deleteItem(id);

		// Delete from UI
		listView.deleteItem(id);
		
	} else if (e.target.matches('.shopping__count-value')) {
		const val = parseFloat(e.target.value, 10);
		state.list.updateCount(id, val);

	}
});


state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());
//change this to  es6
const controlLike = () => {
	if(!state.likes) state.likes = new Likes();
	const currentID = state.recipe.id;

	if (!state.likes.isLiked(currentID)) {
		const newLike = state.likes.addLike(
			currentID,
			state.recipe.title,
			state.recipe.author,
			state.recipe.img
		);

		// Toggle like button
		likesView.toggleLikeBtn(true);

		// Add like to UI
		likesView.renderLike(newLike);

	// User has liked current recipe
	} else {
		// Remove like from state
		state.likes.deleteLike(currentID);

		// Toggle like button
		likesView.toggleLikeBtn(false);

		// Remove like from UI
		likesView.deleteLike(currentID);
	} 
	likesView.toggleLikeMenu(state.likes.getNumLikes());
}; 

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
	} else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
		// Add ingredients to shopping list
		controlList();
	} else if (e.target.matches('.recipe__love, .recipe__love *')) {
		// Likes Controller
		controlLike();
	}
});

