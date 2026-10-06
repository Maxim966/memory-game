//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/js/createElement.js
function createElement(tagName, { className, attributes = {}, on = {}, children = [], text } = {}) {
	const element = document.createElement(tagName);
	if (className) element.className = className;
	for (const [name, value] of Object.entries(attributes)) {
		if (value === null || value === void 0 || value === false) continue;
		element.setAttribute(name, value === true ? "" : String(value));
	}
	for (const [eventName, handler] of Object.entries(on)) element.addEventListener(eventName, handler);
	if (text !== void 0) element.textContent = text;
	const normalizedChildren = Array.isArray(children) ? children : [children];
	for (const child of normalizedChildren) {
		if (child === null || child === void 0 || child === false) continue;
		element.append(child instanceof Node ? child : document.createTextNode(String(child)));
	}
	return element;
}
//#endregion
//#region src/js/createCard.js
function createCard(card, index, onCardClick) {
	const cardButton = createElement("button", {
		className: "card",
		attributes: {
			type: "button",
			"aria-label": `Закрытая карточка ${index + 1}`
		},
		on: { click: () => onCardClick(card, cardButton) },
		children: [createElement("span", {
			className: "card__inner",
			attributes: { "aria-hidden": "true" },
			children: [createElement("span", {
				className: "card__face card__face--front",
				children: [createElement("img", {
					className: "card__image",
					attributes: {
						src: card.image,
						alt: ""
					}
				})]
			}), createElement("span", {
				className: "card__face card__face--back",
				text: "★"
			})]
		})]
	});
	return cardButton;
}
//#endregion
//#region src/js/createStat.js
function createStat(label, valueElement) {
	return createElement("div", {
		className: "stat",
		children: [createElement("span", {
			className: "stat__label",
			text: label
		}), valueElement]
	});
}
//#endregion
//#region src/assets/images/1.png
var _1_default = "/memory-game/assets/1.png";
//#endregion
//#region src/assets/images/2.png
var _2_default = "/memory-game/assets/2.png";
//#endregion
//#region src/assets/images/3.png
var _3_default = "/memory-game/assets/3.png";
//#endregion
//#region src/assets/images/4.png
var _4_default = "/memory-game/assets/4.png";
//#endregion
//#region src/assets/images/5.png
var _5_default = "/memory-game/assets/5.png";
//#endregion
//#region src/assets/images/6.png
var _6_default = "/memory-game/assets/6.png";
//#endregion
//#region src/assets/images/7.png
var _7_default = "/memory-game/assets/7.png";
//#endregion
//#region src/assets/images/8.png
var _8_default = "/memory-game/assets/8.png";
//#endregion
//#region src/js/gameConfig.js
var RESULT_STORAGE_KEY = "memory-game-results";
var CARD_IMAGES = [
	_1_default,
	_2_default,
	_3_default,
	_4_default,
	_5_default,
	_6_default,
	_7_default,
	_8_default
];
var MISMATCH_DELAY = 1e3;
var GAME_STATUS = {
	ready: "Откройте две карточки и найдите одинаковые картинки.",
	matched: "Отлично! Пара найдена.",
	mismatch: "Не совпали. Запомните карточки — они скоро закроются.",
	won: "Поздравляем! Вы нашли все пары."
};
//#endregion
//#region src/js/formatMoves.js
function getMovesWord(count) {
	const lastTwoDigits = count % 100;
	if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "ходов";
	switch (count % 10) {
		case 1: return "ход";
		case 2:
		case 3:
		case 4: return "хода";
		default: return "ходов";
	}
}
//#endregion
//#region src/js/leaderboardStorage.js
function loadLeaderboardResults() {
	const storedResults = window.localStorage.getItem(RESULT_STORAGE_KEY);
	if (storedResults === null) return [];
	const results = JSON.parse(storedResults);
	if (!Array.isArray(results) || !results.every(isValidResult)) throw new Error("Некорректный формат сохранённых результатов.");
	return sortResults(results);
}
function saveLeaderboardResult(result) {
	const results = loadLeaderboardResults();
	results.push(result);
	window.localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(sortResults(results).slice(0, 10)));
}
function sortResults(results) {
	return results.sort((first, second) => first.moves - second.moves || new Date(first.date).getTime() - new Date(second.date).getTime());
}
function isValidResult(result) {
	return result !== null && typeof result === "object" && typeof result.name === "string" && result.name.trim().length > 0 && Number.isInteger(result.moves) && result.moves > 0 && typeof result.date === "string" && Number.isFinite(new Date(result.date).getTime());
}
//#endregion
//#region src/js/modal.js
var modalOverlay = null;
var modalKeyHandler = null;
function showModal({ title, content, actions = [] }) {
	closeModal();
	const actionButtons = actions.map(({ label, variant, onClick }) => createElement("button", {
		className: `button button--${variant} modal__button`,
		attributes: { type: "button" },
		text: label,
		on: { click: onClick }
	}));
	modalOverlay = createElement("div", {
		className: "modal-backdrop",
		on: { click: (event) => {
			if (event.target === modalOverlay) closeModal();
		} },
		children: [createElement("section", {
			className: "modal",
			attributes: {
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "modal-title"
			},
			children: [
				createElement("button", {
					className: "modal__close",
					attributes: {
						type: "button",
						"aria-label": "Закрыть окно"
					},
					text: "×",
					on: { click: closeModal }
				}),
				createElement("div", {
					className: "modal__content",
					children: [
						createElement("p", {
							className: "modal__eyebrow",
							text: "Memory Game"
						}),
						createElement("h2", {
							className: "modal__title",
							attributes: { id: "modal-title" },
							text: title
						}),
						...Array.isArray(content) ? content : [content]
					]
				}),
				createElement("div", {
					className: "modal__actions",
					children: actionButtons
				})
			]
		})]
	});
	document.body.append(modalOverlay);
	modalKeyHandler = (event) => {
		if (event.key === "Escape") closeModal();
	};
	document.addEventListener("keydown", modalKeyHandler);
	return { actionButtons };
}
function closeModal() {
	if (modalOverlay) {
		modalOverlay.remove();
		modalOverlay = null;
	}
	if (modalKeyHandler) {
		document.removeEventListener("keydown", modalKeyHandler);
		modalKeyHandler = null;
	}
}
//#endregion
//#region src/js/shuffle.js
function shuffle(items) {
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
	}
	return shuffled;
}
//#endregion
//#region src/main.js
var app = document.querySelector("#app");
if (!app) throw new Error("Не найден корневой элемент #app.");
var cards = [];
var flippedCards = [];
var moves = 0;
var foundPairs = 0;
var isLocked = false;
var mismatchTimeout = null;
var movesValue = createElement("span", {
	className: "stat__value",
	text: "0"
});
var pairsValue = createElement("span", {
	className: "stat__value",
	text: "0 / 8"
});
var cardGrid = createElement("div", {
	className: "cards",
	attributes: { "aria-label": "Игровое поле" }
});
var gameStatus = createElement("p", {
	className: "game__status",
	attributes: { "aria-live": "polite" },
	text: GAME_STATUS.ready
});
var newGameButton = createElement("button", {
	className: "button button--primary header__button",
	attributes: { type: "button" },
	text: "Новая игра",
	on: { click: startNewGame }
});
var leaderboardButton = createElement("button", {
	className: "button button--secondary header__button",
	attributes: { type: "button" },
	text: "Таблица лидеров",
	on: { click: showLeaderboard }
});
var header = createElement("header", {
	className: "header",
	children: [createElement("a", {
		className: "header__brand",
		attributes: {
			href: "./",
			"aria-label": "Memory Game — на главную"
		},
		children: [createElement("span", {
			className: "header__brand-icon",
			attributes: { "aria-hidden": "true" },
			text: "✳"
		}), createElement("span", { text: "memory game" })]
	}), createElement("nav", {
		className: "header__actions",
		attributes: { "aria-label": "Управление игрой" },
		children: [leaderboardButton, newGameButton]
	})]
});
var stats = createElement("section", {
	className: "stats",
	attributes: { "aria-label": "Статистика игры" },
	children: [createStat("Ходы", movesValue), createStat("Найдено пар", pairsValue)]
});
var gamePanel = createElement("main", {
	className: "game",
	children: [
		createElement("div", {
			className: "game__mark",
			attributes: { "aria-hidden": "true" },
			text: "🧠"
		}),
		createElement("div", {
			className: "game__heading",
			children: [
				createElement("p", {
					className: "game__eyebrow",
					text: "Тренируй свою память"
				}),
				createElement("h1", {
					className: "game__title",
					text: "Memory Game"
				}),
				createElement("span", {
					className: "game__badge",
					text: "ИГРАЙ И ТРЕНИРУЙ ПАМЯТЬ"
				}),
				createElement("p", {
					className: "game__description",
					text: "Открывай карточки и находи одинаковые картинки."
				})
			]
		}),
		stats,
		cardGrid,
		gameStatus
	]
});
app.append(createElement("div", {
	className: "app",
	children: [header, gamePanel]
}));
function handleCardClick(card, cardElement) {
	if (isLocked || card.isFlipped || card.isMatched) return;
	card.isFlipped = true;
	cardElement.classList.add("card--flipped");
	cardElement.setAttribute("aria-label", `Открыта карточка ${card.position + 1}`);
	flippedCards.push({
		card,
		element: cardElement
	});
	if (flippedCards.length < 2) return;
	moves += 1;
	updateStats();
	const [firstCard, secondCard] = flippedCards;
	if (firstCard.card.pairId === secondCard.card.pairId) {
		firstCard.card.isMatched = true;
		secondCard.card.isMatched = true;
		firstCard.element.classList.add("card--matched");
		secondCard.element.classList.add("card--matched");
		firstCard.element.setAttribute("aria-label", `Найдена пара: карточка ${firstCard.card.position + 1}`);
		secondCard.element.setAttribute("aria-label", `Найдена пара: карточка ${secondCard.card.position + 1}`);
		foundPairs += 1;
		flippedCards = [];
		pairsValue.textContent = `${foundPairs} / ${CARD_IMAGES.length}`;
		gameStatus.textContent = GAME_STATUS.matched;
		if (foundPairs === CARD_IMAGES.length) {
			gameStatus.textContent = GAME_STATUS.won;
			showVictoryModal();
		}
		return;
	}
	isLocked = true;
	gameStatus.textContent = GAME_STATUS.mismatch;
	mismatchTimeout = window.setTimeout(() => {
		for (const openedCard of flippedCards) {
			openedCard.card.isFlipped = false;
			openedCard.element.classList.remove("card--flipped");
			openedCard.element.setAttribute("aria-label", `Закрытая карточка ${openedCard.card.position + 1}`);
		}
		flippedCards = [];
		mismatchTimeout = null;
		isLocked = false;
		gameStatus.textContent = GAME_STATUS.ready;
	}, MISMATCH_DELAY);
}
function updateStats() {
	movesValue.textContent = String(moves);
}
function startNewGame() {
	if (mismatchTimeout !== null) {
		window.clearTimeout(mismatchTimeout);
		mismatchTimeout = null;
	}
	closeModal();
	moves = 0;
	foundPairs = 0;
	isLocked = false;
	flippedCards = [];
	cards = shuffle(CARD_IMAGES.flatMap((image, pairId) => [{
		pairId,
		image,
		isFlipped: false,
		isMatched: false
	}, {
		pairId,
		image,
		isFlipped: false,
		isMatched: false
	}])).map((card, position) => ({
		...card,
		position
	}));
	updateStats();
	pairsValue.textContent = `0 / ${CARD_IMAGES.length}`;
	gameStatus.textContent = GAME_STATUS.ready;
	cardGrid.replaceChildren(...cards.map((card, index) => createCard(card, index, handleCardClick)));
}
function showVictoryModal() {
	const nameInput = createElement("input", {
		className: "form__input",
		attributes: {
			id: "player-name",
			name: "playerName",
			type: "text",
			maxlength: "24",
			autocomplete: "name",
			placeholder: "Например, Алекс",
			required: true
		},
		on: { keydown: (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				saveButton.click();
			}
		} }
	});
	const saveStatus = createElement("p", {
		className: "form__status",
		attributes: { "aria-live": "polite" }
	});
	let saved = false;
	let saveButton;
	const saveResult = () => {
		if (saved) return;
		const playerName = nameInput.value.trim();
		if (!playerName) {
			saveStatus.textContent = "Введите имя, чтобы сохранить результат.";
			nameInput.focus();
			return;
		}
		try {
			saveLeaderboardResult({
				name: playerName,
				moves,
				date: (/* @__PURE__ */ new Date()).toISOString()
			});
			saved = true;
			nameInput.disabled = true;
			saveButton.disabled = true;
			saveStatus.textContent = "Результат сохранён в таблице лидеров.";
		} catch (error) {
			console.error("Не удалось сохранить результат игры.", error);
			saveStatus.textContent = "Не удалось сохранить результат. Проверьте доступ к локальному хранилищу браузера.";
		}
	};
	saveButton = showModal({
		title: "Победа!",
		content: [
			createElement("p", {
				className: "modal__message",
				text: `Вы нашли все пары за ${moves} ${getMovesWord(moves)}.`
			}),
			createElement("label", {
				className: "form__label",
				attributes: { for: "player-name" },
				text: "Ваше имя"
			}),
			nameInput,
			saveStatus
		],
		actions: [
			{
				label: "Сохранить результат",
				variant: "primary",
				onClick: saveResult
			},
			{
				label: "Новая игра",
				variant: "secondary",
				onClick: startNewGame
			},
			{
				label: "Закрыть",
				variant: "text",
				onClick: closeModal
			}
		]
	}).actionButtons[0];
	nameInput.focus();
}
function showLeaderboard() {
	let content;
	try {
		const results = loadLeaderboardResults();
		content = results.length ? createElement("ol", {
			className: "leaderboard",
			children: results.slice(0, 10).map((result, index) => createElement("li", {
				className: "leaderboard__row",
				children: [
					createElement("span", {
						className: "leaderboard__rank",
						text: String(index + 1).padStart(2, "0")
					}),
					createElement("span", {
						className: "leaderboard__player",
						text: result.name
					}),
					createElement("span", {
						className: "leaderboard__score",
						text: `${result.moves} ${getMovesWord(result.moves)}`
					}),
					createElement("time", {
						className: "leaderboard__date",
						attributes: { datetime: result.date },
						text: new Date(result.date).toLocaleDateString("ru-RU")
					})
				]
			}))
		}) : createElement("p", {
			className: "feedback feedback--empty",
			text: "Пока нет результатов. Найдите все пары и установите рекорд!"
		});
	} catch (error) {
		console.error("Не удалось загрузить таблицу лидеров.", error);
		content = createElement("p", {
			className: "feedback feedback--error",
			text: "Не удалось загрузить таблицу лидеров. Данные в локальном хранилище повреждены или недоступны."
		});
	}
	showModal({
		title: "Таблица лидеров",
		content,
		actions: [{
			label: "Закрыть",
			variant: "secondary",
			onClick: closeModal
		}]
	});
}
startNewGame();
//#endregion

//# sourceMappingURL=main.js.map