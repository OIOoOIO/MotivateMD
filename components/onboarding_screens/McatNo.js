import { Button, DatePicker } from 'antd';
import moment from 'moment';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import mcat_i from '../../assets/images/ob/mcat.svg';
import { disabledDate } from '../../utils/helpers';
import ReactGA from 'react-ga';

export default class McatNo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mcat: props.mcat,
      loading: false
    }
    ReactGA.modalview('/Onboarding - Motivate MD/MCAT/MCAT No');
  }
  changeInput = (key, value) => {
    let new_mcat = {...this.state.mcat};
    new_mcat[key] = value;
    this.setState({
      mcat: new_mcat
    });
  }
  handleContinue = () => {
    let mcat = this.state.mcat;
    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_mcat(mcat.id, mcat)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/MCAT/MCAT No',
    		  action: 'Continue Clicked Success'
    	  });
        this.props.updateMcat(mcat);
        this.props.updateScreen('uni_selection');
        this.props.updateStep(1);
        this.setState({loading: false});
      })
      .catch(error => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/MCAT/MCAT No',
    		  action: 'Continue Clicked Success'
    	  });
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }
  render() {
    let { mcat } = this.state;
    const dateFormat = 'MM/DD/YY';
    const monthFormat = 'YYYY/MM';
    return (
      <div className="tcenter">
        <img src={mcat_i} style={{width: '30px'}}/>
        <h1 className="h3-like tcenter mt-1 mb-3">When is your MCAT scheduled?</h1>
        <div className="row mb-2">
          <div className="col-md-4 offset-md-4">
            <DatePicker
              defaultValue={moment(mcat.test_date)}
              format={dateFormat}
              disabledDate={disabledDate}
              onChange={(val)=> this.changeInput('test_date', val)}
              placeholder="Test Date" />
          </div>
        </div>
        <div>
          <Button onClick={this.handleContinue} loading={this.state.loading} disabled={this.state.loading}>Continue</Button>
        </div>
      </div>
    );
  }
}