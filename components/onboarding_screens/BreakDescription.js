import { Button, Input } from 'antd';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import school_i from '../../assets/images/ob/school.svg';
import ReactGA from 'react-ga';

export default class BreakDescription extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      education: props.education,
      loading: false
    }
    ReactGA.modalview('/Onboarding - Motivate MD/Education/Break Description');
  }
  handleContinue = () => {
    let education = this.state.education;
    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_education(education.id, education)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Education/Break Description',
    		  action: 'Continue Clicked Success'
    	  });
        this.props.updateEducation(education);
        this.props.updateScreen('mcat_question');
        this.props.updateStep(1);
        this.setState({loading: false});
      })
      .catch(error => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Education/Break Description',
    		  action: 'Continue Clicked Failure'
		  });
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }
  changeInput = (key, value) => {
    let new_education = {...this.state.education};
    new_education[key] = value;
    this.setState({
      education: new_education
    });
  }
  render() {
    let { break_description } = this.state.education;
    return (
      <div className="tcenter">
        <img src={school_i} style={{width: '30px'}}/>
        <h1 className="h3-like tcenter mt-1 mb-3">What&apos;s Happening During That Year?</h1>
        <div className="row mb-2">
          <div className="col-md-8 offset-md-2">
            <Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} 
              value={break_description}
              style={{resize: 'none'}}
              onChange={(e) => this.changeInput('break_description', e.target.value)}
              placeholder="Give us some details about how you'll plan on spending that year. This will help us come up with suggestions on how to maximize your time..." />
          </div>
        </div>
        <div>
        <Button onClick={this.handleContinue} loading={this.state.loading} disabled={this.state.loading}>Continue</Button>
        </div>
      </div>
    );
  }
}