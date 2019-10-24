import { Button } from 'antd';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import mcat_i from '../../assets/images/ob/mcat.svg';
import ReactGA from 'react-ga';

export default class McatQuestion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading_yes: false,
      loading_no: false
    }
    ReactGA.modalview('/Onboarding - Motivate MD/MCAT/MCAT Question');
  }
  handleYes = () => {
    let mcat = this.props.mcat;
    mcat.taken = true;
    this.setState({loading_yes: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_mcat(mcat.id, mcat)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/MCAT/MCAT Question',
    		  action: 'Yes Clicked Success'
    	  });
        this.props.updateMcat(mcat);
        this.props.updateScreen('mcat_yes');
        this.setState({loading_yes: false});
      })
      .catch(error => {
    	  ReactGA.event({
      		  category: '/Onboarding - Motivate MD/MCAT/MCAT Question',
      		  action: 'Yes Clicked Failure'
          });
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading_yes: false});
      });
  }
  handleNo = () => {
    let mcat = this.props.mcat;
    mcat.taken = false;
    this.setState({loading_no: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    mcat.test_date = null
    api.update_mcat(mcat.id, mcat)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/MCAT/MCAT Question',
    		  action: 'No Clicked Success'
    	  });
    	mcat.test_date = new Date()
        this.props.updateMcat(mcat);
        this.props.updateScreen('mcat_no');
        this.setState({loading_no: false});
      })
      .catch(error => {
    	  ReactGA.event({
      		  category: '/Onboarding - Motivate MD/MCAT/MCAT Question',
      		  action: 'No Clicked Failure'
  	  	  });
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading_no: false});
      });
  }
  render() {
    let { loading_no, loading_yes } = this.state;
    return (
      <div className="tcenter">
        <img src={mcat_i} style={{width: '30px'}}/>
        <h1 className="h3-like tcenter mt-1 mb-3">Have you taken the MCAT?</h1>
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