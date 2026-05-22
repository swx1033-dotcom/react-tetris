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
    if ( // 只有在游戏进入开始, 或结束时 触发改变
      (
        [this.props.cur, nextProps.cur].indexOf(false) !== -1 &&
        (this.props.cur !== nextProps.cur)
      ) ||
      (this.props.reset !== nextProps.reset)
    ) {
      this.animate(nextProps);
    }
  }
  shouldComponentUpdate({ cur, reset }) {
    return cur !== this.props.cur || reset !== this.props.reset || !cur;
  }
  animate({ cur, reset }) {
    clearTimeout(Logo.timeout);
    this.setState({
      style: style.r1,
      display: 'none',
    });
    if (cur || reset) {
      this.setState({ display: 'none' });
      return;
    }

    let m = 'r'; // 方向
    let count = 0;

    const set = (func, delay) => {
      if (!func) {
        return;
      }
      Logo.timeout = setTimeout(func, delay);
    };

    const show = (func) => { // 显示
      set(() => {
        this.setState({
          display: 'block',
        });
        if (func) {
          func();
        }
      }, 150);
    };

    const hide = (func) => { // 隐藏
      set(() => {
        this.setState({
          display: 'none',
        });
        if (func) {
          func();
        }
      }, 150);
    };

    const eyes = (func, delay1, delay2) => { // 龙在眨眼睛
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

    const run = (func) => { // 开始跑步啦！
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

    show(() => { // 忽隐忽现
      hide(() => {
        show(() => {
          hide(() => {
            show(() => {
              dra(); // 开始运动
            });
          });
        });
      });
    });
  }
  render() {
    if (this.props.cur) {
      return null;
    }
    if (this.props.challengeMode) {
      const unit = require('../../unit/');
      const scores = unit.getDailyScores();
      let rank = -1;
      const currentPoint = this.props.points;
      if (currentPoint > 0) {
        for (let i = 0; i < scores.length; i++) {
          if (currentPoint === scores[i]) {
            rank = i + 1;
            break;
          }
        }
      }
      return (
        <div className={style.logo} style={{ display: this.state.display }}>
          <h2 style={{ fontSize: '18px', margin: '5px 0' }}>{i18n.challenge[lan]} Rank</h2>
          {rank !== -1 && <p style={{ fontSize: '14px', margin: '5px 0', color: 'red' }}>Your Rank: {rank}</p>}
          {scores.length === 0 ? (
            <p>No records today</p>
          ) : (
            <div style={{ fontSize: '14px', lineHeight: '1.5', marginTop: '5px' }}>
              {scores.slice(0, 5).map((s, i) => (
                <div key={i}>{i + 1}. {s}</div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className={style.logo} style={{ display: this.state.display }}>
        <div className={cn({ bg: true, [style.dragon]: true, [this.state.style]: true })} />
        <p dangerouslySetInnerHTML={{ __html: i18n.titleCenter[lan] }} />
      </div>
    );
  }
}

Logo.propTypes = {
  cur: propTypes.bool,
  reset: propTypes.bool.isRequired,
  challengeMode: propTypes.bool,
  points: propTypes.number,
};
Logo.statics = {
  timeout: null,
};
