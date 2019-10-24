import { Button, DatePicker } from 'antd';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import moment from 'moment';
import calendar_i from '../../assets/images/ob/calendar.svg';
import { disabledDate } from '../../utils/helpers';
import ReactGA from 'react-ga';

export default class Deadline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      application: props.application,
      loading: false
    }
    ReactGA.modalview('/Onboarding - Motivate MD/Deadlines/Deadline');
  }
  changeInput = (key, value) => {
    let new_application = {...this.state.application};
    new_application[key] = value;
    this.setState({
      application: new_application
    });
  }
  handleContinue = () => {
    let application = this.state.application;
    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_application(application.id, application)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Deadlines/Deadline',
    		  action: 'Continue Clicked Success'
    	  });
        this.props.updateApplication(application);
        this.props.updateStep(1);
        this.setState({loading: false});
        window.location.href = '/';
      })
      .catch(error => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Deadlines/Deadline',
    		  action: 'Continue Clicked Failure'
    	  });
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }
  render() {
    let { deadline } = this.state.application;
    const dateFormat = 'MM/DD/YYYY';
    return (
      <div className="tcenter">
        <img src={calendar_i} style={{width: '30px'}}/>
        <h1 className="h3-like tcenter mb-3 mt-1">Let&apos;s Set a Deadline</h1>
        <p className="h4-like mb-1">When do you plan on submitting your medical school application?</p>
        <div className="row mb-2">
          <div className="col-md-4 offset-md-4">
            <DatePicker
              allowClear={false}
              defaultValue={moment(deadline)}
              format={dateFormat}
              disabledDate={disabledDate}
              onChange={(val)=> this.changeInput('deadline', val)}
              placeholder="Test Date" />
          </div>
        </div>
        <div>
        <Button onClick={this.handleContinue} loading={this.state.loading} disabled={this.state.loading}>Finish</Button>
        </div>
      </div>
    );
  }
}