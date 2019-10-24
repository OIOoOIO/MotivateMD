import CookieManager from '../../services/CookieManager';
import Api from '../../services/Api';
import { getPrettyDate, predefinedHexColorArray, getChatUserProfile, getUserProfileColor } from '../../utils/helpers';

export default class InboxEmailListItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: [],
			selected: -1
		};
	}
	
	render() {
		let { email, loggedInUser, selected, currentSection, emailIndex, onEmailClicked } = this.props;
		let classes = "email-item";
		if( selected ){
			classes += " selected";
		}
		let profileColor = predefinedHexColorArray[emailIndex % 50];
		return (
			<div onClick={() => { onEmailClicked(email); }} className={classes}>
				{
					currentSection === "inbox" ?
						<div className="email-item__unread-dot" data-read={email.read}></div>
					: null
				}
				<div className="username-container">
					
					<div className="username-container__username" style={{backgroundColor: getUserProfileColor(email,currentSection,loggedInUser,true,false)? "#34393d" : profileColor}}>
						{
							getChatUserProfile(email,currentSection,loggedInUser,true,false)
						}
					</div>
					<div className="email-item__from truncate">
						<strong>{getChatUserProfile(email,currentSection,loggedInUser,false,false)}</strong>
					</div>
					<div className="email-item__details">
						<span className="email-item__subject truncate">{email.subject}</span>
						<span className="email-item__time truncate">{getPrettyDate(email.time)}</span>
					</div>
				</div>
			</div>
		)
	}
}
