export function getMovesWord(count) {
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'ходов';
  }

  switch (count % 10) {
    case 1:
      return 'ход';
    case 2:
    case 3:
    case 4:
      return 'хода';
    default:
      return 'ходов';
  }
}
