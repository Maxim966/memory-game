import { createElement } from './createElement.js';

export function createStat(label, valueElement) {
  return createElement('div', {
    className: 'stat',
    children: [
      createElement('span', { className: 'stat__label', text: label }),
      valueElement,
    ],
  });
}
