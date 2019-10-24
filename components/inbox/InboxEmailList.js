import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import InboxEmailListItem from './InboxEmailListItem';
import { Input, Icon, message } from 'antd';

export default class InboxEmailList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			emails: [],
			selectedEmailId: 0,
			currentSection: "",
			searchText: ""
		};
	}
	
	onChangeSearchText = (value) => {
		this.setState({searchText: value});
		const cm = new CookieManager();
        const api = new Api(cm.getIdToken());
        api.search_message(value, this.props.currentSection)
        .then(res => {
            //console.log('res===============',res);
        })
        .catch(error => {
            console.log('Oops! Something went wrong! ==========================>',error);
            message.error("Oops! Something went wrong! Please try again later.");
        });
	}
	
	render() {
		let { emails, selectedEmailId, loggedInUser, currentSection, mailboxHeight, onEmailSelected } = this.props;
		let { searchText } = this.state;
		let updatedMailboxHeight = mailboxHeight - 84;
		return (
			<div className="col-12 col-sm-4">
				{
					emails.length > 0 ?
						<div>
							<div className="email-search-container">
								<Input
							        placeholder="Search Message or Name..."
							        prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.25)' }} />}
							        value={searchText}
							        onChange={(e) => {this.onChangeSearchText(e.target.value); e.stopPropagation();}}
							        />
							</div>
							<div className="email-list" style={{height: updatedMailboxHeight+"px"}}>
								{
									emails.map((email,emailIndex) => {
										return (

											<InboxEmailListItem key={`email_${email.id}`}
												onEmailClicked={(email) => { onEmailSelected(email); }}
												email={email}
												loggedInUser={loggedInUser}
												currentSection={currentSection}
												emailIndex={emailIndex}
												selected={selectedEmailId === email.id} />
										);
									})
								}
							</div>
						</div>
					:
						<div className="email-list empty" style={{height: mailboxHeight+"px"}}>
						<span className="no-msg-span">Nothing to see here.</span>
						</div>
				}
			</div>
		)
	}
}
