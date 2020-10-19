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

		let cardToEditIndex = cards.findIndex(({ _id }) => _id === cardId);

		editTodoForm.task.value = cards[cardToEditIndex].cardOwner;
		editTodoForm.todo.value = cards[cardToEditIndex].todo;

		editTodoForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const updatedTaskNameId = editTodoForm.task.value;
			const updatedTodo = editTodoForm.todo.value;
			console.table(updatedTaskNameId);
			const newCard = createNewCard(updatedTaskNameId, updatedTodo);
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
	console.log(newTaskNameId);
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
	tasksContainer.innerHTML += `<li class="sidebar-item" style="${
		(null || 'null') === selectedTaskId && `font-weight: 600;`
	}" data-task-id=null>View All</li>`;

	tasks.forEach(({ _id, task, color }) => {
		tasksContainer.innerHTML += `
		<li class="sidebar-item" style="${
			selectedTaskId === _id && `font-weight: 600;`
		}" data-task-id=${_id}>${task}<input class="sidebar-color" type="color" value=${color}></li>`;
	});
}

function renderTodoFormOptions() {
	newTodoSelect.innerHTML += `<option value="">Select a task</option>`;
	editTodoSelect.innerHTML += `<option value="">Select a task</option>`;

	// Creates dynamic options
	tasks.forEach(({ _id, task, color }) => {
		newTodoSelect.innerHTML += `<option value=${_id}>${task}</option>`;
		editTodoSelect.innerHTML += `<option value=${_id}>${task}</option>`;
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
		cardsContainer.innerHTML += `
			<div class="card" data-card-id=${_id} style="border-color: ${color}">
				<div class="card-content">
					<div class="card-tag" style="background-color: ${convertHexToRGBA(
						color,
						15
					)}; color: ${color};">${task}</div>
					<div class="card-description">${todo}</div>
					<div class="card-actions">
						<i class="far fa-edit"></i>
						<i class="far fa-trash-alt"></i>
					</div>
				</div>
			</div>
		`;
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
