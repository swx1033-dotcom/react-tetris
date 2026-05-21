import Immutable, { Map } from 'immutable';
import reducer from './index';
import * as reducerType from '../unit/reducerType';

export const trackedKeys = [
  'pause',
  'music',
  'matrix',
  'next',
  'cur',
  'startLines',
  'max',
  'points',
  'speedStart',
  'speedRun',
  'lock',
  'clearLines',
  'reset',
  'drop',
];

export const getTrackedState = state => trackedKeys.reduce(
  (snapshot, key) => snapshot.set(key, state.get(key)),
  Map()
);

export const canTrackState = state => state && !state.get('lock') && !state.get('reset') && !state.get('drop');

export const isTrackedStateEqual = (prevState, nextState) => Immutable.is(prevState, nextState);

const getBaseState = state => state || reducer(undefined, { type: '@@INIT' });

const gameReducer = (state, action) => {
  if (action.type === reducerType.RESTORE_GAME_STATE) {
    const baseState = getBaseState(state);
    return baseState
      .merge(action.data)
      .set('keyboard', baseState.get('keyboard'))
      .set('focus', baseState.get('focus'));
  }
  return reducer(state, action);
};

export default gameReducer;
