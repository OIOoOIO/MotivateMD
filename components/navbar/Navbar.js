import brandInline from '../../assets/images/brand-inline.png';
import { Menu, Dropdown, Icon, message } from 'antd';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import upgradeButton from '../../assets/images/color_icons/upgrade.svg';

export default class Navbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      menu_open: false,
      showNotifications: false,
      showNotificationLoader: false,
      notification_list: [],
      notifications_html: '',
      user: this.props.session.user
    }
  }
  
  getAccountMenu = () => {
    let { firstname, lastname } = this.state.user;
    return (
      <Menu>
        <Menu.Item key="6" disabled>Logged in as {firstname} {lastname}</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="5">
        	<a href="/onboarding">Onboarding</a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="4">
            <a href="https://www.motivatemd.com/support/" target="_blank">Support</a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3">
             <a href="https://www.motivatemd.com/premed-app-account/"  target="_blank">My Account</a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="2">
          <a href="https://www.motivatemd.com/upgrade/" target="_blank">Upgrade</a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="1">
          <a href="/logout">Log Out</a>
        </Menu.Item>
      </Menu>
    );
  }

  componentDidMount() {
      const cm = new CookieManager();
      const api = new Api(cm.getIdToken());
      api.get_previous_event_list()
      .then(res => {
              this.setState({ notification_list: res.data.goal_events });
      })
      .catch(error => {
          console.log("Oops! Something went wrong!");
      });
  }
  
  doCompleteEvent = ( e, index ) => {
	  let { active_page } = this.props;
	  let eventId = this.state.notification_list[index].id;
	  const cm = new CookieManager();
	  const api = new Api(cm.getIdToken());
	  let notification_list = [...this.state.notification_list];
	  api.confirm_event(eventId)
	  .then(res => {
		  notification_list[index].logged = true;
		  let currentEvent = notification_list[index];
		  this.setState({
			  notification_list: notification_list
	      });
		  this.createNotificationHtmlList();
		  if( active_page === 'progress'){
			  this.props.updateGoalEventsByNotification(currentEvent);
		  }
		  if(active_page === 'calendar'){
		    window.location.reload();
		  }
		  setTimeout(()=>{
			  notification_list.splice(index, 1);
			  this.setState({
				  notification_list: notification_list
		      });
			  this.createNotificationHtmlList();
			  //window.location.reload();
		  },500);
	  })
	  .catch(error => {
		  console.log("Oops! Something went wrong!");
		  message.error("Oops! Something went wrong! Please try again later.");
	  });
  }

  doDeleteEvent = (e, index) => {
    e.stopPropagation();
    let id = this.state.notification_list[index].id;
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.delete_goal_event(id)
      .then(res => {
        window.location.reload();
    })
    .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
    });
  }

  createNotificationHtmlList = () => {
	  let html = null;
	  let complete_html_array = [];
	  for( let i=0;i<this.state.notification_list.length;i++ ){
		  let current_event_cls = null;
		  if( this.state.notification_list[i].kind == "volunteering" ){
			  current_event_cls = "volunteering";
		  }else if( this.state.notification_list[i].kind == "shadowing" ){
			  current_event_cls = "shadowing";
		  }else if( this.state.notification_list[i].kind == "application" ){
			  current_event_cls = "application";
		  }else if( this.state.notification_list[i].kind == "mcat" ){
			  current_event_cls = "mcat";
		  }else if( this.state.notification_list[i].kind == "extracurriculars" ){
			  current_event_cls = "extracurriculars";
		  }
		  html = (
				<li key={`event_${i}`} className={current_event_cls} >
					<p className="notification-title">
						<span className="c-ec__actions__logged" onClick={(e) => this.doCompleteEvent(e, i)}>
							<i className={this.state.notification_list[i].logged ? "i-checked" : "i-unchecked"}></i>
						</span>
						{this.state.notification_list[i].duration} Hours @ {this.state.notification_list[i].title}
                        <span className="c-ec__actions__delete">
                            <i className="i-close c-getable__delete_btn" onClick={(e) => this.doDeleteEvent(e, i)} />
                        </span>
					</p>

					<p className="notification-sub-title">
						{this.state.notification_list[i].kind}
					</p>

				</li>
			)
			complete_html_array.push(html);
	  }
	  this.setState({ notifications_html: complete_html_array });
  }

  openNotificationPanel = () => {
	  let { showNotifications, showNotificationLoader, notification_list, notifications_html } = this.state;
	  let { showNotificationOrangeDot } = this.props;
	  this.setState({ showNotificationLoader: !showNotificationLoader });
	  if( !this.state.showNotifications ){
		  const cm = new CookieManager();
		  const api = new Api(cm.getIdToken());
		  api.get_previous_event_list()
		  .then(res => {
			  setTimeout(()=>{
				  this.setState({ showNotifications: !showNotifications });
				  this.setState({ notification_list: res.data.goal_events });
				  this.createNotificationHtmlList();
				  this.props.hideNotificationOrangeDot();
			  },1000);
		  })
		  .catch(error => {
			  console.log("Oops! Something went wrong!");
		  });
	  }else{
		  this.setState({ showNotifications: !showNotifications });
		  this.setState({ showNotificationLoader: !showNotificationLoader });
	  }
  }

  hideMsgNotificationOrangeDot = () => {
	  let { hideMsgNotificationOrangeDot } = this.props;
	  setTimeout(() => {
		  hideMsgNotificationOrangeDot();
	  },1000);
  }

  render() {
    let { menu_open, showNotifications, showNotificationLoader, notification_list, notifications_html } = this.state;
    let { today, due, days } = this.props.application;
    let { initial } = this.state.user;
    let { active_page, showNotificationOrangeDot, showMsgNotificationOrangeDot } = this.props;
    return (
      <div className="c-navbar">
        <a className="c-navbar__item md-hide lg-hide xl-hide" onClick={() => this.setState({menu_open: !menu_open})}>
          <i className={menu_open ? "i-close" : "i-menu"} />
        </a>
        <a className="c-navbar__lgitem mr-2" href="/">
          <img className="c-navbar__brand" src={brandInline} />
        </a>
        <a href="/" className={"c-navbar__lgitem c-navbar__pagelink " + (active_page === 'progress' ? 'is-active' : '')}>
          <i className="c-navbar__item__icon i-progress" /> Progress
        </a>
        <a href="/calendar" className={"c-navbar__lgitem c-navbar__pagelink " + (active_page === 'calendar' ? 'is-active' : '')}>
          <i className="c-navbar__item__icon i-calendar" /> Calendar
        </a>
        <a href="/focus" className={"c-navbar__lgitem c-navbar__pagelink " + (active_page === 'focus' ? 'is-active' : '')}>
          <i className="c-navbar__item__icon i-focus" /> Focus
        </a>

        <div className="c-navbar__right_menu">
          <Dropdown overlay={this.getAccountMenu()}>
            <a className="c-navbar__lgitem">
              <div className="c-navbar__avatar">{initial ? initial : "G"}</div>
            </a>
          </Dropdown>
          <a className="upgrade-icon" href="https://www.motivatemd.com/upgrade/" target="_blank">
              <img src={upgradeButton} style={{width: '80%', margin: '0 auto'}}/>
          </a>
          <div className="c-navbar__divider"></div>
          <a className="c-navbar__item notification-bell-icon" onClick={() => this.openNotificationPanel()}>
            <i className="c-navbar__item__icon i-bell">
            	{
            		(showNotificationOrangeDot && this.state.notification_list.length > 0 )?
    				    <span className="notification-orange-dot"></span>
    				: null
            	}
            </i>
        	<div onClick={(e) => e.stopPropagation()} className={"notification-panel " + (showNotificationLoader && !showNotifications ? 'show-notification-loader' : 'hide-notification-loader')}>
            	<span className="blink-text">Loading Notifications ...</span>
            </div>
        	<div onClick={(e) => e.stopPropagation()} className={"notification-panel " + (showNotifications ? 'show-notification-panel' : 'hide-notification-panel')}>
            	<div className="notification-panel-header">
            		<h2 className="notification-panel-title">
            			Confirm Your Activity
        			</h2>
        			<p className="notification-panel-sub-title">
        				Welcome back! Looks like you've been busy. Are these complete?
        			</p>
            	</div>
            	{
	            	this.state.notification_list.length > 0 ?
		            	<div className="notification-panel-list">
		            		<ul>
		            			{notifications_html}
	            			</ul>
		            	</div>
		            :
		            	<div className="notification-panel-list blank-list">
		            		<ul>
		            			<li className="no-notification-title">
		            				No notifications for now!
		            			</li>
		        			</ul>
		            	</div>
            	}
        	</div>
    	  </a>
          <a className="c-navbar__item notification-msg-bell-icon" onClick={(e) => this.hideMsgNotificationOrangeDot()} href="/inbox">
            <i className="c-navbar__item__icon i-message">
	            {
	        		(showMsgNotificationOrangeDot )?
					    <span className="notification-orange-dot"></span>
					: null
	        	}
            </i>
          </a>
          <div className="c-navbar__divider xs-hide sm-hide"></div>
          <div className="c-timeline c-navbar__item xs-hide sm-hide md-hide">
            <div className="c-timeline__day">
              <div className="c-timeline__label">Today</div>
              <div className="c-timeline__value">{today}</div>
            </div>
            <div className="c-timeline__line"></div>
            <div className="c-timeline__time_left">{(days > 0 ? days : 0)} Days</div>
            <div className="c-timeline__line"></div>
            <div className="c-timeline__day">
              <div className="c-timeline__label">Due</div>
              <div className="c-timeline__value">{due}</div>
            </div>
          </div>
        </div>



        <div className={ "c-navbar__mmenu md-hide lg-hide xl-hide mobile-menu-nav " + (menu_open ? "is-open" : "") }>
          <a href="/" className={"c-navbar__mmenu__item " + (active_page === 'progress' ? 'is-active' : '')}>
            <i className="c-navbar__mmenu__icon i-progress" /> Progress
          </a>
          <a href="/calendar" className={"c-navbar__mmenu__item " + (active_page === 'calendar' ? 'is-active' : '')}>
            <i className="c-navbar__mmenu__icon i-calendar" /> Calendar
          </a>
          <a href="/focus" className={"c-navbar__mmenu__item " + (active_page === 'focus' ? 'is-active' : '')}>
            <i className="c-navbar__mmenu__icon i-focus" /> Focus
          </a>
        </div>
      </div>
    );
  }
}