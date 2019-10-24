import { Modal, Button, message } from 'antd';
import ReactGA from 'react-ga';
import moment from 'moment'

export default class AllEventListModal extends React.Component {
	constructor(props) {
	    super(props);
	    ReactGA.modalview('/Goals/AllEventListModal/');
	}
	
	handleCloseAllGEModal = () => {
		this.props.handleCloseAllGEModal()
	}
	
	render() {
		let { open_all_ge_modal, upcomings, title, handleCloseAllGEModal } = this.props;
		let all_event_list = upcomings.map((value,index) => {
        	if(!value.logged) {
	        	return (
	    			<tr key={`z_${value.title}_${index}`}>
						<td>{moment(value.start_date).local().format('MM/DD/YY')}</td>
						<td className="event-title">{value.name}</td>
						<td className="event-kind capitalize-text">{value.kind === "extracurs" ? "Work & Activities" : value.kind}</td>
						<td>{value.duration}</td>
					</tr>
	        	);
        	}
        });
		return (
			<Modal
		        style={{ top: 64 }}
		        closable={false}
		        width={720}
		        title={title}
		        visible={open_all_ge_modal}
		        onCancel={this.handleCloseAllGEModal()}
				wrapClassName="all-event-list-wrapper"
				footer={
		          <div onClick={(e) => e.stopPropagation()}>
		            <Button className="c-btn__secondary" key="cancel" onClick={this.handleCloseAllGEModal()}>Cancel</Button>
		          </div>
		        }>
				<div>
					<table className="all-event-modal-table">
						<thead>
							<tr>
								<th>Date</th>
								<th>Title</th>
								<th>Kind</th>
								<th>Duration</th>
							</tr>
						</thead>
						<tbody>
							{all_event_list}
						</tbody>
					</table>
				</div>
			</Modal>
		);
	}
}