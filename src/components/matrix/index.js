import React from 'react';
import immutable, { List } from 'immutable';
import classnames from 'classnames';
import propTypes from 'prop-types';

import style from './index.less';
import { isClear } from '../../unit/';
import { fillLine, blankLine, clearPoints } from '../../unit/const';
import states from '../../control/states';

const t = setTimeout;
const rowHeight = 22;
const colWidth = 22;
const floatDuration = 1000;

export default class Matrix extends React.Component {
  constructor() {
    super();
    this.state = {
      clearLines: false,
      animateColor: 2,
      isOver: false,
      overState: null,
      floatingScores: [],
    };
    this.floatId = 0;
    this.floatTimeouts = [];
  }
  componentWillReceiveProps(nextProps = {}) {
    const clears = isClear(nextProps.matrix);
    const overs = nextProps.reset;
    this.setState({
      clearLines: clears,
      isOver: overs,
    });
    if (clears && !this.state.clearLines) {
      this.showFloatingScore(clears);
      this.clearAnimate(clears);
    }
    if (!clears && overs && !this.state.isOver) {
      this.over(nextProps);
    }
  }
  componentWillUnmount() {
    this.floatTimeouts.forEach(timeout => clearTimeout(timeout));
    this.floatTimeouts = [];
  }
  shouldComponentUpdate(nextProps = {}, nextState = this.state) {
    const props = this.props;
    return !(
      immutable.is(nextProps.matrix, props.matrix) &&
      immutable.is(
        (nextProps.cur && nextProps.cur.shape),
        (props.cur && props.cur.shape)
      ) &&
      immutable.is(
        (nextProps.cur && nextProps.cur.xy),
        (props.cur && props.cur.xy)
      )
    ) || nextState.clearLines !== this.state.clearLines
    || nextState.animateColor !== this.state.animateColor
    || nextState.isOver !== this.state.isOver
    || nextState.overState !== this.state.overState
    || nextState.floatingScores !== this.state.floatingScores;
  }
  getResult(props = this.props) {
    const cur = props.cur;
    const shape = cur && cur.shape;
    const xy = cur && cur.xy;

    let matrix = props.matrix;
    const clearLines = this.state.clearLines;
    if (clearLines) {
      const animateColor = this.state.animateColor;
      clearLines.forEach((index) => {
        matrix = matrix.set(index, List([
          animateColor,
          animateColor,
          animateColor,
          animateColor,
          animateColor,
          animateColor,
          animateColor,
          animateColor,
          animateColor,
          animateColor,
        ]));
      });
    } else if (shape) {
      shape.forEach((m, k1) => (
        m.forEach((n, k2) => {
          if (n && xy.get(0) + k1 >= 0) {
            let line = matrix.get(xy.get(0) + k1);
            let color;
            if (line.get(xy.get(1) + k2) === 1 && !clearLines) {
              color = 2;
            } else {
              color = 1;
            }
            line = line.set(xy.get(1) + k2, color);
            matrix = matrix.set(xy.get(0) + k1, line);
          }
        })
      ));
    }
    return matrix;
  }
  getFloatingScoreStyle(lines, offsetIndex) {
    const top = ((lines.reduce((sum, line) => sum + line, 0) / lines.length) * rowHeight) + (rowHeight / 2) - (offsetIndex * 10);
    const left = (colWidth * 10) - 18 - ((offsetIndex % 3) * 18);
    return {
      top: `${top}px`,
      left: `${left}px`,
    };
  }
  setFloatingScoreActive(id) {
    this.setState(({ floatingScores }) => ({
      floatingScores: floatingScores.map(item => (
        item.id === id ? { ...item, active: true } : item
      )),
    }));
  }
  removeFloatingScore(id) {
    this.setState(({ floatingScores }) => ({
      floatingScores: floatingScores.filter(item => item.id !== id),
    }));
  }
  showFloatingScore(lines) {
    const score = clearPoints[lines.length - 1];
    const id = this.floatId;
    this.floatId += 1;
    const offsetIndex = this.state.floatingScores.length;
    const floatingScore = {
      id,
      score,
      active: false,
      style: this.getFloatingScoreStyle(lines, offsetIndex),
    };
    this.setState(({ floatingScores }) => ({
      floatingScores: floatingScores.concat(floatingScore),
    }));
    this.floatTimeouts.push(t(() => this.setFloatingScoreActive(id), 20));
    this.floatTimeouts.push(t(() => this.removeFloatingScore(id), floatDuration));
  }
  clearAnimate() {
    const anima = (callback) => {
      t(() => {
        this.setState({
          animateColor: 0,
        });
        t(() => {
          this.setState({
            animateColor: 2,
          });
          if (typeof callback === 'function') {
            callback();
          }
        }, 100);
      }, 100);
    };
    anima(() => {
      anima(() => {
        anima(() => {
          t(() => {
            states.clearLines(this.props.matrix, this.state.clearLines);
          }, 100);
        });
      });
    });
  }
  over(nextProps) {
    let overState = this.getResult(nextProps);
    this.setState({
      overState,
    });

    const exLine = (index) => {
      if (index <= 19) {
        overState = overState.set(19 - index, List(fillLine));
      } else if (index >= 20 && index <= 39) {
        overState = overState.set(index - 20, List(blankLine));
      } else {
        states.overEnd();
        return;
      }
      this.setState({
        overState,
      });
    };

    for (let i = 0; i <= 40; i++) {
      t(exLine.bind(null, i), 40 * (i + 1));
    }
  }
  render() {
    let matrix;
    if (this.state.isOver) {
      matrix = this.state.overState;
    } else {
      matrix = this.getResult();
    }
    return (
      <div className={style.matrix}>
        {
          matrix.map((p, k1) => (<p key={k1}>
            {
              p.map((e, k2) => <b
                className={classnames({
                  c: e === 1,
                  d: e === 2,
                })}
                key={k2}
              />)
            }
          </p>))
        }
        {
          this.state.floatingScores.map(item => (
            <span
              className={classnames(style.floatingScore, {
                [style.floatingScoreActive]: item.active,
              })}
              key={item.id}
              style={item.style}
            >
              {`+${item.score}`}
            </span>
          ))
        }
      </div>
    );
  }
}

Matrix.propTypes = {
  matrix: propTypes.object.isRequired,
  cur: propTypes.object,
  reset: propTypes.bool.isRequired,
};
