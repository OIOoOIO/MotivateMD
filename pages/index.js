import CookieManager from '../services/CookieManager';
import { Modal, Button  } from    'antd';
import AppLayout from '../components/AppLayout';
import Api from '../services/Api';
import moment from 'moment';
import GoalsTab from '../components/progress/goals/GoalsTab';
import ApplicationTab from '../components/progress/application/ApplicationTab';
import { dynamicSort } from '../utils/helpers'
import Footer from '../components/common/Footer'

export default class Index extends React.Component {

  static async getInitialProps({ req, res }) {
    const cm = new CookieManager(req.headers && req.headers.cookie);
    const api = new Api(cm.getIdToken());
    if( cm.getIdToken() ){
	    const back_res = await api.get_progress();
	    if (back_res.data && back_res.data.session && back_res.data.session.logged_in) {
	      if (back_res.data.session.user.ob) {
	        res.redirect('/onboarding');
	        return {};
	      } else {
	        return {
	          ...back_res.data,
	          page_attrs: {
	            title: 'Progress - Motivate MD',
	            description: 'Track your progress of your way into med schools.'
	          },
	          active_page: 'progress'
	        };
	      }
	    } else {
	      res.redirect('/login');
	      return {};
	    }
    } else {
      res.redirect('/login');
      return {};
    }
  }

  constructor(props) {
    super(props);
    //console.log('props=======',props);
    this.state = {
      active_tab:         'goals', // could be [goals, application]
      inboxCount: props.inbox_count,
      education:           props.education,
      mcat:                props.mcat,
      goal_selection:      props.goal_selection,
      s_goal_events:       props.s_goal_events,
      v_goal_events:       props.v_goal_events,
      b_goal_events:    props.b_goal_events,
      extracurs:           props.extracurs,
      personal_statements: props.personal_statements,
      recoms:              props.recoms,
      courses:             props.courses,
      extracur_essays:     props.extracur_essays,
      activity_essays:     props.activity_essays,
      your_notes:          props.your_notes,
      school_list:         props.school_list,
      universities:        props.universities,
      open_all_ge_modal: false,
      currentPage: ""

    }
  }


  componentWillMount() {
    		this.setState({currentPage: "progress"});
  }

  changeEducationInput = (key, value) => {
	  if( (key === 'gpa' || key === 'science_gpa') && parseFloat(value) > 4 ){
		  
	  }else{
		  let education = { ...this.state.education };
		  education[key] = value;
		  this.setState({
			  education: education
		  });
	  }
  }

  changeMcatInput = (key, value) => {
    let mcat = { ...this.state.mcat };
    mcat[key] = value;
    this.setState({
      mcat: mcat
    });
  }

  changeGoalInput = (key, value) => {
    let goal_selection = { ...this.state.goal_selection };
    goal_selection[key] = value;
    this.setState({
      goal_selection: goal_selection
    });
  }

  updateGoalSelection = (goal_selection) => {
    this.setState({
      goal_selection: goal_selection
    });
  }

  updateEducation = (education) => {
    this.setState({
      education: education
    });
  }

  updateMcat = (mcat) => {
    this.setState({
      mcat: mcat
    });
  }

  updateVGoalEvents = (new_ges) => {
    this.setState({
      v_goal_events: new_ges
    });
  }

  updateSGoalEvents = (new_ges) => {
    this.setState({
      s_goal_events: new_ges
    });
  }

  updateExtracurs = (extracurs) => {
    this.setState({
      extracurs: extracurs
    });
  }

  updatePersonalStatements = (personal_statements) => {
    this.setState({
      personal_statements: personal_statements
    });
  }
  updateRecoms = (recoms) => {
    this.setState({
      recoms: recoms
    });
  }
  updateCourses = (courses) => {
    this.setState({
      courses: courses
    });
  }
  updateExtracurEssays = (extracur_essays) => {
    this.setState({
      extracur_essays: extracur_essays
    });
  }
  updateActivityEssays = (activity_essays) => {
    this.setState({
      activity_essays: activity_essays
    });
  }

  updateYourNotes = (your_notes) => {
    this.setState({
      your_notes: your_notes
    });
  }

  updateSchoolList = (school_list) => {
    this.setState({
      school_list: school_list
    });
  }

  updateGoalEventsByNotification = (new_goal) => {

	  console.log('new goal- index =====',new_goal);
	  if( new_goal.kind == "volunteering" ){
		  for( let i=0;i<this.state.v_goal_events.length;i++ ){
			  if( this.state.v_goal_events[i].id == new_goal.id ){
				  this.state.v_goal_events[i] = new_goal;
			  }
		  }
		  this.updateVGoalEvents(this.state.v_goal_events);
	  }else if( new_goal.kind == "shadowing" ){
		  for( let i=0;i<this.state.s_goal_events.length;i++ ){
			  if( this.state.s_goal_events[i].id == new_goal.id ){
				  this.state.s_goal_events[i] = new_goal;
			  }
		  }
		  this.updateSGoalEvents(this.state.s_goal_events);
	  }
  }
  
  handleCloseAllGEModal = () => {
	  let { open_all_ge_modal } = this.state;
	  this.setState({open_all_ge_modal: false});
  }
  
  handleOpenAllGEModal = () => {
	  let { open_all_ge_modal } = this.state;
	  this.setState({open_all_ge_modal: true});
  }

