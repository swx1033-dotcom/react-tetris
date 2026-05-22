import React from 'react';
import propTypes from 'prop-types';

import Number from '../number';
import { i18n, lan } from '../../unit/const';

const DF = i18n.point[lan];
const ZDF = i18n.highestScore[lan];
const SLDF = i18n.lastRound[lan];
const MRDF = i18n.dailyTopScore[lan];
const BRDF = i18n.yourBest[lan];

export default class Point extends React.Component {
  constructor() {
    super();
    this.state = {
      label: '',
      number: 0,
    };
  }
  componentWillMount() {
    this.onChange(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.onChange(nextProps);
  }
  shouldComponentUpdate({ cur, point, max, gameMode, challenge }) {
    const props = this.props;
    return cur !== props.cur ||
      point !== props.point ||
      max !== props.max ||
      gameMode !== props.gameMode ||
      challenge.get('topScore') !== props.challenge.get('topScore') ||
      challenge.get('playerBest') !== props.challenge.get('playerBest') ||
      !props.cur;
  }
  onChange({ cur, point, max, gameMode, challenge }) {
    clearInterval(Point.timeout);
    if (cur) {
      if (gameMode === 'daily' && point >= challenge.get('topScore') && challenge.get('topScore') > 0) {
        this.setState({
          label: MRDF,
          number: point,
        });
        return;
      }
      this.setState({
        label: point >= max && gameMode !== 'daily' ? ZDF : DF,
        number: point,
      });
    } else if (gameMode === 'daily') {
      const toggle = () => {
        this.setState({
          label: BRDF,
          number: challenge.get('playerBest') || point,
        });
        Point.timeout = setTimeout(() => {
          this.setState({
            label: MRDF,
            number: challenge.get('topScore'),
          });
          Point.timeout = setTimeout(toggle, 3000);
        }, 3000);
      };

      if ((challenge.get('playerBest') || point) !== 0) {
        toggle();
      } else {
        this.setState({
          label: MRDF,
          number: challenge.get('topScore'),
        });
      }
    } else {
      const toggle = () => {
        this.setState({
          label: SLDF,
          number: point,
        });
        Point.timeout = setTimeout(() => {
          this.setState({
            label: ZDF,
            number: max,
          });
          Point.timeout = setTimeout(toggle, 3000);
        }, 3000);
      };

      if (point !== 0) {
        toggle();
      } else {
        this.setState({
          label: ZDF,
          number: max,
        });
      }
    }
  }
  render() {
    return (
      <div>
        <p>{ this.state.label }</p>
        <Number number={this.state.number} />
      </div>
    );
  }
}

Point.statics = {
  timeout: null,
};

Point.propTypes = {
  cur: propTypes.bool,
  max: propTypes.number.isRequired,
  point: propTypes.number.isRequired,
  gameMode: propTypes.string.isRequired,
  challenge: propTypes.object.isRequired,
};
