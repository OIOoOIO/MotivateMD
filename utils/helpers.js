import moment from 'moment';
import { Avatar} from 'antd';
import motivateMdLogo from '../assets/images/motivate-md-logo.png';

let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let colorLetters = "0123456789ABCDEF";
export const predefinedHexColorArray = [
    "#230300","#18003e","#084000", "#441b00","#2f2100", "#002c2c","#1e0014","#3a0500",
    "#270066","#0c5e00","#6c2b00", "#503901","#004444","#320021","#570700","#390094",
    "#107a00", "#923a00","#785809","#006161","#4f0034","#a40d00","#4e00cc","#149700",
    "#ba4a00","#b78816","#007f7f","#71004b","#ff0000","#6100ff","#1ac000","#ff6600",
    "e2a718", "#00a3a3","#990066","#ff3939","#8d47ff","#45d42f","#ff893a", "#ffb500",
    "#1cbfbf","#c11588", "#ff6363","#a974ff","#6fe85d", "#ffad76","#ffd162","#3ddddd",
    "#e922a7","#ff8b8b"];

export const text_editor_modules = {
	toolbar: [
		[{ 'header': '1'}, {'header': '2'}, { 'font': [] }], [{size: []}],
        ['bold', 'italic', 'underline','strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'video'],
        ['clean']
	],
};

export const text_editor_formats = [
	'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'video'
];

/* eslint-disable no-useless-escape */
export function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/* disable past dates in antd datepicker */
export function disabledDate (current) {
	return current && current < (moment().endOf('day').subtract(1, "days"));
}

/* validate if only number is entered */
export function validNumber (val) {
    return (val === '' || (val.match(/[a-zA-Z]/) === null && !isNaN(parseInt(val))));
}

export function dynamicSort(property) {
   var sortOrder = 1;
   if(property[0] === "-") {
       sortOrder = -1;
       property = property.substr(1);
   }
   return function (a,b) {
       var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
       return result * sortOrder;
   }
}

export function formatMessageDateTime(date){
	return moment.utc(date).local().format('YYYY-MM-DD HH:mm:ss');
}

export function getFromToString(email,currentSection,loggedInUser){
	if(currentSection === "drafts" || currentSection === "sent"){
		return "from <strong>me</strong>";
	}else{
		let receiverName = "";
		let meReceiverName = "";
		if( email.receiver && email.receiver.length > 0 ){
			for( let i=0;i<email.receiver.length;i++ ){
				if( email.receiver[i].email === loggedInUser.email ){
					meReceiverName = "Me, ";
				}else{
					receiverName = receiverName + (email.receiver[i].firstname ? email.receiver[i].firstname : "Guest") +" "+ (email.receiver[i].lastname ? email.receiver[i].lastname : "") + ", ";
				}
			}
			receiverName = meReceiverName + "" + receiverName;
			receiverName = receiverName.replace(/,\s*$/, "");
			return "to <strong>"+receiverName+"</strong>";
		}else{
			return null;
		}
	}
}

export function getCCString(email,currentSection,loggedInUser){
	let ccName = "";
	let meCCName = "";
	if( email.cc_ids && email.cc_ids.length > 0 ){
		for( let i=0;i<email.cc_ids.length;i++ ){
			if( email.cc_ids[i].email === loggedInUser.email ){
				meCCName = "Me, ";
			}else{
				ccName = ccName + (email.cc_ids[i].firstname ? email.cc_ids[i].firstname : "Guest") +" "+ (email.cc_ids[i].lastname ? email.cc_ids[i].lastname : "") + ", ";
			}
		}
		ccName = meCCName + "" + ccName;
		ccName = ccName.replace(/,\s*$/, "");
		return "cc <strong>"+ccName+"</strong>";
	}else{
		return null;
	}
}

export function getChatUserProfile(email,currentSection,loggedInUser,isProfilePic,isDetailSection){
	//console.log("getChatUserProfile =========================>",email,currentSection,loggedInUser,isProfilePic,isDetailSection);
	let receiverName = "Guest";
	let receiverInitial = "G";
	let meReceiverName = "";
	if( currentSection === "drafts" || currentSection === "sent" ){
		if( email.receiver && email.receiver.length > 0 ){
			receiverName = "";
			for( let i=0;i<email.receiver.length;i++ ){
				if( isProfilePic ){
					if(email.receiver[i].email === "admin@motivatemd.com") {
						receiverInitial = <Avatar src={motivateMdLogo} /> 
					}else{
						receiverInitial = email.receiver[i].initial ? email.receiver[i].initial : "G";
					}
					break;
				}
				if( email.receiver[i].email !== loggedInUser.email && !isDetailSection ){
					receiverName = receiverName + (email.receiver[i].firstname ? email.receiver[i].firstname : "Guest") + (email.receiver[i].lastname ? " "+email.receiver[i].lastname : "") + ", ";
				}else if( email.receiver[i].email === loggedInUser.email && !isDetailSection ){
					receiverName = receiverName + (email.receiver[i].firstname ? email.receiver[i].firstname : "Guest") + (email.receiver[i].lastname ? " "+email.receiver[i].lastname : "") + " (Me), ";
				}else if( isDetailSection ){
					if( email.receiver[i].email === loggedInUser.email ){
						meReceiverName = "Me, ";
					}else{
						receiverName = receiverName + (email.receiver[i].firstname ? email.receiver[i].firstname : "Guest") + (email.receiver[i].lastname ? " "+email.receiver[i].lastname : "") + ", ";
					}
				}
			}
			receiverName = receiverName + "" + meReceiverName;
			receiverName = receiverName.replace(/,\s*$/, "");
		}
	}else{
		if( isProfilePic ){
			if(email.sender.email === "admin@motivatemd.com") {
				receiverInitial = <Avatar src={motivateMdLogo} /> 
			}else{
			 receiverInitial = (email.sender && email.sender.initial) ? email.sender.initial : G;
			}
		}else{
			if( email.sender.email === loggedInUser.email ){
				receiverName = (email.sender.firstname ? email.sender.firstname : "Guest") + (email.sender.lastname ? " "+email.sender.lastname : "") + " (Me)";
			}else{
				receiverName = (email.sender.firstname ? email.sender.firstname : "Guest") + (email.sender.lastname ? " "+email.sender.lastname : "");
			}
		}
	}
	if( isProfilePic ){
		return receiverInitial;
	}else{
		return receiverName;
	}
}
export function getUserProfileColor(email,currentSection,loggedInUser,isProfilePic,isDetailSection){
	
	let userProfileColorFlag = false
	if( currentSection === "drafts" || currentSection === "sent" ){
		if( email.receiver && email.receiver.length > 0 ){
			
			for( let i=0;i<email.receiver.length;i++ ){
				
				if( isProfilePic ){
					if(email.receiver[i].email === "admin@motivatemd.com") {
						userProfileColorFlag = true
					}else{
						userProfileColorFlag = false
					}
					break;
				}
			}
		}
	}else{
		if( isProfilePic ){
			if(email.sender.email === "admin@motivatemd.com") {
				userProfileColorFlag = true
			}else{
			 userProfileColorFlag = false
			}
		}
	}
	return userProfileColorFlag;
}


//Helper methods
export function getPrettyDate(date){
	date = formatMessageDateTime(date);
	date = date.split(' ')[0];
	const newDate = date.split('-');
	const month = months[newDate[1] - 1];
	return `${month} ${newDate[2]}, ${newDate[0]}`;
}

// Remove the seconds from the time
export function getPrettyTime(date){
	date = formatMessageDateTime(date);
	const time = date.split(' ')[1].split(':');
	return `${time[0]}:${time[1]}`;
}

// Generate random hex color code
export function getHexColorCode(){
	let color = '#'; 
	// generating 6 times as HTML color code consist 
	// of 6 letter or digits
	for (var i = 0; i < 6; i++)
	   color += colorLetters[(Math.floor(Math.random() * 16))];
	return color;
}

export const loginErrorMessage = "Email or Password is invalid."




