import { Modal, Button, Icon, message } from 'antd';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import window from 'global';
import DocumentTitle from 'react-document-title';

export default class PomodoroClockModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			session: 20,
			short_break: 4,
            timer: 20 * 60,
            isSessionNow: true,
            isPaused: false,
            eAngle: 0,
            timerSettings: {},
            currentTarget: {},
            mins: 0,
            secs: 0,
            currentBreakMode: ""
		}
	}
	
	startPomodoroOnOpen() {
		//console.log("startPomodoroOnOpen =================>");
		setTimeout(()=>{
			this.setState({windowWidth: window.innerWidth});
			this.initializeCanvas(true);
			this.handleStartPomodoro();
		},500);
	}
	
	componentWillReceiveProps() {
		const cm = new CookieManager();
		const api = new Api(cm.getIdToken());
		api.get_timer_setting()
		.then(res => {
			//console.log("PomodoroClockModal componentWillReceiveProps get_timer_setting ==================>");
			this.setState({timerSettings: res.data.timer_setting});
			this.state.session = parseInt(this.state.timerSettings.rounds_dur);
			this.state.short_break = parseInt(this.state.timerSettings.short_break);
			this.state.timer = parseInt(this.state.timerSettings.rounds_dur * 60);
			let mins = parseInt((this.state.timerSettings.rounds_dur * 60) / 60);
	    	let secs = parseInt((this.state.timerSettings.rounds_dur * 60) % 60);
	        mins = mins < 10 ? "0" + mins : mins;
	        secs = secs < 10 ? "0" + secs : secs;
	        this.state.mins = mins;
	        this.state.secs = secs;
		})
        .catch(error => {
        	console.log("componentWillReceiveProps get_timer_setting catch ==================>",error);
        });
	}
	
	/*componentWillReceiveProps() {
		console.log("componentWillReceiveProps ==================>");
		let { timerSettings } = this.props;
		this.state.session = parseInt(timerSettings.rounds_dur);
		this.state.short_break = parseInt(timerSettings.short_break);
		this.state.timer = parseInt(timerSettings.rounds_dur * 60);
		let { currentTarget } = this.props;
		this.setState({currentTarget: currentTarget});
		console.log("componentWillReceiveProps ==================>",timerSettings);
	}*/
    
    // display time in minutes and seconds
    displayTime = () => {
        var mins = parseInt(this.state.timer / 60);
        var secs = parseInt(this.state.timer % 60);

        mins = mins < 10 ? "0" + mins : mins;
        secs = secs < 10 ? "0" + secs : secs;
        
        this.setState({mins: mins});
        this.setState({secs: secs});

        //return mins + ':' + secs;
        //return mins;
    }
    
    doCompleteRound = () => {
    	this.props.doCompleteRound();
    }
    
    initializeCanvas = (isStoppedTimer) => {
    	let { timerSettings, currentTarget } = this.props;
    	let { currentBreakMode, windowWidth } = this.state;
    	let canvas = document.getElementById('draw-circle');
        let context = canvas.getContext('2d');
        let centerX = canvas.width / 2;
        let centerY = canvas.height / 2;
        let radius;
        if( windowWidth > 575 ){
        	radius = 165;
  		}else{
  			radius = (252/2) - 10;
  		}
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        /*if( isStoppedTimer ){
        	context.lineWidth = 5;
        }else{
        	context.lineWidth = 4;
        }*/
        context.lineWidth = 4;
        let gradient = context.createLinearGradient(0,500,0, 0);
        if( this.state.isSessionNow ){
        	//Create gradient
        	gradient.addColorStop(0, '#25B0E4');
        	gradient.addColorStop(1, '#40d6a5');
        	context.strokeStyle = gradient;
        }else{
        	//Create gradient  && currentTarget.current_round > 1
        	if( ((currentTarget.current_round % timerSettings.long_break_frequency) === 1) ){
        		gradient.addColorStop(0, '#996300');
            	gradient.addColorStop(1, '#ffa500');
        	}else{
        		gradient.addColorStop(0, '#ff9999');
            	gradient.addColorStop(1, '#ff0000');
        	}
        	context.strokeStyle = gradient;
        }
        context.stroke();
    }
    
    stopPomodoro = () => {
    	let { timerSettings } = this.props;
    	let mins = parseInt((timerSettings.rounds_dur * 60) / 60);
    	let secs = parseInt((timerSettings.rounds_dur * 60) % 60);
        mins = mins < 10 ? "0" + mins : mins;
        secs = secs < 10 ? "0" + secs : secs;
        this.setState({
            eAngle: 0,
            isPaused: false,
            isSessionNow: true,
            timer: parseInt(timerSettings.rounds_dur * 60),
            mins: mins,
            secs: secs
        });
        clearInterval(this.state.interval);
        this.initializeCanvas(true);
    }
	
	// starts the Pomodoro Timer
    startPomodoro = () => {
    	let { timerSettings, currentTarget } = this.props;
    	let { windowWidth } = this.state;
        // timer according session or break
        let timer;
        
        var mp3 = 'https://s3.amazonaws.com/freecodecamp/drums/Chord_3.mp3';
        var audio = new Audio(mp3);

        let canvas = document.getElementById('draw-circle');
        let context = canvas.getContext('2d');
        let centerX = canvas.width / 2;
        let centerY = canvas.height / 2;
        let radius;
        if( windowWidth > 575 ){
        	radius = 165;
  		}else{
  			radius = (252/2) - 10;
  		}
        let offset;
        context.strokeStyle = '#D2D2D2';

        if( this.state.isSessionNow ){
            offset = 2 * Math.PI / (this.state.session * 60);

            if (this.state.timer > 0) {
                timer = this.state.timer;
            }
            else {
                timer = this.state.session * 60;
            }
        }
        else {
        	let current_break;// && currentTarget.current_round > 1
        	if( ((currentTarget.current_round % timerSettings.long_break_frequency) === 1) ){
        		current_break = timerSettings.long_break;
        		this.setState({currentBreakMode: "long_break"});
        	}else{
        		current_break = this.state.short_break;
        		this.setState({currentBreakMode: "short_break"});
        	}
            offset = 2 * Math.PI / (current_break * 60);

            if (this.state.timer > 0) {
                timer = this.state.timer;
            }
            else {
                timer = current_break * 60;
            }
        }

        // timer starting
        if (!this.state.isPaused) {
            this.state.interval = setInterval(() => {
                // timer not ended
                if (--timer >= 0) {

                    context.beginPath();
                    context.arc(centerX, centerY, radius, 1.5 * Math.PI, 1.5 * Math.PI - this.state.eAngle, true);
                    context.lineWidth = 5;
                    context.stroke();
                    
                    this.displayTime();

                    this.setState({
                        timer: timer,
                        eAngle: this.state.eAngle + offset
                    });
                }
                // timer ended
                else {
                	// play audio
                    audio.play();
                	if (this.state.isSessionNow) {
                		// mark current round as complete
                        this.doCompleteRound();
                	}
                    // change state
                    this.setState({
                        isSessionNow: !this.state.isSessionNow,
                        isPaused: false,
                        eAngle: 0
                    });
                    // clear interval
                    clearInterval(this.state.interval);
                    // clear canvas
                    //context.clearRect(0, 0, canvas.width, canvas.height);
                    this.initializeCanvas();
                    if( !currentTarget.is_completed ){
                    	// restart pomodoro
                        this.startPomodoro();
                    }else{
                    	this.stopPomodoro();
                		message.success("You have completed your target, please set new target.");
                	}
                }
            }, 1000); //1000 25
        }
        else {
            clearInterval(this.state.interval);
        }

        this.setState({
            isPaused: !this.state.isPaused
        });
    }
    
    closeModal = () => {
    	this.stopPomodoro();
		this.props.handleClose();
    }
    
    handleStartPomodoro = () => {
    	let { currentTarget } = this.props;
    	if( !currentTarget.is_completed ){
    		this.startPomodoro();
    	}else{
    		//message.success("You have completed your target, please set new target.");
    	}
    }
    
  	render() {
  		const { currentTarget } = this.props;
  		let { mins, secs, currentBreakMode, windowWidth } = this.state;
  		let pageTitle = "("+mins+":"+secs+") Focus - Motivate MD";
  		if( windowWidth > 575 ){
  			windowWidth = 350;
  		}else{
  			windowWidth = 252;
  		}
  		return (
  				<DocumentTitle title={pageTitle}>
				<Modal
	  		        style={{ top: 64 }}
	  		        closable={false}
					maskClosable={false}
	  		        width={720}
	  		        title={currentTarget.title}
	  		        visible={this.props.open}
	  		        onCancel={this.closeModal}
					className="pomodoro-timer-modal"
					footer={
						<div onClick={(e) => e.stopPropagation()}>
			            	<Button className="c-btn__secondary" key="cancel" onClick={this.closeModal}>Close</Button>
		            	</div>
		        	}>
		  			<div className="pomodoro-container">
		  				<div ref="timer" className="pomodoro_actual_timer" id="timer">
		  					<div className="pomodoro-inner-content-container">
		  						<div id="timer" onClick={(e) => {this.handleStartPomodoro(); e.stopPropagation();}} className="center-block">
		  							<canvas id="draw-circle" width={windowWidth} height={windowWidth}></canvas>
		  							{
		  								!currentTarget.is_completed ?
	  										<div className="pomodoro-timer-inner-content-container">
					  							<Icon type={this.state.isPaused ? "pause" : "caret-right"} className="i-play play-button" />
			  									{
					  								this.state.isSessionNow ?
				  										<div className="round-status-content">
															<span className="capital-text">Round</span> {(currentTarget.current_round > currentTarget.total_rounds ? parseInt(currentTarget.current_round - 1) : currentTarget.current_round)} of {currentTarget.total_rounds}
														</div>
													:
														<div className="round-status-content">
															<span className="capital-text">Round</span> {parseInt(currentTarget.current_round - 1)} of {currentTarget.total_rounds}
														</div>
			  									}
							  					{
							  						!this.state.isSessionNow && !currentTarget.is_completed && currentBreakMode == "long_break" ?
						  								<div className="break-mode">Long Break</div>
					  								:
					  									null
							  					}
					  							{
				  									!this.state.isSessionNow && !currentTarget.is_completed && currentBreakMode == "short_break" ?
							  								<div className="break-mode">Short Break</div>
						  								:
						  									null
							  					}
						  						<div className="timer-content">{mins}:{secs}</div>
						  						<div className="timer-min-label-content capital-text">
						  							{
						  								mins == "00" ?
					  										<span>Seconds</span>
				  										:
				  											<span>Minutes</span>
						  							}
						  							
					  							</div>
						  						<div className="timer-rem-label-content capital-text">Remaining</div>
					  						</div>
				  						:
				  							<div className="pomodoro-timer-inner-content-container">
					  							<div className="greet-msg">Congratulations!!!</div>
					  							<div className="greet-sub-msg">You have completed your target, please set new one.</div>
					  						</div>
		  							}
			                    </div>
							</div>
		  				</div>
		  			</div>
	  			</Modal>
  			</DocumentTitle>
  		);
  	}
}

