import { Input, DatePicker } from 'antd';
import moment from 'moment';

export default class McatExam extends React.Component {
  constructor(props) {
    super(props);
  }
  totalScore = () => {
    let { chemical_physical, bio, reasoning, social } = this.props;
    let vals = [];
    vals.push(parseInt(chemical_physical));
    vals.push(parseInt(bio));
    vals.push(parseInt(reasoning));
    vals.push(parseInt(social));
    let score = 0;
    for (var i = 0; i < 4; i++) {
      if (!isNaN(vals[i])) {
        score += vals[i];
      }
    }
    return score;
  }
  processScore = (val) => {
    val = val.substring(0, 3);
    if (val.length > 0 && val[val.length - 1].match(/\d/) === null) {
      val = val.substring(0, val.length - 1);
    }
    if (parseInt(val) > 132) {
      return val.substring(0, 2);
    }
    return val;
  }
  render() {
    let { chemical_physical, bio, reasoning, social, test_date } = this.props;
    const dateFormat = 'MM/DD/YY';
    return (
      <div>
        <div className="row c-form__row c-form__reverse_responsive">
          <div className="col-md-2 c-form__input">
            <Input
              className="is-small"
              onClick={(e) => e.stopPropagation()}
              value={chemical_physical === 0? null : chemical_physical}
              onChange={(e) => this.props.changeInput('chemical_physical', this.processScore(e.target.value))}
              placeholder="132" />
          </div>
          <div className="col-md-10 c-form__label c-form__label--left">Chemical and Physical Foundations of Biological Systems</div>
        </div>
        <div className="row c-form__row c-form__reverse_responsive">
          <div className="col-md-2 c-form__input">
            <Input
              className="is-small"
              value={bio === 0? null : bio}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => this.props.changeInput('bio', this.processScore(e.target.value))}
              placeholder="132" />
          </div>
          <div className="col-md-10 c-form__label c-form__label--left">Biological and Biochemical Foundations of Living Systems</div>
        </div>
        <div className="row c-form__row c-form__reverse_responsive">
          <div className="col-md-2 c-form__input">
            <Input
              className="is-small"
              value={reasoning === 0? null :reasoning}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => this.props.changeInput('reasoning', this.processScore(e.target.value))}
              placeholder="132" />
          </div>
          <div className="col-md-10 c-form__label c-form__label--left">Critical Analysis and Reasoning Skills</div>
        </div>
        <div className="row c-form__row c-form__reverse_responsive">
          <div className="col-md-2 c-form__input">
            <Input
              className="is-small"
              value={social === 0? null : social}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => this.props.changeInput('social', this.processScore(e.target.value))}
              placeholder="132" />
          </div>
          <div className="col-md-10 c-form__label c-form__label--left">Physical, Social, and Biological Foundations of Behavior</div>
        </div>
        <div className="row c-form__row c-form__reverse_responsive">
          <div className="col-12 pr-0 pl-0">
            <hr />
          </div>
        </div>
        <div className="row c-form__row">
          <div className="col-md-2 c-form__label c-form__label--center"><strong>{this.totalScore()}</strong></div>
          <div className="col-md-10 c-form__label c-form__label--left">
            <strong>Overall Total MCAT Score</strong>
          </div>
        </div>
        <div className="row c-form__row" onClick={(e) => e.stopPropagation()}>
          <div className="col-md-4 c-form__label">Test Date</div>
          <div className="col-md-4 c-form__input">
            <DatePicker
              allowClear={false}
              defaultValue={moment(test_date)}
              format={dateFormat}
              onChange={(val)=> this.props.changeInput('test_date', val)}
              placeholder="Test Date" />
          </div>
        </div>
      </div>
    );
  }
}