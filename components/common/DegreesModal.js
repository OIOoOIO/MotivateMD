import { Modal, Button, message } from 'antd';
import Degrees from '../common/Degrees';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import ReactGA from 'react-ga';

export default class DegreesModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      education: {...props.education}
    }
    ReactGA.modalview('/Goals/GPA/Degrees/Graduated');
  }

  handleUpdate = () => {
    let education = this.state.education;
    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_education(education.id, education)
      .then(res => {
        this.props.updateEducation(education)
        this.setState({loading: false});
        this.props.handleClose();
        ReactGA.event({ category: 'Goals Tab', action: 'GPA - Degree - Update' });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }
  changeArray = (key, index, value) => {
    let old = this.state.education[key];
    old[index] = value;
    let new_education = {...this.state.education};
    new_education[key] = old;
    this.setState({
      education: new_education
    });
  }
  addToArray = (key) => {
    let old = this.state.education[key];
    if(this.state.education.degrees[this.state.education.degrees.length - 1] === '' ){
         message.error('Please add degree');
         return;
    }


    let new_education = {...this.state.education};
    new_education[key] = [...old, ''];
    this.setState({
      education: new_education
    });
  }
  removeFromArray = (key, i) => {
    let old = [...this.state.education[key]];
    old.splice(i, 1);
    let new_education = {...this.state.education};
    new_education[key] = old;
    this.setState({
      education: new_education
    });
  }

  render() {
    let { loading } = this.state;
    let { degrees } = this.state.education;

    return (
      <Modal
        closable={false}
        title="Update Your Degrees"
        visible={this.props.open}
        onCancel={this.props.handleClose}
        onClick={(e) => e.stopPropagation()}
        footer={
          <div onClick={(e) => e.stopPropagation()}>
            <Button className="c-btn__secondary" key="cancel" onClick={this.props.handleClose}>Cancel</Button>
            <Button key="submit" loading={loading} onClick={this.handleUpdate}>Update</Button>
          </div>
        }>
        <div className="ml-1 mr-1" onClick={(e) => e.stopPropagation()}>
          <Degrees
            degrees={degrees}
            changeDegree={(i, value) => this.changeArray('degrees', i, value)}
            addToDegrees={() => this.addToArray('degrees')}
            removeDegree={(i) => this.removeFromArray('degrees', i)} />
        </div>
      </Modal>
    );
  }
}