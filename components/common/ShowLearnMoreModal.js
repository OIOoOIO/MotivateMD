import { Modal, Button} from 'antd';
import Loader from './Loader';
import userMdSolid from '../../assets/images/color_icons/user-md-solid-white.svg';


export default class ShowLearnMoreModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      learn_more_text: this.props.learn_more_text,
      more_link: ""
    }

  }


  setLearnMoreText = (val, more_link) => {
    this.setState({
        learn_more_text: val,
        more_link: more_link
    })
  }

  render() {
    let { loading, learn_more_text,more_link } = this.state;
    return (
      <Modal
        closable={false}
        width={450}
        title={<strong className="gradient-text-color"><div className="gradient-md-container"><img src={userMdSolid} className="gradient-user-md" /></div>MyMentor</strong>}
        visible={this.props.open}
        onCancel={this.props.handleClose}
        className="my-mentor-modal"
        centered={true}
        footer={null
        }>
        <div onClick={(e) => e.stopPropagation()} >
            <div style={{textAlign: `justify`,textJustify: `inter-word`}}dangerouslySetInnerHTML={{__html: learn_more_text}}>
            </div>
            {
                more_link?
                    <div>
                        <br/>
                        <div className="tright mb-h">
                          <a target="_blank" className="c-btn__inverted" href={more_link}>More <i className="i-angle-right" />
                          </a>
                        </div>
                    </div>
                : ''
            }
         </div>
      </Modal>
    );
  }
}