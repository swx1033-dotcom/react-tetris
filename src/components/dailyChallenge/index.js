import React from 'react';
import propTypes from 'prop-types';
import { i18n, lan } from '../../unit/const';
import { dailyChallenge } from '../../unit/';
import actions from '../../actions';
import store from '../../store';
import style from './index.less';

export default class DailyChallenge extends React.Component {
  constructor() {
    super();
    this.state = {
      showRanking: false,
    };
  }

  handleChallengeClick = () => {
    const state = store.getState();
    const isChallenge = state.get('challengeMode');
    if (state.get('cur') !== null) {
      return;
    }
    if (isChallenge) {
      store.dispatch(actions.challengeMode(false));
      store.dispatch(actions.challengeSubmitted(false));
      dailyChallenge.saveDailyChallengeData({
        sequence: null,
        sequenceIndex: 0,
        submitted: false,
      });
    } else {
      const challengeData = dailyChallenge.initChallengeSequence();
      store.dispatch(actions.challengeMode(true));
      store.dispatch(actions.challengeSequence(challengeData.sequence));
      store.dispatch(actions.challengeSequenceIndex(0));
      store.dispatch(actions.challengeSubmitted(false));
      store.dispatch(actions.challengeMax(0));
      require('../../unit').setChallengeSequence(challengeData.sequence);
      dailyChallenge.saveDailyChallengeData({
        sequence: challengeData.sequence,
        sequenceIndex: 0,
        submitted: false,
      });
    }
  }

  toggleRanking = () => {
    this.setState({
      showRanking: !this.state.showRanking,
    });
  }

  render() {
    const state = store.getState();
    const isChallenge = state.get('challengeMode');
    const ranking = state.get('challengeRanking') || [];
    const position = state.get('challengePosition') || 0;
    const submitted = state.get('challengeSubmitted');
    const challengeMax = state.get('challengeMax');
    const today = dailyChallenge.getTodayString();

    return (
      <div className={style.dailyChallenge}>
        <div className={style.challengeHeader}>
          <span className={style.challengeDate}>{today}</span>
        </div>
        <button
          className={isChallenge ? style.challengeBtnActive : style.challengeBtn}
          onClick={this.handleChallengeClick}
          disabled={state.get('cur') !== null}
        >
          {isChallenge ? i18n.backToNormal[lan] : i18n.dailyChallenge[lan]}
        </button>
        {isChallenge && submitted && (
          <div className={style.challengeInfo}>
            <div className={style.challengeStat}>
              <span>{i18n.challengeHighest[lan]}:</span>
              <span className={style.challengeScore}>{challengeMax}</span>
            </div>
            <div className={style.challengeStat}>
              <span>{i18n.challengePosition[lan]}:</span>
              <span className={style.challengeRank}>#{position}</span>
            </div>
          </div>
        )}
        {isChallenge && (
          <button
            className={style.rankingBtn}
            onClick={this.toggleRanking}
          >
            {i18n.challengeRanking[lan]}
          </button>
        )}
        {this.state.showRanking && ranking.length > 0 && (
          <div className={style.rankingPanel}>
            <h4>{i18n.challengeRanking[lan]}</h4>
            <ol className={style.rankingList}>
              {ranking.map((entry, index) => (
                <li
                  key={index}
                  className={entry.date === today && entry.score === challengeMax ? style.myEntry : ''}
                >
                  <span className={style.rankNum}>#{index + 1}</span>
                  <span className={style.rankScore}>{entry.score}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  }
}

DailyChallenge.propTypes = {
  dispatch: propTypes.func.isRequired,
};