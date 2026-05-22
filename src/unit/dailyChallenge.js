import { List } from 'immutable';
import { blockType, blankLine } from './const';

const DailyChallengeKey = 'REACT_TETRIS_DAILY_CHALLENGE';
const RankingKey = 'REACT_TETRIS_DAILY_RANKING';

const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};

const getTodayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const getDateSeed = () => {
  const today = getTodayString();
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = ((seed << 5) - seed) + today.charCodeAt(i);
    seed = seed & seed;
  }
  return Math.abs(seed);
};

const generateBlockSequence = (seed, length = 100) => {
  const random = seededRandom(seed);
  const sequence = [];
  for (let i = 0; i < length; i++) {
    sequence.push(blockType[Math.floor(random() * blockType.length)]);
  }
  return sequence;
};

const generateObstacles = (seed, lineCount = 5) => {
  const random = seededRandom(seed + 12345);
  const getLine = (min, max) => {
    const count = parseInt((((max - min) + 1) * random()) + min, 10);
    const line = [];
    for (let i = 0; i < count; i++) {
      line.push(1);
    }
    for (let i = 0, len = 10 - count; i < len; i++) {
      const index = parseInt(((line.length + 1) * random()), 10);
      line.splice(index, 0, 0);
    }
    return List(line);
  };

  let obstacleMatrix = List([]);
  for (let i = 0; i < lineCount; i++) {
    if (i <= 2) {
      obstacleMatrix = obstacleMatrix.push(getLine(5, 8));
    } else if (i <= 4) {
      obstacleMatrix = obstacleMatrix.push(getLine(4, 9));
    } else {
      obstacleMatrix = obstacleMatrix.push(getLine(3, 9));
    }
  }
  for (let i = 0, len = 20 - lineCount; i < len; i++) {
    obstacleMatrix = obstacleMatrix.unshift(List(blankLine));
  }
  return obstacleMatrix;
};

const getDailyChallengeData = () => {
  const today = getTodayString();
  let data = localStorage.getItem(DailyChallengeKey);
  if (!data) {
    return null;
  }
  try {
    data = JSON.parse(data);
    if (data.date !== today) {
      return null;
    }
  } catch (e) {
    return null;
  }
  return data;
};

const saveDailyChallengeData = (data) => {
  const today = getTodayString();
  const toSave = { ...data, date: today };
  localStorage.setItem(DailyChallengeKey, JSON.stringify(toSave));
};

const getRanking = () => {
  const today = getTodayString();
  let data = localStorage.getItem(RankingKey);
  if (!data) {
    return [];
  }
  try {
    data = JSON.parse(data);
    if (data.date !== today) {
      return [];
    }
    return data.ranking || [];
  } catch (e) {
    return [];
  }
};

const saveRanking = (ranking) => {
  const today = getTodayString();
  const toSave = { date: today, ranking };
  localStorage.setItem(RankingKey, JSON.stringify(toSave));
};

const submitScore = (score) => {
  const ranking = getRanking();
  const today = getTodayString();
  const existingEntry = ranking.find(entry => entry.date === today);

  if (existingEntry) {
    if (score > existingEntry.score) {
      existingEntry.score = score;
      ranking.sort((a, b) => b.score - a.score);
      saveRanking(ranking);
    }
  } else {
    ranking.push({ date: today, score });
    ranking.sort((a, b) => b.score - a.score);
    ranking = ranking.slice(0, 10);
    saveRanking(ranking);
  }

  const position = ranking.findIndex(entry => entry.date === today) + 1;
  return { ranking: ranking.slice(0, 10), position };
};

const initChallengeSequence = () => {
  const seed = getDateSeed();
  return {
    seed,
    sequence: generateBlockSequence(seed),
    obstacles: generateObstacles(seed),
  };
};

const dailyChallenge = {
  getTodayString,
  getDateSeed,
  generateBlockSequence,
  generateObstacles,
  getDailyChallengeData,
  saveDailyChallengeData,
  getRanking,
  saveRanking,
  submitScore,
  initChallengeSequence,
  seededRandom,
};

export default dailyChallenge;