import { createStore, applyMiddleware, compose } from 'redux';
import { List } from 'immutable';
import rootReducer from '../reducers';
import * as reducerType from '../unit/reducerType';

const MAX_HISTORY = 50;
let past = List();
let future = List();

const recordableActions = [
  reducerType.MATRIX,
];

const undoMiddleware = store => next => (action) => {
  if (action.type === reducerType.UNDO) {
    if (past.size === 0) {
      return;
    }
    const current = store.getState();
    future = future.push(current);
    const previous = past.last();
    past = past.pop();
    return next({ ...action, undoState: previous });
  }

  if (recordableActions.indexOf(action.type) !== -1) {
    const state = store.getState();
    if (state.get('cur') !== null) {
      past = past.push(state).slice(-MAX_HISTORY);
      future = List();
    }
  }

  return next(action);
};

let enhancer = applyMiddleware(undoMiddleware);
if (window.devToolsExtension) {
  enhancer = compose(window.devToolsExtension(), enhancer);
}

const store = createStore(rootReducer, enhancer);

export function getUndoCount() {
  return past.size;
}

export default store;
