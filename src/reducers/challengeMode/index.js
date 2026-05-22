import * as reducerType from '../../unit/reducerType';
import { lastRecord } from '../../unit/const';

const initState = lastRecord && lastRecord.challengeMode !== undefined ? lastRecord.challengeMode : false;

const challengeMode = (state = initState, action) => {
  switch (action.type) {
    case reducerType.CHALLENGE_MODE:
      return action.data;
    default:
      return state;
  }
};

export default challengeMode;
