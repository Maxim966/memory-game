import { createElement } from './createElement.js';

let modalOverlay = null;
let modalKeyHandler = null;

export function showModal({ title, content, actions = [] }) {
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

export function closeModal() {
  if (modalOverlay) {
    modalOverlay.remove();
    modalOverlay = null;
  }

  if (modalKeyHandler) {
    document.removeEventListener('keydown', modalKeyHandler);
    modalKeyHandler = null;
  }
}
