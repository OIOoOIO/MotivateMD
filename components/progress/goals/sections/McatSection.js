import { Button, Progress } from 'antd';
import CookieManager from '../../../../services/CookieManager';
import Api from '../../../../services/Api';
import McatExam from '../../../common/McatExam';
import GoalsModal from '../../../common/GoalsModal';
import GoalProgressBar from '../GoalProgressBar';
import ReactGA from 'react-ga';
import ShowLearnMoreModal from '../../../common/ShowLearnMoreModal';
import userMdSolid from '../../../../assets/images/color_icons/user-md-solid-white.svg';

export default class McatSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      loading: false,
      open_goals: false
    }
    ReactGA.modalview('/Goals/MCAT');
    this.showLearnMoreModalChild = React.createRef();
  }

  handleSubmit = (e) => {
    e.stopPropagation();
    let mcat = this.props.mcat;
    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_mcat(mcat.id, mcat)
      .then(res => {
        this.setState({
          loading: false,
          open: false
        });

        ReactGA.event({ category: 'Goals Tab', action: 'MCAT - Update' });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
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

  totalScore = () => {
    let { chemical_physical, bio, reasoning, social } = this.props.mcat;
    let vals = [];
    vals.push(parseInt(chemical_physical));
    vals.push(parseInt(bio));
    vals.push(parseInt(reasoning));
    vals.push(parseInt(social));
    let score = 0;
    for (var i = 0; i < 4; i++) {
      if (!isNaN(vals[i])) {
        score += vals[i];
      }
    }
    return score;
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
    let { open, open_goals } = this.state;
    let { goal_selection } = this.props;
    let { chemical_physical, bio, reasoning, social, test_date } = this.props.mcat;
    return (
      <div className="c-progress c-progress--goal" onClick={() => this.setState({ open: !open })}>
        <div className="row mr-0 ml-0" style={{alignItems: 'center'}}>
          <div className="col-2 tright c-progress__title progress-title">MCAT</div>
          <div className="col-7 progress-bar">
            {/* <Progress 
              percent={100 * parseFloat(this.totalScore()) / parseFloat(goal_selection.mcat)} 
              showInfo={false} 
              strokeColor="#56d9fe" /> */}
            <GoalProgressBar
              left_text={''}
              done_text={`Currently ${this.totalScore()}`}
              total={goal_selection.mcat}
              completed={this.totalScore()}
              color="#56d9fe" />
          </div>
          <div className="col-2 c-progress__title progress-hrs">
            {goal_selection.mcat} { open ? <a onClick={(e) => {e.stopPropagation(); this.setState({open_goals: true})}}><i className="c-progress__edit_icon i-edit" /></a> : null } 
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
                <McatExam
                  chemical_physical={chemical_physical}
                  bio={bio}
                  reasoning={reasoning}
                  social={social}
                  test_date={test_date}
                  changeInput={this.props.changeMcatInput} />
                <div className="tcenter mt-1 mb-1 mddevice-float-right-cont clearfix">
                  <Button className="alldevice-float-right" onClick={this.handleSubmit} loading={this.state.loading} disabled={this.state.loading}>Update</Button>
                  <div className="col-md-4 offset-md-3 pl-0 tleft">
                  </div>
                </div>
              </div>
              <div className="offset-9 col-2 tright md-btn-cont">
                <a className="c-btn-blue-gradient handle-margin-right" onClick={(e) => this.openMoreLink('The average MCAT score for medical school matriculants is 510-512. Same as your GPA, the MCAT score you need depends on what school you wish to attend. Here’s the good news… A low MCAT score can be balanced with a higher GPA and visa versa. However, some schools do have certain GPA or MCAT “cut-off” limits. Again, be aware of what scores the school you want to attend requires, but more importantly, be aware of what kind of school you want to attend.', "https://www.motivatemd.com/mymentor/mcat/")}><img src={userMdSolid} className="gradient-user-md" /></a>
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
        <ShowLearnMoreModal
                      open={this.state.open_learn_more_link}
                      handleClose={this.closeShowLearnLinkModal}
                      ref={this.showLearnMoreModalChild}
                 />
      </div>
    );
  }
}