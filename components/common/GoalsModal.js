import { Modal, Button } from 'antd';
import Goals from '../common/Goals';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import ReactGA from 'react-ga';

export default class GoalsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      goal_selection: {...props.goal_selection}
    }
    ReactGA.modalview('/Goals/EditGoals');
  }
  changeInput = (key, value) => {
	  if( key === 'gpa' && parseFloat(value) > 4 ){
		  
	  }else if( key === 'extra_curs' && (parseInt(value) > 15 || parseFloat(value) > 15) ){
		  
	  }else{
	    let new_goal_selection = {...this.state.goal_selection};
	    new_goal_selection[key] = value;
	    this.setState({
	      goal_selection: new_goal_selection
	    });
	  }
  }

  handleUpdate = () => {
    let goal_selection = this.state.goal_selection;
    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_goal_selection(goal_selection.id, goal_selection)
      .then(res => {
        this.props.updateGoalSelection(goal_selection)
        this.setState({loading: false});
        this.props.handleClose();
        ReactGA.event({ category: 'Goals Tab', action: 'Edit Goals - Update' });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }

  render() {
    let { loading } = this.state;
    let { gpa, mcat, shadowing, volunteering, extra_curs, recoms } = this.state.goal_selection;
    return (
      <Modal
        closable={false}
        title="Update Your Goals"
        visible={this.props.open}
        onCancel={this.props.handleClose}
        footer={
          <div onClick={(e) => e.stopPropagation()}>
            <Button className="c-btn__secondary" key="cancel" onClick={this.props.handleClose}>Cancel</Button>
            <Button key="submit" loading={loading} onClick={this.handleUpdate}>Update</Button>
          </div>
        }>
        <div className="ml-1 mr-1" onClick={(e) => e.stopPropagation()}>
          <Goals
            gpa={gpa}
            mcat={mcat}
            shadowing={shadowing}
            volunteering={volunteering}
            extra_curs={extra_curs}
            recoms={recoms}
            changeInput={this.changeInput} />
        </div>
      </Modal>
    );
  }
}