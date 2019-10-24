import { Button } from 'antd';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import school_i from '../../assets/images/ob/school.svg'; 
import ReactGA from 'react-ga';

export default class GraduationQuestion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading_yes: false,
      loading_no: false
    }
    ReactGA.modalview('/Onboarding - Motivate MD/Education/Graduation Question');
  }
  handleYes = () => {
    let education = this.props.education;
    education.graduated = true;
    this.setState({loading_yes: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_education(education.id, education)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Education/Graduation Question',
    		  action: 'Yes Clicked Success'
    	  });
        this.props.updateEducation(education);
        this.props.updateScreen('graduation_yes');
        this.setState({loading_yes: false});
      })
      .catch(error => {
    	  ReactGA.event({
      		  category: '/Onboarding - Motivate MD/Education/Graduation Question',
      		  action: 'Yes Clicked Failure'
  	  	  });
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading_yes: false});
      });
  }
  handleNo = () => {
    let education = this.props.education;
    education.graduated = false;
    this.setState({loading_no: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_education(education.id, education)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Education/Graduation Question',
    		  action: 'No Clicked Success'
    	  });
        this.props.updateEducation(education);
        this.props.updateScreen('graduation_no');
        this.setState({loading_no: false});
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Education/Graduation Question',
    		  action: 'No Clicked Failure'
	  	});
        console.log(error);
        this.setState({loading_no: false});
      });
  }
  render() {
    let { loading_no, loading_yes } = this.state;
    return (
      <div className="tcenter">
        <img src={school_i} style={{width: '30px'}}/>
        <h1 className="h3-like tcenter mt-1 mb-3">Tell Us About Your Current Education</h1>
        <p className="h4-like mb-1">Have you graduated college?</p>
        <div>
          <Button className="mr-h c-btn__secondary"
            onClick={(e) => {this.handleNo(); e.preventDefault();}}
            loading={loading_no} 
            disabled={loading_no || loading_yes}>No</Button>
          <Button 
            onClick={(e) => {this.handleYes(); e.preventDefault();}}
            loading={loading_yes} 
            disabled={loading_no || loading_yes}>Yes</Button>
        </div>
      </div>
    );
  }
}