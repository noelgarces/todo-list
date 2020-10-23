// Selectors for new category form
const newCategoryForm = document.querySelector('[data-new-category-form]');
const newCategoryInput = document.querySelector('[data-new-category-input]');

// Selector for categories container
const categoriesContainer = document.querySelector('[data-categories]');

// Selector for currently viewing
const currentlyViewing = document.querySelector('[data-currently-viewing]');

// Selector for new todo form
const newTodoFormToggler = document.querySelector('[data-new-todo-toggler]');
const newTodoForm = document.querySelector('[data-new-todo-form]');
const newTodoSelect = document.querySelector('[data-new-todo-select]');
const newTodoInput = document.querySelector('[data-new-todo-input]');

// Selector for edit todo form
const editTodoForm = document.querySelector('[data-edit-todo-form]');
const editTodoSelect = document.querySelector('[data-edit-todo-select]');
const editTodoInput = document.querySelector('[data-edit-todo-input]');

// Selector for todos container
const todosContainer = document.querySelector('[data-cards]');

// Local storage keys
const LOCAL_STORAGE_CATEGORIES_KEY = 'LOCAL_STORAGE_CATEGORIES_KEY';
const LOCAL_STORAGE_TODOS_KEY = 'LOCAL_STORAGE_TODOS_KEY';
const LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY = 'LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY';

let selectedCategoryId = localStorage.getItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY);
let categories = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY)) || [];
let todos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TODOS_KEY)) || [];

// EVENT: Add Category
newCategoryForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const categoryName = newCategoryInput.value;
	const isCategoryEmpty = !categoryName || !categoryName.trim().length;

	if (isCategoryEmpty) {
		return console.log('please enter a task');
	}

	categories.push({
		_id: Date.now().toString(),
		category: categoryName,
		color: randomColor(),
	});

	newCategoryInput.value = '';

	saveAndRender();
});

// EVENT: Get Selected Category Id
categoriesContainer.addEventListener('click', (e) => {
	if (e.target.tagName.toLowerCase() === 'li') {
		if (!e.target.dataset.categoryId) {
			selectedCategoryId = null;
		} else {
			selectedCategoryId = e.target.dataset.categoryId;
		}

		saveAndRender();
	}
});

// EVENT: Get Selected Category Color
categoriesContainer.addEventListener('change', (e) => {
	if (e.target.tagName.toLowerCase() === 'input') {
		const newCategoryColor = e.target.value;
		const categoryId = e.target.parentElement.dataset.categoryId;

		const categoryToEdit = categories.find((category) => category._id === categoryId);

		categoryToEdit.color = newCategoryColor;

		saveAndRender();
	}
});

// EVENT: Delete Selected Category
currentlyViewing.addEventListener('click', (e) => {
	if (e.target.tagName.toLowerCase() === 'span') {
		categories = categories.filter((category) => category._id !== selectedCategoryId);
		todos = todos.filter((todo) => todo.categoryId !== selectedCategoryId);
		selectedCategoryId = null;
		saveAndRender();
	}
});

// EVENT: Toggle Add Todo Form
newTodoFormToggler.addEventListener('click', function() {
	if (editTodoForm.classList.contains('active')) {
		editTodoForm.classList.remove('active');
	}

	newTodoForm.classList.toggle('active');

	if (newTodoForm.classList.contains('active')) {
		this.innerHTML = `<i class="fas fa-times"></i> Cancel`;
	} else {
		this.innerHTML = `<i class="fa fa-plus" aria-hidden="true"></i> Add Todo`;
	}
});

// EVENT: Add Todo
newTodoForm.addEventListener('submit', (e) => {
	e.preventDefault();

	todos.push({
		_id: Date.now().toString(),
		categoryId: newTodoSelect.value,
		todo: newTodoInput.value,
	});

	newTodoSelect.value = '';
	newTodoInput.value = '';

	saveAndRender();
});

