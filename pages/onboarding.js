import CookieManager from      '../services/CookieManager';
import AppLayout from          '../components/AppLayout';
import Api from                '../services/Api';
import brandLight from         '../assets/images/brand-light.png';
import GraduationQuestion from '../components/onboarding_screens/GraduationQuestion';
import GraduationYes from      '../components/onboarding_screens/GraduationYes';
import GraduationNo from       '../components/onboarding_screens/GraduationNo';
import WantBreak from          '../components/onboarding_screens/WantBreak';
import BreakDescription from   '../components/onboarding_screens/BreakDescription';
import McatQuestion from       '../components/onboarding_screens/McatQuestion';
import McatYes from            '../components/onboarding_screens/McatYes';
import McatNo from             '../components/onboarding_screens/McatNo';
import UniSelection from       '../components/onboarding_screens/UniSelection';
import GoalSelection from      '../components/onboarding_screens/GoalSelection';
import Deadline from           '../components/onboarding_screens/Deadline';
import { Steps, Icon } from    'antd';

const screens = [
  'graduation_question',
  'graduation_yes',
  'graduation_no',
  'want_break',
  'break_description',
  'mcat_question',
  'mcat_no',
  'mcat_yes',
  'uni_selection',
  'goal_selection',
  'deadline'
];

export default class Onboarding extends React.Component {

  static async getInitialProps({ req, res }) {
    const cm = new CookieManager(req.headers && req.headers.cookie);
    const api = new Api(cm.getIdToken());
    if( cm.getIdToken() ){
	    const back_res = await api.get_onboarding();
	    if (back_res.data && back_res.data.session && back_res.data.session.logged_in) {
		    return {
		      ...back_res.data,
		      page_attrs: {
		        title: 'Onboarding - Motivate MD',
		        description: 'Tell us more about yourself, so we can better serve you.'
		      }
		    };
	    }else{
	    	res.redirect('/login');
	    	return {};
	    }
    }else{
	    res.redirect('/login');
	    return {};
    }
  }

  constructor(props) {
    super(props);
    let user = props.session.user;
    this.state = {
      ob_step:         user.ob_step >= 4 ? 0 : user.ob_step,
      screen:          this.getFirstScreen(0),
      education:       props.education,
      mcat:            props.mcat,
      uni_selections:  props.uni_selections,
      goal_selection:  props.goal_selection,
      application:     props.application,
      universities:    props.universities
    }
  }

  getFirstScreen = (ob_step) => {
    const screens = [
      'graduation_question',
      'mcat_question',
      'uni_selection',
      'goal_selection',
      'deadline'
    ]
    return ob_step < 5 ? screens[ob_step] : null;
  }

  goBack = () => {
    let ob_step = Math.max(this.state.ob_step - 1, 0);
    this.setState({
      ob_step: ob_step,
      screen:  this.getFirstScreen(ob_step)
    });
  }
  skip = () => {
    let ob_step = Math.min(this.state.ob_step + 1, 5);
    this.setState({
      ob_step: ob_step,
      screen:  this.getFirstScreen(ob_step)
    });
  }

