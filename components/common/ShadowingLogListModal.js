import { Modal, Button, Input, Select, DatePicker, Checkbox, Icon } from 'antd';
import TextareaAutosize from 'react-autosize-textarea';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import moment from 'moment';
import InputMask from 'react-input-mask';
import TimeOptions from '../TimeOptions';
import Loader from './Loader';
import { disabledDate } from '../../utils/helpers';


export default class GoalEventModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      goal_events: this.props.goal_events,
      selected_index: -1,
      loading_edit: false,
      loading_delete: false,
      ge_modal_mode: 'edit',
    }

  }

  componentWillReceiveProps({props}) {
    this.setState({goal_events: this.props.goal_events})
  }


  openForEdit = (e, i) => {
      e.stopPropagation();
      let { goal_events } = this.state;

      if(goal_events.start_date === "undefined"){
        goal_events['start_date'] =  goal_events[i].starts_at
      }

      this.setState({
        ge_modal_mode: 'edit',
        selected_index: i,
        open_ge_modal: !goal_events[i].logged,
        goal_events: goal_events
      })
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

      goal_event['start_date'] = moment(goal_event.start_date).local().format('MM/DD/YY')
      goal_event['time_zone'] = new Date().getTimezoneOffset()
      api.update_goal_event(goal_event.id, goal_event)
        .then(res => {
          this.props.updateGoalLogEvents(res.data.goal_event, selected_index);
          this.setState({
            selected_index: -1,
            loading_edit: false
          });
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

  changeGE = (i, key, value, is_valid=true) => {
      if (is_valid) {
    	  if( key === "duration" && value > 99999 ){
      		
    	  }else{
    		  let goal_events = [...this.state.goal_events];
    		  let ge = {...goal_events[i]};
    		  ge[key] = value;
    		  goal_events[i] = ge;
    		  goal_events[i]['time_zone'] = new Date().getTimezoneOffset()
    		  this.setState({
    			  goal_events: goal_events
    		  });
    	  }
      }
  }

  validDuration = (val) => {
      return (val === '' || (val.match(/[a-zA-Z]/) === null && !isNaN(parseFloat(val))));
  }


  getEvents = () => {
      let { loading_edit } = this.state;
      let dateFormat = 'MM/DD/YY';
      let events = {
        logged: [],
        upcoming: []
      }



      for(var i = 0; i < this.state.goal_events.length; i++) {
        let ge = this.state.goal_events[i];
        let index = i;
        if (ge.logged && (ge.title === this.props.log_list_title)) {
          let html = null;
          if(ge.start_date === 'undefined'){
            ge.start_date = ge.starts_at
          }
          if (this.state.selected_index === index) {
            html = (
              <tr className="card-list" key={`x_${i}`} onClick={(e) => e.stopPropagation()}>
                <td className="pb-h">
                  <DatePicker
                    className="is-small"
                    allowClear={false}
                    key={`date_${i}`}
                    disabledDate={disabledDate}
                    defaultValue={moment(new Date(ge.start_date), dateFormat)}
                    format={dateFormat}
                    onChange={(val) => this.changeGE(index, 'start_date', moment(val).format(dateFormat))} />

                </td>
                <td className="pb-h">
                  <Input readOnly
                    className="is-small"
                    key={`name_${i}_${ge.id}`}
                    placeholder="Title"
                    value={ge.title}
                    />
                </td>
                <td className="pb-h">
                  <Input
                    key={`dur_${i}`}
                    placeholder="Duration (Hrs)"
                    value={ge.duration}
                    onChange={(e) => this.changeGE(index, 'duration', e.target.value, this.validDuration(e.target.value))}
                    onKeyDown={this.detectEnterForUpdate}
                    className="ant-input is-small" />
                </td>
                <td className="pb-h">
                  <TextareaAutosize
                    className="is-small c-geform_description_ellipsis"
                    key={`name_${i}_${ge.id}`}
                    placeholder="Description"
                    onChange={(e) => this.changeGE(index, 'description', e.target.value)}
                    value={ge.description}
                    onKeyDown={this.detectEnterForUpdate}
                    />
                </td>
                {
                  loading_edit ?
                    <td className="pb-h"><Loader /></td> :
                      <td className="pb-h">
                        <i className="i-edit c-getable__edit_btn mr-h" onClick={(e) => this.openForEdit(e, index)} />
                        <i className="i-close c-getable__delete_btn" onClick={(e) => this.props.delete(e, index)} />
                      </td>
                }
                <td className="card-container" colSpan="5">
	            	<div className="card-input-group modal-card-input-group">
	            		<div className="name-input">
		            		<Input readOnly
		                    className="is-small"
		                    key={`name_${i}_${ge.id}`}
		                    placeholder="Title"
		                    value={ge.title}
		                    />
	                    </div>
		            	<div className="modal-date-duration-input">
		            		<DatePicker
		                    className="is-small"
		                    allowClear={false}
		                    key={`date_${i}`}
		                    disabledDate={disabledDate}
		                    defaultValue={moment(new Date(ge.start_date), dateFormat)}
		                    format={dateFormat}
		                    onChange={(val) => this.changeGE(index, 'start_date', moment(val).format(dateFormat))} />
		            		
		            		<Input
		                    key={`dur_${i}`}
		                    placeholder="Duration"
		                    value={ge.duration}
		                    onChange={(e) => this.changeGE(index, 'duration', e.target.value, this.validDuration(e.target.value))}
		                    onKeyDown={this.detectEnterForUpdate}
		                    className="ant-input is-small modal-input-duration" />
	                    </div>
	                </div>
	                <div className="card-input-group date-addbtn-group">
		                <TextareaAutosize
	                    className="is-small c-geform_description_ellipsis"
	                    key={`name_${i}_${ge.id}`}
	                    placeholder="Description"
	                    onChange={(e) => this.changeGE(index, 'description', e.target.value)}
	                    value={ge.description}
	                    onKeyDown={this.detectEnterForUpdate}
	                    />
	                    
		                <div className="add-card-btn">
                        {
                        	loading_edit ? <Loader /> :
                        	<span>
	                        	<i className="i-edit c-getable__edit_btn mr-h" onClick={(e) => this.openForEdit(e, index)} />
	                            <i className="i-close c-getable__delete_btn" onClick={(e) => this.props.delete(e, index)} />
                        	</span>
                        }
                        </div>
	                </div>
	                	
	            </td>
              </tr>

            );
          } else {
            html = (
              <tr className="card-list" key={`y_${ge.title}_${i}`}>
                <td className="pb-h">{moment(ge.start_date).local().format('MM/DD/YY')}</td>
                <td className="pb-h">{ge.title}</td>
                <td className="pb-h">{ge.duration}</td>
                <td className="pb-h c-geform_description_ellipsis">{ge.description}</td>
                <td className="pb-h">
                  <i className="i-edit c-getable__edit_btn mr-h" onClick={(e) => this.openForEdit(e, index)} />
                  <i className="i-close c-getable__delete_btn" onClick={(e) => this.props.delete(e, index)} />
                </td>
                <td className="card-container" colSpan="5">
		      		<p className="card-title">{ge.title} <span className="event-duration">{moment(ge.start_date).local().format('MM/DD/YY')} {ge.duration} hrs</span></p>
		      		<p className="event-date">{ge.description}
		      			<span className="event-actions">
			      			<i className="i-edit c-getable__edit_btn mr-h" onClick={(e) => this.openForEdit(e, index)} />
	                        <i className="i-close c-getable__delete_btn" onClick={(e) => this.props.delete(e, index)} />
  		      			</span>
  		      		</p>
		        </td>
              </tr>
            );
          }
          events.logged.push(html);
        }
      }
      return events;
    }




  render() {
    let { loading } = this.state;
    //let { id, title, name, start_date, duration} = this.state.goal_event;
    let { logged } = this.getEvents();
    return (
      <Modal
        style={{ top: 64 }}
        closable={false}
        width={650}
        title={this.props.kind.charAt(0).toUpperCase()+ this.props.kind.slice(1) +" Logs"}
        visible={this.props.open}
        onCancel={this.props.handleClose}
        footer={
          <div onClick={(e) => e.stopPropagation()}>
            {
                this.state.selected_index > -1?
                    <Button  key="save" onClick={this.handleUpdateLogged}>Save</Button>
                :  <Button  key="save" style={{background: `#08a5e1`}}onClick={this.handleUpdateLogged} disabled>Save</Button>
            }

            <Button className="c-btn__secondary" key="cancel" onClick={this.props.handleClose}>Cancel</Button>
          </div>
        }>

        <div className="ml-1 mr-1 card-layout-modal">
           <div className="row c-form__row card-layout">
              <div className="c-getable-event-log full-width">
                <table className="c-getable">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Duration</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logged}
                  </tbody>
                </table>
              </div>
          </div>
        </div>
      </Modal>
    );
  }
}