import { Button, Input, Select } from 'antd';
import States from '../States';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import CreditsAndGpa from '../common/CreditsAndGpa';
import school_i from '../../assets/images/ob/school.svg';
import ReactGA from 'react-ga';

export default class GraduationNo extends React.Component {
  constructor(props) {
    super(props);
    let education = props.education;
    if (education.majors.length == 0)
      education.majors = [''];
    this.state = {
      education: education,
      loading: false
    }
    ReactGA.modalview('/Onboarding - Motivate MD/Education/Graduation No');
  }
  changeArray = (key, index, value) => {
    let old = this.state.education[key];
    old[index] = value;
    let new_education = {...this.state.education};
    new_education[key] = old;
    this.setState({
      education: new_education
    });
  }
  addToArray = (key) => {
    let old = this.state.education[key];
    let new_education = {...this.state.education};
    new_education[key] = [...old, ''];
    this.setState({
      education: new_education
    });
  }
  removeFromArray = (key, i) => {
    let old = [...this.state.education[key]];
    old.splice(i, 1);
    let new_education = {...this.state.education};
    new_education[key] = old;
    this.setState({
      education: new_education
    });
  }
  changeInput = (key, value) => {
	  if( (key === 'gpa' || key === 'science_gpa') && parseFloat(value) > 4 ){
		  
	  }else{
		  let new_education = {...this.state.education};
		  new_education[key] = value;
		  this.setState({
			  education: new_education
		  });
	  }
  }
  handleContinue = () => {
    let education = this.state.education;
    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_education(education.id, education)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Education/Graduation No',
    		  action: 'Continue Clicked Success'
    	  });
        this.props.updateEducation(education);
        this.props.updateScreen('want_break');
        this.setState({loading: false});
      })
      .catch(error => {
    	  ReactGA.event({
      		  category: '/Onboarding - Motivate MD/Education/Graduation No',
      		  action: 'Continue Clicked Failure'
  	  		});
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }
  renderMajors = (majors) => {
    return majors.map((e, i) => {
      if (i == 0) {
        return (
          <div key={`major_${i}`} className="row c-form__row">
            <div className="col-md-3 c-form__label">Major</div>
            <div className="col-md-4 c-form__input">
              <Input value={majors[i]}
                onChange={(e) => this.changeArray('majors', i, e.target.value)}
                placeholder="Major" />
            </div>
            <div className="col-md-5 c-form__label c-form__label--left">
              <a onClick={() => this.addToArray('majors')}>+ Add Another Major</a>
            </div>
          </div>
        );
      } else {
        return (
          <div key={`major_${i}`} className="row c-form__row">
            <div className="offset-md-3 col-md-4 c-form__input">
              <Input value={majors[i]}
                onChange={(e) => this.changeArray('majors', i, e.target.value)}
                placeholder="Major" />
            </div>
            <div className="col-md-5 c-form__label c-form__label--left">
              <a onClick={() => this.removeFromArray('majors', i)}>- Remove</a>
            </div>
          </div>
        );
      }
    });
  }
  render() {
    let { school, majors, credits_taken, credits_remaining, gpa, science_gpa, residing_state } = this.state.education;
    return (
      <div className="tcenter">
        <img src={school_i} style={{width: '30px'}}/>
        <h1 className="h3-like mt-1 tcenter">Tell Us About Your Current Education</h1>
        <p className="mb-1">Knowing more about your currrent education will help us build an accurate timeline and premed roadmap.</p>
        <div className="row">
          <div className="col-md-10 offset-md-1">
            <div className="row c-form__row">
              <div className="col-md-3 c-form__label">School Name</div>
              <div className="col-md-9 c-form__input">
                <Input 
                  value={school}
                  onChange={(e) => this.changeInput('school', e.target.value)}
                  placeholder="School" />
              </div>
            </div>
            { this.renderMajors(majors) }
            <CreditsAndGpa
              gpa={gpa}
              science_gpa={science_gpa}
              credits_taken={credits_taken}
              credits_remaining={credits_remaining}
              changeInput={this.changeInput} />
            <div className="row c-form__row">
              <div className="col-md-3 c-form__label">Your Residing State</div>
              <div className="col-md-4 c-form__input">
                <Select 
                  value={residing_state}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  onChange={(val) => this.changeInput('residing_state', val)}
                  placeholder="Your State">
                  {
                    States.map(e => {
                      return (
                        <Select.Option key={e.value} value={e.value}>{e.text}</Select.Option>
                      );
                    })
                  }
                </Select>
              </div>
            </div>
            <div className="row c-form__row">
              <div className="col-md-4 offset-md-3 pl-0 tleft">
                <Button onClick={this.handleContinue} loading={this.state.loading} disabled={this.state.loading}>Continue</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}