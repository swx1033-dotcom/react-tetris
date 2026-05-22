import { List } from 'immutable';
import store from '../store';
import { want, isClear, isOver } from '../unit/';
import actions from '../actions';
import { speeds, blankLine, blankMatrix, clearPoints, eachLines } from '../unit/const';
import { music } from '../unit/music';
import { submitDailyScore, getDailyRankings } from '../unit/dailyChallenge';


const getStartMatrix = (startLines) => { // 生成startLines
  const getLine = (min, max) => { // 返回标亮个数在min~max之间一行方块, (包含边界)
    const count = parseInt((((max - min) + 1) * Math.random()) + min, 10);
    const line = [];
    for (let i = 0; i < count; i++) { // 插入高亮
      line.push(1);
    }
    for (let i = 0, len = 10 - count; i < len; i++) { // 在随机位置插入灰色
      const index = parseInt(((line.length + 1) * Math.random()), 10);
      line.splice(index, 0, 0);
    }

    return List(line);
  };
  let startMatrix = List([]);

  for (let i = 0; i < startLines; i++) {
    if (i <= 2) { // 0-3
      startMatrix = startMatrix.push(getLine(5, 8));
    } else if (i <= 6) { // 4-6
      startMatrix = startMatrix.push(getLine(4, 9));
    } else { // 7-9
      startMatrix = startMatrix.push(getLine(3, 9));
    }
  }
  for (let i = 0, len = 20 - startLines; i < len; i++) { // 插入上部分的灰色
    startMatrix = startMatrix.unshift(List(blankLine));
  }
  return startMatrix;
};

const getDailyNextType = () => {
  const state = store.getState();
  const daily = state.get('daily');
  const blockIndex = daily.blockIndex;
  const blockSequence = daily.blockSequence;
  store.dispatch(actions.dailyBlockIndex(blockIndex + 1));
  return blockSequence[blockIndex] || blockSequence[0];
};

const states = {
  fallInterval: null,

  start: () => {
    if (music.start) {
      music.start();
    }
    const state = store.getState();
    const isDaily = state.get('daily').mode;
    states.dispatchPoints(0);
    store.dispatch(actions.speedRun(state.get('speedStart')));

    let startMatrix;
    if (isDaily) {
      const blockSequence = state.get('daily').blockSequence;
      const obstacles = state.get('daily').obstacles;
      store.dispatch(actions.dailyBlockIndex(2));
      startMatrix = obstacles;
      store.dispatch(actions.nextBlock(blockSequence[0]));
      store.dispatch(actions.moveBlock({ type: blockSequence[0] }));
      store.dispatch(actions.nextBlock(blockSequence[1]));
    } else {
      const startLines = state.get('startLines');
      startMatrix = getStartMatrix(startLines);
      store.dispatch(actions.moveBlock({ type: state.get('next') }));
      store.dispatch(actions.nextBlock());
    }
    store.dispatch(actions.matrix(startMatrix));
    states.auto();
  },

  // 自动下落
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
            if (n && xy.get(0) + k1 >= 0) { // 竖坐标可以为负
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

  // 一个方块结束, 触发下一个
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
    const isDaily = store.getState().get('daily').mode;
    setTimeout(() => {
      store.dispatch(actions.lock(false));
      store.dispatch(actions.moveBlock({ type: store.getState().get('next') }));
      if (isDaily) {
        store.dispatch(actions.nextBlock(getDailyNextType()));
      } else {
        store.dispatch(actions.nextBlock());
      }
      states.auto();
    }, 100);
  },

  // 页面焦点变换
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

  // 暂停
  pause: (isPause) => {
    store.dispatch(actions.pause(isPause));
    if (isPause) {
      clearTimeout(states.fallInterval);
      return;
    }
    states.auto();
  },

  // 消除行
  clearLines: (matrix, lines) => {
    const state = store.getState();
    const isDaily = state.get('daily').mode;
    let newMatrix = matrix;
    lines.forEach(n => {
      newMatrix = newMatrix.splice(n, 1);
      newMatrix = newMatrix.unshift(List(blankLine));
    });
    store.dispatch(actions.matrix(newMatrix));
    store.dispatch(actions.moveBlock({ type: state.get('next') }));
    if (isDaily) {
      store.dispatch(actions.nextBlock(getDailyNextType()));
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

  // 游戏结束, 触发动画
  overStart: () => {
    clearTimeout(states.fallInterval);
    store.dispatch(actions.lock(true));
    store.dispatch(actions.reset(true));
    store.dispatch(actions.pause(false));
  },

  // 游戏结束动画完成
  overEnd: () => {
    const state = store.getState();
    const isDaily = state.get('daily').mode;
    store.dispatch(actions.matrix(blankMatrix));
    store.dispatch(actions.moveBlock({ reset: true }));
    store.dispatch(actions.reset(false));
    store.dispatch(actions.lock(false));
    store.dispatch(actions.clearLines(0));

    if (isDaily) {
      const points = state.get('points');
      const scoreSubmitted = state.get('daily').scoreSubmitted;
      if (!scoreSubmitted && points > 0) {
        submitDailyScore(points);
        store.dispatch(actions.dailyScoreSubmitted(true));
        const rankings = getDailyRankings();
        store.dispatch(actions.dailyRankings(rankings));
      }
      store.dispatch(actions.dailyShowRanking(true));
    }
  },

  dispatchPoints: (point) => {
    store.dispatch(actions.points(point));
    const isDaily = store.getState().get('daily').mode;
    if (!isDaily && point > 0 && point > store.getState().get('max')) {
      store.dispatch(actions.max(point));
    }
  },
};

export default states;
