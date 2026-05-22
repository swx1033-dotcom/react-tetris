import { List } from 'immutable';
import store from '../store';
import { want, isClear, isOver, SeededRandom, getDateSeed, getNextTypeWithSeed } from '../unit';
import actions from '../actions';
import { speeds, blankLine, blankMatrix, clearPoints, eachLines, saveDailyChallengeData } from '../unit/const';
import { music } from '../unit/music';

const getStartMatrix = (startLines) => {
  const getLine = (min, max) => {
    const count = parseInt((((max - min) + 1) * Math.random()) + min, 10);
    const line = [];
    for (let i = 0; i < count; i++) {
      line.push(1);
    }
    for (let i = 0, len = 10 - count; i < len; i++) {
      const index = parseInt(((line.length + 1) * Math.random()), 10);
      line.splice(index, 0, 0);
    }

    return List(line);
  };
  let startMatrix = List([]);

  for (let i = 0; i < startLines; i++) {
    if (i <= 2) {
      startMatrix = startMatrix.push(getLine(5, 8));
    } else if (i <= 6) {
      startMatrix = startMatrix.push(getLine(4, 9));
    } else {
      startMatrix = startMatrix.push(getLine(3, 9));
    }
  }
  for (let i = 0, len = 20 - startLines; i < len; i++) {
    startMatrix = startMatrix.unshift(List(blankLine));
  }
  return startMatrix;
};

const getDailyChallengeStartMatrix = (rng, numObstacles = 3) => {
  let startMatrix = blankMatrix;
  
  for (let i = 0; i < numObstacles; i++) {
    const row = rng.nextInt(10, 19);
    const col = rng.nextInt(0, 9);
    
    let currentRow = startMatrix.get(row);
    if (!currentRow.get(col)) {
      currentRow = currentRow.set(col, 1);
      startMatrix = startMatrix.set(row, currentRow);
    }
  }
  
  return startMatrix;
};

const submitDailyChallengeScore = (score) => {
  const state = store.getState();
  const hasSubmitted = state.get('dailyChallengeHasSubmitted');
  const currentHighScore = state.get('dailyChallengeHighScore');
  let leaderboard = state.get('dailyChallengeLeaderboard');
  
  if (!hasSubmitted || score > currentHighScore) {
    const newEntry = {
      score,
      timestamp: Date.now()
    };
    
    leaderboard = [...leaderboard, newEntry];
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    
    store.dispatch(actions.dailyChallengeLeaderboard(leaderboard));
    store.dispatch(actions.dailyChallengeHasSubmitted(true));
    
    if (score > currentHighScore) {
      store.dispatch(actions.dailyChallengeHighScore(score));
    }
    
    saveDailyChallengeData({
      leaderboard,
      hasSubmitted: true,
      highScore: Math.max(score, currentHighScore)
    });
  }
};

