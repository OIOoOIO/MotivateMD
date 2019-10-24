import CookieManager from      '../services/CookieManager';
import AppLayout from          '../components/AppLayout';
import Api from                '../services/Api';
import window from 'global';
import _ from 'lodash';
import moment from 'moment';
import { message } from 'antd';
import MainInboxContainer from '../components/inbox/MainInboxContainer';

export default class Inbox extends React.Component {

	static async getInitialProps({ req, res }) {
		const cm = new CookieManager(req.headers && req.headers.cookie);
		const api = new Api(cm.getIdToken());
		if( cm.getIdToken() ){
			const back_res = await api.inbox_detail();
			if (back_res.data && back_res.data.session && back_res.data.session.logged_in) {
				return {
					...back_res.data,
					page_attrs: {
						title: 'Inbox - Motivate MD',
						description: 'Tell us more about yourself, so we can better serve you.'
					}
				};
			}else{
		      res.redirect('/login');
		      return {};
		    }
		}else{
	      res.redirect('/login');
	      return {};
	    }
	}

	constructor(props) {
		super(props);
		this.state = {
			mailboxHeight: "",
			loggedInUser: props.session.user,
			userList: props.user_list,
			messageFolder: props.message_folder,
			tag: props.tag,
			messages: props.message,
			inboxCount: props.inbox_count,
			sentCount: props.sent_count,
			draftsCount: props.drafts_count,
			trashCount: props.trash_count,
			importantCount: props.important_count,
		}
	}
  

	componentDidMount() {
		this.setState({mailboxHeight: window.innerHeight - 64});


	}
	
	getMessagesAccordingToFolder = (folder_kind) => {
		let { messageFolder } = this.state;
		const filteredMessageFolder = messageFolder.filter(o => o.kind === folder_kind);
		let selectedMessageFolderId = -1;
		messageFolder.map((o) => {
			if( o.kind === folder_kind ){
				selectedMessageFolderId = o.id;
			}
		});
		const cm = new CookieManager();
		const api = new Api(cm.getIdToken());
		api.get_message_list(selectedMessageFolderId)
		.then(res => {
			if( res.status === 200 && res.data.message.length > 0 ){
				this.setState({messages: res.data.message});
			}else{
				this.setState({messages: []});
			}
		})
  		.catch(error => {
  			console.log('Oops! Something went wrong! ==========================>',error);
  			message.error("Oops! Something went wrong! Please try again later.");
  		});
	}
	
	getMessagesAccordingToTag = (tag_kind) => {
		let { tag } = this.state;
		let selectedMessageTagId = -1;
		tag.map((o) => {
			if( o.kind === tag_kind ){
				selectedMessageTagId = o.id;
			}
		});
		const cm = new CookieManager();
		const api = new Api(cm.getIdToken());
		api.get_tag_message(selectedMessageTagId)
		.then(res => {
			if( res.status === 200 && res.data.message.length > 0 ){
				this.setState({messages: res.data.message});
			}else{
				this.setState({messages: []});
			}
		})
  		.catch(error => {
  			console.log('Oops! Something went wrong! ==========================>',error);
  			message.error("Oops! Something went wrong! Please try again later.");
  		});
	}
	
	setFolderCount = (folderName,isIam, selectedEmail) => {
		let { inboxCount, sentCount, trashCount, draftsCount, importantCount } = this.state;
		if( folderName === "inbox" && !isIam ){
			this.setState({inboxCount: (inboxCount - 1)});
		}else if( folderName === "sent" && !isIam ){
			this.setState({sentCount: (sentCount + 1)});
			this.setState({draftsCount: (draftsCount - 1)});
		}else if( folderName === "sent" && isIam ){
			this.setState({sentCount: (sentCount + 1)});
			this.setState({inboxCount: (inboxCount + 1)});
		}else if( folderName === "trash" && !isIam){
			this.setState({inboxCount: (inboxCount - 1)});
			this.setState({trashCount: (trashCount + 1)});
			if(selectedEmail && selectedEmail.starred){
                this.setState({importantCount: (importantCount - 1)});
            }
		}else if( folderName === "trash" && isIam){
			this.setState({sentCount: (sentCount - 1)});
			this.setState({trashCount: (trashCount + 1)});
			if(selectedEmail && selectedEmail.starred){
                this.setState({importantCount: (importantCount - 1)});
            }
		}else if( folderName === "drafts"){
            this.setState({draftsCount: (draftsCount + 1)});
        }else if( folderName === "trashDrafts"){
			this.setState({draftsCount: (draftsCount - 1)});
		}else if( folderName === "trashDelete"){
			this.setState({trashCount: (trashCount - 1)});
		}else if( folderName === "important"){
			this.setState({importantCount: (importantCount + 1)});
		}else if(folderName === "unImportant"){
            this.setState({importantCount: (importantCount - 1)});
		}
	}
	
	takeActionAfterSent = (emailId) => {
		let { messages, sentCount, draftsCount } = this.state;
		for( let i=0;i<messages.length;i++ ){
			if( emailId === messages[i].id ){
				messages.splice(i,1);
				sentCount = sentCount + 1;
				draftsCount = draftsCount - 1;
				break;
			}
		}
		this.setState({draftsCount: draftsCount});
		this.setState({sentCount: sentCount});
		this.setState({messages: messages});
	}

	takeActionAfterTrash = (emailId) => {
        let { messages, trashCount, draftsCount, inboxCount } = this.state;
        for( let i=0;i<messages.length;i++ ){
            if( emailId === messages[i].id ){
                messages.splice(i,1);
               // trashCount = trashCount + 1;
               // inboxCount = inboxCount - 1;
               this.setState({messages: messages});
                break;
            }
        }
        this.setState({inboxCount: inboxCount});
        this.setState({trashCount: trashCount});
        this.setState({draftsCount: draftsCount});
    }
	
	takeActionAfterSetTag = (selectedTagIds,updatedMessage,updatedTag) => {
		let { messages, tag } = this.state;
		for( let i=0;i<messages.length;i++ ){
			if( messages[i].id === updatedMessage.id ){
				messages[i] = updatedMessage;
			}
		}
		this.setState({tag: updatedTag});
		this.setState({messages: messages});
	}

	render() {
		let { userList, messageFolder, tag, messages, loggedInUser, mailboxHeight, inboxCount, sentCount, draftsCount, trashCount, importantCount } = this.state;
		return (
			<AppLayout inboxCount={inboxCount} {...this.props} navbar>
				<MainInboxContainer
					userList={userList}
					messageFolder={messageFolder}
					tag={tag}
					messages={messages}
					mailboxHeight={mailboxHeight}
					loggedInUser={loggedInUser}
					takeActionAfterComposeSent={this.setFolderCount}
					takeActionAfterSent={this.takeActionAfterSent}
					takeActionAfterTrash={this.takeActionAfterTrash}
					takeActionAfterSetTag={this.takeActionAfterSetTag}
					inboxCount={inboxCount}
					sentCount={sentCount}
					draftsCount={draftsCount}
					trashCount={trashCount}
					importantCount={importantCount}
					setFolderCount={this.setFolderCount}
					getMessagesAccordingToFolder={this.getMessagesAccordingToFolder}
					getMessagesAccordingToTag={this.getMessagesAccordingToTag}
				/>
			</AppLayout>
		);
	}
}
