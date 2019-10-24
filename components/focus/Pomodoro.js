import Clock from './Clock';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';

export default class Pomodoro extends React.Component {
	constructor(props) {
		super(props);
		this.reduceOnSecond = this.reduceOnSecond.bind(this);
		this.startCountdown = this.startCountdown.bind(this);
		this.pauseTimer = this.pauseTimer.bind(this);
		this.increaseSessionValue = this.increaseSessionValue.bind(this);
		this.decreaseSessionValue = this.decreaseSessionValue.bind(this);
		this.increaseBreakValue = this.increaseBreakValue.bind(this);
		this.decreaseBreakValue = this.decreaseBreakValue.bind(this);
		this.togglePauseState = this.togglePauseState.bind(this);
		this.state = {
			intervalID: null,
			countdown: 0,//900,
			session: 0,//900,
			break: 0,//300,
			displayedMinutes: '',
			displayedSeconds: '',
			isPaused: true,
			isSession: true,
			isBreak: false,
			roundCount: 1,
			count: 1,
			longBreak: 45,
			longBreakFrequency: 3,
			currentTarget: ""
		};
	}

	pauseTimer() {
		clearInterval(this.state.intervalID);
	}

	increaseSessionValue() {
		if(this.state.session < 3600) {
			this.setState({
				session: this.state.session + 60,
				countdown: this.state.session + 60
		  }, () => this.renderMinChange());
		}
		else {
			Materialize.toast('You reached the maximum', 4000, 'rounded')
		}
	}

	decreaseSessionValue() {
		//if(this.state.session > 900) {
		if(this.state.session > 60) {
			this.setState({
				session: this.state.session - 60,
				countdown: this.state.session - 60
			}, () => this.renderMinChange());
		}
		else {
			Materialize.toast('You reached the minimum', 4000, 'rounded')
		}
	}

	increaseBreakValue() {
		//if(this.state.break < 900) {
		if(this.state.break < 60) {
			this.setState({
				break: this.state.break + 60,
			});
		}
		else {
			Materialize.toast('You reached the maximum', 4000, 'rounded')
		}
	}

	decreaseBreakValue() {
		//if(this.state.break > 300) {
		if(this.state.break > 30) {
			this.setState({
				break: this.state.break - 60,
			});
		}
		else {
			Materialize.toast('You reached the minimum', 4000, 'rounded')
		}
	}
	
	componentWillMount() {
	    const cm = new CookieManager();
        const api = new Api(cm.getIdToken());
        api.get_timer_list()
          .then(res => {
            this.setState({
                countdown: res.data.timer_list[0].rounds_dur,
                session: res.data.timer_list[0].rounds_dur,
                break: res.data.timer_list[0].short_break,
                roundCount: res.data.timer_list[0].total_rounds,
                count: res.data.timer_list[0].current_round,
                longBreak: res.data.timer_list[0].long_break,
                longBreakFrequency: res.data.timer_list[0].long_break_frequency
            });
            for(var i=0; i < res.data.timer_list.length; i++){
            	if( i == 0 ){
            		this.setState({currentTarget: res.data.timer_list[i]});
            	}
            }
            this.renderMinChange();
          })
          .catch(error => {
    	    console.log('Oops! Something went wrong! ====================>',error);
            this.setState({loading: false});
          });
	}

	renderMinChange(number=this.state.countdown) {
		const countdown = number
		const	minutes = Math.floor(number / 60);
		const	seconds = number % 60;
		const	displayedMinutes = minutes < 10 ? '0' + minutes: minutes.toString();
		const	displayedSeconds = seconds < 10 ? '0' + seconds: seconds.toString();
		this.setState({
			countdown,
			displayedMinutes,
			displayedSeconds
		});
	}

	reduceOnSecond() {
		this.renderMinChange(--this.state.countdown);
	}

	togglePauseState() {
		this.setState({
			isPaused: !this.state.isPaused
		});
	}

	startCountdown() {
		if(this.state.isPaused) {
			this.renderMinChange();
			this.setState({
				//intervalID: window.setInterval(this.reduceOnSecond, 1000),
				intervalID: window.setInterval(this.reduceOnSecond, 100),
				isPaused: !this.state.isPaused,
			});

		}
		else {
			this.pauseTimer();
			this.setState({
				isPaused: !this.state.isPaused
			});
	  }
	}

	componentDidUpdate() {
		if (this.state.countdown < 0 && this.state.isSession) {
			if(this.state.longBreakFrequency < this.state.count){
                this.setState({
                    isSession: !this.state.isSession,
                    isBreak: !this.state.isBreak,
                    countdown: this.state.longBreak,
                }, () => this.renderMinChange());
			}else{
                this.setState({
                    isSession: !this.state.isSession,
                    isBreak: !this.state.isBreak,
                    countdown: this.state.break,
                }, () => this.renderMinChange());
            }
		}
		else if(this.state.countdown < 0 && this.state.isBreak) {
			if(this.state.roundCount <= this.state.count){
			    this.pauseTimer();
			    this.setState({
                    isSession: !this.state.isSession,
                    isBreak: !this.state.isBreak,
                    countdown: this.state.session,
                    isPaused: !this.state.isPaused,
                    count: 1
                }, () => this.renderMinChange() && this.startCountdown());
			}
			this.setState({
				isSession: !this.state.isSession,
				isBreak: !this.state.isBreak,
				countdown: this.state.session,
				isPaused: !this.state.isPaused,
				count: this.state.count + 1
			}, () => this.renderMinChange() && this.startCountdown());
		}
	}

	render() {
		let currentTarget = this.props.currentTarget ? this.props.currentTarget : this.state.currentTarget;
		return(
			<div className="card waves-effect waves-block waves-light">
				<div className="pomodoro">
				<Clock
					startCountdown={this.startCountdown}
					displayedMinutes={this.state.displayedMinutes}
					displayedSeconds={this.state.displayedSeconds}
					displayedRound={this.state.count <= 4? this.state.count : 4}
					pauseTimer={this.pauseTimer}
					roundCount={this.state.roundCount}
					currentTarget={currentTarget}
				/>
				</div>
			</div>
		);
	}
}
