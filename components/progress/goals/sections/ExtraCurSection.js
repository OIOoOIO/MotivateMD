import { Button, Progress, Input} from 'antd';
import TextareaAutosize from 'react-autosize-textarea';
import CookieManager from '../../../../services/CookieManager';
import Api from '../../../../services/Api';
import GoalsModal from '../../../common/GoalsModal';
import ReactDragList from 'react-drag-list';
import GoalProgressBar from '../GoalProgressBar';
import ReactGA from 'react-ga';
import ShowLearnMoreModal from '../../../common/ShowLearnMoreModal';
import userMdSolid from '../../../../assets/images/color_icons/user-md-solid-white.svg';

export default class ExtraCurSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open:       false,
      loading:    false,
      open_goals: false,
      extracurs:  props.extracurs,
      new_title:  '',
      opened_index: -1,
      opened_title: '',
      opened_note: '',
      open_learn_more_link: false
    }
    this.showLearnMoreModalChild = React.createRef();
  }
  componentWillReceiveProps(new_props) {
    this.setState({
      extracurs: [...new_props.extracurs]
    })
  }
  changeNewTitle = (e) => {
    this.setState({
      new_title: e.target.value
    });
  }
  changeOpenedTitle = (e) => {
    this.setState({
      opened_title: e.target.value,
    });
  }
  changeOpenedNote = (e) => {
    this.setState({
      opened_note: e.target.value,
    });
  }
  handleAdd = (e) => {
    e.stopPropagation();
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.create_extracur({title: this.state.new_title})
      .then(res => {
        let new_list = [...this.state.extracurs, res.data.extracur];
        this.setState({ 
          extracurs: new_list,
          new_title: '' 
        });
        this.props.updateExtracurs(new_list);
        ReactGA.event({ category: 'Goals Tab', action: ' Work & Activities - added' });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
      });
  }
  
  updateListOrder = (evt, updated) => {
    let { opened_index } = this.state;
    for (var i = 0; i < updated.length; i++) {
      let extracur = updated[i];
      if (extracur.sort_order !== i) {
        if (extracur.sort_order === opened_index) {
          this.setState({
            opened_index: i,
            opened_title: extracur.title,
            opened_note:  extracur.note
          })
        }
        extracur.sort_order = i;
        const cm = new CookieManager();
        const api = new Api(cm.getIdToken());
        api.update_extracur(extracur.id, extracur)
          .catch(error => {
            alert('Oops! Something went wrong!');
            console.log(error);
          });
      }
    }
    this.props.updateExtracurs(updated);
  }

  closeGoalsModal = () => {
    this.setState({
      open_goals: false
    })
  }

  toggleForEdit = (e, index) => {
    e.stopPropagation();
    if (this.state.opened_index === index) {
      this.setState({
        opened_index: -1,
        opened_title: '',
        opened_note: ''
      });
    } else {
      this.setState({
        opened_index: index,
        opened_title: this.state.extracurs[index].title,
        opened_note:  this.state.extracurs[index].note
      });
    }
  }

  toggleLogged = (e, index) => {
    e.stopPropagation();
    let extracur = this.state.extracurs[index];
    extracur.logged = !extracur.logged;
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_extracur(extracur.id, extracur)
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
      });
    let extracurs = [...this.state.extracurs];
    extracurs[index] = extracur;
    this.setState({
      extracurs: extracurs
    });
  }

  deleteOpened = (e) => {
    e.stopPropagation();
    let extracur = {...this.state.extracurs[this.state.opened_index]};
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.delete_extracur(extracur.id)
      .then(resp => {
        let new_list = [...this.state.extracurs];
        new_list.splice(this.state.opened_index,1);
        this.setState({
          opened_index: -1,
          opened_title: '',
          opened_note: '',
          extracurs: new_list
        });
        ReactGA.event({ category: 'Goals Tab', action: ' Work & Activities - deleted' });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
      });
  }

  updateOpened = (e) => {
    e.stopPropagation();
    this.setState({loading: true});
    let extracur = {...this.state.extracurs[this.state.opened_index]};
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    extracur.title = this.opened_title.input.value;
    extracur.note  = this.opened_note.value;
    api.update_extracur(extracur.id, extracur)
      .then(resp => {
        let new_list = [...this.state.extracurs];
        new_list[this.state.opened_index] = extracur;
        this.setState({
          opened_index: -1,
          opened_title: '',
          opened_note: '',
          extracurs: new_list,
          loading: false
        });
        ReactGA.event({ category: 'Goals Tab', action: ' Work & Activities - updated' });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({loading: false});
      });
  }

  getLogged = () => {
    let count = 0;
    let { extracurs } = this.state;
    for (var i = 0; extracurs && i < extracurs.length; i++) {
      let extracur = extracurs[i];
      if (extracur.logged) {
        count += 1;
      }
    }
    return count;
  }
  detectEnterKeyDown = (e) => {
    if(e.key === 'Enter'){
      this.handleAdd(e);
    }
  }

  detectUpdateEnterKeyDown = (e) => {
    if(e.key === 'Enter'){
      this.updateOpened(e);
    }
  }

  closeShowLearnLinkModal = () => {
        this.setState({
          open_learn_more_link: false
        });
    }

  openMoreLink = (val, more_link) => {
      this.showLearnMoreModalChild.current.setLearnMoreText(val,more_link);
      this.setState({
          open_learn_more_link: true
      })
  }


  render() {
    let { loading, open, open_goals, extracurs, new_title, opened_index, opened_title, opened_note } = this.state;
    let { goal_selection } = this.props;
    let savedValue = ''
    let minRows = 2

    return (
      <div className="c-progress c-progress--goal" onClick={() => this.setState({ open: !open })}>
        <div className="row mr-0 ml-0" style={{alignItems: 'center'}}>
          <div className="col-2 tright c-progress__title progress-title">Work & Activities</div>
          <div className="col-7 progress-bar">
            <GoalProgressBar
              left_text={`${(goal_selection.extra_curs - this.getLogged() > 0 ? goal_selection.extra_curs - this.getLogged() : 0)} Activities Left`}
              done_text={`Completed ${this.getLogged()} Activities`}
              total={goal_selection.extra_curs}
              completed={this.getLogged()}
              color="#a3a1f8" />
          </div>
          <div className="col-2 c-progress__title progress-hrs">
            {goal_selection.extra_curs} Activities { open ? <a onClick={(e) => {e.stopPropagation(); this.setState({open_goals: true})}}><i className="c-progress__edit_icon i-edit" /></a> : null } 
          </div>
          <div className="col-1 progress-arrow">
            <a onClick={() => this.setState({ open: !open })}>
              <i className={ open ? "i-angle-up" : "i-angle-down" } />
            </a>
          </div>
        </div>
        {
          open ?
            <div className="row mr-0 ml-0 mt-1 reponsive-row-cont">
              <div className="offset-2 col-md-10 col-lg-7 clear-left">
                <ReactDragList
                  key={Math.random()}
                  dataSource={extracurs}
                  row={(record, index) => (
                    <div key={index} className="c-ec" onClick={(e) => this.toggleForEdit(e, index)}>
                      <div className="c-ec__row">
                        <div className="c-ec__num">{index + 1}</div>
                        <div className="c-ec__title">
                          {
                            opened_index === index ?
                              <Input placeholder="Title"
                                onClick={(e) => e.stopPropagation()}
                                ref={(c) => { if (c !== null) this.opened_title = c; }}
                                className="c-ec__title__input"
                                onKeyDown={this.detectUpdateEnterKeyDown}
                                defaultValue={opened_title} /> : record.title
                          }
                        </div>
                        <div className="c-ec__actions">
                          <div className="c-ec__actions__arrow">
                            <i onClick={(e) => this.toggleForEdit(e, index)} 
                              className={ opened_index === index ? "i-angle-up" : "i-angle-down" } />
                          </div>
                          <div className="c-ec__actions__logged">
                            <i onClick={(e) => this.toggleLogged(e, index)} 
                              className={record.logged ? "i-checked" : "i-unchecked"}></i>
                          </div>
                        </div>
                      </div>
                      {
                        opened_index === index ?
                          <div>
                            <TextareaAutosize
                              onClick={(e) => e.stopPropagation()}
                              className="c-ec__note"
                              placeholder="Add a note..." 
                              defaultValue={opened_note}
                              innerRef={(c) => { if (c !== null) this.opened_note = c; }}
                              />
                            <div className="mt-h">
                              <Button className="mr-1 is-small" onClick={this.updateOpened} loading={loading} disabled={loading} onKeyDown={this.updateOpened}>Save</Button>
                              <a className="mr-1" onClick={(e) => this.toggleForEdit(e, index)}>Cancel</a>
                              <a onClick={this.deleteOpened}>Delete</a>
                            </div>
                          </div> : 
                            null
                      }
                    </div>
                  )}
                  onUpdate={this.updateListOrder}
                  animation="100"
                  handles={false}
                  ghostClass="drag-ghost"
                />
                <div className="c-ecform">
                  <div className="c-ecform__num">{extracurs.length + 1}</div>
                  <div className="c-ecform__name">
                    <Input className="c-ecform__name__input" placeholder="Type here to add a new activity…"
                      value={new_title}
                      onClick={(e) => e.stopPropagation()}
                      onChange={this.changeNewTitle} 
                      onKeyDown={this.detectEnterKeyDown} />
                  </div>
                  <div className="c-ecform__addbtn">
                    <i onClick={this.handleAdd} className="i-plus-outline"></i>
                  </div>
                </div>
                <div className="c-list_info">
                  <div className="c-list_info__left">Drag to Sort</div>
                  <div className="c-list_info__right">↵ Press Enter to Add Another</div>
                </div>
              </div>
              <div className="offset-9 col-2 tright md-btn-cont">
                <a className="c-btn-blue-gradient handle-margin-right" onClick={(e) => this.openMoreLink('AMCAS allows you to submit a maximum of 15 experiences into their application.  Examples of these are: volunteer experiences (previous section), work experiences, work & activities, awards, honors, publications, etc.  Of these 15 experiences, you may identify three that you consider to be the “most meaningful”. We recommend having at least 12 experiences with 3 of them being selected as “most meaningful"', "https://www.motivatemd.com/mymentor/work-and-activities/")}><img src={userMdSolid} className="gradient-user-md" /></a>
              </div>
              <div className="col-1 tright md-btn-blank-cont"></div>
            </div> : 
              null
        }
        <GoalsModal 
          open={open_goals}
          goal_selection={goal_selection}
          updateGoalSelection={this.props.updateGoalSelection}
          handleClose={this.closeGoalsModal} />
        <ShowLearnMoreModal
          open={this.state.open_learn_more_link}
          handleClose={this.closeShowLearnLinkModal}
          ref={this.showLearnMoreModalChild}
        />
      </div>
    );
  }
}