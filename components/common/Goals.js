import { Input } from 'antd';
import InputMask from 'react-input-mask';

export default class Goals extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let { gpa, mcat, shadowing, volunteering, extra_curs, recoms } = this.props;
    return (
      <div>
        <div className="row c-form__row c-form__reverse_responsive c-form__row_spacing">
          <div className="col-md-3 c-form__input">
            <InputMask 
              mask="9.99" 
              placeholder="0.00"
              value={gpa}
              onChange={(e) => this.props.changeInput('gpa', e.target.value)}
              maskChar="0"
              className="ant-input" />
          </div>
          <div className="col-md-9 c-form__label c-form__label--left">GPA</div>
        </div>
        <div className="c-form__suggest_label">Suggested: 3.7 or greater</div>
        <div className="row c-form__row c-form__reverse_responsive c-form__row_spacing">
          <div className="col-md-3 c-form__input">
            <Input 
              value={mcat}
              onChange={(e) => this.props.changeInput('mcat', e.target.value)}
              placeholder="MCAT" />
          </div>
          <div className="col-md-9 c-form__label c-form__label--left">MCAT</div>
        </div>
        <div className="c-form__suggest_label">Suggested: 507 or greater</div>
        <div className="row c-form__row c-form__reverse_responsive c-form__row_spacing">
          <div className="col-md-3 c-form__input">
            <Input placeholder="hrs" 
              value={shadowing}
              onChange={(e) => this.props.changeInput('shadowing', e.target.value)} />
            <div className="c-form__unit">Hours</div>
          </div>
          <div className="col-md-9 c-form__label c-form__label--left">Shadowing</div>
        </div>
        <div className="c-form__suggest_label">Suggested: 50 hours or greater</div>
        <div className="row c-form__row c-form__reverse_responsive c-form__row_spacing">
          <div className="col-md-3 c-form__input">
            <Input placeholder="hrs" 
              value={volunteering}
              onChange={(e) => this.props.changeInput('volunteering', e.target.value)} />
            <div className="c-form__unit">Hours</div>
          </div>
          <div className="col-md-9 c-form__label c-form__label--left">Volunteering</div>
        </div>
        <div className="c-form__suggest_label">Suggested: 150 hours or greater</div>
        <div className="row c-form__row c-form__reverse_responsive c-form__row_spacing">
          <div className="col-md-3 c-form__input" >
            <Input className="c-form__activities_font " placeholder="activities"
              value={extra_curs}
              onChange={(e) => this.props.changeInput('extra_curs', e.target.value)} />
            <div className="c-form__unit" >Activities</div>
          </div>
          <div className="col-md-9 c-form__label c-form__label--left">Work & Activities</div>
        </div>
        <div className="c-form__suggest_label">Suggested: 12-15</div>
        {/* They said take it away for now */}
        {/* <div className="row c-form__row c-form__reverse_responsive">
          <div className="col-md-3 c-form__input">
            <Input placeholder="Letters of Recommendation" 
              value={recoms}
              onChange={(e) => this.props.changeInput('recoms', e.target.value)} />
          </div>
          <div className="col-md-9 c-form__label c-form__label--left">Letters of Recommendation</div>
        </div> */}
      </div>
    );
  }
}