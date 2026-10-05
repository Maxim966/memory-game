import './scss/style.scss';
import { createElement } from './js/createElement.js';
import { createCard } from './js/createCard.js';
import {
  CARD_SYMBOLS,
  GAME_STATUS,
  MISMATCH_DELAY,
  RESULT_STORAGE_KEY,
} from './js/gameConfig.js';
import { getMovesWord } from './js/formatMoves.js';
import { shuffle } from './js/shuffle.js';

const app = document.querySelector('#app');

if (!app) {
  throw new Error('Не найден корневой элемент #app.');
}

let cards = [];
let flippedCards = [];
let moves = 0;
let foundPairs = 0;
let isLocked = false;
let mismatchTimeout = null;
let modalOverlay = null;
let modalKeyHandler = null;

const movesValue = createElement('span', {
  className: 'stat__value',
  text: '0',
});
const pairsValue = createElement('span', {
  className: 'stat__value',
  text: '0 / 8',
});
const cardGrid = createElement('div', {
  className: 'cards',
  attributes: { 'aria-label': 'Игровое поле' },
});
const gameStatus = createElement('p', {
  className: 'game__status',
  attributes: { 'aria-live': 'polite' },
  text: GAME_STATUS.ready,
});

const newGameButton = createElement('button', {
  className: 'button button--primary header__button',
  attributes: { type: 'button' },
  text: 'Новая игра',
  on: { click: startNewGame },
});
const leaderboardButton = createElement('button', {
  className: 'button button--secondary header__button',
  attributes: { type: 'button' },
  text: 'Таблица лидеров',
  on: { click: showLeaderboard },
});

const header = createElement('header', {
  className: 'header',
  children: [
    createElement('a', {
      className: 'header__brand',
      attributes: { href: './', 'aria-label': 'Memory Game — на главную' },
      children: [
        createElement('span', {
          className: 'header__brand-icon',
          attributes: { 'aria-hidden': 'true' },
          text: '✳',
        }),
        createElement('span', { text: 'memory game' }),
      ],
    }),
    createElement('nav', {
      className: 'header__actions',
      attributes: { 'aria-label': 'Управление игрой' },
      children: [leaderboardButton, newGameButton],
    }),
  ],
});

const stats = createElement('section', {
  className: 'stats',
  attributes: { 'aria-label': 'Статистика игры' },
  children: [
    createStat('Ходы', movesValue),
    createStat('Найдено пар', pairsValue),
  ],
});

const gamePanel = createElement('main', {
  className: 'game',
  children: [
    createElement('div', {
      className: 'game__mark',
      attributes: { 'aria-hidden': 'true' },
      text: '🧠',
    }),
    createElement('div', {
      className: 'game__heading',
      children: [
        createElement('p', {
          className: 'game__eyebrow',
          text: 'Тренируй свою память',
        }),
        createElement('h1', {
          className: 'game__title',
          text: 'Memory Game',
        }),
        createElement('span', {
          className: 'game__badge',
          text: 'ИГРАЙ И ТРЕНИРУЙ ПАМЯТЬ',
        }),
        createElement('p', {
          className: 'game__description',
          text: 'Открывай карточки и находи одинаковые картинки.',
        }),
      ],
    }),
    stats,
    cardGrid,
    gameStatus,
  ],
});

app.append(
  createElement('div', {
    className: 'app',
    children: [header, gamePanel],
  }),
);

function createStat(label, valueElement) {
  return createElement('div', {
    className: 'stat',
    children: [
      createElement('span', { className: 'stat__label', text: label }),
      valueElement,
    ],
  });
}

