import event from '../../unit/event';
import actions from '../../actions';
import states from '../states';
import store from '../../store';
import { Map } from 'immutable';

const down = (storeInstance) => {
  storeInstance.dispatch(actions.keyboardUndo(true));
  event.down({
    key: 'undo',
    once: true,
    callback: () => {
      const state = storeInstance.getState();
      if (state.get('lock')) {
        return;
      }
      
      const history = state.get('history');
      const current = history.get('current');
      if (current > 0) {
        // 获取历史状态
        const savedState = history.get('history').get(current - 1);
        
        // 恢复游戏状态
        if (savedState) {
          storeInstance.dispatch(actions.undo());
          
          // 恢复各个状态
          storeInstance.dispatch(actions.pause(savedState.get('pause')));
          storeInstance.dispatch(actions.matrix(savedState.get('matrix')));
          storeInstance.dispatch(actions.nextBlock(savedState.get('next')));
          // 对于 cur，我们需要重建 Block 对象
          if (savedState.get('cur')) {
            const curData = savedState.get('cur');
            storeInstance.dispatch(actions.moveBlock({
              type: curData.type,
              xy: curData.xy,
              shape: curData.shape,
              rotateIndex: curData.rotateIndex,
            }));
          } else {
            storeInstance.dispatch(actions.moveBlock({ reset: true }));
          }
          storeInstance.dispatch(actions.startLines(savedState.get('startLines')));
          storeInstance.dispatch(actions.points(savedState.get('points')));
          storeInstance.dispatch(actions.max(savedState.get('max')));
          storeInstance.dispatch(actions.speedStart(savedState.get('speedStart')));
          storeInstance.dispatch(actions.speedRun(savedState.get('speedRun')));
          storeInstance.dispatch(actions.lock(savedState.get('lock')));
          storeInstance.dispatch(actions.clearLines(savedState.get('clearLines')));
          storeInstance.dispatch(actions.reset(savedState.get('reset')));
          storeInstance.dispatch(actions.drop(savedState.get('drop')));
          storeInstance.dispatch(actions.focus(savedState.get('focus')));
          
          // 重新开始自动下落
          states.auto();
        }
      }
    },
  });
};

const up = (storeInstance) => {
  storeInstance.dispatch(actions.keyboardUndo(false));
  event.up({
    key: 'undo',
  });
};

export default {
  down,
  up,
};
