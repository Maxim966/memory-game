import { createElement } from './createElement.js';

export function createCard(card, index, onCardClick) {
  const cardButton = createElement('button', {
    className: 'card',
    attributes: {
      type: 'button',
      'aria-label': `Закрытая карточка ${index + 1}`,
    },
    on: { click: () => onCardClick(card, cardButton) },
    children: [
      createElement('span', {
        className: 'card__inner',
        attributes: { 'aria-hidden': 'true' },
        children: [
          createElement('span', {
            className: 'card__face card__face--front',
            text: card.symbol,
          }),
          createElement('span', {
            className: 'card__face card__face--back',
            text: '★',
          }),
        ],
      }),
    ],
  });

  return cardButton;
}
