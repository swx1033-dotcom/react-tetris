import * as reducerType from '../../unit/reducerType';
import { getDailyChallengeData } from '../../unit/const';

const dailyData = getDailyChallengeData();
const initState = dailyData && dailyData.leaderboard ? dailyData.leaderboard : [];

const parse = (state = initState, action) => {
  switch (action.type) {
    case reducerType.DAILY_CHALLENGE_LEADERBOARD:
      return action.data;
    default:
      return state;
  }
};

export default parse;