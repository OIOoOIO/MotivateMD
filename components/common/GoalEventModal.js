import { Modal, Button, Input, Select, DatePicker, Checkbox, message } from 'antd';
import TextareaAutosize from 'react-autosize-textarea';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import moment from 'moment';
import InputMask from 'react-input-mask';
import TimeOptions from '../TimeOptions';
import RecursiveOptions from '../Recursive';
import { disabledDate } from '../../utils/helpers';
import ReactGA from 'react-ga';

const Option = Select.Option;


export default class GoalEventModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      goal_event: {...props.goal_event},
      goal_events: [...props.goal_events]
    }
    ReactGA.modalview('/Goals/GoalEvent/'+this.state.goal_event.kind);
  }
  changeInput = (key, value, is_valid=true) => {
    if (is_valid) {
    	if( key === "duration" && value > 99999 ){
    		
    	}else{
    		let goal_event = {...this.state.goal_event};
    		goal_event[key] = value;
    		this.setState({
    	        goal_event: goal_event
    		});
    	}
    }
  }
  
  componentWillReceiveProps(new_props) {
    this.setState({
      goal_events: [...new_props.goal_events],
      goal_event: {...new_props.goal_event}
    })
  }

   changeInput1 = (key, value, is_valid=true) => {
      if (is_valid) {
        let goal_event = {...this.state.goal_event};
        this.state.goal_events.map((e) => {
           if( e.id == value ){
            goal_event[key] = e.name;
            this.setState({
              goal_event: goal_event
            });
           }
        });
      }
    }

  checkedPreviouslyLogged = (key, value, is_valid=true) => {
    if (is_valid) {
     let goal_event = {...this.state.goal_event};
     let titleList = [];
     for(var i=0;i < this.state.goal_events.length; i++){
        let ge = this.state.goal_events[i];
        if(!ge.logged){
            titleList.push({id: ge.id, name: ge.title});
        }
     }

     this.setState({
       goal_event: {...this.state.goal_event, is_previously_log: value, title: ''}
     });
    }
  }

  viewError = (issues) => {
      let fields_str = '';
      for(var i = 0; i < issues.length; i++) {
        fields_str += (i === issues.length - 1 ? issues[i] : `${issues[i]}, `);
      }
      message.error('These fields are required: ' + fields_str);
  }



  handleCreate = () => {
    let goal_event = this.state.goal_event;
    goal_event['time_zone'] = new Date().getTimezoneOffset()
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

    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    if(goal_event.is_extracur){
        goal_event.note = goal_event.description;
    }

    api.create_goal_event(goal_event)
      .then(res => {
        //let ec = res.data.extracur;
        //if (ec !== null) {
        	//this.props.updateExtracurs([...this.props.extracurs, ec]);
        //}
    	  if( res.data.goal_event 
			  && ( res.data.goal_event.recursive_mode === 'weekly-on-selected-day' || 
				   res.data.goal_event.recursive_mode === 'annually-on-selected-day' || 
				   res.data.goal_event.recursive_mode === 'every-weekday-mon-fri' ) ){
    		  message.success("Event created successfully. Recurring events will appear after sometime.",6);
    	  }else{
    		  message.success("Event created successfully.");
    	  }
        this.props.updateGoalEvents(res.data.goal_event);
        this.setState({loading: false});
        this.props.handleClose();
        ReactGA.event({ category: 'Goals Tab', action: res.data.goal_event.kind+' event - created' });
        //window.location.reload();
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }

  handleUpdate = () => {
    let goal_event = this.state.goal_event;
    goal_event['time_zone'] = new Date().getTimezoneOffset()
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




    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    let timezoneOffset = new Date().getTimezoneOffset();
    let hours = timezoneOffset/60

    if (goal_event.start_time == moment(goal_event.start_date).local().add(hours, 'hours').format('hh:mm a')){
      goal_event['start_time'] = moment(goal_event.start_date).local().format('hh:mm a')
    }
    goal_event['start_date'] = moment(goal_event.start_date).local().format('MM/DD/YY')
    api.update_goal_event(goal_event.id, goal_event)
      .then(res => {
        //let ec = res.data.extracur;
         //if (ec !== null) {
        	//this.props.updateExtracurs([...this.props.extracurs, ec]);
        //}
    	  if( res.data.goal_event 
			  && ( res.data.goal_event.recursive_mode === 'weekly-on-selected-day' || 
				   res.data.goal_event.recursive_mode === 'annually-on-selected-day' || 
				   res.data.goal_event.recursive_mode === 'every-weekday-mon-fri' ) ){
    		  message.success("Event created successfully. Recurring events will appear after sometime.",6);
    	  }else{
    		  message.success("Event created successfully.");
    	  }
        this.props.updateGoalEvents(res.data.goal_event);
        this.setState({loading: false});
        this.props.handleClose();
        ReactGA.event({ category: 'Goals Tab', action: res.data.goal_event.kind+' event - updated' });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }
  handleSave = (event) => {
    event.preventDefault();
    if (this.props.mode === 'new') {
      this.handleCreate();
    } else {
      this.handleUpdate();
    }
  }
  
  validDuration = (val) => {
    return (val === '' || (val.match(/[a-zA-Z]/) === null && !isNaN(parseFloat(val))));
  }

  render() {
    let { loading } = this.state;
    let { id, title, name, kind, start_date, start_time, duration, description, is_extracur, recursive_mode, logged, is_previously_log, time_zone, note } = this.state.goal_event;
    let hidden_cls = null;

    this.state.goal_event.is_extracur ?
        hidden_cls = {
            display: 'block'
        }
        :
        hidden_cls = {
            display: 'none'
        }

    let timeFormat = 'h:mm a';
    let dateFormat = 'MM/DD/YY';

    let goal_event_obj_list = []
    for(var i=0;i<this.state.goal_events.length;i++){
            let goal_event_obj = this.state.goal_events[i];
            if(i == 0){
                goal_event_obj_list.push(goal_event_obj)
            }else{
                let flag = true
                for(var j=0; j<goal_event_obj_list.length; j++){
                    //if(goal_event_obj_list[j].title === this.state.goal_events[i].title){
                    if(goal_event_obj_list[j].title.toUpperCase() === this.state.goal_events[i].title.toUpperCase()){
                       flag = false
                    }
                }
                if(flag){
                     goal_event_obj_list.push(goal_event_obj)
                }
            }
    }

    return (
      <Modal
        style={{ top: 64 }}
        closable={false}
        width={720}
        title="Schedule Goal Event"
        visible={this.props.open}
        onCancel={this.props.handleClose}
        footer={
          <div onClick={(e) => e.stopPropagation()}>
            <Button className="c-btn__secondary" key="cancel" onClick={this.props.handleClose}>Cancel</Button>
            <Button key="submit" loading={loading} onClick={this.handleSave}>Save</Button>
          </div>
        }>
        <div className="ml-1 mr-1" onClick={(e) => e.stopPropagation()}>
          {this.state.goal_events.length > 0 ?
              <div className="row c-form__row">
                  <div className="col-12">
                    <Checkbox checked={is_previously_log}
                      onChange={(e) => this.checkedPreviouslyLogged('is_previously_log', e.target.checked)}>Add to a previously logged event </Checkbox>
                  </div>
              </div>
           : ''
          }
          <div className="row c-form__row">
            {((goal_event_obj_list.length > 0) && is_previously_log )?
                <div className="col-md-6">
                  <div className="c-form__label c-form__label--left">Title</div>
                  <div className="c-form__input" >
                    <Select
                      onChange={(val) =>  this.changeInput1('title', val)}
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      value={title}
                      >
                      {
                        goal_event_obj_list.map((e) => {
                          return(
                            <Select.Option key={e.id} value={e.id}>{e.name}</Select.Option>
                          );
                        })
                      }
                    </Select>
                  </div>
                </div>
            :
                <div className="col-md-6">
                  <div className="c-form__label c-form__label--left">Title</div>
                  <div className="c-form__input">
                    <Input placeholder="Title"
                      value={title}
                      onChange={(e) => this.changeInput('title', e.target.value)} />
                  </div>
                </div>
            }
            <div className="col-md-6">
              <div className="c-form__label c-form__label--left">Category</div>
              <div className="c-form__input">
                <Select 
                  disabled={this.props.lock_kind}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  value={kind} 
                  onChange={(val) => this.changeInput('kind', val)}
                  placeholder="Select a Category">
                  <Select.Option key="shadowing" value="shadowing">Shadowing</Select.Option>
                  <Select.Option key="volunteering" value="volunteering">Volunteering</Select.Option>
                </Select>
              </div>
            </div>
          </div>
          <div className="row c-form__row">
            <div className="col-md-4">
              <div className="c-form__label c-form__label--left">Start Date</div>
              <div className="c-form__input">
                <DatePicker 
                  allowClear={false} 
                  autoFocus={false}
                  key={`sd_${this.state.goal_event.id}`}
            	  disabledDate={disabledDate}
                  defaultValue={start_date !== '' ? moment(new Date(start_date), dateFormat) : null}
                  format={dateFormat}
                  onChange={(val) => this.changeInput('start_date', moment(val).format(dateFormat))} />
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form__label c-form__label--left">Start Time</div>
              <div className="c-form__input">
                {/* It is weird, select does not show placeholder when value is empty */}
                {/* So I have to do this fix: only set value when start_time is not empty */}
                {
                  start_time === '' ?
                    <Select ref={this.input}
                      key={this.props.mode === 'new' ? `new_${Math.round(Math.random() * 100000)}` : `edit_time_${id}`}
                      onChange={(val) => this.changeInput('start_time', val)}
                      defaultValue={this.state.goal_event.start_time}
                      >
                      {
                        TimeOptions.map(e => {
                          return (
                            <Select.Option key={e.value} value={e.value}>{e.text}</Select.Option>
                          );
                        })
                      }
                    </Select> :
                    <Select ref={this.input}
                      key={this.props.mode === 'new' ? `new_${Math.round(Math.random() * 100000)}` : `edit_time_${id}`}
                	    defaultValue={id? moment(new Date(start_date)).format(timeFormat): start_time}
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      onChange={(val) => this.changeInput('start_time', val)}>
                      {
                        TimeOptions.map(e => {
                          return (
                            <Select.Option key={e.value} value={e.value}>{e.text}</Select.Option>
                          );
                        })
                      }
                    </Select>
                }
              </div>
            </div>
            <div className="col-md-4">
              <div className="c-form__label c-form__label--left">Duration (Hrs)</div>
              <div className="c-form__input">
                <Input
                  placeholder="Ex: 3 or 7.5"
                  value={duration}
                  onChange={(e) => this.changeInput('duration', e.target.value, this.validDuration(e.target.value))} />
              </div>
            </div>
          </div>
          <div className="row c-form__row">
          	<div className="col-12">
          		<div className="c-form__label c-form__label--left">Repeat</div>
          		  <Select
                  key={this.props.mode === 'new' ? `new_${Math.round(Math.random() * 100000)}` : `edit_time_${id}`}
                  defaultValue={this.state.goal_event.recursive_mode}
          		  getPopupContainer={triggerNode => triggerNode.parentNode}
                  onChange={(val) => this.changeInput('recursive_mode', val)}>
                  {
                    RecursiveOptions.map(e => {
                      return (
                        <Select.Option key={e.value} value={e.value}>{e.text}</Select.Option>
                      );
                    })
                  }
                </Select>
          	</div>
      	  </div>
          <div className="row c-form__row">
            <div className="col-12">
              <div className="c-form__label c-form__label--left">Description</div>
              <div className="c-form__input">
                <TextareaAutosize rows={2}
                  value={description}
                  style={{width:`100%`}}
                  onChange={(e) => this.changeInput('description', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}