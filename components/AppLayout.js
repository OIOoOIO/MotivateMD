import Head from 'next/head';
import jstz from 'jstz';
import '../assets/stylesheets/application.scss'; 
import Navbar from '../components/navbar/Navbar';
import CookieManager from '../services/CookieManager';
import Api from '../services/Api';
import window from 'global';
import ReactGA from 'react-ga';
import Favicon from 'react-favicon';
import motivateMdLogo from '../assets/images/motivate-md-logo.png';

export default class AppLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active_page: props.active_page, // could be either of [progress, focus, calendar]
      isOneSignalInitialized: false,
      showNotificationOrangeDot: true,
      showMsgNotificationOrangeDot: false
    }
  }
  
  componentWillReceiveProps(props) {
	  this.setState({active_page: this.props.currentPage});
	  if( this.props.inboxCount > 0 ){
		  this.setState({showMsgNotificationOrangeDot: true});
	  }
  }
  
  componentDidMount() {
    const cm = new CookieManager(document.cookie);
    cm.setDocumentCookie('timezone', jstz.determine().name(), 1000);
  }
  
  intializeGA = () => {
	  //console.log("app lay ===========================>",this.props);
	  process.env.NODE_ENV === 'production' ?
		  ReactGA.initialize('UA-131280139-1')
	  :
		  ReactGA.initialize('UA-131280139-1',
			  {
			  	//debug: true
			  }
		  );
	  ReactGA.pageview(this.props.page_attrs.title);
	  if( this.props.session.logged_in ){
		  ReactGA.set({ userId: this.props.session.user.uuid });
	  }
  }
  
  getGAId = () => {
	  return process.env.NODE_ENV === 'production' ? 'UA-119392120-1' : 'UA-131280139-1';
  }
  
  getGA = () => {
    return process.env.NODE_ENV === 'production' ? `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'UA-119392120-1');
    ` : 
    	`window.dataLayer = window.dataLayer || [];
    	function gtag(){dataLayer.push(arguments);}
    	gtag('js', new Date());
    	gtag('config', 'UA-131237825-1');`; //biz4 ---- UA-131237825-1, beta --- UA-131280139-1
  }
  
  updateGoalEventsByNotification = ( new_goal ) => {
	  this.props.updateGoalEventsByNotification(new_goal);
  }
  
  hideNotificationOrangeDot = () => {
	  this.setState({ showNotificationOrangeDot: false });
  }
  
  hideMsgNotificationOrangeDot = () => {
	  this.setState({ showMsgNotificationOrangeDot: false });
  }
  
  handleScriptLoad = () => {
	  try{
		  if( !this.state.isOneSignalInitialized ){
			  let OneSignal = window.OneSignal || [];
			  OneSignal.push(function() {
			    OneSignal.init({
			    	appId: "c45304bf-bcd9-4b7d-a154-19bd80ed8c23", //beta server app
			    	//appId: "8b24c2c0-938d-4acb-b387-67bf384773f6", //development app
			    });
			  });
			  OneSignal.on('subscriptionChange', (isSubscribed) => {
				  this.getUserIdOneSignal(isSubscribed);
	  		  });
			  OneSignal.on('notificationDisplay', (obj) => {
				  //console.log("on notification =============================>",obj);
				  if( obj.content.includes("sent a message.") || obj.content.includes("check in chat inbox.") ){
					  this.setState({ showMsgNotificationOrangeDot: true });
				  }else{
					  this.setState({ showNotificationOrangeDot: true });
				  }
			  });
			  this.state.isOneSignalInitialized = true;
			  this.getUserIdOneSignal(true);
		  }
	  }catch(e){console.log("handleScriptLoad catch ======================>");}
  }
  
  getUserIdOneSignal = ( isSubscribed ) => {
	  let playerId = null;
	  const cm = new CookieManager();
	  const api = new Api(cm.getIdToken());
	  if( !isSubscribed ){
		  api.update_player_id(playerId)
		  .then(res => {
			  //console.log("getUserIdOneSignal update_player_id ================================>",res);
		  })
		  .catch(error => {
			console.log("Oops! Something went wrong!");
			this.setState({loading: false});
		  });
	  }else{
		  OneSignal.getUserId((id) => {
			  playerId = id;
			  api.update_player_id(playerId)
			  .then(res => {
				  //console.log("getUserIdOneSignal update_player_id ================================>",res);
			  })
			  .catch(error => {
				console.log("Oops! Something went wrong!");
				this.setState({loading: false});
			  });
		  });
	  }
  }
  
  render() {
    return (
      <div>
        <Head>
          <link rel="shortcut icon" type="image/x-icon" href="/static/images/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no,maximum-scale=1,user-scalable=0"  />
          <title>{this.props.page_attrs.title}</title>
          <meta name='description' content={this.props.page_attrs.description} />
          <script>
  			{this.intializeGA()}
		  </script>
          <script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async="" onLoad={this.handleScriptLoad()} />
      </Head >
         <Favicon url={motivateMdLogo} />
        {
          this.props.navbar ? 
            <Navbar
              active_page={this.state.active_page}
              session={this.props.session}
          	  showNotificationOrangeDot={this.state.showNotificationOrangeDot}
          	  hideNotificationOrangeDot={this.hideNotificationOrangeDot}
      		  showMsgNotificationOrangeDot={this.props.inboxCount > 0 ? true : false}
      		  hideMsgNotificationOrangeDot={this.hideMsgNotificationOrangeDot}
          	  updateGoalEventsByNotification={this.updateGoalEventsByNotification}
              application={this.props.application} /> :
              null
        }
        {
          this.props.sidebar ?
            <div className="l-sidepanel side-panel-container row">
              <div className={"col-12 col-sm-8 l-sidepanel__main "+this.state.active_page}>{this.props.children}</div>
              <div className={"col-4 l-sidepanel__side sidebar-container "+this.state.active_page}>{this.props.sidebar}</div>
            </div> : 
              this.props.children
        }
      </div>
    );
  }
}
