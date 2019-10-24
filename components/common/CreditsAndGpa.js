import { Input } from 'antd';
import InputMask from 'react-input-mask';
import { validNumber } from '../../utils/helpers';

export default class CreditsAndGpa extends React.Component {
  constructor(props) {
    super(props);
  }
  changeInput = (key, value) => {
	  if( validNumber(value) ){
		  this.props.changeInput(key, value);
	  }
  }
  render() {
    let { gpa, science_gpa, credits_taken, credits_remaining } = this.props;
    return (
      <div>
        <div className="row c-form__row">
          <div className="col-md-3 c-form__label">Current GPA</div>
          <div className="col-md-3 c-form__input">
            <InputMask 
              mask="9.99"
              placeholder="0.00"
              value={gpa ? gpa : ""}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => this.props.changeInput('gpa', e.target.value)} 
              maskChar="0" 
              className="ant-input" />
          </div>
          <div className="col-md-3 c-form__label">Science GPA</div>
          <div className="col-md-3 c-form__input">
            <InputMask 
              mask="9.99" 
              placeholder="0.00"
              value={science_gpa ? science_gpa : ""}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => this.props.changeInput('science_gpa', e.target.value)}
              maskChar="0"
              className="ant-input" />
          </div>
        </div>
        <div className="row c-form__row">
          <div className="col-md-3 c-form__label">Credits Taken</div>
          <div className="col-md-3 c-form__input">
            <Input
              onClick={(e) => e.stopPropagation()}
              value={credits_taken ? credits_taken : ""}
              onChange={(e) => this.changeInput('credits_taken', e.target.value)}
              placeholder="#" />
          </div>
          <div className="col-md-3 c-form__label">Credits Left</div>
          <div className="col-md-3 c-form__input">
            <Input
              onClick={(e) => e.stopPropagation()}
              value={credits_remaining ? credits_remaining : ""}
              onChange={(e) => this.changeInput('credits_remaining', e.target.value)}
              placeholder="#" />
          </div>
        </div>
      </div>
    );
  }
}