// EVENT: Load Edit Todo Form With Values
let todoToEdit = null;
todosContainer.addEventListener('click', (e) => {
	if (e.target.classList[1] === 'fa-edit') {
		if (newTodoForm.classList.contains('active')) {
			newTodoForm.classList.remove('active');
			newTodoFormToggler.innerHTML = `<i class="fa fa-plus" aria-hidden="true"></i> Add Todo`;
		}

		editTodoForm.classList.add('active');

		todoToEdit = todos.find((todo) => todo._id === e.target.dataset.editTodo);

		editTodoSelect.value = todoToEdit.categoryId;
		editTodoInput.value = todoToEdit.todo;
	}
	if (e.target.classList[1] === 'fa-trash-alt') {
		const todoToDeleteIndex = todos.findIndex((todo) => todo._id === e.target.dataset.deleteTodo);

		todos.splice(todoToDeleteIndex, 1);

		saveAndRender();
	}
});

// EVENT: Update The Todo Being Edited With New Values
editTodoForm.addEventListener('submit', function (e) {
	e.preventDefault();

	todoToEdit.categoryId = editTodoSelect.value;
	todoToEdit.todo = editTodoInput.value;

	editTodoForm.classList.remove('active');

	editTodoSelect.value = '';
	editTodoInput.value = '';

	saveAndRender();
});

// *==================== Functions ====================

function saveAndRender() {
	save();
	render();
}

function save() {
	localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY,JSON.stringify(categories));
	localStorage.setItem(LOCAL_STORAGE_TODOS_KEY, JSON.stringify(todos));
	localStorage.setItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY,selectedCategoryId);
}

function render() {
	clearChildElements(categoriesContainer);
	clearChildElements(newTodoSelect);
	clearChildElements(editTodoSelect);
	clearChildElements(todosContainer);

	renderCategories();
	renderFormOptions();
	renderTodos();

	// Set the current viewing category
	if (!selectedCategoryId || selectedCategoryId === 'null') {
		currentlyViewing.innerHTML = `You are currently viewing <strong>All Categories</strong>`;
	} else {
		const currentCategory = categories.find(
			(category) => category._id === selectedCategoryId
		);
		currentlyViewing.innerHTML = `You are currently viewing <strong>${currentCategory.category}</strong>
		<span style="color: #e57373; cursor: pointer;">(delete)</span>`;
	}
}

function renderCategories() {
	categoriesContainer.innerHTML += `
	<li class="sidebar-item" style="${selectedCategoryId === 'null' || selectedCategoryId === null ? 'font-weight: 600' : ''}" data-category-id="">View All</li>
	`;

	categories.forEach(({ _id, category, color }) => {
		categoriesContainer.innerHTML += `<li class="sidebar-item" style="${
			_id === selectedCategoryId ? 'font-weight: 600' : ''
		}" data-category-id=${_id}>${category}<input class="sidebar-color" type="color" value=${color}></li>`;
	});
}

function renderFormOptions() {
	// Create default option
	newTodoSelect.innerHTML += `<option value="">Select a category</option>`;
	editTodoSelect.innerHTML += `<option value="">Select a category</option>`;

	// Creates dynamic options
	categories.forEach(({ _id, category }) => {
		newTodoSelect.innerHTML += `<option value=${_id}>${category}</option>`;
		editTodoSelect.innerHTML += `<option value=${_id}>${category}</option>`;
	});
}

function renderTodos() {
	let todosToRender = todos;

	// if their is a Selected Category Id, and selected category id !== 'null then filter the todos
	if (selectedCategoryId && selectedCategoryId !== 'null') {
		todosToRender = todos.filter(
			(todo) => todo.categoryId === selectedCategoryId
		);
	}

	// Render Todos
	todosToRender.forEach(({ _id, categoryId, todo }) => {
		// Get Complimentary categoryDetails Based On TaskId
		const categoryDetails = categories.find(
			(category) => category._id === categoryId
		);
		todosContainer.innerHTML += `
			<div class="card" style="border-color: ${categoryDetails.color}">
				<div class="card-content">
					<div class="card-tag" style="background-color: ${convertHexToRGBA(
						categoryDetails.color,
						20
					)}; color: ${categoryDetails.color};">${
			categoryDetails.category
		}</div>
					<div class="card-description">${todo}</div>
					<div class="card-actions">
						<i class="far fa-edit" data-edit-todo=${_id}></i>
						<i class="far fa-trash-alt" data-delete-todo=${_id}></i>
					</div>
				</div>
			</div>
		`;
	});
}

// HELPERS
function clearChildElements(element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

function convertHexToRGBA(hexCode, opacity) {
	let hex = hexCode.replace('#', '');

	if (hex.length === 3) {
		hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
	}

	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return `rgba(${r},${g},${b},${opacity / 100})`;
}

render();