function handleCardClick(card, cardElement) {
  if (isLocked || card.isFlipped || card.isMatched) {
    return;
  }

  card.isFlipped = true;
  cardElement.classList.add('card--flipped');
  cardElement.setAttribute('aria-label', `Открыта карточка: ${card.symbol}`);
  flippedCards.push({ card, element: cardElement });

  if (flippedCards.length < 2) {
    return;
  }

  moves += 1;
  updateStats();

  const [firstCard, secondCard] = flippedCards;

  if (firstCard.card.pairId === secondCard.card.pairId) {
    firstCard.card.isMatched = true;
    secondCard.card.isMatched = true;
    firstCard.element.classList.add('card--matched');
    secondCard.element.classList.add('card--matched');
    firstCard.element.setAttribute(
      'aria-label',
      `Найдена пара: ${firstCard.card.symbol}`,
    );
    secondCard.element.setAttribute(
      'aria-label',
      `Найдена пара: ${secondCard.card.symbol}`,
    );
    foundPairs += 1;
    flippedCards = [];
    pairsValue.textContent = `${foundPairs} / ${CARD_SYMBOLS.length}`;
    gameStatus.textContent = GAME_STATUS.matched;

    if (foundPairs === CARD_SYMBOLS.length) {
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
      openedCard.element.classList.remove('card--flipped');
      openedCard.element.setAttribute(
        'aria-label',
        `Закрытая карточка ${openedCard.card.position + 1}`,
      );
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
  cards = shuffle(
    CARD_SYMBOLS.flatMap((symbol, pairId) => [
      { pairId, symbol, isFlipped: false, isMatched: false },
      { pairId, symbol, isFlipped: false, isMatched: false },
    ]),
  ).map((card, position) => ({ ...card, position }));

  updateStats();
  pairsValue.textContent = `0 / ${CARD_SYMBOLS.length}`;
  gameStatus.textContent = GAME_STATUS.ready;
  cardGrid.replaceChildren(
    ...cards.map((card, index) =>
      createCard(card, index, handleCardClick),
    ),
  );
}

function showVictoryModal() {
  const nameInput = createElement('input', {
    className: 'form__input',
    attributes: {
      id: 'player-name',
      name: 'playerName',
      type: 'text',
      maxlength: '24',
      autocomplete: 'name',
      placeholder: 'Например, Алекс',
      required: true,
    },
    on: {
      keydown: (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          saveButton.click();
        }
      },
    },
  });
  const saveStatus = createElement('p', {
    className: 'form__status',
    attributes: { 'aria-live': 'polite' },
  });
  let saved = false;
  let saveButton;

  const saveResult = () => {
    if (saved) {
      return;
    }

    const playerName = nameInput.value.trim();

    if (!playerName) {
      saveStatus.textContent = 'Введите имя, чтобы сохранить результат.';
      nameInput.focus();
      return;
    }

    try {
      saveLeaderboardResult({
        name: playerName,
        moves,
        date: new Date().toISOString(),
      });
      saved = true;
      nameInput.disabled = true;
      saveButton.disabled = true;
      saveStatus.textContent = 'Результат сохранён в таблице лидеров.';
    } catch (error) {
      console.error('Не удалось сохранить результат игры.', error);
      saveStatus.textContent =
        'Не удалось сохранить результат. Проверьте доступ к локальному хранилищу браузера.';
    }
  };

  const modal = showModal({
    title: 'Победа!',
    content: [
      createElement('p', {
        className: 'modal__message',
        text: `Вы нашли все пары за ${moves} ${getMovesWord(moves)}.`,
      }),
      createElement('label', {
        className: 'form__label',
        attributes: { for: 'player-name' },
        text: 'Ваше имя',
      }),
      nameInput,
      saveStatus,
    ],
    actions: [
      { label: 'Сохранить результат', variant: 'primary', onClick: saveResult },
      {
        label: 'Новая игра',
        variant: 'secondary',
        onClick: startNewGame,
      },
      { label: 'Закрыть', variant: 'text', onClick: closeModal },
    ],
  });

  saveButton = modal.actionButtons[0];
  nameInput.focus();
}

function showLeaderboard() {
  let content;

  try {
    const results = loadLeaderboardResults();

    content = results.length
      ? createElement('ol', {
          className: 'leaderboard',
          children: results.slice(0, 10).map((result, index) =>
            createElement('li', {
              className: 'leaderboard__row',
              children: [
                createElement('span', {
                  className: 'leaderboard__rank',
                  text: String(index + 1).padStart(2, '0'),
                }),
                createElement('span', {
                  className: 'leaderboard__player',
                  text: result.name,
                }),
                createElement('span', {
                  className: 'leaderboard__score',
                  text: `${result.moves} ${getMovesWord(result.moves)}`,
                }),
                createElement('time', {
                  className: 'leaderboard__date',
                  attributes: {
                    datetime: result.date,
                  },
                  text: new Date(result.date).toLocaleDateString('ru-RU'),
                }),
              ],
            }),
          ),
        })
      : createElement('p', {
          className: 'feedback feedback--empty',
          text: 'Пока нет результатов. Найдите все пары и установите рекорд!',
        });
  } catch (error) {
    console.error('Не удалось загрузить таблицу лидеров.', error);
    content = createElement('p', {
      className: 'feedback feedback--error',
      text: 'Не удалось загрузить таблицу лидеров. Данные в локальном хранилище повреждены или недоступны.',
    });
  }

  showModal({
    title: 'Таблица лидеров',
    content,
    actions: [{ label: 'Закрыть', variant: 'secondary', onClick: closeModal }],
  });
}

function loadLeaderboardResults() {
  const storedResults = window.localStorage.getItem(RESULT_STORAGE_KEY);

  if (storedResults === null) {
    return [];
  }

  const results = JSON.parse(storedResults);

  if (!Array.isArray(results) || !results.every(isValidResult)) {
    throw new Error('Некорректный формат сохранённых результатов.');
  }

  return results.sort(
    (first, second) =>
      first.moves - second.moves ||
      new Date(first.date).getTime() - new Date(second.date).getTime(),
  );
}

function isValidResult(result) {
  return (
    result !== null &&
    typeof result === 'object' &&
    typeof result.name === 'string' &&
    result.name.trim().length > 0 &&
    Number.isInteger(result.moves) &&
    result.moves > 0 &&
    typeof result.date === 'string' &&
    Number.isFinite(new Date(result.date).getTime())
  );
}

function saveLeaderboardResult(result) {
  const results = loadLeaderboardResults();
  results.push(result);
  results.sort(
    (first, second) =>
      first.moves - second.moves ||
      new Date(first.date).getTime() - new Date(second.date).getTime(),
  );
  window.localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(results.slice(0, 10)));
}

