// *==================== Selectors ====================
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const newTaskAlert = document.querySelector('[data-new-task-alert]');
const tasksContainer = document.querySelector('[data-tasks]');
const currentViewingTask = document.querySelector(
	'[data-current-viewing-task]'
);
const newTodoFormToggler = document.querySelector(
	'[data-new-todo-form-toggler]'
);
const newTodoForm = document.querySelector('[data-new-todo-form]');
const newTodoSelect = document.querySelector('[data-new-todo-select]');
const editTodoForm = document.querySelector('[data-edit-todo-form]');
const editTodoSelect = document.querySelector('[data-edit-todo-select]');
const cardsContainer = document.querySelector('[data-cards]');

// *==================== Varaibles ====================
const LOCAL_STORAGE_TASKS_KEY = 'LOCAL_STORAGE_TASKS_KEY';
const LOCAL_STORAGE_CARDS_KEY = 'LOCAL_STORAGE_CARDS_KEY';
const LOCAL_STORAGE_SELECTED_TASK_ID_KEY = 'LOCAL_STORAGE_SELECTED_TASK_ID_KEY';
let tasks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TASKS_KEY)) || [];
let cards = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CARDS_KEY)) || [];
let selectedTaskId = localStorage.getItem(LOCAL_STORAGE_SELECTED_TASK_ID_KEY);

// *==================== Event Listeneres ====================
newTaskForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const newTaskName = newTaskInput.value;

	const isTaskEmpty = !newTaskName || !newTaskName.trim().length;
	if (isTaskEmpty) {
		newTaskAlert.innerText = 'Please enter a task';
		newTaskAlert.classList.add('alert-danger');
		newTaskAlert.classList.add('active');

		setTimeout(() => {
			newTaskAlert.innerText = '';
			newTaskAlert.classList.remove('alert-danger');
			newTaskAlert.classList.remove('active');
		}, 2000);

		return newTaskAlert;
	}

	const newTask = createNewTask(newTaskName);
	newTaskAlert.innerText = 'Successfully created task';
	newTaskAlert.classList.add('alert-success');
	newTaskAlert.classList.add('active');
	tasks.push(newTask);

	setTimeout(() => {
		newTaskAlert.innerText = '';
		newTaskAlert.classList.remove('alert-success');
		newTaskAlert.classList.remove('active');
	}, 2000);

	newTaskInput.value = '';

	saveToLocalStorageAndRender();
});

tasksContainer.addEventListener('change', (e) => {
	if (e.target.tagName.toLowerCase() === 'input') {
		const newTaskColor = e.target.value;
		const taskId = e.target.parentElement.dataset.taskId;
		updateTaskAndCardColor(newTaskColor, taskId);
		saveToLocalStorageAndRender();
	}
});

tasksContainer.addEventListener('click', (e) => {
	if (e.target.tagName.toLowerCase() === 'li') {
		selectedTaskId = e.target.dataset.taskId;
		saveToLocalStorageAndRender();
	}
});

currentViewingTask.addEventListener('click', (e) => {
	if (e.target.tagName.toLowerCase() === 'span') {
		tasks = tasks.filter((task) => task._id !== selectedTaskId);
		cards = cards.filter((card) => card.cardOwner !== selectedTaskId);

		selectedTaskId = 'null';
		saveToLocalStorageAndRender();
	}
});

newTodoFormToggler.addEventListener('click', () => {
	newTodoForm.parentElement.classList.toggle('active');
});

newTodoForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const newTaskNameId = newTodoForm.task.value;
	const newTodo = newTodoForm.todo.value;
	const newCard = createNewCard(newTaskNameId, newTodo);
	cards.unshift(newCard);

	newTodoForm.task.value = '';
	newTodoForm.todo.value = '';

	saveToLocalStorageAndRender();
});

cardsContainer.addEventListener('click', (e) => {
	if (e.target.classList[1] === 'fa-trash-alt') {
		const {
			cardId,
		} = e.target.parentElement.parentElement.parentElement.dataset;
		cards = cards.filter(({ _id }) => _id !== cardId);
		saveToLocalStorageAndRender();
	}
	if (e.target.classList[1] === 'fa-edit') {
		const {
			cardId,
		} = e.target.parentElement.parentElement.parentElement.dataset;
		editTodoForm.parentElement.classList.add('active');

		//find card that will be edited
		let cardToEditIndex = cards.findIndex(({ _id }) => _id === cardId);

		//load card details into form
		editTodoForm.task.value = cards[cardToEditIndex].cardOwner;
		editTodoForm.todo.value = cards[cardToEditIndex].todo;

		editTodoForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const updatedTaskNameId = editTodoForm.task.value;
			const updatedTodo = editTodoForm.todo.value;

			const newCard = createNewCard(updatedTaskNameId, updatedTodo);
			editTodoForm.task.value = '';
			editTodoForm.todo.value = '';
			editTodoForm.parentElement.classList.remove('active');
			cards[cardToEditIndex] = newCard;

			saveToLocalStorageAndRender();
		});
	}
});

// *==================== Functions ====================
function createNewTask(newTaskName) {
	return {
		_id: Date.now().toString(),
		task: newTaskName,
		color: generateColor(),
	};
}

