import * as reducerType from '../../unit/reducerType';
import { getDailyChallengeData, maxPoint } from '../../unit/const';

const dailyData = getDailyChallengeData();
let initState = dailyData && !isNaN(parseInt(dailyData.highScore, 10)) ?
  parseInt(dailyData.highScore, 10) : 0;

if (initState < 0) {
  initState = 0;
} else if (initState > maxPoint) {
  initState = maxPoint;
}

const parse = (state = initState, action) => {
  switch (action.type) {
    case reducerType.DAILY_CHALLENGE_HIGH_SCORE:
      return action.data > maxPoint ? maxPoint : action.data;
    default:
      return state;
  }
};

export default parse;