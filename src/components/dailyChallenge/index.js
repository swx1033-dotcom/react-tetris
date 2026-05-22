import React from 'react';
import cn from 'classnames';
import propTypes from 'prop-types';

import style from './index.less';
import { i18n, lan } from '../../unit/const';
import states from '../../control/states';

export default class DailyChallenge extends React.Component {
  handleStartChallenge = () => {
    states.startDailyChallenge();
  };

  handleShowLeaderboard = () => {
    states.showLeaderboard(true);
  };

  handleHideLeaderboard = () => {
    states.showLeaderboard(false);
  };

  getPlayerRank = (leaderboard, currentScore) => {
    for (let i = 0; i < leaderboard.length; i++) {
      if (leaderboard[i].score <= currentScore) {
        return i + 1;
      }
    }
    return leaderboard.length + 1;
  };

  renderLeaderboard = () => {
    const { leaderboard, dailyChallengeHighScore, points } = this.props;
    
    if (!leaderboard || leaderboard.length === 0) {
      return (
        <div className={style.leaderboardEmpty}>
          <p>{i18n.leaderboard[lan]}</p>
          <p>{i18n.todayHighScore[lan]}: {dailyChallengeHighScore}</p>
        </div>
      );
    }

    const playerRank = this.getPlayerRank(leaderboard, points);

    return (
      <div className={style.leaderboard}>
        <h3>{i18n.leaderboard[lan]}</h3>
        <p className={style.todayHighScore}>
          {i18n.todayHighScore[lan]}: {leaderboard[0]?.score || 0}
        </p>
        <div className={style.leaderboardList}>
          {leaderboard.map((entry, index) => (
            <div key={index} className={style.leaderboardItem}>
              <span className={style.rank}>{index + 1}</span>
              <span className={style.score}>{entry.score}</span>
            </div>
          ))}
        </div>
        <p className={style.yourRank}>
          {i18n.yourRank[lan]}: {playerRank}
        </p>
        <button 
          className={style.closeButton}
          onClick={this.handleHideLeaderboard}
        >
          OK
        </button>
      </div>
    );
  };

  renderButton = () => {
    return (
      <div className={style.dailyChallengeButtonContainer}>
        <button 
          className={style.dailyChallengeButton}
          onClick={this.handleStartChallenge}
        >
          {i18n.dailyChallenge[lan]}
        </button>
        <button 
          className={style.leaderboardButton}
          onClick={this.handleShowLeaderboard}
        >
          {i18n.leaderboard[lan]}
        </button>
      </div>
    );
  };

  render() {
    const { showLeaderboard, cur } = this.props;
    
    if (cur) {
      return null;
    }

    if (showLeaderboard) {
      return this.renderLeaderboard();
    }

    return this.renderButton();
  }
}

DailyChallenge.propTypes = {
  leaderboard: propTypes.array.isRequired,
  dailyChallengeHighScore: propTypes.number.isRequired,
  showLeaderboard: propTypes.bool.isRequired,
  points: propTypes.number.isRequired,
  cur: propTypes.object,
};