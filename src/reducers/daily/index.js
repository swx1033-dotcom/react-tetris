import * as reducerType from '../../unit/reducerType';
import {
  getDailyBlockSequence, getDailyObstacles, getDailyRankings,
  hasScoreSubmittedToday, getDailySeed,
} from '../../unit/dailyChallenge';

const initState = {
  mode: false,
  blockIndex: 0,
  blockSequence: getDailyBlockSequence(),
  obstacles: getDailyObstacles(),
  rankings: getDailyRankings(),
  scoreSubmitted: hasScoreSubmittedToday(),
  showRanking: false,
  seed: getDailySeed(),
};

const daily = (state = initState, action) => {
  switch (action.type) {
    case reducerType.DAILY_MODE:
      return {
        ...state,
        mode: action.data,
        blockSequence: action.data ? getDailyBlockSequence() : state.blockSequence,
        obstacles: action.data ? getDailyObstacles() : state.obstacles,
        rankings: action.data ? getDailyRankings() : state.rankings,
        scoreSubmitted: action.data ? hasScoreSubmittedToday() : state.scoreSubmitted,
        seed: action.data ? getDailySeed() : state.seed,
        blockIndex: action.data ? 0 : state.blockIndex,
        showRanking: false,
      };
    case reducerType.DAILY_BLOCK_INDEX:
      return {
        ...state,
        blockIndex: action.data,
      };
    case reducerType.DAILY_RANKINGS:
      return {
        ...state,
        rankings: action.data,
      };
    case reducerType.DAILY_SCORE_SUBMITTED:
      return {
        ...state,
        scoreSubmitted: action.data,
      };
    case reducerType.DAILY_SHOW_RANKING:
      return {
        ...state,
        showRanking: action.data,
      };
    default:
      return state;
  }
};

export default daily;