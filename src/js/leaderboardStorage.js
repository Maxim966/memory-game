import { RESULT_STORAGE_KEY } from './gameConfig.js';

export function loadLeaderboardResults() {
  const storedResults = window.localStorage.getItem(RESULT_STORAGE_KEY);

  if (storedResults === null) {
    return [];
  }

  const results = JSON.parse(storedResults);

  if (!Array.isArray(results) || !results.every(isValidResult)) {
    throw new Error('Некорректный формат сохранённых результатов.');
  }

  return sortResults(results);
}

export function saveLeaderboardResult(result) {
  const results = loadLeaderboardResults();
  results.push(result);
  window.localStorage.setItem(
    RESULT_STORAGE_KEY,
    JSON.stringify(sortResults(results).slice(0, 10)),
  );
}

function sortResults(results) {
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
