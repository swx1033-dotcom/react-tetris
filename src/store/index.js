import { createStore } from 'redux';
import { List } from 'immutable';
import reducer, { canTrackState, getTrackedState, isTrackedStateEqual } from '../reducers/game';
import * as reducerType from '../unit/reducerType';

const HISTORY_LIMIT = 50;

const store = createStore(reducer, window.devToolsExtension && window.devToolsExtension());

let past = List();
let future = List();
let present = getTrackedState(store.getState());
let commitTimer = null;

const commitHistory = () => {
  commitTimer = null;
  const current = getTrackedState(store.getState());
  if (!canTrackState(current) || isTrackedStateEqual(current, present)) {
    return false;
  }
  past = past.push(present);
  if (past.size > HISTORY_LIMIT) {
    past = past.shift();
  }
  present = current;
  future = List();
  return true;
};

const flushHistory = () => {
  if (commitTimer === null) {
    return false;
  }
  clearTimeout(commitTimer);
  return commitHistory();
};

const scheduleHistory = () => {
  if (commitTimer !== null) {
    return;
  }
  commitTimer = setTimeout(commitHistory, 0);
};

const originalDispatch = store.dispatch;

store.dispatch = (action) => {
  if (action.type === reducerType.UNDO) {
    flushHistory();
    const current = getTrackedState(store.getState());
    if (!isTrackedStateEqual(current, present)) {
      originalDispatch({
        type: reducerType.RESTORE_GAME_STATE,
        data: present,
      });
      return action;
    }
    if (!past.size) {
      return action;
    }
    future = future.push(present);
    present = past.last();
    past = past.pop();
    originalDispatch({
      type: reducerType.RESTORE_GAME_STATE,
      data: present,
    });
    return action;
  }
  const prevState = getTrackedState(store.getState());
  const result = originalDispatch(action);
  const nextState = getTrackedState(store.getState());
  if (!isTrackedStateEqual(prevState, nextState)) {
    scheduleHistory();
  }
  return result;
};

store.undo = () => {
  const prevState = store.getState();
  store.dispatch({ type: reducerType.UNDO });
  return prevState !== store.getState();
};

store.canUndo = () => {
  flushHistory();
  return past.size > 0 || !isTrackedStateEqual(getTrackedState(store.getState()), present);
};

export default store;
