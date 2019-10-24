import { Button, DatePicker } from 'antd';
import moment from 'moment';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import school_i from '../../assets/images/ob/school.svg';
import { disabledDate } from '../../utils/helpers';
import ReactGA from 'react-ga';

export default class WantBreak extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      education: props.education,
      loading_yes: false,
      loading_no: false
    }
    ReactGA.modalview('/Onboarding - Motivate MD/Education/Want Break');
  }
  handleYes = () => {
    let education = this.props.education;
    education.wants_break = true;
    this.setState({loading_yes: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_education(education.id, education)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Education/Want Break',
    		  action: 'Yes Clicked Success'
    	  });
        this.props.updateEducation(education);
        this.props.updateScreen('break_description');
        this.setState({loading_yes: false});
      })
      .catch(error => {
    	  ReactGA.event({
      		  category: '/Onboarding - Motivate MD/Education/Want Break',
      		  action: 'Yes Clicked Failure'
  	  	  });
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading_yes: false});
      });
  }
  handleNo = () => {
    let education = this.props.education;
    education.wants_break = false;
    this.setState({loading_no: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_education(education.id, education)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Education/Want Break',
    		  action: 'No Clicked Success'
    	  });
        this.props.updateEducation(education);
        this.props.updateScreen('mcat_question');
        this.props.updateStep(1);
        this.setState({loading_no: false});
      })
      .catch(error => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Education/Want Break',
    		  action: 'No Clicked Failure'
  		  });
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading_no: false});
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
    let { loading_no, loading_yes, education } = this.state;
    const dateFormat = 'YYYY/MM/DD';
    const monthFormat = 'MM/YYYY';

    return (
      <div className="tcenter">
        <img src={school_i} style={{width: '30px'}}/>
        <h1 className="h3-like tcenter mb-3 mt-1">Let&apos;s Talk Graduation</h1>
        { !education.graduated ?
          <div>
            <p className="h4-like mb-1">Expected Undergrad Graduation</p>
            <div className="row mb-2">
              <div className="col-md-4 offset-md-4">
                <DatePicker.MonthPicker placeholder="Select Month" 
                  defaultValue={moment(moment(education.expected_graduation).format('MM/YYYY'), monthFormat)}
                  format={monthFormat}
                  disabledDate={disabledDate}
                  onChange={(val)=> this.changeInput('expected_graduation', val)}/>
              </div>
            </div>
          </div> :
            null
        }
        <p className="h4-like mb-1">Do you plan to take a year off between undergrad and med school?</p>
        <div>
          <Button className="mr-h c-btn__secondary"
            onClick={this.handleNo}
            loading={loading_no} 
            disabled={loading_no || loading_yes}>No</Button>
          <Button 
            onClick={this.handleYes}
            loading={loading_yes} 
            disabled={loading_no || loading_yes}>Yes</Button>
        </div>
      </div>
    );
  }
}