  getSidebar = () => {
	  let { open_all_ge_modal } = this.state;
      let upcomings = [...this.state.s_goal_events, ...this.state.v_goal_events, ...this.state.b_goal_events];
      upcomings = upcomings.sort(dynamicSort("start_date"));
      upcomings = upcomings.filter(e => moment().isBefore(moment(e.start_date)));
      let counter = 0;
      let list = upcomings.map((e,index) => {
        if(counter < 5 && !e.logged) {
        	counter++;
            return (
              <div key={`event_${e.id}`} className="c-upcoming mb-h">
                <div className={"ml-h c-upcoming__tag c-upcoming__tag--" + e.kind}></div>
                <div className="ml-1">
                  <div className="c-upcoming__date">{moment(e.start_date).local().format('MM/DD/YY')}</div>
                  <div className="c-upcoming__duration">{e.duration} Hours { }</div>
                </div>
                <div className="ml-1">
                  <div className="c-upcoming__name">{e.name}</div>
                  <div className="c-upcoming__kind capitalize-text">{e.kind === "extracurs" ? "Work & Activities" : e.kind}</div>
                </div>
              </div>
            );
        }
      });
      let all_event_list = upcomings.map((value,index) => {
    	  if(!value.logged) {
	      	return (
	  			<tr key={`z_${value.title}_${index}`}>
						<td>{moment(value.start_date).local().format('MM/DD/YY')}</td>
						<td className="event-title">{value.name}</td>
						<td className="event-kind capitalize-text">{value.kind === "extracurs" ? "Work & Activities" : value.kind}</td>
						<td>{value.duration}</td>
					</tr>
	      	);
    	  }
      });
      return (
        upcomings.length > 0 ?
          (
            <div className="p-1">
              <div className="mb-h col-c3"><strong>Upcoming Events</strong></div>
              {list}
              <div className="view-more-container">
	          	{
	          		upcomings.length > 5 ?
	      				<div className="view-more-content">
	          				<Button type="dashed" size="small" onClick={this.handleOpenAllGEModal}>View more</Button>
	          				<Modal
	                  	        style={{ top: 64 }}
	                  	        closable={false}
	                  	        width={720}
	                  	        title="Upcoming Events"
	                  	        visible={open_all_ge_modal}
	                  	        onCancel={this.handleCloseAllGEModal}
	          					wrapClassName="all-event-list-wrapper"
	              				footer={
	          			          <div onClick={(e) => e.stopPropagation()}>
	          			            <Button className="c-btn__secondary" key="cancel" onClick={this.handleCloseAllGEModal}>Cancel</Button>
	          			          </div>
	          			        }>
	          					<div>
	      							<table className="all-event-modal-table">
	      								<thead>
	      									<tr>
	      										<th>Date</th>
	  											<th>Title</th>
	  											<th>Duration</th>
												</tr>
											</thead>
											<tbody>
												{all_event_list}
											</tbody>
										</table>
									</div>
	              			</Modal>
	          			</div>
	  				:
	      				null
	          	}
	          </div>
            </div>
          ) : <div className="pl-1 pr-1 pt-1 h3-like tcenter">No Upcoming Event</div>
      );
  }

  render() {
    let { active_tab, goal_selection, education, mcat, v_goal_events, s_goal_events, b_goal_events, extracurs, inboxCount } = this.state;
    let { personal_statements, recoms, courses, extracur_essays, activity_essays, your_notes, school_list, universities } = this.state;
    return (
      <AppLayout inboxCount={inboxCount} {...this.props} navbar sidebar={this.getSidebar()} updateGoalEventsByNotification={this.updateGoalEventsByNotification} currentPage={this.state.currentPage} >
        <div className="c-tabs progress-tabs">
          <div className="pl-1">
            <div
              onClick={() => this.setState({active_tab: 'goals'})}
              className={"c-tabs__tab " + (active_tab === 'goals' ? 'is-active' : '')}>Goals</div>
            <div
              onClick={() => this.setState({active_tab: 'application'})}
              className={"c-tabs__tab " + (active_tab === 'application' ? 'is-active' : '')}>Application</div>
          </div>
          <div className="c-tabs__content">
            <div className="row c-tabs__content__header row mr-0 ml-0 pt-h pb-h progress-table-header">
              <div className="col-2 tright title-column">Goal Title</div>
              <div className="col-7 progress-column">Progress</div>
              <div className="col-3">Goal</div>
            </div>
            {
              active_tab === 'goals' ?
                <GoalsTab
                  education={education}
                  mcat={mcat}
                  s_goal_events={s_goal_events}
                  v_goal_events={v_goal_events}
          		  b_goal_events={b_goal_events}
                  extracurs={extracurs}
                  goal_selection={goal_selection}
                  changeEducationInput={this.changeEducationInput}
                  changeGoalInput={this.changeGoalInput}
                  changeMcatInput={this.changeMcatInput}
                  updateEducation={this.updateEducation}
                  updateExtracurs={this.updateExtracurs}
                  updateGoalSelection={this.updateGoalSelection}
                  updateMcat={this.updateMcat}
                  updateSGoalEvents={this.updateSGoalEvents}
                  updateVGoalEvents={this.updateVGoalEvents} /> :
                <ApplicationTab
                  personal_statements={personal_statements}
                  recoms={recoms}
                  courses={courses}
                  extracur_essays={extracur_essays}
                  activity_essays={activity_essays}
                  updatePersonalStatements={this.updatePersonalStatements}
                  updateRecoms={this.updateRecoms}
                  updateCourses={this.updateCourses}
                  updateExtracurEssays={this.updateExtracurEssays}
                  updateActivityEssays={this.updateActivityEssays}
                  your_notes ={your_notes}
                  updateYourNotes={this.updateYourNotes}
                  school_list = {school_list}
                  universities = {universities}
                  updateSchoolList={this.updateSchoolList}
                />
            }
          </div>
        </div>
        <Footer />
      </AppLayout>
    );
  }
}
