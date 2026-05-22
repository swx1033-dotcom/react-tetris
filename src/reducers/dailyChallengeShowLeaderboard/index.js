import * as reducerType from '../../unit/reducerType';

const initState = false;

const parse = (state = initState, action) => {
  switch (action.type) {
    case reducerType.DAILY_CHALLENGE_SHOW_LEADERBOARD:
      return action.data;
    default:
      return state;
  }
};

export default parse;