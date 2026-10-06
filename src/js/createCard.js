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
            children: [
              createElement('img', {
                className: 'card__image',
                attributes: {
                  src: card.image,
                  alt: '',
                },
              }),
            ],
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
