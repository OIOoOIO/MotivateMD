import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import { Icon, message, Select, Button } from 'antd';
import ComposeEmailModal from './ComposeEmailModal';

export default class InboxSidebar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			emails: [],
			open_ce_modal: false,
			open_message_tag_modal: false
			
		};
		this.composeCreateModalChild = React.createRef();
	}

	closeCEModal = () => {
		this.setState({
			open_ce_modal: false
		});
	}
	
	openCEModal = () => {
		this.setState({open_ce_modal: true});
		//message.info("Coming soon...");
		this.composeCreateModalChild.current.openModalForCreate();
	}
	
	getUnreadCount = () => {
		let { emails } = this.props;
		let unreadCount = 0;
		unreadCount = emails.reduce((previous, msg) => {
			if( msg.read !== "true" ){
				return previous + 1;
			}else{
				return previous;
			}
		},0);
		return unreadCount;
	}

	getDeletedCount = () => {
		let { emails } = this.props;
		let deleteCount = 0;
		deleteCount = emails.reduce( (previous, msg) => {
			if( msg.tag === "trash" ){
				return previous + 1;
			}else{
				return previous;
			}
		},0);
		return deleteCount;
	}
	
	handleComposeEvent = () => {
		this.openCEModal();
	}
	
	showMessageTagsModal = ()=> {
		this.setState({open_message_tag_modal: true})
	}

	setTagSection = (item_id) => {
        this.setState({open_message_tag_modal: false})
        this.props.setSidebarTagSection(item_id)
	}
	
	closeMessageTagsModal = () =>{
		this.setState({open_message_tag_modal: false})
	}

	
	
	render() {
		let { setSidebarSection, setSidebarTagSection, currentSection, mailboxHeight, loggedInUser, takeActionAfterComposeSent, userList, messageFolder, tag, inboxCount, sentCount, draftsCount, trashCount, importantCount } = this.props;
		let { open_ce_modal } = this.state;
        let closeMessageTagsPopup = ""
        this.state.open_message_tag_modal? closeMessageTagsPopup="message-tags-list-visible": null
        
       
		return (
			<div id="sidebar" style={{height: mailboxHeight+"px"}}>
				<div className="sidebar__compose">
					<a onClick={(e) => {this.handleComposeEvent(); e.stopPropagation();}} className="mail-btn compose sidebar-compose-none">
						Compose <Icon type="edit" />
					</a>
					<div className="add-new-event-container compose-btn-container">
                        <Button onClick={(e) => {this.handleComposeEvent(); e.stopPropagation();}} type="primary" shape="circle" icon="edit" />
                    </div>

					<div className="mail-btn compose  sidebar-compose-devise-block mail-menu">
                        <Select
                            onChange={(val) => { setSidebarSection(val); }}
                            defaultValue={currentSection}
                            getPopupContainer={triggerNode => triggerNode.parentNode}
                           >
                           {
                               messageFolder.map(item => {
                                 return (
                                   <Select.Option key={`folder_list_${item.id}`} value={item.kind}>{item.title}</Select.Option>
                                 );
                               })
                           }
                        </Select>
                        <div className="mail-btn-right" onClick={(e) => {this.showMessageTagsModal(); e.stopPropagation();}} >
                            Tags
                        </div>
                    </div>
                    
                    <div className={"message-tag-list "+closeMessageTagsPopup}>
                    	<div className="message-tags-list-overlay" onClick={(e) => {this.closeMessageTagsModal();}}></div>
	                    <ul className="sidebar__tags ">
	                        {
	                            tag.map(item => (
	                                <li key={`tag_list_${item.id}`} className={currentSection === item.kind ? 'selected-section email-tag-list' : 'email-tag-list'} onClick={() => { this.setTagSection(item.kind);}}>
	                                    <a className={item.kind === "mcat" ? "capital-text" : "capitalize-text"}>
	                                        <span style={{backgroundColor: item.color}} className={"c-upcoming__tag c-upcoming__tag--"+item.kind}></span>
	                                        {item.title}
	                                        {(item.count > 0) ? <span className="item-count">{item.count}</span> : null}
	                                    </a>
	                                </li>
	                            ))
	                        }
	                    </ul>
	                </div>
                    
                    
					<ComposeEmailModal
						ref={this.composeCreateModalChild}
			            open={open_ce_modal}
						loggedInUser={loggedInUser}
						closeCEModal={this.closeCEModal}
						userList={userList}
						takeActionAfterComposeSent={takeActionAfterComposeSent}
						title="Compose"
					/>

				</div>
				<ul className="sidebar__inboxes sidebar-compose-none">
					{
						messageFolder.map(item => (
							<li key={`folder_list_${item.id}`} className={currentSection === item.kind ? 'selected-section' : ''} onClick={() => { setSidebarSection(item.kind); }}>
								<a>
									{item.kind === "inbox" ? <Icon type="inbox" /> : null}
									{item.kind === "sent" ? <Icon type="check" /> : null}
									{item.kind === "drafts" ? <Icon type="form" /> : null}
									{item.kind === "trash" ? <Icon type="delete" /> : null}
									{item.kind === "important" ? <Icon type="star" /> : null}
									{item.title}
									{(item.kind === "inbox" && inboxCount > 0) ? <span className="item-count">{inboxCount}</span> : null}
									{(item.kind === "sent" && sentCount > 0) ? <span className="item-count">{sentCount}</span> : null}
									{(item.kind === "drafts" && draftsCount > 0) ? <span className="item-count">{draftsCount}</span> : null}
									{(item.kind === "trash" && trashCount > 0) ? <span className="item-count">{trashCount}</span> : null}
									{(item.kind === "important" && importantCount > 0) ? <span className="item-count">{importantCount}</span> : null}
								</a>
							</li>
						))
					}
				</ul>
				<ul className="sidebar__tags sidebar-compose-none">
					<li className="tag-title"><strong>Tag</strong></li>
					{
						tag.map(item => (
							<li key={`tag_list_${item.id}`} className={currentSection === item.kind ? 'selected-section' : ''} onClick={() => { setSidebarTagSection(item.kind); }}>
								<a className={item.kind === "mcat" ? "capital-text" : "capitalize-text"}>
									<span style={{backgroundColor: item.color}} className={"c-upcoming__tag c-upcoming__tag--"+item.kind}></span> 
									{item.title}
									{(item.count > 0) ? <span className="item-count">{item.count}</span> : null}
								</a>
							</li>
						))
					}
				</ul>
			</div>
		)
	}
}
