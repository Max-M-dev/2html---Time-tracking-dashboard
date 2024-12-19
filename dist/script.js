class EventManager {
	#listEvents = {};
	subscribe(event, handler) {
		if (!this.isExisEvent(event)) {
			this.#listEvents[event] = [];
		}
		this.#listEvents[event].push(handler);
	}
	unsubscribe(event, handler) {
		if (!this.isExisEvent(event)) {
			return true;
		}
		try {
			this.#listEvents[event] = this.#listEvents[event].filter((handlerInList) => handlerInList !== handler);
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}
	async notify(event, data) {
		if (!this.isExisEvent(event)) {
			console.error("Event name is not found in listEvents");
			return false;
		}
		this.#listEvents[event].forEach(async (handler) => await handler(data));
		return true;
	}
	isExisEvent(nameEvent) {
		return nameEvent in this.#listEvents;
	}
}

const eventManager = new EventManager();
const nameEvents = {
	changeTime: "changeTime",
};
const idElCards = "cards";
const idElFilterTime = "filter-time";
const classNameActiveLink = "filter__link--active";
const defaultActiveTime = "weekly";

async function main() {
	let res = await fetch("data.json")
		.then((res) => res.text())
		.then((res) => JSON.parse(res));

	function createHtmlWithSpecificTime(nameTime) {
		let listElCard = res.map((entity) => {
			let { current, previous } = entity.timeframes[nameTime];
			return createCard(entity.title, nameTime, current, previous);
		});
		renderListElement(idElCards, listElCard);
	}

	eventManager.subscribe(nameEvents["changeTime"], (data) => {
		console.log(data);
		/* toggle active menu */
		let listElFilterTimeLink = Array.from(document.getElementById(idElFilterTime).children);
		removeClassNameInEl(classNameActiveLink, listElFilterTimeLink);
		listElFilterTimeLink.forEach((element) => {
			if (element.dataset.nameTime === data) {
				element.classList.add(classNameActiveLink);
			}
		});
		/* Cards */
		clearCards(idElCards);
		createHtmlWithSpecificTime(data);
	});

	let listElFilterTime = Object.keys(res[0].timeframes).map((entity) => {
		return createElForFilterTime(entity, false, () => eventManager.notify(nameEvents["changeTime"], entity));
	});
	renderListElement(idElFilterTime, listElFilterTime);

	eventManager.notify(nameEvents["changeTime"], defaultActiveTime);
}

function createElForFilterTime(textContent, active = false, onClick = null) {
	let el = document.createElement("a");
	el.href = "#";
	el.classList.add("filter__link");
	el.innerText = textContent;
	el.dataset.nameTime = textContent;
	el.onclick = onClick;
	return el;
}
function clearCards(idElement) {
	console.log("Clear");
	document.getElementById(idElement).innerHTML = "";
}
function removeClassNameInEl(className, listElement) {
	if (!(listElement instanceof Array)) throw new Error("ListElement is not array");
	listElement.forEach((element) => {
		element.classList.remove(className);
	});
}

function renderListElement(idElement, listElCard) {
	let elCards = document.getElementById(idElement);
	if (!elCards) throw new Error("Not found id el. cards");
	for (let elCard of listElCard) {
		elCards.appendChild(elCard);
	}
}

function createCard(title, nameTimeframes, current, prev) {
	let cardEl = document.createElement("div");
	cardEl.classList.add("card");
	/* background element */
	let backgroundCardEl = document.createElement("div");
	backgroundCardEl.classList.add("card__background", `card__background--${title.toLocaleLowerCase().replaceAll(" ", "-")}`);
	/* wrapper element */
	let wrapperEl = document.createElement("div");
	wrapperEl.classList.add("card__wrapper");
	/* header */

	let titleEl = document.createElement("div");
	titleEl.classList.add("card__title");
	titleEl.textContent = title;

	let moreEl = document.createElement("div");
	moreEl.classList.add("card__more");
	let buttonHeaderEl = document.createElement("button");
	buttonHeaderEl.textContent = "...";
	moreEl.append(buttonHeaderEl);

	let headerEl = document.createElement("div");
	headerEl.classList.add("card__header");
	headerEl.append(titleEl, moreEl);

	/* body */
	let bodyEl = document.createElement("div");
	bodyEl.classList.add("card__body");
	wrapperEl.append(headerEl, bodyEl);

	cardEl.append(backgroundCardEl);
	cardEl.append(wrapperEl);

	let totalTime = document.createElement("div");
	totalTime.classList.add("card__total");
	totalTime.textContent = `${current}hrs`;

	let periodTime = document.createElement("div");
	periodTime.classList.add("card__period-time");
	periodTime.textContent = `Last ${nameTimeframes} - ${prev}hrs`;

	bodyEl.append(totalTime, periodTime);

	// cardEl.innerHTML = `
	// 				<div class="card__background card__background--${title.toLocaleLowerCase().replaceAll(" ", "-")}"></div>
	// 				<div class="card__wrapper">
	// 					<div class="card__header">
	// 						<div class="card__title">${title}</div>
	// 						<div class="card__more"><button>...</button></div>
	// 					</div>
	// 					<div class="card__body">
	// 						<div class="card__total-time">${current}hrs</div>
	// 						<div class="card__period-time">Last ${nameTimeframes} - ${prev}hrs</div>
	// 					</div>
	// 			</div>`;
	return cardEl;
}

main();
