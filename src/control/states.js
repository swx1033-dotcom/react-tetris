import { List } from 'immutable';
import store from '../store';
import { want, isClear, isOver } from '../unit/';
import actions from '../actions';
import { speeds, blankLine, blankMatrix, clearPoints, eachLines } from '../unit/const';
import { music } from '../unit/music';
import {
  createChallengeState,
  getChallengeNextType,
  getDailyChallengeMatrix,
  submitChallengeScore,
} from '../unit/game';

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

const getBaseSpeed = (state = store.getState()) => (state.get('gameMode') === 'daily' ? 1 : state.get('speedStart'));

const syncChallenge = () => {
  const challengeState = store.getState().get('challenge');
  const challenge = createChallengeState(challengeState && challengeState.toJS ? challengeState.toJS() : {});
  store.dispatch(actions.challenge(challenge));
  return challenge;
};

const setDailyNext = (sequenceIndex) => {
  const challenge = syncChallenge();
  store.dispatch(actions.challenge({ sequenceIndex }));
  store.dispatch(actions.nextBlock(getChallengeNextType(challenge.dateKey, sequenceIndex)));
  return challenge;
};

const states = {
  fallInterval: null,

  start: () => {
    if (music.start) {
      music.start();
    }
    const state = store.getState();
    const isDaily = state.get('gameMode') === 'daily';
    const baseSpeed = getBaseSpeed(state);

    states.dispatchPoints(0);
    store.dispatch(actions.clearLines(0));
    store.dispatch(actions.speedRun(baseSpeed));

    if (isDaily) {
      const challenge = syncChallenge();
      store.dispatch(actions.matrix(getDailyChallengeMatrix(challenge.dateKey)));
      store.dispatch(actions.moveBlock({ type: getChallengeNextType(challenge.dateKey, 0) }));
      store.dispatch(actions.challenge({ sequenceIndex: 1 }));
      store.dispatch(actions.nextBlock(getChallengeNextType(challenge.dateKey, 1)));
      states.auto();
      return;
    }

    const startLines = state.get('startLines');
    const startMatrix = getStartMatrix(startLines);
    store.dispatch(actions.matrix(startMatrix));
    store.dispatch(actions.moveBlock({ type: state.get('next') }));
    store.dispatch(actions.nextBlock());
    states.auto();
  },

  startMode: (mode) => {
    clearTimeout(states.fallInterval);
    store.dispatch(actions.gameMode(mode));
    if (mode === 'daily') {
      syncChallenge();
    }
    states.overEnd();
    states.start();
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
      states.overStart({ challengeOver: true });
      return;
    }
    setTimeout(() => {
      store.dispatch(actions.lock(false));
      const state = store.getState();
      store.dispatch(actions.moveBlock({ type: state.get('next') }));
      if (state.get('gameMode') === 'daily') {
        const challenge = syncChallenge();
        const nextIndex = challenge.sequenceIndex + 1;
        store.dispatch(actions.challenge({ sequenceIndex: nextIndex }));
        store.dispatch(actions.nextBlock(getChallengeNextType(challenge.dateKey, nextIndex)));
      } else {
        store.dispatch(actions.nextBlock());
      }
      states.auto();
    }, 100);
  },

  focus: (isFocusNow) => {
    store.dispatch(actions.focus(isFocusNow));
    if (!isFocusNow) {
      clearTimeout(states.fallInterval);
      return;
    }
    if (store.getState().get('gameMode') === 'daily') {
      syncChallenge();
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
    if (state.get('gameMode') === 'daily') {
      const challenge = syncChallenge();
      const nextIndex = challenge.sequenceIndex + 1;
      store.dispatch(actions.challenge({ sequenceIndex: nextIndex }));
      store.dispatch(actions.nextBlock(getChallengeNextType(challenge.dateKey, nextIndex)));
    } else {
      store.dispatch(actions.nextBlock());
    }
    states.auto();
    store.dispatch(actions.lock(false));
    const clearLinesCount = state.get('clearLines') + lines.length;
    store.dispatch(actions.clearLines(clearLinesCount));

    const addPoints = store.getState().get('points') +
      clearPoints[lines.length - 1];
    states.dispatchPoints(addPoints);

    const speedAdd = Math.floor(clearLinesCount / eachLines);
    let speedNow = getBaseSpeed(state) + speedAdd;
    speedNow = speedNow > 6 ? 6 : speedNow;
    store.dispatch(actions.speedRun(speedNow));
  },

  overStart: (option = {}) => {
    clearTimeout(states.fallInterval);
    const state = store.getState();
    if (option.challengeOver && state.get('gameMode') === 'daily') {
      const result = submitChallengeScore(state.get('challenge').toJS(), state.get('points'));
      store.dispatch(actions.challenge(result));
    }
    store.dispatch(actions.lock(true));
    store.dispatch(actions.reset(true));
    store.dispatch(actions.pause(false));
  },

  overEnd: () => {
    store.dispatch(actions.matrix(blankMatrix));
    store.dispatch(actions.moveBlock({ reset: true }));
    store.dispatch(actions.reset(false));
    store.dispatch(actions.lock(false));
    store.dispatch(actions.clearLines(0));
    if (store.getState().get('gameMode') === 'daily') {
      setDailyNext(0);
      return;
    }
    store.dispatch(actions.nextBlock());
  },

  dispatchPoints: (point) => {
    store.dispatch(actions.points(point));
    const state = store.getState();
    if (state.get('gameMode') === 'daily') {
      return;
    }
    if (point > 0 && point > state.get('max')) {
      store.dispatch(actions.max(point));
    }
  },
};

export default states;
