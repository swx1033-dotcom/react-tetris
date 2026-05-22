import * as reducerType from '../../unit/reducerType';

const initState = [];

const challengeRanking = (state = initState, action) => {
  switch (action.type) {
    case reducerType.CHALLENGE_RANKING:
      return action.data;
    default:
      return state;
  }
};

export default challengeRanking;