const states = {
  fallInterval: null,

  start: () => {
    if (music.start) {
      music.start();
    }
    const state = store.getState();
    states.dispatchPoints(0);
    store.dispatch(actions.speedRun(state.get('speedStart')));
    const startLines = state.get('startLines');
    const startMatrix = getStartMatrix(startLines);
    store.dispatch(actions.matrix(startMatrix));
    store.dispatch(actions.moveBlock({ type: state.get('next') }));
    store.dispatch(actions.nextBlock());
    states.auto();
  },

  startDailyChallenge: () => {
    if (music.start) {
      music.start();
    }
    
    const seed = getDateSeed();
    const rng = new SeededRandom(seed);
    
    store.dispatch(actions.dailyChallengeMode(true));
    store.dispatch(actions.dailyChallengeSeed(seed));
    store.dispatch(actions.dailyChallengeRng(rng));
    store.dispatch(actions.dailyChallengeShowLeaderboard(false));
    
    states.dispatchPoints(0);
    store.dispatch(actions.speedRun(1));
    
    const startMatrix = getDailyChallengeStartMatrix(rng);
    store.dispatch(actions.matrix(startMatrix));
    
    const firstType = getNextTypeWithSeed(rng);
    const secondType = getNextTypeWithSeed(rng);
    
    store.dispatch(actions.moveBlock({ type: firstType }));
    store.dispatch(actions.nextBlock(secondType));
    states.auto();
  },

  nextBlockDaily: () => {
    const state = store.getState();
    const rng = state.get('dailyChallengeRng');
    const nextType = getNextTypeWithSeed(rng);
    store.dispatch(actions.nextBlock(nextType));
  },

  auto: (timeout) => {
    const out = (timeout < 0 ? 0 : timeout);
    let state = store.getState();
    let cur = state.get('cur');
    const fall = () => {
      state = store.getState();
      cur = state.get('cur');
      const next = cur.fall();
      if (want(next, state.get('matrix'))) {
        store.dispatch(actions.moveBlock(next));
        states.fallInterval = setTimeout(fall, speeds[state.get('speedRun') - 1]);
      } else {
        let matrix = state.get('matrix');
        const shape = cur && cur.shape;
        const xy = cur && cur.xy;
        shape.forEach((m, k1) => (
          m.forEach((n, k2) => {
            if (n && xy.get(0) + k1 >= 0) {
              let line = matrix.get(xy.get(0) + k1);
              line = line.set(xy.get(1) + k2, 1);
              matrix = matrix.set(xy.get(0) + k1, line);
            }
          })
        ));
        states.nextAround(matrix);
      }
    };
    clearTimeout(states.fallInterval);
    states.fallInterval = setTimeout(fall,
      out === undefined ? speeds[state.get('speedRun') - 1] : out);
  },

  nextAround: (matrix, stopDownTrigger) => {
    clearTimeout(states.fallInterval);
    store.dispatch(actions.lock(true));
    store.dispatch(actions.matrix(matrix));
    if (typeof stopDownTrigger === 'function') {
      stopDownTrigger();
    }

    const addPoints = (store.getState().get('points') + 10) +
      ((store.getState().get('speedRun') - 1) * 2);

    states.dispatchPoints(addPoints);

    if (isClear(matrix)) {
      if (music.clear) {
        music.clear();
      }
      return;
    }
    if (isOver(matrix)) {
      if (music.gameover) {
        music.gameover();
      }
      states.overStart();
      return;
    }
    setTimeout(() => {
      store.dispatch(actions.lock(false));
      store.dispatch(actions.moveBlock({ type: store.getState().get('next') }));
      
      const state = store.getState();
      if (state.get('dailyChallengeMode')) {
        states.nextBlockDaily();
      } else {
        store.dispatch(actions.nextBlock());
      }
      
      states.auto();
    }, 100);
  },

  focus: (isFocus) => {
    store.dispatch(actions.focus(isFocus));
    if (!isFocus) {
      clearTimeout(states.fallInterval);
      return;
    }
    const state = store.getState();
    if (state.get('cur') && !state.get('reset') && !state.get('pause')) {
      states.auto();
    }
  },

  pause: (isPause) => {
    store.dispatch(actions.pause(isPause));
    if (isPause) {
      clearTimeout(states.fallInterval);
      return;
    }
    states.auto();
  },

  clearLines: (matrix, lines) => {
    const state = store.getState();
    let newMatrix = matrix;
    lines.forEach(n => {
      newMatrix = newMatrix.splice(n, 1);
      newMatrix = newMatrix.unshift(List(blankLine));
    });
    store.dispatch(actions.matrix(newMatrix));
    store.dispatch(actions.moveBlock({ type: state.get('next') }));
    
    if (state.get('dailyChallengeMode')) {
      states.nextBlockDaily();
    } else {
      store.dispatch(actions.nextBlock());
    }
    
    states.auto();
    store.dispatch(actions.lock(false));
    const clearLines = state.get('clearLines') + lines.length;
    store.dispatch(actions.clearLines(clearLines));

    const addPoints = store.getState().get('points') +
      clearPoints[lines.length - 1];
    states.dispatchPoints(addPoints);

    const speedAdd = Math.floor(clearLines / eachLines);
    let speedNow = state.get('speedStart') + speedAdd;
    speedNow = speedNow > 6 ? 6 : speedNow;
    store.dispatch(actions.speedRun(speedNow));
  },

  overStart: () => {
    clearTimeout(states.fallInterval);
    store.dispatch(actions.lock(true));
    store.dispatch(actions.reset(true));
    store.dispatch(actions.pause(false));
    
    const state = store.getState();
    if (state.get('dailyChallengeMode')) {
      submitDailyChallengeScore(state.get('points'));
      store.dispatch(actions.dailyChallengeShowLeaderboard(true));
    }
  },

  overEnd: () => {
    const state = store.getState();
    if (state.get('dailyChallengeMode')) {
      store.dispatch(actions.dailyChallengeMode(false));
    }
    
    store.dispatch(actions.matrix(blankMatrix));
    store.dispatch(actions.moveBlock({ reset: true }));
    store.dispatch(actions.reset(false));
    store.dispatch(actions.lock(false));
    store.dispatch(actions.clearLines(0));
  },

  dispatchPoints: (point) => {
    store.dispatch(actions.points(point));
    
    const state = store.getState();
    if (!state.get('dailyChallengeMode') && point > 0 && point > state.get('max')) {
      store.dispatch(actions.max(point));
    }
  },
  
  showLeaderboard: (show) => {
    store.dispatch(actions.dailyChallengeShowLeaderboard(show));
  },
};

export default states;