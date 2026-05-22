import * as reducerType from '../../unit/reducerType';
import { maxPoint } from '../../unit/const';

const initState = 0;

const parse = (state = initState, action) => {
  switch (action.type) {
    case reducerType.CHALLENGE_MAX:
      return action.data > maxPoint ? maxPoint : action.data;
    default:
      return state;
  }
};

export default parse;