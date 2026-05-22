import * as reducerType from '../../unit/reducerType';
import { lastRecord, blockType } from '../../unit/const';

const initState = lastRecord && blockType.indexOf(lastRecord.hold) !== -1 ?
  lastRecord.hold : null;

const hold = (state = initState, action) => {
  switch (action.type) {
    case reducerType.HOLD_BLOCK:
      return action.data;
    case reducerType.RESET:
      return null;
    default:
      return state;
  }
};

export default hold;
