import { List } from 'immutable';
import { blankLine, blockType } from './const';

const playerStorageKey = 'REACT_TETRIS_PLAYER_ID';
const challengeCache = {};
const maxChallengeBoardSize = 10;
const sequenceLength = 5000;

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createSeed = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 1;
};

const createRandom = (seed) => {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const sortLeaderboard = (leaderboard = []) => leaderboard
  .slice()
  .sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.updatedAt - b.updatedAt;
  })
  .slice(0, maxChallengeBoardSize);

const getPlayerId = () => {
  let playerId = localStorage.getItem(playerStorageKey);
  if (playerId) {
    return playerId;
  }
  playerId = `player_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  localStorage.setItem(playerStorageKey, playerId);
  return playerId;
};

const createObstacleLine = (random, index) => {
  const filledCount = 3 + Math.floor(random() * Math.min(5 + index, 7));
  const line = blankLine.slice();
  const positions = [...Array(10)].map((n, i) => i);

  for (let i = 0; i < filledCount; i++) {
    const pick = Math.floor(random() * positions.length);
    line[positions.splice(pick, 1)[0]] = 1;
  }

  if (line.every(n => n === 1)) {
    line[Math.floor(random() * line.length)] = 0;
  }

  return line;
};

const getDailyChallengeConfig = (dateKey = getDateKey()) => {
  if (challengeCache[dateKey]) {
    return challengeCache[dateKey];
  }

  const seed = createSeed(`daily-${dateKey}`);
  const random = createRandom(seed);
  const obstacleLines = 4 + Math.floor(random() * 4);
  const matrix = [];

  for (let i = 0; i < 20 - obstacleLines; i++) {
    matrix.push(blankLine.slice());
  }

  for (let i = 0; i < obstacleLines; i++) {
    matrix.push(createObstacleLine(random, i));
  }

  const sequence = [];
  for (let i = 0; i < sequenceLength; i++) {
    sequence.push(blockType[Math.floor(random() * blockType.length)]);
  }

  const config = {
    dateKey,
    seed,
    obstacleLines,
    matrix,
    sequence,
  };

  challengeCache[dateKey] = config;
  return config;
};

const getDailyChallengeMatrix = (dateKey = getDateKey()) => {
  const config = getDailyChallengeConfig(dateKey);
  return List(config.matrix.map(line => List(line)));
};

const getChallengeNextType = (dateKey = getDateKey(), index = 0) => {
  const config = getDailyChallengeConfig(dateKey);
  return config.sequence[index % config.sequence.length];
};

const createChallengeState = (savedChallenge = {}) => {
  const dateKey = getDateKey();
  const config = getDailyChallengeConfig(dateKey);
  const isTodayChallenge = savedChallenge && savedChallenge.dateKey === dateKey;
  const leaderboardSource = isTodayChallenge && Array.isArray(savedChallenge.leaderboard) ?
    savedChallenge.leaderboard : [];
  const leaderboard = sortLeaderboard(leaderboardSource.map(item => ({
    id: item.id,
    score: parseInt(item.score, 10) || 0,
    updatedAt: parseInt(item.updatedAt, 10) || 0,
  })));
  const playerId = getPlayerId();
  const playerRank = leaderboard.findIndex(item => item.id === playerId) + 1;
  const playerEntry = playerRank > 0 ? leaderboard[playerRank - 1] : null;
  const sequenceIndex = isTodayChallenge && !isNaN(parseInt(savedChallenge.sequenceIndex, 10)) ?
    parseInt(savedChallenge.sequenceIndex, 10) : 0;
  const lastPlayedScore = isTodayChallenge && !isNaN(parseInt(savedChallenge.lastPlayedScore, 10)) ?
    parseInt(savedChallenge.lastPlayedScore, 10) : 0;

  return {
    dateKey,
    seed: config.seed,
    obstacleLines: config.obstacleLines,
    sequenceIndex,
    leaderboard,
    playerBest: playerEntry ? playerEntry.score : 0,
    playerRank,
    topScore: leaderboard[0] ? leaderboard[0].score : 0,
    lastPlayedScore,
  };
};

const submitChallengeScore = (challengeState = {}, score = 0) => {
  const playerId = getPlayerId();
  const leaderboard = Array.isArray(challengeState.leaderboard) ?
    challengeState.leaderboard.slice() : [];
  const nextScore = parseInt(score, 10) || 0;
  const now = Date.now();
  const currentIndex = leaderboard.findIndex(item => item.id === playerId);
  const currentScore = currentIndex === -1 ? 0 : leaderboard[currentIndex].score;

  if (currentIndex !== -1) {
    leaderboard.splice(currentIndex, 1);
  }

  leaderboard.push({
    id: playerId,
    score: nextScore > currentScore ? nextScore : currentScore,
    updatedAt: now,
  });

  const sortedLeaderboard = sortLeaderboard(leaderboard);
  const playerRank = sortedLeaderboard.findIndex(item => item.id === playerId) + 1;
  const playerEntry = playerRank > 0 ? sortedLeaderboard[playerRank - 1] : null;

  return {
    leaderboard: sortedLeaderboard,
    playerBest: playerEntry ? playerEntry.score : 0,
    playerRank,
    topScore: sortedLeaderboard[0] ? sortedLeaderboard[0].score : 0,
    lastPlayedScore: nextScore,
  };
};

export {
  getDateKey,
  getDailyChallengeConfig,
  getDailyChallengeMatrix,
  getChallengeNextType,
  createChallengeState,
  submitChallengeScore,
};
