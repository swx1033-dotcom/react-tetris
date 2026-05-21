import { combineReducers } from 'redux-immutable';
import { List } from 'immutable';
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

const combinedReducer = combineReducers({
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
});

const rootReducer = (state, action) => {
  if (action.type === 'UNDO') {
    const past = state.get('past');
    if (past && past.size > 0) {
      const previous = past.last();
      const newPast = past.pop();
      const future = state.get('future') || List();
      const currentToRecord = state.delete('past').delete('future').delete('lastRecordTime');
      
      return previous.set('past', newPast).set('future', future.push(currentToRecord));
    }
    return state;
  }

  const nextState = combinedReducer(state, action);
  
  if (state && state !== nextState) {
    const recordableActions = ['MOVE_BLOCK', 'MATRIX', 'CLEAR_LINES', 'POINTS'];
    if (recordableActions.includes(action.type)) {
      const past = state.get('past') || List();
      
      const now = Date.now();
      const lastRecordTime = state.get('lastRecordTime') || 0;
      
      let newPast = past;
      if (now - lastRecordTime > 50) { // Group actions within 50ms
        const stateToRecord = state.delete('past').delete('future').delete('lastRecordTime');
        newPast = past.push(stateToRecord);
        if (newPast.size > 50) {
          newPast = newPast.shift();
        }
      }
      
      return nextState.set('past', newPast).set('future', List()).set('lastRecordTime', now);
    }
    
    return nextState.set('past', state.get('past')).set('future', state.get('future')).set('lastRecordTime', state.get('lastRecordTime'));
  }
  
  if (state) {
    return nextState.set('past', state.get('past')).set('future', state.get('future')).set('lastRecordTime', state.get('lastRecordTime'));
  }
  return nextState;
};

export default rootReducer;
