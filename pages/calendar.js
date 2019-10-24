import BigCalendar from 'react-big-calendar';
import { Button, Modal, message } from    'antd';
import CookieManager from      '../services/CookieManager';
import AppLayout from          '../components/AppLayout';
import Api from                '../services/Api';
import moment from 'moment'
import window from 'global';
import _ from 'lodash';
import { dynamicSort } from '../utils/helpers';
import GoalEventModal from '../components/common/GoalEventModal';
import GoalProgressBar from '../components/progress/goals/GoalProgressBar';
import Footer from '../components/common/Footer';
import userMdSolid from '../assets/images/color_icons/user-md-solid-white.svg';

// Setup the localizer by providing the moment (or globalize) Object
// to the correct localizer.
const localizer = BigCalendar.momentLocalizer(moment) // or globalizeLocalizer
//let allViews = Object.keys(BigCalendar.Views).map(k => BigCalendar.Views[k])


export default class Calendar extends React.Component {

  static async getInitialProps({ req, res }) {
    const cm = new CookieManager(req.headers && req.headers.cookie);
    const api = new Api(cm.getIdToken());
    if( cm.getIdToken() ){
	    const back_res = await api.get_calendar();
	    if (back_res.data && back_res.data.session && back_res.data.session.logged_in) {
		    return {
		      ...back_res.data,
		      page_attrs: {
		        title: 'Calendar - Motivate MD',
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
    console.log('props=======',props);
    this.state = {
        currentPage: "calendar",
        inboxCount: props.inbox_count,
        application: props.application,
        eventList: props.goal_events,
        extracurs: props.extracurs,
        recom_extracurs: props.recom_extracurs,
        recom_goal_events: props.recom_goal_events,
        goal_selection: props.goal_selection,
        allEventList: [],
        currentCalendarView: "month",
        open_ge_modal: false,
        ge_modal_mode: 'new',
        open_all_ge_modal: false,
        open_tmm_modal: false,
        selected_index: -1,
        set_lock_mode: false,
        current_tmm_modal: {},
        ge_template: {
            kind: "shadowing",
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            start_time: '',
            duration:   '',
            is_extracur: false,
            logged: false,
            recursive_mode: '',
            is_previously_log: false,
            time_zone: new Date().getTimezoneOffset(),
            note: ''
        }
    };
  }

  componentDidMount() {
	  this.setState({currentPage: "calendar"});
  }

  componentWillMount() {
       let allEventList = [];
        this.state.eventList.map((eventObject) => {
        	eventObject.startDate = new Date(eventObject.start_date);
        	eventObject.endDate = new Date(eventObject.end_date);
        	eventObject.allDay = false;
        	allEventList.push(eventObject);
        	//allEventList.push({title: eventObject.title, kind: eventObject.kind, startDate: new Date(eventObject.start_date), endDate: new Date(eventObject.end_date), allDay: false})
        });
        this.state.extracurs.map((eventObject) => {
        	eventObject.startDate = new Date(eventObject.start_date);
        	eventObject.endDate = new Date(eventObject.end_date);
        	eventObject.kind = "extracurs";
        	eventObject.allDay = false;
        	//allEventList.push(eventObject);
        	//allEventList.push({title: eventObject.title, kind: "extracurs", startDate: new Date(eventObject.start_date), endDate: new Date(eventObject.end_date), allDay: false})
        });
        
        this.setState({
           allEventList: allEventList,
        });
  }
  
  closeGEModal = () => {
	  this.setState({
		  open_ge_modal: false
	  });
  }
  
  getLoggedHrs = (kind) => {
	  let logged = 0;
	  if( kind === "extracurs" ){
		  this.state.recom_extracurs.map((eventObject) =>{
			  if (eventObject.logged) {
		    	  logged += 1;
		      }
		  });
	  }else if( kind === "shadowing" || kind === "volunteering" ){
		  this.state.recom_goal_events.map((eventObject) =>{
			  if( kind === "shadowing" && eventObject.kind === "shadowing" ){
				  if (eventObject.logged) {
			    	  logged += parseFloat(eventObject.duration);
			      }
			  }else if( kind === "volunteering" && eventObject.kind === "volunteering" ){
				  if (eventObject.logged) {
			    	  logged += parseFloat(eventObject.duration);
			      }
			  }
		  });
	  }
	  return logged;
  }
  
  handleOpenAllGEModal = () => {
	  let { open_all_ge_modal } = this.state;
	  this.setState({open_all_ge_modal: true});
  }
  
  handleCloseAllGEModal = () => {
	  let { open_all_ge_modal } = this.state;
	  this.setState({open_all_ge_modal: false});
  }
  
  calculateRecomdVol = (catValue,catLabel) => {
	  let { application } = this.state;
	  let completedCatValue = this.getLoggedHrs(catLabel);
	  let leftCatValue = parseInt(catValue) - parseInt(completedCatValue);
	  let notRoundRecomdValue = (leftCatValue * 30) / application.days;
	  let recomdValue;
	  if( catValue ){
		  if( notRoundRecomdValue > 0 && notRoundRecomdValue < 1 ){
			  recomdValue = 1;
		  }else{
			  recomdValue = Math.round((leftCatValue * 30) / application.days);
		  }
	  }else{
		  recomdValue = 0;
	  }
	  return recomdValue;
  }
  
  getSidebar = () => {
	  	let { goal_selection, open_all_ge_modal } = this.state;
        let extracursList = this.state.extracurs.map((extraEvent,index) => {
	  		extraEvent.kind = "extracurs";
	  		return extraEvent;
	  	});
        let upcomings = [...this.state.eventList, ...extracursList];
        upcomings = upcomings.sort(dynamicSort("start_date"));
        upcomings = upcomings.filter((e,index) => {
        	if( moment().isBefore(moment(e.start_date)) && !e.logged ){
        		return e;
        	}
    	});
        let list = upcomings.map((e,index) => {
    	  if(index < 5) {
              return (
                <div key={`event_${index}`} className="c-upcoming mb-h">
                  <div className={"ml-h c-upcoming__tag c-upcoming__tag--" + e.kind}></div>
                  <div className="ml-1">
                    <div className="c-upcoming__date">{moment(e.start_date).local().format('MM/DD/YY')}</div>
                    <div className="c-upcoming__duration">{e.duration} Hours { }</div>
                  </div>
                  <div className="ml-1">
                    <div className="c-upcoming__name">{e.title}</div>
                    <div className="c-upcoming__kind capitalize-text">{e.kind === "extracurs" ? "Work & Activities" : (e.kind === "team_motivate_md" ? "Team Motivate MD" : e.kind)}</div>
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
						<td className="event-kind capitalize-text">{value.kind === "extracurs" ? "Work & Activities" : (value.kind === "team_motivate_md" ? "Team Motivate MD" : value.kind)}</td>
						<td>{value.duration}</td>
					</tr>
	        	);
        	}
        });
        return (
            <div>
            {
                upcomings.length > 0 ?
                (
                  <div className="p-1">
                    <div className="mb-h col-c3"><strong>Upcoming Goal Events</strong></div>
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
	                    								<th>Kind</th>
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
                ) : (<div className="pl-1 pr-1 pt-1 h3-like tcenter">No Upcoming Event</div>)
            }
            <hr/>
            {
              <div className="p-1 recommendations-container recommendations-container-block">
                <div className="mb-h col-c3 recommendations-title"><strong className="gradient-text-color"><div className="gradient-md-container"><img src={userMdSolid} className="gradient-user-md" /></div>Recommendations</strong>
                <p className="mt-h recommendations-sub-title">PRO TIP: Use your goals to help map out your calendar.</p></div>
                <div className="row mr-0 ml-0 progress-container" style={{alignItems: 'center'}}>
	                <div className="col-2 tright c-progress__title">Shadowing</div>
	                <div className="col-10 recommendations-progress-bar">
	                  <GoalProgressBar
	                    left_text={`${(goal_selection.shadowing - this.getLoggedHrs('shadowing') > 0 ? goal_selection.shadowing - this.getLoggedHrs('shadowing') : 0)} Hours Left`}
	                    done_text={`Completed ${this.getLoggedHrs('shadowing')} Hours`}
	                    total={goal_selection.shadowing}
	                    completed={this.getLoggedHrs('shadowing')}
	                    color="#ff8373" />
	                </div>
	                <div className="col-2 empty-column"></div>
	                <div className="col-10 suggest-msg">We suggest <strong>{this.calculateRecomdVol(goal_selection.shadowing,'shadowing')} Hours per month</strong> to make your goal.</div>
                </div>
                <div className="row mr-0 ml-0 progress-container" style={{alignItems: 'center'}}>
	                <div className="col-2 tright c-progress__title">Volunteering</div>
	                <div className="col-10 recommendations-progress-bar">
	                  <GoalProgressBar
	                    left_text={`${(goal_selection.volunteering - this.getLoggedHrs('volunteering') > 0 ? goal_selection.volunteering - this.getLoggedHrs('volunteering') : 0)} Hours Left`}
	                    done_text={`Completed ${this.getLoggedHrs('volunteering')} Hours`}
	                    total={goal_selection.volunteering}
	                    completed={this.getLoggedHrs('volunteering')}
	                    color="#ffda83" />
	                </div>
                    <div className="col-2 empty-column"></div>
	                <div className="col-10 suggest-msg">We suggest <strong>{this.calculateRecomdVol(goal_selection.volunteering,'volunteering')} Hours per month</strong> to make your goal.</div>
	            </div>
	            <div className="row mr-0 ml-0 progress-container" style={{alignItems: 'center'}}>
	                <div className="col-2 tright c-progress__title">Work & Activities</div>
	                <div className="col-10 recommendations-progress-bar">
		                <GoalProgressBar
			                left_text={`${(goal_selection.extra_curs - this.getLoggedHrs('extracurs') > 0 ? goal_selection.extra_curs - this.getLoggedHrs('extracurs') : 0)} Activities Left`}
			                done_text={`Completed ${this.getLoggedHrs('extracurs')} Activities`}
			                total={goal_selection.extra_curs}
			                completed={this.getLoggedHrs('extracurs')}
			                color="#a3a1f8" />
	                </div>
	                <div className="col-2 empty-column"></div>
	                <div className="col-10 suggest-msg">We suggest <strong>{this.calculateRecomdVol(goal_selection.extra_curs,'extracurs')} activity per month</strong> to make your goal.</div>
	            </div>
              </div>
            }
            </div>
        );
  }

  onView = (param) => {
	  this.setState({currentCalendarView: param});
  }
  
  handleAddNewEvent = () => {
	  //message.info("Coming soon...");
	  this.setState({set_lock_mode: false});
	  this.openForCreate();
  }
  
  updateGoalEvents = (new_ge) => {
	  new_ge.end_date = moment(new_ge.start_date).add(new_ge.duration, 'hours');
      if (this.state.ge_modal_mode === 'new') {
    	  let new_ges = [...this.state.eventList, new_ge];
          this.setState({
        	  eventList: new_ges
          });
      } else {
    	  let old_ges = [...this.state.eventList];
          old_ges[this.state.selected_index] = new_ge;
          this.setState({
        	  eventList: old_ges
          });
      }
      this.componentWillMount();
  }
  
  openForCreate = () => {
	    let goal_event = this.state.ge_template;
	    let timeFormat = 'h:mm a';
	    let dateFormat = 'MM/DD/YY';
	    let default_start_date = moment().format(dateFormat);

	    let default_start_time = moment().format(timeFormat);
	    let temp = default_start_time.split(':')[1]
	    let hour = default_start_time.split(':')[0]
	    let temp1 = temp.split(' ')[0]
	    let min = 0
	    temp1 < 15 ? min = '00' : (temp1 > 15 && temp1 < 45) ? min = 30 : min = 60

	    min === 60 ? hour = (parseInt(hour) + 1) : null
	    if (hour > 12){
	        hour = hour%12
	    }

	    hour < 10 ? hour = '0'+hour : null
	    min === 60 ? min = '00' : null
	    default_start_time = hour +':'+min+' '+temp.split(' ')[1]

	    goal_event['start_date'] = default_start_date
	    goal_event['start_time'] = default_start_time;
	    goal_event['recursive_mode'] = 'no-repeat'

	    this.setState({
	    	ge_modal_mode: 'new',
	    	open_ge_modal: true,
	    	ge_template: goal_event
	    });
  }
  
  openForEdit = (currentEvent) => {
	  let { allEventList } = this.state;
	  let currentEventIndex = -1;
	  for( let i=0;i<allEventList.length;i++ ){
		  if( allEventList[i].id === currentEvent.id ){
			  currentEventIndex = i;
			  break;
		  }
	  }
	  this.setState({
		  ge_modal_mode: 'edit',
		  set_lock_mode: true,
		  selected_index: currentEventIndex,
	      open_ge_modal: !currentEvent.logged
	  });
  }
  
  handleCloseTMMModal = () => {
	  this.setState({open_tmm_modal: false});
  }
  
  openTMMEventPopup = (currentEvent) => {
	  this.setState({open_tmm_modal: true});
	  this.setState({current_tmm_modal: currentEvent});
  }

  render() {
    let { allEventList, eventList, ge_modal_mode, open_ge_modal, ge_template, selected_index, currentCalendarView, set_lock_mode, open_tmm_modal, current_tmm_modal, inboxCount } = this.state;
    const minTime = new Date();
    minTime.setHours(6,0,0);
    const maxTime = new Date();
    maxTime.setHours(22,0,0);
    return (
      <AppLayout inboxCount={inboxCount} currentPage={this.state.currentPage} {...this.props} navbar sidebar={this.getSidebar()}>
          <div className={"calendar-container "+currentCalendarView}>
              <BigCalendar
                  events={allEventList}
                  views={{ month: true, week: true, day: true}}
          		  onView={this.onView}
          		  timeslots={2}
              	  min={minTime}
              	  max={maxTime}
                  showMultiDayTimes
                  defaultDate={new Date()}
                  localizer={localizer}
                  style={{height: `-webkit-fill-available`}}
                  startAccessor='startDate'
                  endAccessor='endDate'
                  eventPropGetter={
                      (event, startDate, endDate) => {
                        let newStyle = {
                          backgroundColor: "#ff8373",
                          color: '#fff',
                          borderRadius: "2px",
                          border: "none"
                        };
                        if (event.kind === 'volunteering'){
                          newStyle.backgroundColor = "#ffda83";
                        }else if( event.kind === "extracurs" ){
                        	newStyle.backgroundColor = "#a3a1f8";
                        }else if( event.kind === "team_motivate_md" ){
                        	newStyle.backgroundColor = "#08a5e1";
                        }
                        return {
                          className: "",
                          style: newStyle
                        };
                      }
            	  }
              	onSelectEvent={
            		  (event) => {
            			  if( event.kind === 'volunteering' || event.kind === 'shadowing' ){
            				  this.openForEdit(event);
            			  }else if( event.kind === 'team_motivate_md' ){
            				  this.openTMMEventPopup(event);
            			  }
        			  }
    		  	}
              />
              <div className="add-new-event-container">
              	<Button onClick={(e) => {this.handleAddNewEvent(); e.stopPropagation();}} type="primary" shape="circle" icon="plus" />
          		<div className="sng-text">Schedule New Event</div>
      		</div>
      		<GoalEventModal
	      		lock_kind={set_lock_mode}
	            open={open_ge_modal}
	            mode={ge_modal_mode}
	            goal_events={allEventList}
      			goal_event={ge_modal_mode === 'new' ? ge_template : allEventList[selected_index]}
	            updateGoalEvents={this.updateGoalEvents}
	            extracurs={this.props.extracurs}
	            updateExtracurs={this.props.updateExtracurs}
	            handleClose={this.closeGEModal} />
        
      		<Modal
		      style={{ top: 64 }}
		      closable={false}
		      width={720}
			  title={current_tmm_modal.title}
		      visible={open_tmm_modal}
		      onCancel={this.handleCloseTMMModal}
			  wrapClassName="tmm-event-wrapper"
			  footer={
			  <div onClick={(e) => e.stopPropagation()}>
	          	<Button className="c-btn__secondary" key="cancel" onClick={this.handleCloseTMMModal}>Cancel</Button>
	      	  </div>
		      }>
			  <div>
				<div className="tmm-event-desc" dangerouslySetInnerHTML={{__html: current_tmm_modal.description}}></div>
			  </div>
		    </Modal>
  		</div>
  		<Footer />
      </AppLayout>
    );
  }
}