function showModal({ title, content, actions = [] }) {
  closeModal();

  const actionButtons = actions.map(({ label, variant, onClick }) =>
    createElement('button', {
      className: `button button--${variant} modal__button`,
      attributes: { type: 'button' },
      text: label,
      on: { click: onClick },
    }),
  );
  const closeButton = createElement('button', {
    className: 'modal__close',
    attributes: { type: 'button', 'aria-label': 'Закрыть окно' },
    text: '×',
    on: { click: closeModal },
  });
  const modal = createElement('section', {
    className: 'modal',
    attributes: {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'modal-title',
    },
    children: [
      closeButton,
      createElement('div', {
        className: 'modal__content',
        children: [
          createElement('p', {
            className: 'modal__eyebrow',
            text: 'Memory Game',
          }),
          createElement('h2', {
            className: 'modal__title',
            attributes: { id: 'modal-title' },
            text: title,
          }),
          ...(Array.isArray(content) ? content : [content]),
        ],
      }),
      createElement('div', {
        className: 'modal__actions',
        children: actionButtons,
      }),
    ],
  });

  modalOverlay = createElement('div', {
    className: 'modal-backdrop',
    on: {
      click: (event) => {
        if (event.target === modalOverlay) {
          closeModal();
        }
      },
    },
    children: [modal],
  });
  document.body.append(modalOverlay);
  modalKeyHandler = (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', modalKeyHandler);

  return { actionButtons };
}

function closeModal() {
  if (modalOverlay) {
    modalOverlay.remove();
    modalOverlay = null;
  }

  if (modalKeyHandler) {
    document.removeEventListener('keydown', modalKeyHandler);
    modalKeyHandler = null;
  }
}

startNewGame();
