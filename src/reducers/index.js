import { combineReducers } from 'redux-immutable';
import * as reducerType from '../unit/reducerType';
import pause from './pause';
import music from './music';
import matrix from './matrix';
import next from './next';
import cur from './cur';
import startLines from './startLines';
import max from './max';
import points from './points';
import speedStart from './speedStart';
import speedRun from './speedRun';
import lock from './lock';
import clearLines from './clearLines';
import reset from './reset';
import drop from './drop';
import keyboard from './keyboard';
import focus from './focus';
import undo from './undo';


const appReducer = combineReducers({
  pause,
  music,
  matrix,
  next,
  cur,
  startLines,
  max,
  points,
  speedStart,
  speedRun,
  lock,
  clearLines,
  reset,
  drop,
  keyboard,
  focus,
  undo,
});

const rootReducer = (state, action) => {
  if (action.type === reducerType.UNDO && action.undoState) {
    return action.undoState
      .set('undo', (state ? state.get('undo') : 0) + 1)
      .set('lock', false);
  }
  return appReducer(state, action);
};

export default rootReducer;
