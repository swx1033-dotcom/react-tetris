import * as reducerType from '../../unit/reducerType';

const initState = 0;

const reducer = (state = initState, action) => {
  switch (action.type) {
    case reducerType.UNDO:
      return state + 1;
    default:
      return state;
  }
};

export default reducer;