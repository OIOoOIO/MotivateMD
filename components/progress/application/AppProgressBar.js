export default class AppProgressBar extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let { completed, total } = this.props;
    let fake_arr = new Array(total).fill(0);
    return (
      <div className="c-app_pbar">
        {
          fake_arr.map((e, i) => {
            let is_last = completed === i + 1;
            let is_filled  =  i + 1 < completed;
            return (
              <div key={`step_${Math.round(Math.random() * 100000)}`} className={"c-app_pbar__step " + (is_last ? 'is-last' : '') + (is_filled ? 'is-filled' : '')} />
            );
          })
        }
      </div>
    );
  }
}