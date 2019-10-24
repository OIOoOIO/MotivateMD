import { Button, Progress, Alert } from 'antd';
import CreditsAndGpa from '../../../common/CreditsAndGpa';
import CookieManager from '../../../../services/CookieManager';
import Api from '../../../../services/Api';
import GoalsModal from '../../../common/GoalsModal';
import DegreesModal from '../../../common/DegreesModal';
import GoalProgressBar from '../GoalProgressBar';
import ReactGA from 'react-ga';
import ShowLearnMoreModal from '../../../common/ShowLearnMoreModal';
import userMdSolid from '../../../../assets/images/color_icons/user-md-solid-white.svg';

export default class GpaSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      loading: false,
      open_goals: false,
      open_degrees: false,
      isCAGError: false
    }
    ReactGA.modalview('/Goals/GPA');
    this.showLearnMoreModalChild = React.createRef();
  }

  handleSubmit = () => {
    let education = this.props.education;
    if( education.gpa && education.science_gpa && education.credits_taken && education.credits_remaining ){
    	this.setState({loading: true});
        const cm = new CookieManager();
        const api = new Api(cm.getIdToken());
        api.update_education(education.id, education)
        .then(res => {
    	    this.setState({
    	      loading: false,
    	      open: false
    	    });
    	    ReactGA.event({ category: 'Goals Tab', action: 'GPA - Update' });
        })
        .catch(error => {
    	    alert('Oops! Something went wrong!');
    	    console.log(error);
    	    this.setState({loading: false});
        });
    }else{
    	this.setState({isCAGError: true});
    }
    
  }

  closeGoalsModal = () => {
    this.setState({
      open_goals: false
    })
  }

  closeDegreesModal = () => {
    this.setState({
      open_degrees: false
    })
  }

  closeShowLearnLinkModal = () => {
      this.setState({
        open_learn_more_link: false
      });
  }

  openMoreLink = (val, more_link) => {
    this.showLearnMoreModalChild.current.setLearnMoreText(val,more_link);
    this.setState({
        open_learn_more_link: true
    })
  }

  render() {
    let { open, open_goals, open_degrees, isCAGError } = this.state;
    let { goal_selection, education } = this.props;
    let errors_if_any = !this.state.isCAGError ? null :
        <div className="col-12 pl-h pr-h mb-1">
          <div className="tleft">
            <Alert
              description={<ul>Please enter valid data.</ul>}
              type="error"
            />
          </div>
        </div>;
    return (
      <div className="c-progress c-progress--goal" onClick={(e) => {this.setState({ open: !open });}}>
        <div className="row mr-0 ml-0" style={{alignItems: 'center'}}>
          <div className="col-2 tright c-progress__title progress-title">GPA</div>
          <div className="col-7 progress-bar">
            <GoalProgressBar
              left_text={''}
              done_text={`Currently ${education.gpa === null? 0 : education.gpa}`}
              total={parseFloat(goal_selection.gpa)}
              completed={parseFloat(education.gpa)}
              color="#4089fb" />
          </div>
          <div className="col-2 c-progress__title progress-hrs">
            {goal_selection.gpa} { open ? <a onClick={(e) => {e.stopPropagation(); this.setState({open_goals: true})}}><i className="c-progress__edit_icon i-edit" /></a> : null } 
          </div>
          <div className="col-1 progress-arrow">
            <a onClick={() => this.setState({ open: !open })}>
              <i className={ open ? "i-angle-up" : "i-angle-down" } />
            </a>
          </div>
        </div>
        {
          open ? 
            <div className="row mr-0 ml-0 mt-1 reponsive-row-cont">
              <div className="offset-2 col-md-10 col-lg-7 clear-left">
                <CreditsAndGpa
                  gpa={education.gpa}
                  science_gpa={education.science_gpa}
                  credits_taken={education.credits_taken}
                  credits_remaining={education.credits_remaining}
                  changeInput={this.props.changeEducationInput} />
                 {errors_if_any}
                <div className="tcenter mt-1 graduated-gpa-btn-cont clearfix">
	                <Button
		                onClick={(e) => {e.stopPropagation(); this.setState({open_degrees: true})}}
		                className="c-btn__secondary graduated-gpa-btn lg-hide xl-hide">Graduated</Button>
                	<Button className="update-btn" onClick={(e) => {e.stopPropagation(); this.handleSubmit()}} loading={this.state.loading} disabled={this.state.loading}>Update</Button>
              </div>
              </div>
              <div className="col-2 tright">
                <Button
                  onClick={(e) => {e.stopPropagation(); this.setState({open_degrees: true})}}
                  className="c-btn__secondary md-hide sm-hide xs-hide">Graduated</Button>
              </div>
              <div className="offset-9 col-2 tright md-btn-cont">
                <a className="c-btn-blue-gradient handle-margin-right" onClick={(e) => this.openMoreLink('The average GPA varies with each school but is usually between 3.6-3.8. The GPA you need depends on several factors like: what school you wish to attend, your MCAT score, your state of residence, etc. The GPA needed to successfully matriculate at Harvard will be very different than those needed to attend an  in-state school or even a DO school. While no applicant wants any deficiencies, they are inevitable; we are not perfect people.', "https://www.motivatemd.com/mymentor/gpa/")}><img src={userMdSolid} className="gradient-user-md" /></a>
              </div>
              <div className="col-1 tright md-btn-blank-cont"></div>
            </div> : 
              null
        }
        <GoalsModal 
          open={open_goals}
          goal_selection={goal_selection}
          updateGoalSelection={this.props.updateGoalSelection}
          handleClose={this.closeGoalsModal} />
        <DegreesModal
          open={open_degrees}
          education={education}
          updateEducation={this.props.updateEducation}
          handleClose={this.closeDegreesModal} />
         <ShowLearnMoreModal
              open={this.state.open_learn_more_link}
              handleClose={this.closeShowLearnLinkModal}
              ref={this.showLearnMoreModalChild}
         />
      </div>
    );
  }
}