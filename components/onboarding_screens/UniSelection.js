import { Button, Select, message } from 'antd';
import ReactDragList from 'react-drag-list';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import school_i from '../../assets/images/ob/school.svg';
import ReactGA from 'react-ga';

export default class UniSelection extends React.Component {
  constructor(props) {
    super(props);
    let uni_selections = props.uni_selections;
    //if (uni_selections.length === 0) {
      //uni_selections = [...uni_selections, '']
   // }
    this.state = {
      uni_selections: uni_selections,
      loading: false
    };
    this.unis = props.universities.map((u, i) => {
      return(
        <Select.Option key={u.name} value={u.id}>{u.name}</Select.Option>
      );
    })
    ReactGA.modalview('/Onboarding - Motivate MD/Top Schools/University Selection');
  }
  viewError = () => {
      message.error('Please select university ');
   }



  addUni = () => {
     let errorsArePresent = false;
    if(this.state.uni_selections[this.state.uni_selections.length - 1] === ''){
       this.viewError();
       return;
    }
    this.setState({
      uni_selections: [...this.state.uni_selections, '']
    })
  }

  removeUni = (i) => {
    let old = this.state.uni_selections;

    old.splice(i, 1);
    this.setState({
      uni_selections: old
    })
    this.handleContinue()
  }
  handleContinue = () => {
    let uni_selections = this.state.uni_selections;
    this.setState({loading: true});
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_uni_selections(uni_selections)
      .then(res => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Top Schools/University Selection',
    		  action: 'Continue Clicked Success'
    	  });
        this.props.updateUniSelections(uni_selections);
        //this.props.updateScreen('goal_selection');
        //this.props.updateStep(1);
        this.setState({loading: false});
      })
      .catch(error => {
    	  ReactGA.event({
    		  category: '/Onboarding - Motivate MD/Top Schools/University Selection',
    		  action: 'Continue Clicked Failure'
    	  });
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }
  setUni = (i, id) => {
    let old = [...this.state.uni_selections];
    old[i] = {
      priority: i,
      university_id: id
    }
    old.push(old[i])
    this.setState({
      uni_selections: old
    })
    this.handleContinue()
  }

  setNewUni = (id) => {
      let old = this.state.uni_selections;
      old[old.length] = {
        priority: old.length,
        university_id: id,
        note: ''
      }
      this.setState({
        uni_selections: old
      })
     this.handleContinue()
  }

  updateUniListOrder = (evt, updated) => {
    let itemList = []
    for (var i = 0; i < updated.length; i++) {
      let item = updated[i];
      if (item.sort_order !== i) {
          let temp_item = {
            priority: i,
            university_id: item.university_id,
            id: item.id
          }
         itemList.push(temp_item)
      }
    }
    this.setState({
      uni_selections: itemList
    })
    this.handleContinue(this.state.uni_selections)
  }

  handleContinueStep = () => {
    this.props.updateScreen('goal_selection');
    this.props.updateStep(1);
  }




  render() {
    let { universities } = this.props;
    let { uni_selections } = this.state;
    return (
      <div className="tcenter">
        <img src={school_i} style={{width: '30px'}}/>
        <h1 className="h3-like tcenter mb-3 mt-1">Top School Picks</h1>
        <p className="h4-like mb-1">Coming Soon: Depending on your membership the app will automatically suggest GPA and MCAT goals based on the competitiveness of your selected top schools.</p>
        {
          <ReactDragList
            key={Math.random()}
            dataSource={uni_selections}
            row={(u, i) => {
                return (
                  <div key={`university_${i}`} className="row">
                    <div className="col-md-6 offset-md-3 c-uniselect">
                      <div className="c-uniselect__num">{i + 1}</div>
                      <div className="c-uniselect__dropdown">
                        <Select showSearch placeholder="Select a University..."
                          optionFilterProp="children"
                    	  getPopupContainer={triggerNode => triggerNode.parentNode}
                          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          value={u.university_id}
                          onChange={(val) => this.setUni(i, val)}>
                          {this.unis}
                        </Select>
                      </div>
                      <div onClick={() => this.removeUni(i)} className="c-uniselect__removebtn"><i className="i-close"></i></div>
                    </div>
                  </div>
                );
             }}
             onUpdate={this.updateUniListOrder}
             animation="100"
             handles={false}
             ghostClass="drag-ghost" />
        }
        <div className="col-md-6 offset-md-3 c-uniselect">
          <div className="c-uniselect__num">{uni_selections.length + 1}</div>
          <div className="c-uniselect__dropdown">
            <Select showSearch placeholder="Select a University..."
              optionFilterProp="children"
        	  getPopupContainer={triggerNode => triggerNode.parentNode}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              value={''}
              onChange={(val) => this.setNewUni(val)}>
              {
                  this.props.universities.map((u, i) => {
                    return(
                      <Select.Option key={u.name} value={u.id}>{u.name}</Select.Option>
                    );
                  })
              }
            </Select>
          </div>
        </div>
        <div className="mt-2">
            <Button onClick={this.handleContinueStep} >Continue</Button>
        </div>
      </div>
    );
  }
}