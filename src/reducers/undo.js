import { List } from 'immutable';
import * as reducerType from '../unit/reducerType';

const MAX_UNDO = 50;

const RECORDABLE_ACTIONS = new Set([
  reducerType.MATRIX,
]);

const UI_STATE_KEYS = new Set(['keyboard', 'focus']);

let undoStack = List([]);
let undoIndex = -1;

export const canUndo = () => undoIndex >= 0;

export const resetUndoStack = () => {
  undoStack = List([]);
  undoIndex = -1;
};

const createUndoReducer = rootReducer => (state, action) => {
  if (action.type === reducerType.UNDO) {
    if (undoIndex >= 0) {
      const savedState = undoStack.get(undoIndex);
      undoIndex -= 1;
      let restoredState = state;
      savedState.forEach((value, key) => {
        if (!UI_STATE_KEYS.has(key)) {
          restoredState = restoredState.set(key, value);
        }
      });
      return restoredState.set('lock', false);
    }
    return state;
  }

  const nextState = rootReducer(state, action);

  if (state && RECORDABLE_ACTIONS.has(action.type) && nextState !== state) {
    if (undoIndex < undoStack.size - 1) {
      undoStack = undoStack.slice(0, undoIndex + 1);
    }
    undoStack = undoStack.push(state);
    if (undoStack.size > MAX_UNDO) {
      undoStack = undoStack.shift();
    }
    undoIndex = undoStack.size - 1;
  }

  return nextState;
};

export default createUndoReducer;
