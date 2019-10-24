import { Button } from 'antd';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import McatExam from '../../components/common/McatExam';
import mcat_i from '../../assets/images/ob/mcat.svg';
import ReactGA from 'react-ga';

export default class McatYes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mcat: props.mcat
    }
    ReactGA.modalview('/Onboarding - Motivate MD/MCAT/MCAT Yes');
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
    		  category: '/Onboarding - Motivate MD/MCAT/MCAT Yes',
    		  action: 'Continue Clicked Success'
    	  });
        this.props.updateMcat(mcat);
        this.props.updateScreen('uni_selection');
        this.props.updateStep(1);
        this.setState({loading: false});
      })
      .catch(error => {
    	  ReactGA.event({
      		  category: '/Onboarding - Motivate MD/MCAT/MCAT Yes',
      		  action: 'Continue Clicked Failure'
  	  		});
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }
  totalScore = () => {
    let { mcat } = this.state;
    return parseInt(mcat.chemical_physical) + parseInt(mcat.bio) + parseInt(mcat.reasoning) + parseInt(mcat.social);
  }
  handleContinue = () => {
    let mcat = this.state.mcat;
    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_mcat(mcat.id, mcat)
      .then(res => {
        this.props.updateMcat(mcat);
        this.props.updateScreen('uni_selection');
        this.props.updateStep(1);
        this.setState({loading: false});
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }
  render() {
    let { chemical_physical, bio, reasoning, social, test_date  } = this.state.mcat;
    return (
      <div className="tcenter">
        <img src={mcat_i} style={{width: '30px'}}/>
        <h1 className="h3-like tcenter mt-1 mb-3">How&apos;d You Do?</h1>
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <McatExam
              chemical_physical={chemical_physical}
              bio={bio}
              reasoning={reasoning}
              social={social}
              test_date={test_date}
              changeInput={this.changeInput} />
            <div className="tcenter">
              <Button onClick={this.handleContinue} loading={this.state.loading} disabled={this.state.loading}>Continue</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}