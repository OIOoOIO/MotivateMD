import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import ServerRouter from '../../services/ServerRouter';
import { Select, Modal, Icon, Divider, Button, message } from 'antd';
import ComposeEmailModal from './ComposeEmailModal';
import { getPrettyDate, getPrettyTime, predefinedHexColorArray, getChatUserProfile, getFromToString, getCCString, getUserProfileColor } from '../../utils/helpers';
import window from 'global';

export default class InboxEmailDetails extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: [],
			open_ce_modal: false,
			open_tag_modal: false,
			selectedTagIds: [],
			selectedTagTitles: [],
			isTagError: false
		};
		this.composeModalChild = React.createRef();
	}
	
	closeCEModal = () => {
		this.setState({
			open_ce_modal: false
		});
	}
	
	openCEModal = (currentEmail,userList) => {
		this.setState({open_ce_modal: true});
		this.composeModalChild.current.setCurrentEmailForEdit(currentEmail,userList);
	}
	
	openCEModalToReply = (currentEmail,userList) => {
		this.setState({open_ce_modal: true});
		this.composeModalChild.current.takeActionForReply(currentEmail,userList);
	}
	
	closeTAGModal = () => {
		this.setState({
			open_tag_modal: false
		});
	}
	
	openTAGModal = () => {
		let { email, tag } = this.props;
		let { selectedTagTitles } = this.state;
		if( email.associate_message_tag && email.associate_message_tag.length > 0 ){
			selectedTagTitles = [];
			for( let i=0;i<email.associate_message_tag.length;i++ ){
				for( let j=0;j<tag.length;j++ ){
					if( email.associate_message_tag[i].message_tag_id === tag[j].id ){
						selectedTagTitles.push(tag[j].title);
					}
				}
			}
			this.setState({selectedTagTitles: selectedTagTitles});
		}else{
			this.setState({selectedTagTitles: []});
		}
		this.setState({open_tag_modal: true});
	}
	
    getStarredButton = () => {
		let { email, onStarred, onUnStarred } = this.props;
		if (email.starred) {
		    return <Icon title="Set un-important" className="delete-btn star-btn star-btn-active" type="star" theme="filled" onClick={() => { onUnStarred(email.id); }}/>
		}else{
		    return <Icon title="Set important" className="delete-btn star-btn" type="star" theme="filled" onClick={() => { onStarred(email.id); }} />;
		}
		return undefined;
	}

	getDeleteButton = () => {
        let { email, onDelete } = this.props;
        if (email.tag !== 'deleted') {
            return <Icon title="Delete" className="delete-btn" onClick={() => { onDelete(email.id); }} type="delete" />;
        }
        return undefined;
    }
	
	onEdit = (currentEmail,userList) => {
		this.openCEModal(currentEmail,userList);
	}
	
	onReply  = (currentEmail,userList) => {
		this.openCEModalToReply(currentEmail,userList);
	}
	
	handleAttachmentClick = (attachment) => {
		const cm = new CookieManager();
		const api = new Api(cm.getIdToken());
		
		api.get_message_attachment(attachment.id)
		.then(res => {
			let win = window.open("",'_blank');
			win.document.write(res.data);
			win.focus();
		})
  		.catch(error => {
  			console.log('Oops! Something went wrong! ==========================>',error);
  			message.error("Oops! Something went wrong! Please try again later.");
  		});
	}
	
	getAttachmentHtml = (attachments) => {
		let all_attachment_list;
		const cm = new CookieManager();
		if( attachments.length > 0 ){
			all_attachment_list = attachments.map((value,i) => {
				if( value.filename.toLowerCase().includes(".jpg")
					|| value.filename.toLowerCase().includes(".jpeg")
					|| value.filename.toLowerCase().includes(".gif")
					|| value.filename.toLowerCase().includes(".png")
				){
					return(
						<Button target="_blank" href={`${ServerRouter.backend()}/get_message_attachment?authorization=${cm.getIdToken()}&id=${value.id}`} key={`attachment_jpg_${i}`} type="dashed" icon="file-jpg" size="small">{value.filename}</Button>
					);
				}else if( value.filename.toLowerCase().includes(".docx")
						  || value.filename.toLowerCase().includes(".doc")
						  || value.filename.toLowerCase().includes(".docm")
						  || value.filename.toLowerCase().includes(".dotx")
						  || value.filename.toLowerCase().includes(".dotm")
						  || value.filename.toLowerCase().includes(".docb")
				){
					return(
						<Button target="_blank" href={`${ServerRouter.backend()}/get_message_attachment?authorization=${cm.getIdToken()}&id=${value.id}`} key={`attachment_word_${i}`} type="dashed" icon="file-word" size="small">{value.filename}</Button>
					);
				}else if( value.filename.toLowerCase().includes(".pdf") ){
					return(
						<Button target="_blank" href={`${ServerRouter.backend()}/get_message_attachment?authorization=${cm.getIdToken()}&id=${value.id}`} key={`attachment_pdf_${i}`} type="dashed" icon="file-pdf" size="small">{value.filename}</Button>
					);
				}else if( value.filename.toLowerCase().includes(".xls")
						  || value.filename.toLowerCase().includes(".xlsb")
						  || value.filename.toLowerCase().includes(".xlsm")
						  || value.filename.toLowerCase().includes(".xlsx")
				){
					return(
						<Button target="_blank" href={`${ServerRouter.backend()}/get_message_attachment?authorization=${cm.getIdToken()}&id=${value.id}`} key={`attachment_excel_${i}`} type="dashed" icon="file-excel" size="small">{value.filename}</Button>
					);
				}else if( !value.filename.toLowerCase().includes(".jpg")
				  		  && !value.filename.toLowerCase().includes(".jpeg")
				  		  && !value.filename.toLowerCase().includes(".gif")
				  		  && !value.filename.toLowerCase().includes(".png")
				  		  && !value.filename.toLowerCase().includes(".pdf")
				  		  && !value.filename.toLowerCase().includes(".docx")
				  		  && !value.filename.toLowerCase().includes(".doc")
				  		  && !value.filename.toLowerCase().includes(".docm")
				  		  && !value.filename.toLowerCase().includes(".dotx")
				  		  && !value.filename.toLowerCase().includes(".dotm")
				  		  && !value.filename.toLowerCase().includes(".docb")
				  		  && !value.filename.toLowerCase().includes(".xls")
				  		  && !value.filename.toLowerCase().includes(".xlsb")
				  		  && !value.filename.toLowerCase().includes(".xlsm")
				  		  && !value.filename.toLowerCase().includes(".xlsx")
				){
					return(
						<Button target="_blank" href={`${ServerRouter.backend()}/get_message_attachment?authorization=${cm.getIdToken()}&id=${value.id}`} key={`attachment_file_${i}`} type="dashed" icon="file" size="small">{value.filename}</Button>
					);
				}
			});
		}
		return all_attachment_list;
	}
	
	onTag = () => {
		this.openTAGModal();
	}
	
	setTag = () => {
		let { selectedTagTitles } = this.state;
		let { email, tag, takeActionAfterSetTag } = this.props;
		let selectedTagObj = tag.filter(o => selectedTagTitles.includes(o.title));
		let selectedTagIds = selectedTagObj.map(obj => { return obj.id });
		const cm = new CookieManager();
		const api = new Api(cm.getIdToken());
		api.add_and_remove_tag_to_message(email.id,selectedTagIds)
		.then(res => {
			if( res.status === 200 ){
				this.closeTAGModal();
				takeActionAfterSetTag(selectedTagIds,res.data.current_message,res.data.tag);
			}
		})
  		.catch(error => {
  			console.log('Oops! Something went wrong! ==========================>',error);
  			message.error("Oops! Something went wrong! Please try again later.");
  		});
	}
	
	checkSetTag = () => {
		/*let { selectedTagTitles } = this.state;
		if( selectedTagTitles.length <= 0 ){
			this.setState({isTagError: true});
			message.error("Please select atleast one tag.");
		}else{
			this.setTag();
		}*/
		this.setTag();
	}
	
	handleTagChange = (selectedTagTitles) => {
		this.setState({selectedTagTitles: selectedTagTitles});
		if( selectedTagTitles.length > 0 ){
			this.setState({isTagError: false});
		}
	}
	
	getTagsChips = () => {
		let { email, tag } = this.props;
		let tagHtml = [];
		if( email.associate_message_tag && email.associate_message_tag.length > 0 ){
			for( let i=0;i<email.associate_message_tag.length;i++ ){
				for( let j=0;j<tag.length;j++ ){
					if( email.associate_message_tag[i].message_tag_id === tag[j].id ){
						let html = (
							<span key={`tag_chip_${tag[j].kind}_${j}`} className="tag-chip" style={{backgroundColor: tag[j].color}}>
								{tag[j].title}
							</span>
						);
						tagHtml.push(html);
					}
				}
			}
			return tagHtml;
		}else{
			return null;
		}
	}

	render() {
		let { email, emailIndex, tag, userList, loggedInUser, mailboxHeight, currentSection, takeActionAfterSent, takeActionAfterComposeSent } = this.props;
		let { open_ce_modal, open_tag_modal, selectedTagTitles, isTagError } = this.state;
		let date = email ? `${getPrettyDate(email.time)} · ${getPrettyTime(email.time)}` : '';
		let profileColor = predefinedHexColorArray[emailIndex % 50];
		const filteredOptions = tag.filter(o => !selectedTagTitles.includes(o.title));
		return (
			<div className="col-12 col-sm-8 email-detail-col">
				{
					email ?
						<div className="email-content" style={{height: mailboxHeight+"px"}}>
							<div className="email-content__header">
								<h3 className="email-content__subject">{email.subject}</h3>
								{
								    currentSection !== "drafts" ?
								        this.getStarredButton()
								    : null
								}
								{this.getDeleteButton()}
								{
									currentSection === "drafts" ?
											<Icon title="Edit" className="delete-btn edit-btn" onClick={() => { this.onEdit(email,userList); }} type="form" />
									:
										null
								}
								{
									currentSection === "inbox" ?
											<Icon title="Set tag" className="delete-btn tag-btn" onClick={() => { this.onTag(); }} type="tags" />
									:
										null
								}
								<Modal
					  		        style={{ top: 64 }}
					  		        closable={false}
									maskClosable={false}
					  		        width={720}
					  		        title="Set Tag"
					  		        visible={open_tag_modal}
					  		        onCancel={this.closeTAGModal}
									className="tag-modal"
									footer={
										<div onClick={(e) => e.stopPropagation()}>
							            	<Button className="c-btn__secondary" key="cancel" onClick={this.closeTAGModal}>Close</Button>
							            	<Button key="submit" onClick={this.checkSetTag}>Set</Button>
						            	</div>
						        	}>
									<div className="tag-container">
										<Select
								          	mode="multiple"
								          	placeholder="Set tag"
							          		showArrow={false}
											className="tag-select"
											getPopupContainer={triggerNode => triggerNode.parentNode}
											value={selectedTagTitles}
											className={isTagError ? 'isError' : ''}
											defaultOpen={false}
											onChange={this.handleTagChange}
											size="large"
								          	style={{ width: '100%' }}>
											{
												filteredOptions.map(item => (
													<Select.Option key={`set_tag_${item.id}`} value={item.title}>
										            	{item.title}
									            	</Select.Option>
												))
									        }
										</Select>
									</div>
								</Modal>
								<ComposeEmailModal
									ref={this.composeModalChild}
									takeActionAfterSent={takeActionAfterSent}
								    takeActionAfterComposeSent={takeActionAfterComposeSent}
						            open={open_ce_modal}
									loggedInUser={loggedInUser}
									closeCEModal={this.closeCEModal}
									userList={userList}
									title="Compose"
								/>
								<div className="tag-chip-container">
									{this.getTagsChips()}
								</div>
								<div className="username-container">
									<div className="username-container__username" style={{backgroundColor: getUserProfileColor(email,currentSection,loggedInUser,true,false)? '#34393d' : profileColor}}>
										{getChatUserProfile(email,currentSection,loggedInUser,true,false)}
									</div>
									<div className="email-content__from">
										<strong>{getChatUserProfile(email,currentSection,loggedInUser,false,true)}</strong>
									</div>
									<div className="email-content__time-container">
										<span className={"email-content__tome " + ((email.cc_ids && email.cc_ids.length > 0) ? 'is-cc-present' : '')} dangerouslySetInnerHTML={{__html: getFromToString(email,currentSection,loggedInUser)}}>
										</span>
										<span className="email-content__tome" dangerouslySetInnerHTML={{__html: getCCString(email,currentSection,loggedInUser)}}>
										</span>
										<span className="email-content__time">{date}</span>
									</div>
								</div>
								{
									email.message_attachment.length > 0 ?
										<div className="attachment-container">
											<Divider>Attachments</Divider>
											{this.getAttachmentHtml(email.message_attachment)}
										</div>
									:
										null
								}
							</div>
							<div className="email-content__message" dangerouslySetInnerHTML={{__html: email.message}}></div>
							{
								currentSection === "inbox" ?
									<div className="email-content__reply">
										Click here to 
										<Button onClick={() => { this.onReply(email,userList); }} size="small" className="reply-btn">Reply</Button>
									</div>
								:
									null
							}
						</div>
					:
						<div className="email-content empty" style={{height: mailboxHeight+"px"}}>
							<span className="no-msg-span">No message body.</span>
						</div>
				}
			</div>
		)
	}
}
