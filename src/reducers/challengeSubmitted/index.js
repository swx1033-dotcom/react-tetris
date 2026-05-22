import * as reducerType from '../../unit/reducerType';

const initState = false;

const challengeSubmitted = (state = initState, action) => {
  switch (action.type) {
    case reducerType.CHALLENGE_SUBMITTED:
      return action.data;
    default:
      return state;
  }
};

export default challengeSubmitted;