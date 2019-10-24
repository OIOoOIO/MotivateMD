import { Input, InputNumber, Icon, message } from 'antd';
import NumericInput from 'react-numeric-input';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import moment from 'moment';
import ReactDragList from 'react-drag-list';
import Loader from '../common/Loader';
import { validNumber } from '../../utils/helpers';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';

export default class TimerList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			timerList: [],
			loading_new: false,
			timer_rounds: 1,
			timer_title: "",
			currentIndex: -1,
			currentInput: "",
			totalFocusTime: ""
		}
	}
	
	componentWillReceiveProps() {
		let { timerList } = this.props;
		this.setState({
			timerList: timerList
		});
		let totalFocusTime = 0;
		let totalFocusTimeHr = 0;
		let totalFocusTimeMin = 0;
		let totalFocusTimeStr = "";
		for( let i=0;i<timerList.length;i++ ){
			totalFocusTime = totalFocusTime + parseInt(timerList[i].total_focus_time);
		}
		totalFocusTimeHr = parseInt(totalFocusTime/60);
		totalFocusTimeMin = totalFocusTime % 60;
		if( totalFocusTimeHr > 0 && totalFocusTimeHr > 1 ){
			totalFocusTimeStr = totalFocusTimeStr + totalFocusTimeHr + " Hours ";
		}else if( totalFocusTimeHr > 0 && totalFocusTimeHr === 1 ){
			totalFocusTimeStr = totalFocusTimeStr + totalFocusTimeHr + " Hour ";
		}
		if( totalFocusTimeMin > 0 && totalFocusTimeMin > 1 ){
			totalFocusTimeStr = totalFocusTimeStr + totalFocusTimeMin + " Minutes";
		}else if( totalFocusTimeMin > 0 && totalFocusTimeMin === 1 ){
			totalFocusTimeStr = totalFocusTimeStr + totalFocusTimeMin + " Minute";
		}
		this.setState({totalFocusTime: totalFocusTimeStr});
	}
  
  	sendCurrentTarget = (currTarget) => {
  		this.props.getCurrentTarget(currTarget);
  	}
  
  	changeInput = (key,value) => {
  		this.setState({currentIndex: -1});
  		if( key == "title" ){
  			this.setState({timer_title: value});
  		}else{
  			this.setState({timer_rounds: key});
  			//this.handleAddTarget();
  		}
  	}
  	
  	editChangeInput = (key,value,elem) => {
  		let { timerList } = this.state;
  		let currentIndex;
  		if( key === "title" ){
  			timerList[elem].title = value;
  			currentIndex = elem;
  			this.setState({currentInput: "title"});
  			this.props.updateTarget(key,value,elem);
  		}else{
  			timerList[elem.id].total_rounds = key;
  			currentIndex = elem.id;
  			this.setState({currentInput: "total_rounds"});
  			this.props.updateTarget("total_rounds",key,elem.id,true);
  		}
  		this.setState({currentIndex: currentIndex});
  		this.setState({timerList: timerList});
  	}
  	
  	editDetectEnterKeyDown = (e,index) => {
  		if( ( e.key === 'Enter' ) ){
  			this.props.updateTarget("","",index,true);
  			this.setState({currentIndex: -1});
  		}
  	}
  	
  	detectEnterKeyDown = (e) => {
  		if( ( e.key === 'Enter' ) && ( this.state.timer_title != "" && this.state.timer_rounds != "" ) ){
  			this.handleAddTarget();
  		}
  	}
  	
  	deleteTarget = (index,targetId) => {
  		this.props.deleteTarget(index,targetId);
  	}
  
  	handleAddTarget = () => {
  		if( this.state.timer_title != "" && this.state.timer_rounds != "" ){
  			const cm = new CookieManager();
  			const api = new Api(cm.getIdToken());
  			let target_obj = {
				title: this.state.timer_title,
				total_rounds: this.state.timer_rounds
  			}
  			api.create_timer(target_obj)
  			.then(res => {
  				ReactGA.event({
  					category: 'Focus',
  					action: 'Create New Target',
  					label: this.state.timer_title
  				});
  				this.setState({timer_title: ""});
  				this.setState({timer_rounds: 1});
  				this.props.addNewTarget();
  			})
  			.catch(error => {
  				console.log('create_timer catch =========================>',error);
  				this.setState({ loading_new: false });
  			});
  		}else{
  			//message.error("Please enter title and rounds.");
  		}
  	}
  	
  	updateTargetOrder = ( evt,updated ) => {
  		this.props.updateTargetOrder(evt,updated);
  	}
  	
  	getMinNumber = (currentTarget) => {
  		if( currentTarget.is_completed ){
  			return currentTarget.current_round;
  		}else if( !currentTarget.is_completed && currentTarget.current_round > 1 ){
  			return currentTarget.current_round - 1;
  		}else if( !currentTarget.is_completed && currentTarget.current_round <= 1 ){
  			return 1;
  		}
  	}

  render() {
    let { loading_new, timer_rounds, timer_title, totalFocusTime } = this.state;
    return (
      <div className="pomodoro-left-panel-container">
      	<div className="row">
      		<div className="no-padding col-2">
      			
      		</div>
      		<div className="no-left-padding col-10">
      			<div className="target-header target-list-header target-list-content">
	      			<span className="capital-text">Today's Targets</span>
	      			<span className="capital-text small-title float-right">Rounds</span>
	      			{
	      				totalFocusTime ? 
      						<div className="total-focus-time">
	      						Today’s Total Focus Time: {totalFocusTime}
	      					</div>
  						:
  							null
	      			}
      			</div>
      		</div>
      	</div>
      	<ReactDragList
	    	key={Math.random()}
	    	dataSource={this.state.timerList}
	    	row={(tl, index) => (
	    		<div className="row">
	          		<div className="no-padding action-panel col-2">
	          			<span onClick={(e) => {this.sendCurrentTarget(tl); e.stopPropagation();}} className="c-ec__actions__logged">
	          				{
	          					tl.is_completed ?
          							<Icon type="check-circle" theme="filled" />
  								:
  									null
	          				}
	          				{
	          					!tl.is_completed && tl.current_round === 1 ?
          							<Icon type="play-circle" />
  								:
  								null
	          				}
	          				{
	          					( tl.current_round != 1 && !tl.is_completed ) ?
          							<Icon type="play-circle" theme="filled" />
  								:
  									null
	          				}
	    				</span>
	          		</div>
	          		<div className="no-left-padding col-10 target-list-content-container" key={`col_${index}`}>
	          			<div key={`list_${index}`} className="target-list-content target-existing-list-content">
	          				<span className="list-content seq-content">{tl.sort_order + 1}</span>
	    	      			<span key={`span_${index}`} className="list-content left-content">
			      				<Input
				                    placeholder="Type here to add a new target"
				                    className="c-geform__input"
			                    	key={`title_${index}`}
			      					ref={ (component) => { if( this.state.currentInput == "title" && this.state.currentIndex == index && component != null ) ReactDOM.findDOMNode(component).focus(); }}
				                	value={tl.title ? tl.title : ""}
			      					onKeyDown={(e) => this.editDetectEnterKeyDown(e, index)}
				                    onChange={(e) => this.editChangeInput('title', e.target.value, index)} />
			      			</span>
	    	      			<span className="list-content right-content">
	    	      				{(tl.is_completed ? tl.current_round : tl.current_round - 1)}/
	    	      				<NumericInput 
			      					className="form-control"
		      						placeholder="1"
									id={index}
	    	      					mobile={false}
	    	      					key={`total_rounds_${index}`}
	    	      					ref={ (component) => { if( this.state.currentInput == "total_rounds" && this.state.currentIndex == index && component != null ) ReactDOM.findDOMNode(component).focus(); }}
		  							value={tl.total_rounds ? tl.total_rounds : ""}
			      					onKeyDown={(e) => this.editDetectEnterKeyDown(e, index)}
			      					onChange={this.editChangeInput}
		      						min={this.getMinNumber(tl)}
		  						/>
	    	      				<i className="i-close c-getable__delete_btn" onClick={(e) => this.deleteTarget(index, tl.id)} />
    	      				</span>
	          			</div>
	          		</div>
	          	</div>
	    	)}
	    	onUpdate={this.updateTargetOrder}
	    	animation="100"
	    	handles={false}
	    	ghostClass="drag-ghost"
	    />
		<div className="row">
  			<div className="no-padding action-panel col-2">
  				<span onClick={(e) => {this.handleAddTarget(); e.stopPropagation();}} className="c-geform__addbtn">
					<i className="i-plus-outline"></i>
				</span>
  			</div>
      		<div className="no-left-padding col-10">
      			<div className="target-list-header target-list-content">
      				<span className="list-content seq-content">
      					{
      						this.state.timerList ?
  								this.state.timerList.length + 1
							:
								1
      					}
  					</span>
	      			<span className="list-content left-content">
		      			<Input
		                    placeholder="Type here to add a new target"
		                    className="c-geform__input"
		                	value={timer_title ? timer_title : ""}
		      				onKeyDown={this.detectEnterKeyDown}
		                    onChange={(e) => this.changeInput('title', e.target.value)} />
	      			</span>
	      			<span className="list-content new-target-content right-content">
	      				<NumericInput 
	      					className="form-control"
      						placeholder="1"
							id="myId"
							mobile={false}
  							value={timer_rounds ? timer_rounds : ""}
	      					onKeyDown={this.detectEnterKeyDown}
	      					onChange={this.changeInput}
      						min={1}
  						/>
      				</span>
      			</div>
      		</div>
      	</div>
      	<div className="row">
      		<div className="offset-2 col-10 col-hint-msg-container">
      			<div className="c-list_info">
		      		<div className="c-list_info__left">Drag to Sort</div>
			        <div className="c-list_info__right">↵ Press Enter to Add Another</div>
		        </div>
      		</div>
  		</div>
	  </div>
    );
  }
}