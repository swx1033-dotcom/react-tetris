import * as reducerType from '../../unit/reducerType';

const initState = true;

const canHold = (state = initState, action) => {
  switch (action.type) {
    case reducerType.CAN_HOLD:
      return action.data;
    case reducerType.RESET:
      return true;
    default:
      return state;
  }
};

export default canHold;