  updateStep = (diff) => {
    let new_obstep = this.state.ob_step + diff;
    let intermediate = Math.max(0, new_obstep);
    let final = Math.min(5, intermediate)
    this.setState({ob_step: final});
  }
  updateScreen = (new_screen) => {
    this.setState({screen: new_screen});
  }
  updateEducation = (education) => {
    this.setState({education: education});
  }
  updateMcat = (mcat) => {
    this.setState({mcat: mcat});
  }
  updateUniSelections = (uni_selections) => {
    this.setState({uni_selections: uni_selections});
  }
  updateGoalSelection = (goal_selection) => {
    this.setState({goal_selection: goal_selection});
  }
  updateApplication = (application) => {
    this.setState({application: application});
  }
  render() {
    let { ob_step, screen, education, mcat, goal_selection, uni_selections, universities, application} = this.state;
    let screen_html = null;
    if (screen === 'graduation_question') {
      screen_html = (
        <GraduationQuestion 
          education={education}
          updateEducation={this.updateEducation}
          updateScreen={this.updateScreen} />
      );
    } else if (screen === 'graduation_yes') {
      screen_html = (
        <GraduationYes 
          education={education}
          updateEducation={this.updateEducation}
          updateScreen={this.updateScreen} />
      );
    } else if (screen === 'graduation_no') {
      screen_html = (
        <GraduationNo
          education={education}
          updateEducation={this.updateEducation}
          updateScreen={this.updateScreen} />
      );
    } else if (screen === 'want_break') {
      screen_html = (
        <WantBreak
          education={education}
          updateEducation={this.updateEducation}
          updateScreen={this.updateScreen} 
          updateStep={this.updateStep}
        />
      );
    } else if (screen === 'break_description') {
      screen_html = (
        <BreakDescription
          education={education}
          updateEducation={this.updateEducation}
          updateScreen={this.updateScreen} 
          updateStep={this.updateStep} />
      );
    } else if (screen === 'mcat_question') {
      screen_html = (
        <McatQuestion 
          mcat={mcat}
          updateMcat={this.updateMcat}
          updateScreen={this.updateScreen} 
        />
      );
    } else if (screen === 'mcat_yes') {
      screen_html = (
        <McatYes 
          mcat={mcat}
          updateMcat={this.updateMcat}
          updateScreen={this.updateScreen} 
          updateStep={this.updateStep} />
      );
    } else if (screen === 'mcat_no') {
      screen_html = (
        <McatNo
          mcat={mcat}
          updateMcat={this.updateMcat}
          updateScreen={this.updateScreen} 
          updateStep={this.updateStep} />
      );
    } else if (screen === 'uni_selection') {
      screen_html = (
        <UniSelection
          universities={universities}
          uni_selections={uni_selections}
          updateUniSelections={this.updateUniSelections}
          updateScreen={this.updateScreen} 
          updateStep={this.updateStep} />
      );
    } else if (screen === 'goal_selection') {
      screen_html = (
        <GoalSelection 
          goal_selection={goal_selection}
          updateGoalSelection={this.updateGoalSelection}
          updateScreen={this.updateScreen} 
          updateStep={this.updateStep} />
      );
    } else if (screen === 'deadline') {
      screen_html = (
        <Deadline 
          application={application} 
          updateApplication={this.updateApplication} 
          updateScreen={this.updateScreen} 
          updateStep={this.updateStep} />
      );
    }
    return (
      <AppLayout {...this.props}>
        <div className="l-ob">
          <div className="row ml-0 mr-0">
            <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
              <div className="l-ob__header">
                <img className="l-ob__header__brand" src={brandLight} />
              </div>
              <div className="l-ob__panel">
                <div className="mb-2 xs-hide sm-hide">
                  <Steps current={ob_step} size="small">
                    <Steps.Step title="Education"/>
                    <Steps.Step title="MCAT"/>
                    <Steps.Step title="Top Schools"/>
                    <Steps.Step title="Goals"/>
                    <Steps.Step title="Deadline"/>
                  </Steps>
                </div>
                {screen_html}
                <div className="l-ob__nav mt-3 desc-container">
                  {
                    screen !== 'graduation_question' ? 
                      <a className="l-ob__nav--prev" onClick={(e) => {this.goBack(); e.preventDefault();}}><Icon type="arrow-left" /> Back</a> :
                        null
                  }
                  {
                    screen === 'uni_selection'?
                        <span className="l-ob__uni-selection">You can later add, edit, and sort this list, plus add notes for your each school in the Application tab of your Progress page.</span>
                    : null
                  }
                  {
                    screen !== 'deadline' ? 
                      <a className="l-ob__nav--next" onClick={(e) => {this.skip(); e.preventDefault();}}>Skip <Icon type="arrow-right" /></a> :
                        null
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
}
