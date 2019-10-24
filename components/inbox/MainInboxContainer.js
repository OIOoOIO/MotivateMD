import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import InboxSidebar from './InboxSidebar';
import InboxEmailList from './InboxEmailList';
import InboxEmailDetails from './InboxEmailDetails';
import window from 'global';
import { message } from 'antd';

export default class MainInboxContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedEmailId: -1,
			currentSection: 'inbox',
			emails: [],
			user_list: []
		};
	}
	
	componentWillReceiveProps(props) {
		//console.log("MainInboxContainer componentWillReceiveProps ==========================>",props);
		let { messages } = props;
		let { emails } = this.state;
		this.setState({emails: messages});
		if( messages.length > 0 ){
			this.setState({selectedEmailId: messages[0].id});
		}
	}
	
	componentDidMount = () => {
		let { messages } = this.props;
		let { emails } = this.state;
		this.setState({emails: messages});
		if( messages.length > 0 ){
			this.setState({selectedEmailId: messages[0].id});
		}
	}
	
	openEmail(email) {
		let { currentSection } = this.state;
		let { setFolderCount } = this.props;
		const cm = new CookieManager();
		const api = new Api(cm.getIdToken());
		if( currentSection === "inbox" ){
			api.message_read_by_user(email.id)
			.then(res => {
				const emails = this.state.emails;
				const index = emails.findIndex(x => x.id === email.id);
				if( !email.read ){
	                setFolderCount("inbox", false, email);
	            }
				emails[index].read = 'true';
				this.setState({
					selectedEmailId: email.id,
					emails
				});
			})
	  		.catch(error => {
	  			console.log('Oops! Something went wrong! ==========================>',error);
	  			message.error("Oops! Something went wrong! Please try again later.");
	  		});
		}else{
			const emails = this.state.emails;
			const index = emails.findIndex(x => x.id === email.id);
			this.setState({
				selectedEmailId: email.id,
				emails
			});
		}
	}

	starredMessage(id){
	    let { setFolderCount } = this.props;
        const cm = new CookieManager();
        const api = new Api(cm.getIdToken());
        api.message_starred_by_user(id)
        .then(res => {
            const emails = this.state.emails;
            const index = emails.findIndex(x => x.id === id);
            const selectedEmail = emails[index];
             if( !selectedEmail.starred ){
               setFolderCount("important", false, selectedEmail);
             }else{
               setFolderCount("unImportant", false, selectedEmail);
             }


            emails[index].starred = 'true';
            this.setState({
                selectedEmailId: id,
                emails
            });

        })
        .catch(error => {
            console.log('Oops! Something went wrong! ==========================>',error);
            message.error("Oops! Something went wrong! Please try again later.");
        });
	}

	unStarredMessage(id){
	    let { setFolderCount } = this.props;
        const cm = new CookieManager();
        const api = new Api(cm.getIdToken());
        api.message_unstarred_by_user(id)
        .then(res => {
            const emails = this.state.emails;
            const index = emails.findIndex(x => x.id === id);
            const selectedEmail = emails[index];
             if( !selectedEmail.starred ){
               setFolderCount("important", false, selectedEmail);
             }else{
               setFolderCount("unImportant", false, selectedEmail);
             }


            emails[index].starred = false;
            this.setState({
                selectedEmailId: id,
                emails
            });

        })
        .catch(error => {
            console.log('Oops! Something went wrong! ==========================>',error);
            message.error("Oops! Something went wrong! Please try again later.");
        });
	}

	
	deleteMessage(id) {
		// Mark the message as 'deleted'
		let { takeActionAfterTrash, takeActionAfterComposeSent, messageFolder, setFolderCount } = this.props;
		const emails = this.state.emails;
		const index = emails.findIndex(x => x.id === id);
		let previousMessageFolder = this.state.currentSection;
		emails[index].tag = 'trash';
		let selectedEmail = emails[index];

		const cm = new CookieManager();
        const api = new Api(cm.getIdToken());
        api.trash_message(selectedEmail.id)
        .then(res => {
            this.setState({
                selectedEmailId: selectedEmail.id,
                emails
            });
            if(previousMessageFolder === "drafts"){
                 setFolderCount("trashDrafts",true, selectedEmail);
                 takeActionAfterTrash(selectedEmail.id);
            }else if(previousMessageFolder === "inbox"){
                setFolderCount("trash",false, selectedEmail);
                takeActionAfterTrash(selectedEmail.id);
            }else if(previousMessageFolder === "sent"){
                setFolderCount("trash",true, selectedEmail);
                takeActionAfterTrash(selectedEmail.id);
            }else if(previousMessageFolder === "trash"){
                setFolderCount("trashDelete",true, selectedEmail);
                takeActionAfterTrash(selectedEmail.id);
            }else if(previousMessageFolder === "important"){
                setFolderCount("trash",true, selectedEmail);
                takeActionAfterTrash(selectedEmail.id);
            }


        })
        .catch(error => {
            console.log('Oops! Something went wrong! ==========================>',error);
            message.error("Oops! Something went wrong! Please try again later.");
        });
		

	}
	
	setSidebarSection(section) {
		console.log('section=======',section);
		console.log('this.state.selectedEmailId=======',this.state.selectedEmailId);
		let selectedEmailId = this.state.selectedEmailId;
		if (section !== this.state.currentSection) {
			selectedEmailId = '';
		}
		
		this.setState({
			currentSection: section,
			selectedEmailId
		});
		
		let { getMessagesAccordingToFolder } = this.props;
		getMessagesAccordingToFolder(section);
	}
	
	setSidebarTagSection = (section) => {
		let selectedEmailId = this.state.selectedEmailId;
		if (section !== this.state.currentSection) {
			selectedEmailId = '';
		}
		
		this.setState({
			currentSection: section,
			selectedEmailId
		});
		
		let { getMessagesAccordingToTag } = this.props;
		getMessagesAccordingToTag(section);
	}

	render() {

		let { emails, selectedEmailId, currentSection } = this.state;
		let { userList, messageFolder, tag, loggedInUser, mailboxHeight, takeActionAfterSetTag, takeActionAfterComposeSent, takeActionAfterSent, inboxCount, sentCount, draftsCount, trashCount, importantCount } = this.props;
		let currentEmail = emails.find(x => x.id === selectedEmailId);
		let emailIndex = 0;
		let dummyEmailList = emails.filter(x => x.tag === currentSection);
		for( let i=0;i<dummyEmailList.length;i++ ){
			if( dummyEmailList[i].id === selectedEmailId ){
				emailIndex = i;
			}
		}
		return (
			<div className="inbox-main-container">
				{
					<div className="row ht-100 clear-margin">
						<div className="col-12 col-lg-2 sidebar-col ht-100 sidebar-compose-col">
							<InboxSidebar
								emails={emails}
								mailboxHeight={mailboxHeight}
								currentSection={currentSection}
								userList={userList}
								loggedInUser={loggedInUser}
								messageFolder={messageFolder}
								tag={tag}
								takeActionAfterComposeSent={takeActionAfterComposeSent}
								inboxCount={inboxCount}
								sentCount={sentCount}
								draftsCount={draftsCount}
								trashCount={trashCount}
								importantCount={importantCount}
								setSidebarTagSection={(section) => { this.setSidebarTagSection(section); }}
								setSidebarSection={(section) => { this.setSidebarSection(section); }} />
						</div>
						<div className="col-12 col-lg-10 content-col ht-100">
							<div className="inbox-container row clear-margin">
								<InboxEmailList
									emails={emails}
									mailboxHeight={mailboxHeight}
									loggedInUser={loggedInUser}
									onEmailSelected={(email) => { this.openEmail(email); }}
									selectedEmailId={selectedEmailId}
									currentSection={currentSection} />
								<InboxEmailDetails
									email={currentEmail}
									mailboxHeight={mailboxHeight}
									emailIndex={emailIndex}
									loggedInUser={loggedInUser}
									tag={tag}
									takeActionAfterSetTag={takeActionAfterSetTag}
									takeActionAfterSent={takeActionAfterSent}
								    takeActionAfterComposeSent={takeActionAfterComposeSent}
									currentSection={currentSection}
									userList={userList}
									onDelete={(id) => { this.deleteMessage(id); }}
									onStarred={(id) => { this.starredMessage(id); }}
									onUnStarred={(id) => { this.unStarredMessage(id); }} />
							</div>
						</div>
					</div>
				}
			</div>
		)
	}
}
