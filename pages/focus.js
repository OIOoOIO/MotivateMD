import CookieManager from      '../services/CookieManager';
import AppLayout from          '../components/AppLayout';
import Api from                '../services/Api';
import brandLight from         '../assets/images/brand-light.png';
import TimerList from '../components/focus/TimerList';
import Clock from '../components/focus/Clock';
import window from 'global';
import _ from 'lodash';
import moment from 'moment';
import ReactGA from 'react-ga';
import { message } from 'antd';
import Footer from '../components/common/Footer'

export default class Focus extends React.Component {

  static async getInitialProps({ req, res }) {
    const cm = new CookieManager(req.headers && req.headers.cookie);
    const api = new Api(cm.getIdToken());
    if( cm.getIdToken() ){
	    const back_res = await api.get_onboarding();
	    if (back_res.data && back_res.data.session && back_res.data.session.logged_in) {
		    return {
		      ...back_res.data,
		      page_attrs: {
		        title: 'Focus - Motivate MD',
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
        borderDivHeight: 0,
        inboxCount: props.inbox_count,
        timerList: [],
        currentTarget: "",
        timerSettings: "",
        currentPage: ""
    };
    this.clockChild = React.createRef();
  }
  
  	/*componentWillReceiveProps() {
		let { currentTarget } = this.props;
		this.setState({currentTarget: currentTarget});
	}*/
  
  	componentWillMount() {
  		this.setState({currentPage: "focus"});
  		const cm = new CookieManager();
		const api = new Api(cm.getIdToken());
		api.get_timer_list()
		.then(res => {
			if( res.data.timer_list && res.data.timer_list.length > 0 ){
				this.setState({
	  				timerList: res.data.timer_list
	  			});
	  			let currentTargetFlag = true;
				for(var i=0; i < res.data.timer_list.length; i++){
                	if( !res.data.timer_list[i].is_completed ){
                		this.setState({currentTarget: res.data.timer_list[i]});
                		currentTargetFlag = false
                		break;
                	}
                }
                if(currentTargetFlag){
                    this.setState({currentTarget: ""});
                }
			}else{
				this.setState({timerList: []});
				this.setState({currentTarget: ""});
			}
		})
  		.catch(error => {
  			console.log('Oops! Something went wrong! ==========================>',error);
  			message.error("Oops! Something went wrong! Please try again later.");
  		});
		api.get_timer_setting()
		.then(res => {
			//console.log("focus componentWillMount get_timer_setting ==================>",res);
			this.setState({timerSettings: res.data.timer_setting});
		})
        .catch(error => {
        	console.log("componentDidMount get_timer_setting catch ==================>",error);
        });
  	}

  componentDidMount() {
	  this.setState({borderDivHeight: window.innerHeight - 64});
  }
  
  getCurrentTarget = (currTarget) => {
	  this.setState({currentTarget: currTarget});
	  this.clockChild.current.openPomodoroClock(currTarget);
  }
  
  addNewTarget = () => {
	  this.componentWillMount();
  }
  
  doCompleteRound = () => {
	  let { timerSettings } = this.state;
	  let currentTarget = this.state.currentTarget;
	  let currentTargetClone = _.clone(this.state.currentTarget);
	  const cm = new CookieManager();
	  const api = new Api(cm.getIdToken());
	  
	  currentTarget.total_focus_time = currentTarget.total_focus_time + timerSettings.rounds_dur;
	  currentTarget.current_round = currentTarget.current_round + 1;
	  if( currentTarget.current_round > currentTarget.total_rounds ){
		  currentTarget.is_completed = true;
		  currentTarget.current_round = currentTarget.current_round - 1;
	  }
	  this.setState({
		  currentTarget: currentTarget
	  });
	  let timerList = this.state.timerList;
	  for( let i=0;i<timerList.length;i++ ){
		  if( currentTarget.id === timerList[i].id ){
			  timerList[i] = currentTarget;
		  }
	  }
	  this.setState({
		  timerList: timerList
	  });
	  api.update_target_round(currentTargetClone)
	  .then(res => {
		  if( res.data.timer ){
			  /*currentTarget = res.data.timer;
			  this.setState({
				  currentTarget: currentTarget
			  });
			  let timerList = this.state.timerList;
			  for( let i=0;i<timerList.length;i++ ){
				  if( currentTarget.id === timerList[i].id ){
					  timerList[i] = currentTarget;
				  }
			  }
			  this.setState({
				  timerList: timerList
			  });*/
			   ReactGA.event({
                      category: 'Focus',
                      action: 'Current Target Completed'
                });
		  }
	  })
      .catch(error => {
    	  console.log("doCompleteRound update_target_round catch ==================>",error);
      });
  }
  
  doUpdateTimerSettings = ( key,value ) => {
	  let timerSettings = this.state.timerSettings;
	  timerSettings[key] = value;
	  const cm = new CookieManager();
	  const api = new Api(cm.getIdToken());
	  api.update_timer_settings(timerSettings)
	  .then(res => {
		  this.setState({
			  timerSettings: res.data.timer_setting
		  });
		  ReactGA.event({
                category: 'Focus',
                action: 'Timer setting updated'
          });
	  })
      .catch(error => {
    	  console.log("doUpdateTimerSettings catch ==================>",error);
      });
  }
  
  updateTargetOrder = ( evt,updated ) => {
	  for (var i = 0; i < updated.length; i++) {
		  let currentTarget = updated[i];
		  if( currentTarget.sort_order !== i ){
			  currentTarget.sort_order = i;
			  const cm = new CookieManager();
			  const api = new Api(cm.getIdToken());
			  api.update_timer(currentTarget.id, currentTarget)
			  .then(res => {
				  this.componentWillMount();
				  ReactGA.event({
                        category: 'Focus',
                        action: 'Target order changed.'
                  });
			  })
			  .catch(error => {
				  console.log("updateTargetOrder catch ========================>",error);
			  });
		  }
	  }
  }
  
  updateTarget = ( key,value,index,updateToBackend ) => {
	  let { timerList, currentTarget } = this.state;
	  if( value != "" && key == "title" ){
		  timerList[index].title = value;
	  }else if( value != "" && key == "total_rounds" ){
		  timerList[index].total_rounds = value;
	  }
	  
	  if( updateToBackend ){
		  const cm = new CookieManager();
		  const api = new Api(cm.getIdToken());
		  api.update_timer(timerList[index].id, timerList[index])
		  .then(res => {
			  timerList[index] = res.data.timer;
			  this.setState({timerList: timerList});
			  if( currentTarget.id == res.data.timer.id ){
				  this.setState({currentTarget: res.data.timer});
			  }
			  ReactGA.event({
                  category: 'Focus',
                  action: 'Target Updated'
              });
		  })
		  .catch(error => {
			  console.log("updateTarget catch ========================>",error);
		  });
	  }
  }
  
  deleteTarget = (index,targetId) => {
	  const cm = new CookieManager();
	  const api = new Api(cm.getIdToken());
	  api.delete_timer(targetId)
	  .then(res => {
          ReactGA.event({
              category: 'Focus',
              action: 'Target Deleted'
            });
		  this.componentWillMount();

	  });
  }

  render() {
    const borderDivStyle = {
      height: this.state.borderDivHeight+'px'
    };
    let { timerList, inboxCount } = this.state;

    return (
      <AppLayout inboxCount={inboxCount} currentPage={this.state.currentPage} {...this.props} navbar >

          <div className="row no-margin">
              <div className="no-left-padding col-12 col-sm-5 col-md-4">
                <TimerList
                	getCurrentTarget={this.getCurrentTarget}
                	timerList={timerList}
                	addNewTarget={this.addNewTarget}
                	updateTarget={this.updateTarget}
                	deleteTarget={this.deleteTarget}
                	updateTargetOrder={this.updateTargetOrder}
                />
                <div className="vl" style={borderDivStyle}></div>
              </div>
              <div className="col-12 col-sm-7 col-md-8 timer-section">
                <div className="card waves-effect waves-block waves-light">
					<div className="pomodoro">
		                <Clock
		                	ref={this.clockChild}
							currentTarget={this.state.currentTarget}
		                	doCompleteRound={this.doCompleteRound}
		                	timerSettings={this.state.timerSettings}
		                	doCompleteRound={this.doCompleteRound}
		                	doUpdateTimerSettings={this.doUpdateTimerSettings}
						/>
	                </div>
                </div>
            </div>
          </div>
          <Footer />
      </AppLayout>
    );
  }
}
