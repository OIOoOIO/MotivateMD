import { Icon, InputNumber } from 'antd';
import NumericInput from 'react-numeric-input';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import PomodoroClockModal from './PomodoroClockModal';
import window from 'global';

export default class Clock extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			openPomodoroClockModal: false,
			timerSettings: "",
			currentTarget: "",
			windowWidth: 0
		}
		this.pomodoroClockModalChild = React.createRef();
	}
	
	initializeCanvas = () => {
		let { windowWidth } = this.state;
    	let canvas = document.getElementById('draw-initial-circle');
        let context = canvas.getContext('2d');
        let centerX = canvas.width / 2;
        let centerY = canvas.height / 2;
        let radius;
        if( windowWidth > 575 ){
        	radius = 165;
  		}else{
  			radius = (290/2) - 10;
  		}
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.lineWidth = 4	;
        let gradient = context.createLinearGradient(0,500,0, 0);
    	gradient.addColorStop(0, '#25B0E4');
    	gradient.addColorStop(1, '#40d6a5');
    	context.strokeStyle = gradient;
        context.stroke();
    }
	
	componentWillReceiveProps() {
		let { currentTarget, timerSettings } = this.props;
		this.setState({currentTarget: currentTarget});
		this.setState({timerSettings: timerSettings});
	}
	
	componentDidMount() {
		setTimeout(()=>{
			this.initializeCanvas();
		},1000);
		this.setState({windowWidth: window.innerWidth});
		/*const cm = new CookieManager();
		const api = new Api(cm.getIdToken());
		api.get_timer_setting()
		.then(res => {
			this.setState({timerSettings: res.data.timer_setting});
		})
        .catch(error => {
        	console.log("componentDidMount get_timer_setting catch ==================>",error);
  	    	this.setState({loading: false});
        });*/
	}
	
	closePomodoroClockModal = () => {
		this.setState({
			openPomodoroClockModal: false
	    });
	}
	
	handleIconClick() {
		this.props.pauseTimer();
  		[
  			this.refs.timer,
  			document.getElementById('setsArea')
  		]
  			.forEach(el => el.classList.add('rotateF'));
	}
  
	openPomodoroClock = (currentTarget) => {
		this.setState({
			currentTarget: currentTarget,
			openPomodoroClockModal: true
		});
		this.pomodoroClockModalChild.current.startPomodoroOnOpen();
	}
	
	doCompleteRound = () => {
		this.props.doCompleteRound();
	}
	
	inputChange = ( value,valueStr,elem ) => {
		this.props.doUpdateTimerSettings( elem.id,value );
	}
	
  	render() {
  		let { currentTarget, timerSettings } = this.props;
  		let { openPomodoroClockModal, windowWidth } = this.state;
  		if( windowWidth > 575 ){
  			windowWidth = 350;
  		}else{
  			windowWidth = 290;
  		}
  		return (
			<div>
  				<div className="pomodoro-container">
					{
						currentTarget ? 
							<div ref="timer" onClick={(e) => {this.openPomodoroClock(currentTarget); e.stopPropagation();}} className="pomodoro__timer" id="timer">
							<canvas id="draw-initial-circle" width={windowWidth} height={windowWidth}></canvas>
							<div className="pomodoro-inner-content-container">
		  						<Icon className="i-play play-button" type="caret-right" />
									<div className="round-status-content">
		  							<span className="capital-text">Round</span> {currentTarget.current_round} of {currentTarget.total_rounds}
									</div>
									<div className="timer-content">{timerSettings.rounds_dur ? timerSettings.rounds_dur : 25}</div>
									<div className="timer-min-label-content capital-text">Minutes</div>
								</div>
  							</div>
						:
							<div ref="timer" className="pomodoro__timer" id="timer">
  								<canvas id="draw-initial-circle" width={windowWidth} height={windowWidth}></canvas>
  								<div className="pomodoro-inner-content-container">
	  								<span className="pomodoro-message-content">Please set target first.</span>
	  							</div>
  							</div>
					}
					<PomodoroClockModal
						ref={this.pomodoroClockModalChild}
	  					open={openPomodoroClockModal}
	  					handleClose={this.closePomodoroClockModal}
  						currentTarget={currentTarget}
						timerSettings={timerSettings}
						doCompleteRound={this.doCompleteRound}
					/>
				</div>
				<div className="pomodoro-timer-settings">
					<div className="capital-text timer-setting-header">
						Timer Settings
					</div>
					{
						timerSettings ?
							<div className="timer-setting-container row">
								<div className="col-12 col-sm-4 ts-focus-section">
									<div className="capital-text focus-title">
										Focus For
									</div>
									<div className="ts-focus-input">
										<NumericInput 
					      					className="form-control"
				      						placeholder="1"
											id="rounds_dur"
											mobile={false}
				  							value={timerSettings.rounds_dur ? timerSettings.rounds_dur : ""}
					      					onKeyDown={this.detectEnterKeyDown}
					      					onChange={this.inputChange}
				      						min={1}
				  						/>
									</div>
									<div className="ts-focus-mins">
										mins
									</div>
								</div>
								<div className="col-12 col-sm-8 ts-break-section">
									<div className="capital-text ts-break-title row">
										<div className="col-8">Breaks</div>
										<div className="col-4"></div>
									</div>
									<div className="ts-break-container row">
										<div className="col-4 no-padding-left ts-short-break-section">
											<div className="capital-text focus-title">
												Short
											</div>
											<div className="ts-focus-input">
												<NumericInput 
							      					className="form-control"
						      						placeholder="1"
													id="short_break"
													mobile={false}
						  							value={timerSettings.short_break ? timerSettings.short_break : ""}
							      					onKeyDown={this.detectEnterKeyDown}
							      					onChange={this.inputChange}
						      						min={1}
						  						/>
											</div>
											<div className="ts-focus-mins">
												mins
											</div>
											<hr className="vr-line" />
										</div>
										<div className="col-4 no-padding-left ts-long-break-section">
											<div className="capital-text focus-title">
												Long
											</div>
											<div className="ts-focus-input">
												<NumericInput 
							      					className="form-control"
						      						placeholder="1"
													id="long_break"
													mobile={false}
						  							value={timerSettings.long_break ? timerSettings.long_break : ""}
							      					onKeyDown={this.detectEnterKeyDown}
							      					onChange={this.inputChange}
						      						min={1}
						  						/>
											</div>
											<div className="ts-focus-mins">
												mins
											</div>
										</div>
										<div className="col-4 no-padding-left ts-long-round-section">
											<div className="capital-text focus-title">
												After
											</div>
											<div className="ts-focus-input">
												<NumericInput 
							      					className="form-control"
						      						placeholder="1"
													id="long_break_frequency"
													mobile={false}
						  							value={timerSettings.long_break_frequency ? timerSettings.long_break_frequency : ""}
							      					onKeyDown={this.detectEnterKeyDown}
							      					onChange={this.inputChange}
						      						min={1}
						  						/>
											</div>
											<div className="capital-text ts-focus-mins">
												Rounds
											</div>
										</div>
									</div>
								</div>
							</div>
						:
						<div className="message-container">
							Please set target first.
						</div>
					}
				</div>
			</div>
  		);
  	}
}

