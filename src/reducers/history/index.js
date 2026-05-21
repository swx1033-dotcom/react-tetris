import { List, Map } from 'immutable';
import * as reducerType from '../../unit/reducerType';

const MAX_HISTORY = 50;

const initState = Map({
  history: List(),
  current: 0,
});

const history = (state = initState, action) => {
  switch (action.type) {
    case reducerType.SAVE_STATE: {
      const newState = action.data;
      const current = state.get('current');
      let history = state.get('history');
      
      // 移除当前位置之后的历史记录
      history = history.slice(0, current + 1);
      
      // 添加新状态
      history = history.push(newState);
      
      // 限制历史记录数量
      if (history.size > MAX_HISTORY) {
        history = history.shift();
      }
      
      return state.set('history', history).set('current', history.size - 1);
    }
    case reducerType.UNDO: {
      let current = state.get('current');
      if (current > 0) {
        current -= 1;
        return state.set('current', current);
      }
      return state;
    }
    case reducerType.RESET: {
      return initState;
    }
    default:
      return state;
  }
};

export default history;