function createNewCard(newTaskNameId, newTodo) {
	const { task, color } = tasks.find(({ _id }) => _id === newTaskNameId);
	return {
		cardOwner: newTaskNameId,
		_id: Date.now().toString(),
		task: task,
		todo: newTodo,
		color: color,
	};
}

function updateTaskAndCardColor(newTaskColor, taskId) {
	const task = tasks.find((task) => task._id === taskId);
	task.color = newTaskColor;
	cards.forEach((card) =>
		card.cardOwner === taskId ? (card.color = newTaskColor) : card.color
	);
}

function generateColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.round(Math.random() * 15)];
	}
	return color;
}

function saveToLocalStorageAndRender() {
	saveToLocalStorage();
	render();
}

function saveToLocalStorage() {
	localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
	localStorage.setItem(LOCAL_STORAGE_CARDS_KEY, JSON.stringify(cards));
	localStorage.setItem(LOCAL_STORAGE_SELECTED_TASK_ID_KEY, selectedTaskId);
}

function render() {
	clearChildElements(tasksContainer);
	clearChildElements(newTodoSelect);
	clearChildElements(editTodoSelect);
	clearChildElements(cardsContainer);

	renderTasks();
	renderTodoFormOptions();
	renderCurrentViewing(); // We dont need to clear child elements because this function does not create an element. It just inserts text into an element
	renderCards();
}

function clearChildElements(element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

function renderTasks() {
	// Create sidebar li
	const sidebarItem = document.createElement('li');
	sidebarItem.dataset.taskId = null;
	sidebarItem.classList.add('sidebar-item');
	sidebarItem.innerText = 'View All';
	if (selectedTaskId === null || selectedTaskId === 'null') {
		sidebarItem.style.fontWeight = '600';
	}

	tasksContainer.append(sidebarItem);

	tasks.forEach(({ _id, task, color }) => {
		// Create sidebar li
		const sidebarItem = document.createElement('li');
		sidebarItem.dataset.taskId = _id;
		sidebarItem.classList.add('sidebar-item');
		sidebarItem.innerText = task;
		if (selectedTaskId === _id) {
			sidebarItem.style.fontWeight = '600';
		}

		// create sidebar color
		const sidebarColor = document.createElement('input');
		sidebarColor.classList.add('sidebar-color');
		sidebarColor.setAttribute('type', 'color');
		sidebarColor.value = color;

		// append color selector to sidebarItem
		sidebarItem.appendChild(sidebarColor);

		// append sidebarItem to sidebarList
		tasksContainer.appendChild(sidebarItem);
	});
}

function renderTodoFormOptions() {
	// creates a default option
	const option = document.createElement('option');
	option.innerText = 'Select a task';
	option.setAttribute('value', '');
	newTodoSelect.appendChild(option);
	editTodoSelect.appendChild(option.cloneNode(true));

	// Creates dynamic options
	tasks.forEach(({ _id, task, color }) => {
		const option = document.createElement('option');
		option.innerText = task;
		option.setAttribute('value', _id);
		newTodoSelect.appendChild(option);
		editTodoSelect.appendChild(option.cloneNode(true));
	});
}

function renderCurrentViewing() {
	if (selectedTaskId === 'null' || selectedTaskId === null) {
		return (currentViewingTask.innerHTML = `You are currently viewing <strong>All Task</strong>`);
	}

	const { task } = tasks.find((task) => task._id === selectedTaskId);
	currentViewingTask.innerHTML = `You are currently viewing <strong>${task}</strong>
	<span style="color: #e57373; cursor: pointer;">(delete)</span>`;
}

function renderCards() {
	let cardsToRender;

	if (selectedTaskId === 'null' || selectedTaskId === null) {
		cardsToRender = cards;
	} else {
		cardsToRender = cards.filter(
			(card) => card.cardOwner === selectedTaskId
		);
	}

	cardsToRender.forEach(({ cardOwner, _id, task, todo, color }) => {
		// create main card
		const cardElement = document.createElement('div');
		cardElement.classList.add('card');
		cardElement.style.borderTop = `6px solid ${color}`;
		cardElement.dataset.cardId = _id;

		// create content div
		const cardContent = document.createElement('div');
		cardContent.classList.add('card-content');

		// create card tag
		const cardCategory = document.createElement('div');
		cardCategory.classList.add('card-tag');
		cardCategory.innerText = task;
		cardCategory.style.backgroundColor = convertHexToRGBA(color, 15);
		cardCategory.style.color = color;

		// create main description for card
		const cardDescription = document.createElement('div');
		cardDescription.classList.add('card-description');
		cardDescription.innerText = todo;

		// create main options
		const mainOptions = document.createElement('div');
		mainOptions.classList.add('card-actions');
		mainOptions.innerHTML += `
	        <i class="far fa-edit"></i>
	        <i class="far fa-trash-alt"></i>
	    `;

		// Build the card
		cardElement.appendChild(cardContent);
		cardContent.appendChild(cardCategory);
		cardContent.appendChild(cardDescription);
		cardContent.appendChild(mainOptions);
		cardsContainer.appendChild(cardElement);
	});
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
