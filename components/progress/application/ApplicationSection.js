import { Progress, Input, message, Button, Select } from 'antd';
import TextareaAutosize from 'react-autosize-textarea';
import CookieManager from '../../../services/CookieManager';
import Api from '../../../services/Api';
import AppProgressBar from './AppProgressBar';
import ReactDragList from 'react-drag-list';
import ReactGA from 'react-ga';
import ShowLearnMoreModal from '../../common/ShowLearnMoreModal';
import userMdSolid from '../../../assets/images/color_icons/user-md-solid-white.svg';

export default class ApplicationSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      selected_index: -1,
      loading_new: false,
      loading_edit: false,
      loading: false,
      new_item: {
        kind: props.kind,
        title: '',
        complete: false,
        note: ''
      },
      new_note:{
        title: '',
        body: ''
      },
      editNote: true,
      items: this.props.items,
      edit_note_index: -1,
      edit_uni_note_index: -1,
      edit_uni_flag: false,
      note: '',
      open_learn_more_link: false,
      open_new_application_note: false,
      edit_application_note_flag: false
    }
    this.item_template = {
      kind: props.kind,
      title: '',
      complete: false,
      note: ''
    }
    this.showLearnMoreModalChild = React.createRef();

  }

  handleEditNote = (e,i) => {
    e.stopPropagation();
    if (this.state.edit_note_index < 0 && this.state.edit_note_index === i) {
        this.setState({
          edit_note_index: -1,
          title: '',
          note: ''
        });
    } else {
        this.setState({
          edit_note_index: i,
          //title: this.state.items[index].title,
          //note:  this.state.items[index].note
        });
    }
  }

  handleDeleteNote = (e,i) => {
    this.setState({ loading_edit: true });
     const cm = new CookieManager();
     const api = new Api(cm.getIdToken());
     let item = this.state.items[i];
     api.delete_note(item.id)
       .then(res => {
         let items = [...this.props.items];
         items.splice(i, 1);
         this.props.updateItems(items);

         this.setState({
           edit_note_index: -1,
           loading_edit: false,
           items: items
         });
       })
       .catch(error => {
         alert('Oops! Something went wrong!');
         console.log(error);
         this.setState({ loading_edit: false });
       });
  }


  changeNewTitle = (e) => {
    this.setState({
      new_item: {
        ...this.state.new_item,
        title: e.target.value
      }
    });
  }

  changeNewNote = (key, val) => {
    let new_note = {...this.state.new_note};
    new_note[key] = val;
    this.setState({
        new_note: new_note
    });
  }

  clearNote = () => {
    let new_note = {...this.state.new_note};
    new_note['title'] = '';
    new_note['body'] = ''
    this.setState({
        new_note: new_note,
        open_new_application_note: !this.state.open_new_application_note
    });
  }

  changeUpdateNote = (e, key, val, i) => {
     e.stopPropagation();
     let items = this.props.items;
     let item = this.props.items[i];
     item[key] = val;
     items[i] = item
     this.setState({
        items: items
     })
  }

  handleUpdateNote = (e, i) => {
     this.setState({ loading_edit: true });
     const cm = new CookieManager();
     const api = new Api(cm.getIdToken());
     let item = this.state.items[i];
     api.update_note(item.id, item)
       .then(res => {
         this.setState({
           edit_note_index: -1,
           loading_edit: false
         });
          ReactGA.event({ category: 'Application Tab/'+this.props.title, action: res.data.app_step.title+'  - updated' });
       })
       .catch(error => {
         alert('Oops! Something went wrong!');
         console.log(error);
         this.setState({ loading_edit: false });
       });
  }




  viewError = (issues) => {
    let fields_str = '';
    for(var i = 0; i < issues.length; i++) {
      fields_str += (i === issues.length - 1 ? issues[i] : `${issues[i]}, `);
    }
    message.error('These fields are required: ' + fields_str);
  }

  handleAddNote = (e) => {
    e.stopPropagation();
    let new_note = this.state.new_note;
    if(new_note.title === '' && new_note.body === ''){
        message.error('Title and Description is required');
        return;
    }
    if (new_note.title === '') {
      message.error('Title is required');
      return;
    }
    if (new_note.body === '') {
      message.error('Description is required');
      return;
    }

    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    this.setState({ loading_new: true });
    api.create_new_note(new_note)
      .then(res => {
        let items = [...this.props.items];
        items.push(res.data.app_step);
        let new_note = {...this.state.new_note};
        new_note['title'] = '';
        new_note['body'] = ''
        this.setState({
            items: items,
            new_note: new_note
        })
        this.props.updateItems(items);
        ReactGA.event({ category: 'Application Tab/'+this.props.title, action: res.data.app_step.title+'  - added' });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({ loading_new: false });
      });
  }



  handleAdd = (e) => {
    e.stopPropagation();
    let new_item = this.state.new_item;
    if (new_item.title === '') {
      message.error('Title is required');
      return;
    }
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    this.setState({ loading_new: true });
    api.create_app_step(new_item)
      .then(res => {
        let items = [...this.props.items];
        items.push(res.data.app_step);
        this.props.updateItems(items);
        this.setState({
          new_item: {...this.item_template},
          loading_new: false,
          items: items
        });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({ loading_new: false });
      });
  }
  handleUpdate = (e) => {
    let { selected_index } = this.state;
    let item = this.props.items[selected_index];
    if (item.title === '') {
      message.error('Title is required');
      return;
    }

    this.setState({ loading_edit: true });
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_app_step(item.id, item)
      .then(res => {
        this.setState({
          selected_index: -1,
          loading_edit: false
        });
        ReactGA.event({ category: 'Application Tab/'+this.props.title, action: item.title+'  - updated' });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
        this.setState({ loading_edit: false });
      });
  }
  delete = (e, i) => {
    e.stopPropagation();
    let id = this.props.items[i].id;
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.delete_app_step(id)
      .then(res => {
        let items = [...this.props.items];
        let title = items[i].title;
        items.splice(i, 1);
        this.props.updateItems(items);
        this.setState({
          selected_index: -1
        })
        ReactGA.event({ category: 'Application Tab/'+this.props.title, action: title+'  - deleted' });
      })
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
      });
  }
  detectEnterForUpdate = (e) => {
    if(e.key === 'Enter'){
      this.handleUpdate(e);
    }
  }
  detectEnterForCreate = (e) => {
    if(e.key === 'Enter'){
      this.handleAdd(e);
    }
  }

  changeSelectedTitleAndNote = (e, key,value) => {
    let items = [...this.props.items];
    let item = items[this.state.selected_index];
    item[key] = value
    items[this.state.selected_index] = item;
    /*items[this.state.selected_index] = {
      ...this.props.items[this.state.selected_index],
      title: e.target.value,
      note: e.target.value
    };*/
    this.setState({
        items: items
    })
    this.props.updateItems(items);
  }

  changeSelectedUniNote = (e, key, value) => {
    let items = [...this.props.items];
    let item = items[this.state.selected_index];
    item[key] = value
    items[this.state.selected_index] = item;
    this.setState({
        items: items
    })
    this.props.updateItems(items);
  }

  changeSelectedTitle = (e) => {
      let items = [...this.props.items];
      items[this.state.selected_index] = {
        ...this.props.items[this.state.selected_index],
        title: e.target.value
      };
      this.props.updateItems(items);
  }




  toggleForEdit = (e, index) => {
      e.stopPropagation();
      if (this.state.selected_index === index) {
        this.setState({
          selected_index: -1,
          title: '',
          note: ''
        });
      } else {
        this.setState({
          selected_index: index,
          title: this.state.items[index].title,
          note:  this.state.items[index].note
        });
      }
  }

  toggleForUniEdit = (e, index) => {
     e.stopPropagation();
     if (this.state.edit_uni_note_index === index) {
       this.setState({
         edit_uni_note_index: -1,
          note: ''
       });
     } else {
       this.setState({
         edit_uni_note_index: index ,
         edit_uni_flag: true ,
         priority: index,
         university_id:  this.state.items[index].university_id
       });
     }
  }




  toggleComplete = (e, index) => {
    e.stopPropagation();
    let item = {...this.props.items[index]};
    item.complete = !item.complete;
    const cm = new CookieManager();
    const api = new Api(cm.getIdToken());
    api.update_app_step(item.id, item)
      .catch(error => {
        alert('Oops! Something went wrong!');
        console.log(error);
      });
    let items = [...this.props.items];
    items[index] = item;
    this.props.updateItems(items);
    ReactGA.event({ category: 'Application Tab/'+this.props.title, action: item.title+'  - completed' });

  }

  countItems = () => {
    return {
      total: this.props.items.length,
      complete: this.props.items.filter(e => e.complete).length
    };
  }

  addUni = (e) => {
      e.stopPropagation();
      let errorsArePresent = false;
      if(this.state.items[this.state.items.length - 1] === '' ){
         message.error('Please select university');
         return;
      }
      let item = ''
      let items = this.state.items
      items[this.state.items.length] = item;
      this.setState({
        items: items
      })
  }

  removeUni = () => {
      let old = this.state.items
      old.splice(this.state.edit_uni_note_index, 1);
      this.setState({
        items: old,
        edit_uni_flag: false
      })
      if(old[this.state.edit_uni_note_index] === '' ){
      }else{
        this.handleContinue(this.state.items)
      }
      ReactGA.event({ category: 'Application Tab/'+this.props.title, action:' School  - removed' });
  }

  handleContinue = (items) => {
      let uni_selections = items;
      this.setState({loading: true});
      const cm = new CookieManager();
      const api = new Api(cm.getIdToken());
      if(this.state.edit_uni_note_index != -1){
        if(this.note != 'undefined' && this.note.value != 'undefined'){
            if(uni_selections[this.state.edit_uni_note_index] != undefined){
                uni_selections[this.state.edit_uni_note_index]['note'] = this.note.value;
            }
        }
      }

      api.update_uni_selections(uni_selections)
        .then(res => {
          this.setState({
            loading: false,
            items: res.data.uni_selections,
            edit_uni_note_index: -1,
            edit_uni_flag: false
          });
          this.props.updateItems(res.data.uni_selections);

        })
        .catch(error => {
          alert('Oops! Something went wrong!');
          console.log(error);
          this.setState({loading: false});
        });
  }

  setUni = ( i, id) => {
      let old = [...this.state.items];
      old[i] = {
        priority: i,
        university_id: id
      }
      this.setState({
        items: old,
        edit_uni_note_index: i - 1,
        edit_uni_flag: true
      })
  }

  uniSave = () => {
    this.handleContinue(this.state.items)
    ReactGA.event({ category: 'Application Tab/'+this.props.title, action:' School  - updated' });
  }

  setNewUni = (id) => {
        let old = [...this.state.items];
        old[old.length] = {
          priority: old.length,
          university_id: id,
          note: ''
        }
        this.setState({
          items: old
        })
       this.handleContinue(old)
       ReactGA.event({ category: 'Application Tab/'+this.props.title, action: 'School - added' });
  }

  updateUniListOrder = (evt, updated) => {
      let { opened_index } = this.state;
      let itemList = []
      for (var i = 0; i < updated.length; i++) {
        let item = updated[i];
        if (item.sort_order !== i) {
            let temp_item = {
              priority: i,
              university_id: item.university_id,
              id: item.id,
              note:  item.note
            }
           itemList.push(temp_item)
        }
      }
      this.setState({
        items: itemList
      })
      this.handleContinue(this.state.items)
      ReactGA.event({ category: 'Application Tab/'+this.props.title, action: ' School - list order updated' });
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
    let { open, selected_index, loading_new, loading_edit, new_item, new_note, edit_uni_flag, edit_uni_note_index, edit_application_note_flag } = this.state;
    let { kind, title, note, items } = this.props;
    let { total, complete } = this.countItems();
    let marginTop = "30px";
    items.length < 2 ? marginTop = "0px" : marginTop = "30px"

    let applicationNotesCss = ""
    kind === 'your_notes' ?  applicationNotesCss = 'progress-application-notes' : null

    return (
      <div className="c-progress" onClick={(e) => {this.setState({ open: !open }); ReactGA.modalview('/'+title);}}>
        <div className="row mr-0 ml-0" style={{alignItems: 'center'}}>
           {
               kind !== 'your_notes' && kind !== 'school_list'?
                    <div className="col-2 tright c-progress__title progress-title" style={{lineHeight: '1.2'}}>{title}</div>
               :    <div className="col-2 tright c-progress__title progress-title" style={{lineHeight: '1.2'}}></div>
           }
              <div className="col-7 progress-bar">
              {
                  kind !== 'your_notes' ?
                      kind !== 'school_list' ?
                          <AppProgressBar
                            total={total}
                            completed={complete}
                          />
                      : <div className="c-progress__title progress-title pl-0" style={{lineHeight: '1.2', paddingLeft: `30px`}}>{title}</div>
                  :  <div className="c-progress__title progress-title pl-0" style={{lineHeight: '1.2', paddingLeft: `30px`}}>{title}</div>
              }
              </div>
              <div className="col-2 c-progress__title application-progress">
                {
                  kind !== 'your_notes' ? total === 0 ? 'No Items Yet' :  kind != 'school_list' ? `${complete} of ${total} Completed` : `${this.props.items.filter(e => e.id).length} school(s) added` : ''
                }
              </div>
          <div className="col-1 application-progress-arrow">
            <a onClick={() => this.setState({ open: !open })}>
              <i className={ open ? "i-angle-up" : "i-angle-down" } />
            </a>
          </div>
        </div>
        {
          open ?
            <div className="row mr-0 ml-0 mt-1">
              <div className={"offset-2 col-7 applist-section "+applicationNotesCss} >
                <div className="c-applist">
                  {
                    kind !== 'your_notes' && kind !== 'school_list'?
                        items.map((item, i) => {
                          let index = i;
                          return (
                            <div key={`${kind}_step_${i}`} className="c-applist__item">
                              {
                                (kind === 'recom' || kind === 'course')?
                                  <div style={{width: `100%`}}>
                                      <div key={index} onClick={(e) => this.toggleForEdit(e, index)}>
                                          <div className="c-ec__row">
                                              <div className="c-applist__item__num">{ index + 1 }</div>
                                              <div className="c-applist__item__title">
                                                {
                                                      selected_index === index ?
                                                        <div>
                                                            <Input
                                                              key={`${kind}_title_${index}`}
                                                              placeholder="Title"
                                                              value={item.title}
                                                              onChange={(e) => this.changeSelectedTitleAndNote(e,'title', e.target.value)}
                                                              onKeyDown={this.detectEnterForUpdate}
                                                              onClick={(e) => {e.stopPropagation(); this.setState({ selected_index: index })}}
                                                              className="ant-input is-small" />
                                                          </div>
                                                          : item.title
                                                }
                                              </div>
                                              <div className="c-ec__actions">
                                                  <div className="c-ec__actions__arrow">
                                                    <i onClick={(e) => this.toggleForEdit(e, index)}
                                                      className={ selected_index === index ? "i-angle-up" : "i-angle-down" } />
                                                  </div>
                                              </div>
                                              <div className="c-applist__item__actions">
                                                  <i className={"c-applist__item__logged_btn " + (item.complete ? "i-checked" : "i-unchecked")}
                                                    onClick={(e) => this.toggleComplete(e, index)} />
                                               </div>
                                          </div>
                                            {
                                               selected_index === index ?
                                                   <div>
                                                        <TextareaAutosize
                                                            key={`${kind}_note_${index}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="c-ec__note"
                                                            placeholder="Add a note..."
                                                            value={item.note}
                                                            onChange={(e) => this.changeSelectedUniNote(e,'note', e.target.value)}
                                                             />
                                                        <div className="mt-h">
                                                          <Button className="mr-1 is-small" onClick={this.handleUpdate}>Save</Button>
                                                          <a className="mr-1 " onClick={(e) => this.toggleForEdit(e, index)}>Cancel</a>
                                                          <a onClick={(e) => this.delete(e, index)}>Delete</a>
                                                        </div>
                                                   </div>
                                               : null
                                            }
                                      </div>

                                  </div>
                                :

                                    <div key={`${kind}_step_${i}`} className="c-applist__item" style={{width:`100%`}}>
                                       <div className="c-applist__item__num">{ index + 1 }</div>
                                       <div className="c-applist__item__title">
                                         {
                                           selected_index === index ?
                                             <Input
                                               key={`${kind}_title_${index}`}
                                               placeholder="Title"
                                               value={item.title}
                                               onChange={(e) => this.changeSelectedTitle(e)}
                                               onKeyDown={this.detectEnterForUpdate}
                                               onClick={(e) => e.stopPropagation()}
                                               className="ant-input is-small" /> : item.title
                                         }
                                       </div>
                                       {
                                            item.created_by === 'user' ?
                                               <div className="c-applist__item__actions">
                                                 <i className="i-edit c-applist__item__edit_btn mr-h"
                                                   onClick={(e) => {e.stopPropagation(); this.setState({ selected_index: index })}}/>
                                                 <i className="i-close c-applist__item__delete_btn mr-h"
                                                   onClick={(e) => this.delete(e, index)} />
                                               </div>
                                            : null
                                       }
                                       <div className="c-applist__item__actions">
                                            <i className={"c-applist__item__logged_btn " + (item.complete ? "i-checked" : "i-unchecked")}
                                              onClick={(e) => this.toggleComplete(e, index)} />
                                        </div>
                                     </div>


                              }

                            </div>
                          );
                        })
                    :  (kind === 'school_list') && (items.length > 0) ?
                         <ReactDragList
                           key={Math.random()}
                           dataSource={items}
                           row={(u, i) => {

                                return (
                                  <div key={`university_${i}`} className="row">
                                    <div className="c-uniselect" style={{width:`100%`}}>
                                      <div className="c-uniselect__num">{i + 1}</div>
                                      <div className="c-uniselect__dropdown" onClick={(e) => {e.stopPropagation();}}>
                                            <Select showSearch placeholder="Select a University..."
                                              optionFilterProp="children"
                                        	  getPopupContainer={triggerNode => triggerNode.parentNode}
                                              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                              value={u.university_id}
                                              onChange={(val) => this.setUni(i, val)}>
                                              {
                                                  this.props.universities.map((u, i) => {
                                                    return(
                                                      <Select.Option key={u.name} value={u.id}>{u.name}</Select.Option>
                                                    );
                                                  })
                                              }
                                            </Select>
                                      </div>
                                       <div className="col-1">
                                          <a onClick={(e) => { this.setState({ edit_uni_flag:  !edit_uni_flag });this.toggleForUniEdit(e, i)}}>
                                            <i className={ edit_uni_flag && edit_uni_note_index === i ? "i-angle-up" : "i-angle-down" } />
                                          </a>
                                        </div>
                                    </div>
                                    {
                                        edit_uni_flag && edit_uni_note_index === i ?
                                            <div style={{width:`90%`}}>
                                                <TextareaAutosize
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="c-ec__note"
                                                  placeholder="Add a note..."
                                                  defaultValue={u.note}
                                                  innerRef={(c) => { if (c !== null) this.note = c; }}
                                                  />
                                                <div className="mt-h">
                                                  <Button className="mr-1 is-small" onClick={this.uniSave}  onKeyDown={this.uniSave}>Save</Button>
                                                  <a className="mr-1" onClick={(e) =>{ this.setState({ edit_uni_flag:  !edit_uni_flag, edit_uni_note_index: i-1 }); e.stopPropagation();}}>Cancel</a>
                                                  <a onClick={this.removeUni}>Delete</a>
                                                </div>
                                            </div>
                                        : ''
                                    }

                                  </div>
                                );
                              }}
                               onUpdate={this.updateUniListOrder}
                                animation="100"
                                handles={false}
                                ghostClass="drag-ghost"
                              />
                       : ''

                  }
                  {
                     kind !== 'your_notes' ? kind !== 'school_list' ?
                          <div>
                              <div className="c-applist__form">
                                <div className="c-applist__form__num">{items.length + 1}</div>
                                <div className="c-applist__form__title">
                                  <Input className="c-applist__form__input" placeholder={kind === 'course' ? "Add a required course…" :  kind === 'recom' ? "Add an author…" : "add a new application step…"}
                                    value={new_item.title}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={this.changeNewTitle}
                                    onKeyDown={this.detectEnterForCreate} />
                                </div>
                                <div className="c-applist__form__actions">
                                  <i onClick={this.handleAdd} className="i-plus-outline c-applist__form__add_btn"></i>
                                </div>
                              </div>
                              <div className="offset-5 col-12 tright application-md-btn-cont" style={{paddingRight:`0`}}>
                                <a className="c-btn-blue-gradient" onClick={(e) => this.openMoreLink(this.props.more_text,"")}><img src={userMdSolid} className="gradient-user-md" /></a>
                              </div>
                          </div>
                        :
                                <div>
                                    <div  className="row">
                                      <div className="c-uniselect" style={{width:`100%`}}>
                                        <div className="c-uniselect__num">{items.length + 1}</div>
                                        <div className="c-uniselect__dropdown" onClick={(e) => {e.stopPropagation();}}>
                                          <Select showSearch placeholder="Select a University..."
                                            optionFilterProp="children"
                                            getPopupContainer={triggerNode => triggerNode.parentNode}
                                            value={''}
                                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
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

                                   </div>
                                   <div className="offset-5 col-12 tright application-md-btn-cont" style={{paddingRight:`0`}}>
                                      <a className="c-btn-blue-gradient" onClick={(e) => this.openMoreLink(this.props.more_text,"")}><img src={userMdSolid} className="gradient-user-md" /></a>
                                   </div>
                                </div>


                     :
                      <div className="c-applist_cursor-default">
                        <div className="row">
                          {
                              items.map((item, i) => {
                                let index = i;
                                let editNote = true;
                                this.state.edit_note_index === index ? editNote = false : editNote = true
                                let marginTop = '30px';

                                (index === 0 || index === 1 )? marginTop = "0px" : marginTop = "30px"

                                return (
                                    <div key={`${index}_app_note`} className="col-6 col-full">
                                        <div key={`${index}_app_btn`} onClick={(e) => { this.setState({ edit_application_note_flag:  !edit_application_note_flag });e.stopPropagation();this.handleEditNote(e,index)}}  className="application-note-header-cls" style={{marginTop: `${marginTop}`}} >
                                            <Button  type="primary" style={{background: `#ddd`, color: `#707070`}}>{items[i].title}</Button>

                                              <a className="application-note-angle-right" onClick={(e) => { this.setState({ edit_application_note_flag:  !edit_application_note_flag })}}>
                                                <i className={ edit_application_note_flag && this.state.edit_note_index === i ? "i-angle-up" : "i-angle-down" } />
                                              </a>

                                        </div>
                                        {
                                            edit_application_note_flag && !editNote ?
                                                <div key={`${index}_edit_note`} className="c-applist_content-box" style={{marginTop: `${marginTop}`, marginLeft: `0px`}} >
                                                    {
                                                        !editNote ?
                                                            <Input readOnly={editNote} className="c-applist__form__input c-applist_note-title" placeholder="Note Title"
                                                                onClick={(e) => {e.stopPropagation()}}
                                                                key={`note_${index}`}
                                                                value={items[i].title}
                                                                onChange={(e) => this.changeUpdateNote(e, 'title', e.target.value, i)} />
                                                        : <span className="c-applist_note-title"> {items[i].title} </span>
                                                    }
                                                    <hr/>
                                                        <TextareaAutosize readOnly={editNote} className="c-applist__form__input c-applist_input_width textarea-adjust-in-box-edit" style={{marginBottom: `15px`}} placeholder="Type your note details here. It can be as long as you need!"
                                                          onClick={(e) => e.stopPropagation()}
                                                          defaultValue={items[i].body}
                                                          resize={"none"}
                                                          onChange={(e) => this.changeUpdateNote(e, 'body', e.target.value, i)} />
                                                         <div >
                                                              {
                                                              !editNote ?
                                                                <Button className="c-applist_btn-padding c-applist_save_btn c-applist_btn_padding" style={{bottom: `10px`, position: `absolute`}} onClick={(e) => this.handleUpdateNote(e, index)}  type="primary">Update</Button>
                                                              : <Button className="c-applist_btn-padding c-applist_default_btn c-applist_btn_padding" style={{bottom: `10px`, position: `absolute`}} onClick={(e) => this.handleEditNote(e,index)} type="primary">Edit This</Button>
                                                              }
                                                              <Button className="c-applist_btn-padding c-applist_delete_btn c-applist_btn_padding" style={{bottom: `10px`, position: `absolute`, marginLeft: `90px`}} onClick={(e) => this.handleDeleteNote(e,index)} type="primary">Delete</Button>
                                                         </div>

                                                </div>
                                            : null
                                        }
                                    </div>
                                )
                              })
                          }
                         
                          {
                              this.state.open_new_application_note ?
                            <div className="col-6 col-full">
                                  <div className="c-applist_content-box c-applist_border add-applist-box" style={{marginTop: `${marginTop}`, marginLeft: `0px`}}>
                                      <Input  className="c-applist__form__input c-applist_input-bottom-border" placeholder="Note Title"
                                          onClick={(e) => e.stopPropagation()}
                                          value={new_note.title}
                                          onChange={(e) => this.changeNewNote('title', e.target.value)} />
                                      <div style={{height:`10px`}}></div>
                                      <TextareaAutosize className="c-applist__form__input c-applist_input_width c-applist_textarea-border textarea-adjust-in-box" placeholder="Type your note details here. It can be as long as you need!"
                                        onClick={(e) => e.stopPropagation()}
                                        value={new_note.body}
                                        resize={"none"}
                                        onChange={(e) => this.changeNewNote('body', e.target.value)} />
                                      <div className="c-applist__form__actions">
                                        <Button className="c-applist_btn-padding c-applist_default_btn c-applist_btn_padding" onClick={(e) => {this.clearNote(); e.stopPropagation()}} type="normal">Cancel</Button>
                                        <Button className="c-applist_btn-padding c-applist_save_btn" onClick={this.handleAddNote} style={{marginLeft: `15px`}} type="primary">Add</Button>
                                      </div>
                                  </div></div>
                              : null
                          }
                          <div className="add-new-event-container">
                          	<Button onClick={(e) => {this.setState({ open_new_application_note: !this.state.open_new_application_note }); e.stopPropagation()}} type="primary" shape="circle" icon="plus" />
                          </div>
                        </div>

                       </div>
                  }
                </div>
              </div>
            </div> :
              null
        }
        <ShowLearnMoreModal
                  open={this.state.open_learn_more_link}
                  handleClose={this.closeShowLearnLinkModal}
                  ref={this.showLearnMoreModalChild}
                />
      </div>
    );
  }
}