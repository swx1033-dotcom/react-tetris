import { fromJS } from 'immutable';
import * as reducerType from '../../unit/reducerType';
import { lastRecord } from '../../unit/const';
import { createChallengeState } from '../../unit/game';

const initState = fromJS(createChallengeState(lastRecord && lastRecord.challenge));

const challenge = (state = initState, action) => {
  switch (action.type) {
    case reducerType.CHALLENGE:
      return state.merge(fromJS(action.data));
    default:
      return state;
  }
};

export default challenge;
