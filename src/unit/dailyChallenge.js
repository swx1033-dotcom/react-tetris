import { List } from 'immutable';
import { blockType, blankLine } from './const';

const DAILY_RANKINGS_KEY = 'REACT_TETRIS_DAILY_RANKINGS';
const DAILY_SCORE_KEY = 'REACT_TETRIS_DAILY_SCORE';
const DAILY_SEQUENCE_LENGTH = 200;

function mulberry32(a) {
  return function () {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function getDailyDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return `${y}-${m}-${d}`;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDailySeed() {
  return getDailyDateString();
}

export function getDailyBlockSequence() {
  const dateStr = getDailySeed();
  const seed = hashString(dateStr);
  const rng = mulberry32(seed);
  const typesLen = blockType.length;
  const sequence = [];
  for (let i = 0; i < DAILY_SEQUENCE_LENGTH; i++) {
    const idx = Math.floor(rng() * typesLen);
    sequence.push(blockType[idx]);
  }
  return sequence;
}

export function getDailyObstacles() {
  const dateStr = getDailySeed() + '_obs';
  const seed = hashString(dateStr);
  const rng = mulberry32(seed);

  const matrix = [];
  for (let i = 0; i < 20; i++) {
    matrix.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }

  const obstacleCount = 10 + Math.floor(rng() * 11);
  for (let i = 0; i < obstacleCount; i++) {
    const row = 14 + Math.floor(rng() * 6);
    const col = Math.floor(rng() * 10);
    matrix[row][col] = 1;
  }

  return List(matrix.map(row => List(row)));
}

export function getDailyRankings() {
  const today = getDailySeed();
  try {
    const raw = localStorage.getItem(DAILY_RANKINGS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === today) {
        return data.rankings || [];
      }
    }
  } catch (e) {
    // ignore
  }
  return [];
}

export function saveDailyRankings(rankings) {
  const today = getDailySeed();
  try {
    const data = JSON.stringify({ date: today, rankings });
    localStorage.setItem(DAILY_RANKINGS_KEY, data);
  } catch (e) {
    // ignore
  }
}

export function submitDailyScore(score, playerName) {
  const today = getDailySeed();
  let rankings = getDailyRankings();

  if (hasScoreSubmittedToday()) {
    return false;
  }

  const entry = {
    name: playerName || ('Player' + Math.floor(Math.random() * 1000)),
    score,
    time: Date.now(),
  };

  rankings.push(entry);
  rankings.sort((a, b) => b.score - a.score);
  rankings = rankings.slice(0, 10);

  saveDailyRankings(rankings);
  markScoreSubmitted(score);
  return true;
}

export function hasScoreSubmittedToday() {
  const today = getDailySeed();
  try {
    const raw = localStorage.getItem(DAILY_SCORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return data.date === today;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

export function getSubmittedScore() {
  const today = getDailySeed();
  try {
    const raw = localStorage.getItem(DAILY_SCORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === today) {
        return data.score;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function markScoreSubmitted(score) {
  const today = getDailySeed();
  try {
    const data = JSON.stringify({ date: today, score });
    localStorage.setItem(DAILY_SCORE_KEY, data);
  } catch (e) {
    // ignore
  }
}

export function getPlayerRank(score) {
  const rankings = getDailyRankings();
  for (let i = 0; i < rankings.length; i++) {
    if (rankings[i].score <= score) {
      return i + 1;
    }
  }
  return rankings.length + 1;
}

export function getDailyHighestScore() {
  const rankings = getDailyRankings();
  if (rankings.length > 0) {
    return rankings[0].score;
  }
  return 0;
}

export function isNewDay(lastDate) {
  return lastDate !== getDailySeed();
}