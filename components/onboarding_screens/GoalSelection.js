import { Button, Input, DatePicker } from 'antd';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import Goals from '../common/Goals';
import goals_i from '../../assets/images/ob/goals.svg';
import ReactGA from 'react-ga';

export default class GoalSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      goal_selection: props.goal_selection
    }
    ReactGA.modalview('/Onboarding - Motivate MD/Goals/Goal Selection');
  }
  changeInput = (key, value) => {
	  if( key === 'gpa' && parseFloat(value) > 4 ){
		  
	  }else if( key === 'extra_curs' && (parseInt(value) > 15 || parseFloat(value) > 15) ){
		  
	  }else{
		  let goal_selection = {...this.state.goal_selection};
		  goal_selection[key] = value;
		  this.setState({
			  goal_selection: goal_selection
		  });
	  }
  }
  handleContinue = () => {
    let goal_selection = this.state.goal_selection;
    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_goal_selection(goal_selection.id, goal_selection)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Goals/Goal Selection',
    		  action: 'Continue Clicked Success'
    	  });
        this.props.updateGoalSelection(goal_selection);
        this.props.updateScreen('deadline');
        this.props.updateStep(1);
        this.setState({loading: false});
      })
      .catch(error => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Goals/Goal Selection',
    		  action: 'Continue Clicked Failure'
    	  });
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }
  render() {
    let { gpa, mcat, shadowing, volunteering, extra_curs, recoms } = this.state.goal_selection;
    return (
      <div className="tcenter">
        <img src={goals_i} style={{width: '30px'}}/>
        <h1 className="h3-like tcenter mb-3 mt-1">Set Some Goals</h1>
        <div className="row">
          <div className="col-md-5 offset-md-3">
            <Goals
              gpa={gpa}
              mcat={mcat}
              shadowing={shadowing}
              volunteering={volunteering}
              extra_curs={extra_curs}
              recoms={recoms}
              changeInput={this.changeInput} />
            <div className="row c-form__row mt-2">
              <div className="col-md-5 c-form__label c-form__label--left pl-0 pr-0">
                <Button onClick={this.handleContinue} loading={this.state.loading} disabled={this.state.loading}>Continue</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}