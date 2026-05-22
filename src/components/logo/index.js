import React from 'react';
import cn from 'classnames';
import propTypes from 'prop-types';

import style from './index.less';
import { i18n, lan } from '../../unit/const';

export default class Logo extends React.Component {
  constructor() {
    super();
    this.state = {
      style: style.r1,
      display: 'none',
    };
  }
  componentWillMount() {
    this.animate(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (
      ([this.props.cur, nextProps.cur].indexOf(false) !== -1 && (this.props.cur !== nextProps.cur)) ||
      (this.props.reset !== nextProps.reset) ||
      (this.props.gameMode !== nextProps.gameMode)
    ) {
      this.animate(nextProps);
    }
  }
  shouldComponentUpdate({ cur, reset, gameMode, challenge }) {
    return cur !== this.props.cur ||
      reset !== this.props.reset ||
      gameMode !== this.props.gameMode ||
      challenge.get('topScore') !== this.props.challenge.get('topScore') ||
      challenge.get('playerRank') !== this.props.challenge.get('playerRank') ||
      challenge.get('leaderboard') !== this.props.challenge.get('leaderboard') ||
      !cur;
  }
  animate({ cur, reset, gameMode }) {
    clearTimeout(Logo.timeout);
    this.setState({
      style: style.r1,
      display: 'none',
    });
    if (cur || reset) {
      this.setState({ display: 'none' });
      return;
    }
    if (gameMode === 'daily') {
      this.setState({ display: 'block' });
      return;
    }

    let m = 'r';
    let count = 0;

    const set = (func, delay) => {
      if (!func) {
        return;
      }
      Logo.timeout = setTimeout(func, delay);
    };

    const show = (func) => {
      set(() => {
        this.setState({
          display: 'block',
        });
        if (func) {
          func();
        }
      }, 150);
    };

    const hide = (func) => {
      set(() => {
        this.setState({
          display: 'none',
        });
        if (func) {
          func();
        }
      }, 150);
    };

    const eyes = (func, delay1, delay2) => {
      set(() => {
        this.setState({ style: style[m + 2] });
        set(() => {
          this.setState({ style: style[m + 1] });
          if (func) {
            func();
          }
        }, delay2);
      }, delay1);
    };

    const run = (func) => {
      set(() => {
        this.setState({ style: style[m + 4] });
        set(() => {
          this.setState({ style: style[m + 3] });
          count++;
          if (count === 10 || count === 20 || count === 30) {
            m = m === 'r' ? 'l' : 'r';
          }
          if (count < 40) {
            run(func);
            return;
          }
          this.setState({ style: style[m + 1] });
          if (func) {
            set(func, 4000);
          }
        }, 100);
      }, 100);
    };

    const dra = () => {
      count = 0;
      eyes(() => {
        eyes(() => {
          eyes(() => {
            this.setState({ style: style[m + 2] });
            run(dra);
          }, 150, 150);
        }, 150, 150);
      }, 1000, 1500);
    };

    show(() => {
      hide(() => {
        show(() => {
          hide(() => {
            show(() => {
              dra();
            });
          });
        });
      });
    });
  }
  renderModeButtons() {
    return (
      <div className={style.modeButtons}>
        <button
          className={cn({ [style.active]: this.props.gameMode === 'normal' })}
          onClick={() => this.props.onStartMode('normal')}
        >
          {i18n.normalMode[lan]}
        </button>
        <button
          className={cn({ [style.active]: this.props.gameMode === 'daily' })}
          onClick={() => this.props.onStartMode('daily')}
        >
          {i18n.dailyChallenge[lan]}
        </button>
      </div>
    );
  }
  renderDailyPanel() {
    const leaderboard = this.props.challenge.get('leaderboard');
    return (
      <div className={cn(style.logo, style.challenge)} style={{ display: this.state.display }}>
        <div className={style.challengeTitle}>{i18n.dailyChallenge[lan]}</div>
        <div className={style.challengeMeta}>{this.props.challenge.get('dateKey')}</div>
        <div className={style.challengeStats}>
          <span>{i18n.dailyTopScore[lan]}</span>
          <strong>{this.props.challenge.get('topScore')}</strong>
        </div>
        <div className={style.challengeStats}>
          <span>{i18n.yourRank[lan]}</span>
          <strong>{this.props.challenge.get('playerRank') || '--'}</strong>
        </div>
        <div className={style.challengeBoardTitle}>{i18n.dailyBoard[lan]}</div>
        <div className={style.challengeBoard}>
          {leaderboard.size ? leaderboard.map((item, index) => (
            <div className={style.challengeRow} key={item.get('id')}>
              <span>{`#${index + 1}`}</span>
              <strong>{item.get('score')}</strong>
            </div>
          )) : <div className={style.challengeEmpty}>{i18n.noChallengeRecord[lan]}</div>}
        </div>
        {this.renderModeButtons()}
      </div>
    );
  }
  render() {
    if (this.props.cur) {
      return null;
    }
    if (this.props.gameMode === 'daily') {
      return this.renderDailyPanel();
    }
    return (
      <div className={style.logo} style={{ display: this.state.display }}>
        <div className={cn({ bg: true, [style.dragon]: true, [this.state.style]: true })} />
        <p dangerouslySetInnerHTML={{ __html: i18n.titleCenter[lan] }} />
        {this.renderModeButtons()}
      </div>
    );
  }
}

Logo.propTypes = {
  cur: propTypes.bool,
  reset: propTypes.bool.isRequired,
  gameMode: propTypes.string.isRequired,
  challenge: propTypes.object.isRequired,
  onStartMode: propTypes.func.isRequired,
};
Logo.statics = {
  timeout: null,
};
