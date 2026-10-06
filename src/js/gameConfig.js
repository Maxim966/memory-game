import image1 from '../assets/images/1.png';
import image2 from '../assets/images/2.png';
import image3 from '../assets/images/3.png';
import image4 from '../assets/images/4.png';
import image5 from '../assets/images/5.png';
import image6 from '../assets/images/6.png';
import image7 from '../assets/images/7.png';
import image8 from '../assets/images/8.png';

export const RESULT_STORAGE_KEY = 'memory-game-results';
export const CARD_IMAGES = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
];
export const MISMATCH_DELAY = 1000;

export const GAME_STATUS = {
  ready: 'Откройте две карточки и найдите одинаковые картинки.',
  matched: 'Отлично! Пара найдена.',
  mismatch: 'Не совпали. Запомните карточки — они скоро закроются.',
  won: 'Поздравляем! Вы нашли все пары.',
};
