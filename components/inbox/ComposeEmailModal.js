import { Modal, Upload, Button, Input, message, Select, Checkbox } from 'antd';
import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import 'react-quill/dist/quill.snow.css';
import { text_editor_modules, text_editor_formats } from '../../utils/helpers';
import document from 'global';
import ServerRouter from '../../services/ServerRouter';

export default class ComposeEmailModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			new_ce: {
				id: -1,
				selectedToEmailIds: [],
				selectedCCEmailIds: [],
		        subject: '',
		        body: '',
		        message_folder_id: 3,
		        receiver_ids: [],
		        cc_ids: []
			},
			quill: '',
			isSubjectError: false,
			isToError: false,
			isEditMode: false,
			isAllUser: false,
			isReplyMode: false,
			fileList: []
		};
		if( typeof window !== 'undefined' && document ){
			this.state.quill = require('react-quill')
	    }
	}
	
	openModalForCreate = () => {
		let { new_ce } = this.state;
		/*let new_ce_fresh = {
			id: -1,
			selectedToEmailIds: [],
			selectedCCEmailIds: [],
	        subject: '',
	        body: '',
	        message_folder_id: 3,
	        receiver_ids: [],
	        cc_ids: []
		}*/
		new_ce.receiver_ids = [];
		new_ce.selectedToEmailIds = [];
		new_ce.cc_ids = [];
		new_ce.selectedCCEmailIds = [];
		new_ce.id = -1;
		new_ce.subject = "";
		new_ce.body = "";
		this.setState({new_ce: new_ce});
		this.setState({fileList: []});
	}
	
	takeActionForReply = (currentEmail,userList) => {
		//console.log("takeActionForReply =======================>",currentEmail,userList);
		let { new_ce } = this.state;
		new_ce.receiver_ids = [];
		new_ce.selectedToEmailIds = [];
		new_ce.cc_ids = [];
		new_ce.selectedCCEmailIds = [];
		
		if( currentEmail.sender ){
			new_ce.receiver_ids.push(currentEmail.sender.id);
			for( let j=0;j<userList.length;j++ ){
				if( currentEmail.sender.id === userList[j].id ){
					new_ce.selectedToEmailIds.push((userList[j].firstname+""+(userList[j].lastname ? " "+userList[j].lastname : "")+" ("+(userList[j].wordpress_username ? userList[j].wordpress_username : userList[j].id+"_"+userList[j].firstname+(userList[j].lastname ? "_"+userList[j].lastname : ""))+")"));
				}
			}
		}
		
		this.setState({isReplyMode: true});
		this.setState({new_ce: new_ce});
	}
	
	setCurrentEmailForEdit = (currentEmail,userList) => {
		let { new_ce } = this.state;
		new_ce.receiver_ids = [];
		new_ce.selectedToEmailIds = [];
		new_ce.cc_ids = [];
		new_ce.selectedCCEmailIds = [];
		if( currentEmail.cc_ids && currentEmail.cc_ids.length > 0 ){
			for( let i=0;i<currentEmail.cc_ids.length;i++ ){
				new_ce.cc_ids.push(currentEmail.cc_ids[i].id);
				for( let j=0;j<userList.length;j++ ){
					if( currentEmail.cc_ids[i].id === userList[j].id ){
						new_ce.selectedCCEmailIds.push((userList[j].firstname+""+(userList[j].lastname ? " "+userList[j].lastname : "")+" ("+(userList[j].wordpress_username ? userList[j].wordpress_username : userList[j].id+"_"+userList[j].firstname+(userList[j].lastname ? "_"+userList[j].lastname : ""))+")"));
					}
				}
			}
		}
		if( currentEmail.receiver && currentEmail.receiver.length > 0 ){
			for( let i=0;i<currentEmail.receiver.length;i++ ){
				new_ce.receiver_ids.push(currentEmail.receiver[i].id);
				for( let j=0;j<userList.length;j++ ){
					if( currentEmail.receiver[i].id === userList[j].id ){
						new_ce.selectedToEmailIds.push((userList[j].firstname+""+(userList[j].lastname ? " "+userList[j].lastname : "")+" ("+(userList[j].wordpress_username ? userList[j].wordpress_username : userList[j].id+"_"+userList[j].firstname+(userList[j].lastname ? "_"+userList[j].lastname : ""))+")"));
					}
				}
			}
		}
		new_ce.id = currentEmail.id;
		new_ce.subject = currentEmail.subject;
		new_ce.body = currentEmail.message;
		this.setState({isEditMode: true});
		this.setState({new_ce: new_ce});
	}
	
	sendMessage = () => {
		let { closeCEModal, takeActionAfterSent, userList } = this.props;
		let { new_ce, isEditMode, isAllUser } = this.state;
		delete new_ce.message_folder_id;
		const cm = new CookieManager();
		const api = new Api(cm.getIdToken());
		if( new_ce.receiver_ids.length <= 0 ){
			if(!isAllUser){
			    this.setState({isToError: true});
			    message.error("Please select recipient email id.");
			}
		}else if( new_ce.subject === "" ){
			this.setState({isSubjectError: true});
			message.error("Please enter subject.");
		}

		let selectedEmail = new_ce;
		if(isAllUser){
		    new_ce.selectedCCEmailIds = [];
		    new_ce.receiver_ids = [];
		    for( let j=0;j<userList.length;j++ ){
               new_ce.selectedCCEmailIds.push(userList[j].email);
               new_ce.receiver_ids.push(userList[j].id);
            }
		}
		if( new_ce.receiver_ids.length > 0 && new_ce.subject !== "" ){
			api.send_message(new_ce)
			.then(res => {
				message.success("Your message is been sent successfully.");
				if( isEditMode ){
					let { takeActionAfterSent } = this.props;
					takeActionAfterSent(new_ce.id);
				}else{
					let { takeActionAfterComposeSent, loggedInUser } = this.props;
					let isIam = false;
					let selectedEmail = '';
					for( let i=0;i<new_ce.receiver_ids.length;i++ ){
						if( loggedInUser.id === new_ce.receiver_ids[i] ){
							isIam = true;

							break;
						}
					}
					for( let i=0;i<new_ce.cc_ids.length;i++ ){
						if( loggedInUser.id === new_ce.cc_ids[i] ){
							isIam = true;
							break;
						}
					}
					
					if( isIam ){
						takeActionAfterComposeSent("sent",true,selectedEmail);
					}else{
						takeActionAfterComposeSent("sent",false, selectedEmail);
					}
				}
				closeCEModal();
			})
	  		.catch(error => {
	  			console.log('Oops! Something went wrong! ==========================>',error);
	  			message.error("Oops! Something went wrong! Please try again later.");
	  		});
		}
	}
	
	createMessage = (new_ce) => {
		//let { new_ce } = this.state;
		let { userList, takeActionAfterComposeSent } = this.props;
		new_ce.receiver_ids = [];
		new_ce.cc_ids = [];
		const cm = new CookieManager();
		const api = new Api(cm.getIdToken());
		
		const filteredOptions = userList.filter((o) => {
			if( new_ce.selectedToEmailIds.includes((o.firstname+""+(o.lastname ? " "+o.lastname : "")+" ("+(o.wordpress_username ? o.wordpress_username : o.id+"_"+o.firstname+(o.lastname ? "_"+o.lastname : ""))+")")) ){
				return o.id;
			}
		});
		filteredOptions.map((o) => {
			new_ce.receiver_ids.push(o.id);
		});
		
		const filteredCCOptions = userList.filter((o) => {
			if( new_ce.selectedCCEmailIds.includes((o.firstname+""+(o.lastname ? " "+o.lastname : "")+" ("+(o.wordpress_username ? o.wordpress_username : o.id+"_"+o.firstname+(o.lastname ? "_"+o.lastname : ""))+")")) ){
				return o.id;
			}
		});
		filteredCCOptions.map((o) => {
			new_ce.cc_ids.push(o.id);
		});
		
		if( new_ce.id !== -1 ){
			api.update_message(new_ce.id,new_ce)
			.then(res => {
				if( res.status === 200 ){
					
				}
			})
	  		.catch(error => {
	  			console.log('Oops! Something went wrong! ==========================>',error);
	  			message.error("Oops! Something went wrong! Please try again later.");
	  		});
		}else{
			api.create_message(new_ce)
			.then(res => {
				if( res.status === 200 ){
					new_ce.id = res.data.message.id;
					this.setState({
						new_ce: new_ce
					});
					takeActionAfterComposeSent("drafts",true, new_ce);
				}
			})
	  		.catch(error => {
	  			console.log('Oops! Something went wrong! ==========================>',error);
	  			message.error("Oops! Something went wrong! Please try again later.");
	  		});
		}
	}
	
	changeNewCE = (key, val, is_valid=true) => {
		let new_ce = {...this.state.new_ce};
		if( is_valid && (key !== "to" && key !== "cc" && key !== "subject") ){
			new_ce.body = key;
		}else if( is_valid && (key === "to" || key === "cc" || key === "subject") ){
			new_ce[key] = val;
			if( key === "subject" && val !== "" ){
				this.setState({isSubjectError: false});
			}
		}
		this.setState({
			new_ce: new_ce
		});
		this.createMessage(new_ce);
	}
	
	handleEmailChange = (selectedToEmailIds) => {
		let { new_ce } = this.state;
		new_ce.selectedToEmailIds = selectedToEmailIds;
		this.setState({new_ce: new_ce});
		if( selectedToEmailIds.length > 0 ){
			this.setState({isToError: false});
		}
		this.createMessage(new_ce);
	}
	
	handleCCEmailChange = (selectedCCEmailIds) => {
		let { new_ce } = this.state;
		new_ce.selectedCCEmailIds = selectedCCEmailIds;
		this.setState({new_ce: new_ce});
		this.createMessage(new_ce);
	}

	checkedAllUsers = ( value) => {
	    this.setState({isAllUser: value})
	}
	
	onRemoveAttach = (file) => {
		//console.log("onRemoveAttach =========================>",file);
	}
	
	handleUploadChange = (info) => {
		let fileList = info.fileList;
		this.setState({ fileList });
	}

	render() {
		let { open, title, closeCEModal, userList } = this.props;
		let { new_ce, quill, isSubjectError, isToError, isAllUser, fileList, isReplyMode } = this.state;
		const filteredOptions = userList.filter(o => !new_ce.selectedToEmailIds.includes((o.firstname+""+(o.lastname ? " "+o.lastname : "")+" ("+(o.wordpress_username ? o.wordpress_username : o.id+"_"+o.firstname+(o.lastname ? "_"+o.lastname : ""))+")")));
		const filteredCCOptions = userList.filter(o => !new_ce.selectedCCEmailIds.includes((o.firstname+""+(o.lastname ? " "+o.lastname : "")+" ("+(o.wordpress_username ? o.wordpress_username : o.id+"_"+o.firstname+(o.lastname ? "_"+o.lastname : ""))+")")));
		const ReactQuill = quill;
		let message_id = null;
		let isAttachmentDisable = true;
		const cm = new CookieManager();
		if( new_ce.id !== -1 ){
			message_id = new_ce.id;
			isAttachmentDisable = false;
		}else{
			message_id = null;
		}
		const uploadInitObj = {
			name: 'data',
			action: `${ServerRouter.backend()}/add_attachment_to_message`,
			multiple: true,
			disabled: isAttachmentDisable,
			headers: {
				Authorization: cm.getIdToken(),
			},
			data: {
				message_id: message_id
			},
			onChange: this.handleUploadChange,
			onRemove(file) {
				//console.log("onRemoveAttach =========================>",file);
		    }
		};
		if( ReactQuill ){
			return (
				<Modal
	  		        style={{ top: 64 }}
	  		        closable={false}
					maskClosable={false}
	  		        width={720}
	  		        title={title}
	  		        visible={open}
	  		        onCancel={closeCEModal}
					className="compose-mail-modal"
					footer={
						<div onClick={(e) => e.stopPropagation()}>
			            	<Button className="c-btn__secondary" key="cancel" onClick={closeCEModal}>Close</Button>
			            	<Button key="submit" onClick={this.sendMessage}>Send</Button>
		            	</div>
		        	}>
					<div className="compose-mail-container">
						<Upload {...uploadInitObj} fileList={fileList}
							className="attach-file-container"
							>
							<Button type="primary" icon="paper-clip" size="small">Attach File</Button>
						</Upload>
						<Checkbox checked={isAllUser} disabled={isReplyMode}
                                onChange={(e) => this.checkedAllUsers(e.target.checked)} style={{marginBottom:`8px`}}>Send All </Checkbox>
                    	<Select
				          	mode="multiple"
				          	placeholder="To"
			          		showArrow={false}
							className={isToError ? 'isError' : ''}
                    	    getPopupContainer={triggerNode => triggerNode.parentNode}
							value={new_ce.selectedToEmailIds}
							onChange={this.handleEmailChange}
							disabled={isAllUser || isReplyMode}
							defaultOpen={false}
							size="large"
				          	style={{ width: '100%' }}>
							{
								filteredOptions.map(item => (
									<Select.Option key={`${item.firstname}${(item.lastname ? " "+item.lastname : "")} (${(item.wordpress_username ? item.wordpress_username : item.email)})`}>
										{`${item.firstname}${(item.lastname ? " "+item.lastname : "")} (${(item.wordpress_username ? item.wordpress_username : item.email)})`}
					            	</Select.Option>
								))
					        }
						</Select>
						<Select
				          	mode="multiple"
				          	placeholder="CC"
			          		showArrow={false}
							getPopupContainer={triggerNode => triggerNode.parentNode}
							value={new_ce.selectedCCEmailIds}
							onChange={this.handleCCEmailChange}
							disabled={isAllUser}
							defaultOpen={false}
							size="large"
				          	style={{ width: '100%' }}>
							{
								filteredCCOptions.map(item => (
									<Select.Option key={`${item.firstname}${(item.lastname ? " "+item.lastname : "")} (${(item.wordpress_username ? item.wordpress_username : item.email)})`}>
										{`${item.firstname}${(item.lastname ? " "+item.lastname : "")} (${(item.wordpress_username ? item.wordpress_username : item.email)})`}
					            	</Select.Option>
								))
					        }
						</Select>
						<Input
			                placeholder="Subject"
			                className={"c-geform__input " + (isSubjectError ? 'isError' : '')}
			                value={new_ce.subject}
			                onChange={(e) => this.changeNewCE('subject', e.target.value)} 
			                />
						<ReactQuill
							onChange={this.changeNewCE}
				          	theme="snow"
				          	bounds={'.compose-mail-container'}
				            placeholder="Write Something"
			          		value={new_ce.body}
							modules={text_editor_modules}
	                    	formats={text_editor_formats}
							/>
					</div>
				</Modal>
			)
		}else{
			return null;
		}
	}
}
