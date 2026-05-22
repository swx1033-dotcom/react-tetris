import React from 'react';
import propTypes from 'prop-types';

import style from './index.less';
import store from '../../store';
import actions from '../../actions';
import states from '../../control/states';
import { getDailySeed, getDailyRankings, getPlayerRank } from '../../unit/dailyChallenge';
import { i18n, lan } from '../../unit/const';

export default class Daily extends React.Component {
  constructor() {
    super();
    this.state = {
      showRanking: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showRanking && !this.state.showRanking) {
      this.setState({ showRanking: true });
    }
    if (!nextProps.showRanking && this.state.showRanking) {
      this.setState({ showRanking: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.cur !== this.props.cur ||
      nextProps.reset !== this.props.reset ||
      nextProps.dailyMode !== this.props.dailyMode ||
      nextProps.showRanking !== this.props.showRanking ||
      nextState.showRanking !== this.state.showRanking
    );
  }

  startDaily() {
    store.dispatch(actions.dailyMode(true));
    setTimeout(() => {
      states.start();
    }, 50);
  }

  closeRanking() {
    store.dispatch(actions.dailyShowRanking(false));
    store.dispatch(actions.dailyMode(false));
  }

  render() {
    const { cur, reset, dailyMode, points } = this.props;

    if (dailyMode && cur) {
      return null;
    }

    const showButton = !cur && !reset && !dailyMode;

    if (this.state.showRanking) {
      const rankings = getDailyRankings();
      const playerRank = getPlayerRank(points);
      const highestScore = rankings.length > 0 ? rankings[0].score : 0;

      return (
        <div className={style.overlay}>
          <div className={style.panel}>
            <h2>{i18n.dailyChallenge[lan]} - {getDailySeed()}</h2>
            <div className={style.scoreInfo}>
              <div className={style.yourScore}>
                <span>{i18n.dailyYourScore[lan]}</span>
                <em>{points}</em>
              </div>
              <div className={style.highest}>
                <span>{i18n.dailyHighest[lan]}</span>
                <em>{highestScore}</em>
              </div>
              <div className={style.rank}>
                <span>{i18n.dailyYourRank[lan]}</span>
                <em>#{playerRank}</em>
              </div>
            </div>
            <div className={style.rankings}>
              <h3>{i18n.dailyRanking[lan]}</h3>
              {rankings.length === 0 ? (
                <p className={style.empty}>{i18n.dailyNoRecords[lan]}</p>
              ) : (
                <ul>
                  {rankings.map((entry, i) => (
                    <li key={i} className={entry.score === points && i + 1 === playerRank ? style.highlight : ''}>
                      <span className={style.rankNum}>{i + 1}</span>
                      <span className={style.name}>{entry.name}</span>
                      <span className={style.score}>{entry.score}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button className={style.closeBtn} onClick={() => this.closeRanking()}>
              {i18n.dailyClose[lan]}
            </button>
          </div>
        </div>
      );
    }

    if (showButton) {
      return (
        <div className={style.startBtn}>
          <button onClick={() => this.startDaily()}>
            {i18n.dailyChallenge[lan]}
          </button>
        </div>
      );
    }

    return null;
  }
}

Daily.propTypes = {
  cur: propTypes.object,
  reset: propTypes.bool.isRequired,
  dailyMode: propTypes.bool.isRequired,
  showRanking: propTypes.bool.isRequired,
  points: propTypes.number.isRequired,
};