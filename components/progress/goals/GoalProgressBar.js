export default class GoalProgressBar extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let { completed, total, color, done_text, left_text, is_large } = this.props;
    let progress = 100 * completed / total;
    return (
      <div className="c-goal_pbar">
        <div className="c-goal_pbar__info">
          <div className="c-goal_pbar__done">{done_text}</div>
          <div className="c-goal_pbar__left progress-position">{left_text}</div>
        </div>
        <div className={"c-goal_pbar__bar " + (is_large ? 'is-large' : '')}>
          <div
            key={`step_${Math.round(Math.random() * 100000)}`} 
            className="c-goal_pbar__step"
            style={{width: `${progress}%`, backgroundColor: color}}
            />
        </div>
      </div>
    );
  }
}