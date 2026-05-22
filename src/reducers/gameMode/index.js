import * as reducerType from '../../unit/reducerType';
import { lastRecord } from '../../unit/const';

const initState = lastRecord && lastRecord.gameMode === 'daily' ? 'daily' : 'normal';

const gameMode = (state = initState, action) => {
  switch (action.type) {
    case reducerType.GAME_MODE:
      return action.data === 'daily' ? 'daily' : 'normal';
    default:
      return state;
  }
};

export default gameMode;
