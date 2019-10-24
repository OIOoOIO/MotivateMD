import GpaSection from './sections/GpaSection';
import McatSection from './sections/McatSection';
import GoalEventSection from './sections/GoalEventSection';
import ExtraCurSection from './sections/ExtraCurSection';
import ReactGA from 'react-ga';

export default class GoalsTab extends React.Component {

  constructor(props) {
    super(props);
     ReactGA.modalview('/Goals');
  }
  render() {
    let { goal_selection, education, mcat, v_goal_events, s_goal_events, b_goal_events, extracurs } = this.props;
    return (
      <div>
        <GpaSection 
          goal_selection={goal_selection}
          education={education}
          updateGoalSelection={this.props.updateGoalSelection}
          updateEducation={this.props.updateEducation}
          changeGoalInput={this.props.changeGoalInput} 
          changeEducationInput={this.props.changeEducationInput} />
        
        <McatSection
          goal_selection={goal_selection}
          mcat={mcat}
          updateGoalSelection={this.props.updateGoalSelection}
          updateMcat={this.props.updateEducation}
          changeGoalInput={this.props.changeGoalInput} 
          changeMcatInput={this.props.changeMcatInput} />

        <GoalEventSection
          kind='shadowing'
          title='Shadowing'
          color="#ff8373"
          more_text="There is no set amount of shadowing hours you need to be accepted into medical school. The rule of thumb is that you should shadow enough to where you have at least 3-4 physicians who know you on a personal level and would write a knock-out, incredible letter of recommendation for you.  Also, this will give you insight about what life as a physician will really be like. We would recommend every applicant at least shadow 50 hours."
          more_link="https://www.motivatemd.com/mymentor/shadowing/"
          goal_events={s_goal_events}
          goal={goal_selection.shadowing}
          goal_selection={goal_selection}
          updateGoalEvents={this.props.updateSGoalEvents}
          updateGoalSelection={this.props.updateGoalSelection} 
          extracurs={extracurs} 
          updateExtracurs={this.props.updateExtracurs}/>
        
        <GoalEventSection
          kind='volunteering'
          title='Volunteering'
          color="#ffda83"
          more_text="Admittedly, there is no clear data regarding the average number of volunteer hours for medical school matriculants. That said, through our research efforts, our best guess is between 150-200. Our recommendation would be a minimum of 150 hours total with at least 100 of those hours being within a medical setting (e.g. volunteering in your local hospital’s emergency department)."
          more_link="https://www.motivatemd.com/mymentor/volunteering/"
          goal_events={v_goal_events}
          goal={goal_selection.volunteering}
          goal_selection={goal_selection}
          updateGoalEvents={this.props.updateVGoalEvents}
          updateGoalSelection={this.props.updateGoalSelection} 
          extracurs={extracurs} 
          updateExtracurs={this.props.updateExtracurs}/>
        
        <ExtraCurSection
          extracurs={extracurs} 
          goal_selection={goal_selection}
          updateGoalSelection={this.props.updateGoalSelection} 
          updateExtracurs={this.props.updateExtracurs} />
    </div>
    );
  }
}