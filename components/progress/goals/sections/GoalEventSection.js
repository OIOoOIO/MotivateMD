import { Button, Progress, Popover, Input, DatePicker, message } from 'antd';
import CookieManager from '../../../../services/CookieManager';
import Api from '../../../../services/Api';
import GoalsModal from '../../../common/GoalsModal';
import GoalEventModal from '../../../common/GoalEventModal';
import ShadowingLogListModal from '../../../common/ShadowingLogListModal';
import moment from 'moment';
import InputMask from 'react-input-mask';
import Loader from '../../../common/Loader';
import GoalProgressBar from '../GoalProgressBar';
import { disabledDate, dynamicSort } from '../../../../utils/helpers';
import ReactGA from 'react-ga';
import ShowLearnMoreModal from '../../../common/ShowLearnMoreModal';
import userMdSolid from '../../../../assets/images/color_icons/user-md-solid-white.svg';

export default class GoalEventSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      open_goals: false,
      open_ge_modal: false,
      open_shadowing_list_modal: false,
      ge_modal_mode: 'new',
      goal_events: props.goal_events,
      selected_index: -1,
      ge_template: {
        kind: props.kind,
        title: '',
        description: '',
        start_date: '',
        start_time: '',
        duration:   '',
        is_extracur: false,
        logged: false,
        recursive_mode: '',
        is_previously_log: false,
        time_zone: new Date().getTimezoneOffset(),
        note: '',
        ge_index: ''
      },
      new_ge: {
        kind: props.kind,
        title: '',
        description: '',
        start_date: '',
        start_time: '',
        duration: '',
        is_extracur: false,
        logged: true,
        recursive_mode: '',
        is_previously_log: false,
        time_zone: new Date().getTimezoneOffset(),
        note: ''
      },
      loading_edit: false,
      loading_new: false,
      loading_delete: false,
      log_list_title: '',
      open_learn_more_link: false,
      learn_more_text: ""
    }
    ReactGA.modalview('/Goals/GoalEvent');
    this.showLearnMoreModalChild = React.createRef();
  }

  componentWillReceiveProps({props}) {
      this.setState({goal_events: this.state.goal_events})
  }


  closeGoalsModal = () => {
    this.setState({
      open_goals: false
    });
  }

  closeGEModal = () => {
    this.setState({
      open_ge_modal: false
    });
  }

  closeShowLearnLinkModal = () => {
      this.setState({
        open_learn_more_link: false
      });
  }

  closeShadowingListModal = () => {
      this.setState({
        open_shadowing_list_modal: false
      });
  }

  updateGoalEvents = (new_ge) => {
    if (this.state.ge_modal_mode === 'new') {
      let new_ges = [...this.state.goal_events, new_ge];
      this.setState({
        goal_events: new_ges
      });
      this.props.updateGoalEvents(new_ges);
    } else {
      let old_ges = [...this.state.goal_events];
      let current_index_recursive_mode = old_ges[this.state.selected_index];
      old_ges[this.state.selected_index] = new_ge;
      this.setState({
        goal_events: old_ges
      });

      this.props.updateGoalEvents(old_ges);
      if(current_index_recursive_mode !== old_ges[this.state.selected_index]){
        //window.location.reload();
      }
    }
    if(new_ge.is_extracur){
        //window.location.reload();
    }
  }


  updateGoalLogEvents = (new_ge, selected_index) => {
        let old_ges = [...this.state.goal_events];
        old_ges[selected_index] = new_ge;
        this.setState({
          goal_events: old_ges
        });
        this.props.updateGoalEvents(old_ges);
  }

  deleteFromGoalEvents = (i) => {
    let old_ges = [...this.state.goal_events];
    old_ges.splice(i, 1);
    this.setState({
      goal_events: old_ges
    });
    this.props.updateGoalEvents(old_ges);
    let closePop = true;
    for(var i=0;i<this.state.goal_events.length; i++){
        if(this.state.goal_events[i].logged){
           closePop = false
        }
    }
    if(closePop){
        this.closeShadowingListModal();
    }
  }

  openForCreate = (e) => {
    e.stopPropagation();


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
    })
  }

  showLogList = (e, event_obj) => {
    e.stopPropagation();
    this.setState({
      open_shadowing_list_modal: true,
      log_list_title: event_obj.log_name
    })
  }


  openForEdit = (e, i) => {
    e.stopPropagation();
    let { goal_events } = this.state;
    this.setState({
      ge_modal_mode: 'edit',
      selected_index: i,
      open_ge_modal: !goal_events[i].logged
    })
  }

  delete = (e, i) => {
    e.stopPropagation();
    let id = this.state.goal_events[i].id;
    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    let operation = "event";
    if(this.state.goal_events[i].logged){
       operation = "log";
    }
    ReactGA.event({ category: 'Goals Tab', action: this.state.goal_events[i].kind+' '+operation+' - deleted' });
    api.delete_goal_event(id)
      .then(res => {
        this.deleteFromGoalEvents(i);

      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }

  getLoggedHrs = () => {
    let logged = 0;
    for(var i = 0; i < this.state.goal_events.length; i++) {
      let ge = this.state.goal_events[i];
      if (ge.logged) {
        logged += parseFloat(ge.duration);
      }
    }
    return logged;
  }

  changeGE = (i, key, value, is_valid=true) => {
    if (is_valid) {
      let goal_events = [...this.state.goal_events];
      let ge = {...goal_events[i]};
      ge[key] = value;
      goal_events[i] = ge;
      this.setState({
        goal_events: goal_events
      });
    }
  }

  getEvents = () => {
    let { loading_edit } = this.state;
    let dateFormat = 'MM/DD/YY';
    let events = {
      logged: [],
      upcoming: []
    }
    let event_count = 0;
    let upcoming_events = [];
    for(var i = 0; i < this.state.goal_events.length; i++) {
      let ge = this.state.goal_events[i];
      let index = i;
      if (ge.logged) {
        let html = null;

        if(ge.start_date !== undefined){
            ge.start_date = ge.starts_at
        }
        if (this.state.selected_index === index) {
          html = (
            <tr key={`x_${i}`} onClick={(e) => e.stopPropagation()}>
              
              
            </tr>
            
          );
        } else {
          //html = (
            /*<tr key={`y_${ge.name}_${i}`}>
              <td className="pb-h">{ge.start_date}</td>
              <td className="pb-h">{ge.name}</td>
              <td className="pb-h">{ge.duration}</td>
              <td className="pb-h">
                <i className="i-edit c-getable__edit_btn mr-h" onClick={(e) => this.openForEdit(e, index)} />
                <i className="i-close c-getable__delete_btn" onClick={(e) => this.delete(e, index)} />
              </td>
            </tr>
            <tr>
               <td className="pb-h">{log_start_date}</td>
               <td className="pb-h">{log_end_date}</td>
                <td className="pb-h">{ge.name}</td>
                <td className="pb-h">{ge.duration}</td>
            </tr>*/
         // );
        }
        events.logged.push(html);
      } else {
           ge.ge_index = index;
           upcoming_events.push(ge)
          /* let html = (
             <tr key={`z_${ge.title}_${i}`}>
               <td className="pb-h">{moment(ge.start_date).local().format('MM/DD/YY')}</td>
               <td className="pb-h">{ge.name}</td>
               <td className="pb-h">{ge.duration}</td>
               <td className="pb-h">
                 <i className="i-edit c-getable__edit_btn mr-h" onClick={(e) => this.openForEdit(e, index)} />
                 <i className="i-close c-getable__delete_btn" onClick={(e) => this.delete(e, index)} />
               </td>
             </tr>
           );
           events.upcoming.push(html);*/
      }
    }

    upcoming_events = upcoming_events.sort(dynamicSort("start_date"));
    for(var i = 0; i < upcoming_events.length; i++) {
        let ge = upcoming_events[i];
        if(new Date(ge.start_date) > new Date()){
             if(event_count < 5 ){
                let html = (
                  <tr className="card-list" key={`z_${ge.title}_${i}`}>
	                  <td className="pb-h">{moment(ge.start_date).local().format('MM/DD/YY')}</td>
	                  <td className="pb-h">{ge.name}</td>
	                  <td className="pb-h">{ge.duration}</td>
	                  <td className="pb-h">
	                    <i className="i-edit c-getable__edit_btn mr-h" onClick={(e) => this.openForEdit(e, ge.ge_index)} />
	                    <i className="i-close c-getable__delete_btn" onClick={(e) => this.delete(e, ge.ge_index)} />
	                  </td>
	                  <td className="card-container" colSpan="4">
	  		      		<p>{ge.name} <span className="event-duration">{ge.duration} hrs</span></p>
	  		      		<p className="event-date">{moment(ge.start_date).local().format('MM/DD/YY')}
	  		      			<span className="event-actions">
		  		      			<i className="i-edit c-getable__edit_btn mr-h" onClick={(e) => this.openForEdit(e, ge.ge_index)} />
			  		            <i className="i-close c-getable__delete_btn" onClick={(e) => this.delete(e, ge.ge_index)} />
		  		            </span>
		  		        </p>
	  		          </td>
                  </tr>
                );
                events.upcoming.push(html);
                event_count = event_count + 1
             }
         }
    }

    return events;
  }

  viewError = (issues) => {
    let fields_str = '';
    for(var i = 0; i < issues.length; i++) {
      fields_str += (i === issues.length - 1 ? issues[i] : `${issues[i]}, `);
    }
    message.error('These fields are required: ' + fields_str);
  }

  handleAddLogged = () => {
    let goal_event = this.state.new_ge;
    let issues = [];
    if (goal_event.start_date === '') {
      issues.push('Date');
    }
    if (goal_event.duration === '') {
      issues.push('Duration');
    }
    if (goal_event.title === '') {
      issues.push('Title')
    }
    if (issues.length > 0) {
      this.viewError(issues);
      return;
    }
    if (goal_event.start_time === '') {
      let timeFormat = 'h:mm a';
      let default_start_time = moment().format(timeFormat);
      goal_event.start_time = default_start_time;
    }
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    this.setState({ loading_new: true });
    api.create_goal_event(goal_event)
      .then(res => {
        this.updateGoalEvents(res.data.goal_event);
        this.setState({
          new_ge: {...this.state.ge_template, logged: true},
          loading_new: false
        });
        ReactGA.event({ category: 'Goals Tab', action: res.data.goal_event.kind+' Log  - added' });
        window.location.reload();
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({ loading_new: false });
      });
  }
  handleUpdateLogged = () => {
    let { goal_events, selected_index } = this.state;
    let goal_event = goal_events[selected_index];
    let issues = [];
    if (goal_event.start_date === '') {
      issues.push('Date');
    }
    if (goal_event.duration === '') {
      issues.push('Duration');
    }
    if (goal_event.title === '') {
      issues.push('Title')
    }
    if (issues.length > 0) {
      this.viewError(issues);
      return;
    }
    this.setState({ loading_edit: true });
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_goal_event(goal_event.id, goal_event)
      .then(res => {
        this.updateGoalEvents(res.data.goal_event);
        this.setState({
          selected_index: -1,
          loading_edit: false
        });
        ReactGA.event({ category: 'Goals Tab', action: res.data.goal_event.kind+' log  - updated' });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({ loading_edit: false });
      });
  }
  detectEnterForUpdate = (e) => {
    if(e.key === 'Enter'){
      this.handleUpdateLogged();
    }
  }
  detectEnterForCreate = (e) => {
    if(e.key === 'Enter'){
      this.handleAddLogged();
    }
  }
  changeNewGE = (key, val, is_valid=true) => {
    if (is_valid) {
    	if( key === "duration" && val > 99999 ){
    		
    	}else{
    		let new_ge = {...this.state.new_ge};
    		new_ge[key] = val;
    		this.setState({
    			new_ge: new_ge
    		});
    	}
    }
  }

  validDuration = (val) => {
    return (val === '' || (val.match(/[a-zA-Z]/) === null && !isNaN(parseFloat(val))));
  }

  openMoreLink = (val, more_link) => {
    this.showLearnMoreModalChild.current.setLearnMoreText(val,more_link);
    this.setState({
        open_learn_more_link: true
    })
  }


  render() {
    let { loading_new, open, open_goals, open_ge_modal, ge_modal_mode, ge_template, new_ge, goal_events, selected_index, open_shadowing_list_modal } = this.state;
    let { goal, goal_selection, title, color } = this.props;
    let { logged, upcoming } = this.getEvents();
    let dateFormat = 'MM/DD/YY';


    let log_end_date = ''
    let log_start_date = ''
    let log_name = ''
    let log_duration = 0

    let goal_event_log_list = []
    for(var i = 0; i < this.state.goal_events.length; i++) {
        let goal_log = this.state.goal_events[i];
        let goal_log_obj = {}
        log_duration = 0
        log_start_date = ''
        if(goal_log.logged){
            log_name = this.state.goal_events[i].title
            log_duration = log_duration + goal_log.duration

            if(log_start_date === ''){
            	log_start_date =  this.state.goal_events[i].start_date
            }else{
            	if(log_start_date >  this.state.goal_events[i].start_date){
            	   log_start_date =  this.state.goal_events[i].start_date
            	}
            }

            if(i==0){
                goal_log_obj = {"log_name": log_name, "log_duration": log_duration, "log_start_date": log_start_date}
                goal_event_log_list.push(goal_log_obj)
            }else{
                let flag = true
                for(var j=0;j<goal_event_log_list.length; j++){
                    if(goal_event_log_list[j].log_name.toUpperCase() === this.state.goal_events[i].title.toUpperCase()){
                        goal_event_log_list[j].log_duration = goal_event_log_list[j].log_duration + this.state.goal_events[i].duration
                        flag = false
                    }
                }
                if(flag){
                    goal_log_obj = {"log_name": log_name, "log_duration": log_duration, "log_start_date": log_start_date}
                    goal_event_log_list.push(goal_log_obj)
                }
            }
        }

    }

    for(var i=0; i < goal_event_log_list.length; i++){
       let index = i;
       let html = null;
       let event_obj =  goal_event_log_list[i]
       html = (
           <tr className="card-list" key={`${event_obj.log_name}_${i}`} onClick={(e) => this.showLogList(e, event_obj)}>
             <td className="pb-h">{moment(event_obj.log_start_date).local().format('MM/DD/YY')}</td>
             <td className="pb-h">{event_obj.log_name}</td>
             <td className="pb-h">{event_obj.log_duration}</td>
             <td className="card-container" colSpan="3">
	      		<p>{event_obj.log_name} <span className="event-duration">{event_obj.log_duration} hrs</span></p>
	      		<p className="event-date">{moment(event_obj.log_start_date).local().format('MM/DD/YY')}</p>
	          </td>
           </tr>
       )
       logged.push(html)
    }



    return (
      <div className="c-progress c-progress--goal" onClick={() => this.setState({ open: !open })}>
        <div className="row mr-0 ml-0" style={{alignItems: 'center'}}>
          <div className="col-2 tright c-progress__title progress-title">{title}</div>
          <div className="col-7 progress-bar">
            <GoalProgressBar
              left_text={`${(goal - this.getLoggedHrs() > 0 ? goal - this.getLoggedHrs() : 0)} Hours Left`}
              done_text={`Completed ${this.getLoggedHrs()} Hours`}
              total={goal}
              completed={this.getLoggedHrs()}
              color={color} />
          </div>
          <div className="col-2 c-progress__title progress-hrs">
            {goal} Hours { open ? <a onClick={(e) => {e.stopPropagation(); this.setState({open_goals: true})}}><i className="c-progress__edit_icon i-edit" /></a> : null } 
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
              <div className="offset-2 col-md-10 col-lg-7 card-layout">
                {
                  upcoming.length > 0 ? 
                    <div>
                      <div className="c-progress__list_title">Upcoming Events</div>
	                      <table className="c-getable">
	                        <thead>
	                          <tr>
	                            <th>Date</th>
	                            <th>Title</th>
	                            <th>Duration</th>
	                            <th>Actions</th>
	                          </tr>
	                        </thead>
	                        <tbody>
	                          {upcoming}
	                        </tbody>
	                      </table>
                    </div> : null
                }
                <Button 
                  onClick={this.openForCreate}
                  className="c-btn__dark is-small mt-h mb-h">+ Schedule a New Goal Event</Button>
                <div>
                  <div className="c-progress__list_title">{title} Log</div>
                    
	                  <table className="c-getable">
	                    <thead>
	                      <tr>
	                      <th>Date</th>
	                      <th>Title</th>
	                      <th>Duration</th>
	                      <th>Actions</th>
	                      </tr>
	                    </thead>
	                    <tbody>
	                       {/*<tr onClick={this.showLogList}>
	                          <th>{moment(log_start_date).local().format('MM/DD/YY')}</th>
	                          <th>{log_name}</th>
	                          <th>{log_start_date == '' ? '': log_duration }</th>
	                       </tr>*/}
	                       {logged}
	                       {
	                             <ShadowingLogListModal
	                                        open={open_shadowing_list_modal}
	                                        kind={this.props.kind}
	                                        selected_index={selected_index}
	                                        goal_events = {this.state.goal_events}
	                                        handleClose={this.closeShadowingListModal}
	                                        deleteFromGoalEvents={this.deleteFromGoalEvents}
	                                        delete={this.delete}
	                                        updateGoalLogEvents={this.updateGoalLogEvents}
	                                        log_list_title={this.state.log_list_title}/>
	                       }
	                      <tr className="c-geform card-list add-new-card-item" onClick={(e) => e.stopPropagation()}>
	                        <td>
	                          <DatePicker
	                            placeholder="Date"
	                            className="is-small c-geform__input"
	                            allowClear={false}
	                            value={new_ge.start_date !== '' ? moment(new_ge.start_date, dateFormat) : null}
	                            format={dateFormat}
	                            onChange={(val) => this.changeNewGE('start_date', moment(val).format(dateFormat))} />
	                        </td>
	                        <td>
	                          <Input
	                            placeholder="Log Title"
	                            className="c-geform__input"
	                            value={new_ge.title}
	                            onChange={(e) => this.changeNewGE('title', e.target.value)} 
	                            onKeyDown={this.detectEnterForCreate} />
	                        </td>
	                        <td>
	                          <Input
	                            placeholder="Duration (Hrs)"
	                            value={new_ge.duration}
	                            onChange={(e) => this.changeNewGE('duration', e.target.value, this.validDuration(e.target.value))} 
	                            onKeyDown={this.detectEnterForCreate}
	                            className="ant-input is-small c-geform__input" />
	                        </td>
	                        <td>
	                          <div className="c-geform__addbtn">
	                            {
	                              loading_new ? <Loader /> :
	                                <i onClick={this.handleAddLogged} className="i-plus-outline"></i>
	                            }
	                          </div>
	                        </td>
	                        <td className="card-container" colSpan="4">
	                        	<div className="card-input-group">
	                        		<div className="name-input">
				                        <Input
			                            placeholder="Log Title"
			                            className="c-geform__input"
			                            value={new_ge.title}
			                            onChange={(e) => this.changeNewGE('title', e.target.value)} 
			                            onKeyDown={this.detectEnterForCreate} />
				                    </div>
			                        <Input
		                            placeholder="Duration (Hrs)"
		                            value={new_ge.duration}
		                            onChange={(e) => this.changeNewGE('duration', e.target.value, this.validDuration(e.target.value))} 
		                            onKeyDown={this.detectEnterForCreate}
		                            className="ant-input is-small c-geform__input duration-input" />
		                        </div>
			                    <div className="card-input-group date-addbtn-group">
	                            	<DatePicker
		                            placeholder="Date"
		                            className="is-small c-geform__input date-input"
		                            allowClear={false}
		                            value={new_ge.start_date !== '' ? moment(new_ge.start_date, dateFormat) : null}
		                            format={dateFormat}
		                            onChange={(val) => this.changeNewGE('start_date', moment(val).format(dateFormat))} />
		                            
			                        <div className="c-geform__addbtn add-card-btn">
		                            {
		                              loading_new ? <Loader /> :
		                                <i onClick={this.handleAddLogged} className="i-plus-outline"></i>
		                            }
		                            </div>
	                            </div>
	                            	
	                        </td>
	                      </tr>
	                    </tbody>
	                  </table>
                  
                </div>
              <div className="col-2 tright">
              </div>
            </div>
            <div className="offset-9 col-2 tright md-btn-cont">
              <a className="c-btn-blue-gradient handle-margin-right" onClick={(e) => this.openMoreLink(this.props.more_text, this.props.more_link)}><img src={userMdSolid} className="gradient-user-md" /></a>
            </div>
            <div className="col-1 tright md-btn-blank-cont"></div>
          </div> : null
        }
        <GoalsModal 
          open={open_goals}
          goal_selection={goal_selection}
          updateGoalSelection={this.props.updateGoalSelection}
          handleClose={this.closeGoalsModal} />
        <GoalEventModal
          lock_kind={true}
          open={open_ge_modal}
          mode={ge_modal_mode}
          goal_events = {this.props.goal_events}
          goal_event={ge_modal_mode === 'new' ? ge_template : goal_events[selected_index]} 
          updateGoalEvents={this.updateGoalEvents}
          extracurs={this.props.extracurs}
          updateExtracurs={this.props.updateExtracurs}
          handleClose={this.closeGEModal} />
        <ShowLearnMoreModal
          open={this.state.open_learn_more_link}
          handleClose={this.closeShowLearnLinkModal}
          ref={this.showLearnMoreModalChild}
        />
      </div>
    );
  }
}