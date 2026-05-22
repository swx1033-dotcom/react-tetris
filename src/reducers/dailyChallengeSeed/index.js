import * as reducerType from '../../unit/reducerType';
import { getDateSeed } from '../../unit';

const initState = getDateSeed();

const parse = (state = initState, action) => {
  switch (action.type) {
    case reducerType.DAILY_CHALLENGE_SEED:
      return action.data;
    default:
      return state;
  }
};

export default parse;