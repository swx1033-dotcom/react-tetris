import { getNextType, getChallengeNextType } from '../unit';
import * as reducerType from '../unit/reducerType';
import Block from '../unit/block';
import keyboard from './keyboard';

function nextBlock(next = getNextType(), index = null) {
  const type = index !== null ? getChallengeNextType(index) : next;
  return {
    type: reducerType.NEXT_BLOCK,
    data: type,
  };
}

function moveBlock(option) {
  return {
    type: reducerType.MOVE_BLOCK,
    data: option.reset === true ? null : new Block(option),
  };
}

function speedStart(n) {
  return {
    type: reducerType.SPEED_START,
    data: n,
  };
}

function speedRun(n) {
  return {
    type: reducerType.SPEED_RUN,
    data: n,
  };
}

function startLines(n) {
  return {
    type: reducerType.START_LINES,
    data: n,
  };
}

function matrix(data) {
  return {
    type: reducerType.MATRIX,
    data,
  };
}

function lock(data) {
  return {
    type: reducerType.LOCK,
    data,
  };
}

function clearLines(data) {
  return {
    type: reducerType.CLEAR_LINES,
    data,
  };
}

function points(data) {
  return {
    type: reducerType.POINTS,
    data,
  };
}

function max(data) {
  return {
    type: reducerType.MAX,
    data,
  };
}

function reset(data) {
  return {
    type: reducerType.RESET,
    data,
  };
}

function drop(data) {
  return {
    type: reducerType.DROP,
    data,
  };
}

function pause(data) {
  return {
    type: reducerType.PAUSE,
    data,
  };
}

function music(data) {
  return {
    type: reducerType.MUSIC,
    data,
  };
}

function focus(data) {
  return {
    type: reducerType.FOCUS,
    data,
  };
}

function challengeMode(data) {
  return {
    type: reducerType.CHALLENGE_MODE,
    data,
  };
}

function challengeSequence(data) {
  return {
    type: reducerType.CHALLENGE_SEQUENCE,
    data,
  };
}

function challengeSequenceIndex(data) {
  return {
    type: reducerType.CHALLENGE_SEQUENCE_INDEX,
    data,
  };
}

function challengeMax(data) {
  return {
    type: reducerType.CHALLENGE_MAX,
    data,
  };
}

function challengeSubmitted(data) {
  return {
    type: reducerType.CHALLENGE_SUBMITTED,
    data,
  };
}

function challengeRanking(data) {
  return {
    type: reducerType.CHALLENGE_RANKING,
    data,
  };
}

function challengePosition(data) {
  return {
    type: reducerType.CHALLENGE_POSITION,
    data,
  };
}

export default {
  nextBlock,
  moveBlock,
  speedStart,
  speedRun,
  startLines,
  matrix,
  lock,
  clearLines,
  points,
  reset,
  max,
  drop,
  pause,
  keyboard,
  music,
  focus,
  challengeMode,
  challengeSequence,
  challengeSequenceIndex,
  challengeMax,
  challengeSubmitted,
  challengeRanking,
  challengePosition,
};
