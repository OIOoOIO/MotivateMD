import Api from '../../services/Api';
import AppLayout from '../../components/AppLayout';
import Link from 'next/link';
import { Button, Input, Alert } from 'antd';
import brandInline from '../../assets/images/brand-inline.png';
import ReactGA from 'react-ga';

export default class Activate extends React.Component {
  static async getInitialProps({ req }) {
    const api = new Api();
    let props = null;
    try {
      const res = await api.activate_account(req.params.token);
      props = res.data;
    } catch (e) {
      console.log(e)
      props = e.response.data;
    }
    return {
      ...props,
      session: {
        logged_in: false,
        username: null
      },
      page_attrs: {
        title: 'Account Activation - Motivate MD',
        description: 'Activate your account.'
      }
    }
  }
  
  constructor(props) {
    super(props);
    this.state = {}
    ReactGA.pageview('/activate');
  }

  render() {
    let success = (
      <div>
        <h3 className="mb-1">Thank You</h3>
        <p>Your account is now activated.</p>
        <Link href="/auth/login" as="/login"><a>Continue</a></Link>
      </div>
    );
    let error = (
      <div className="col-12 pl-h pr-h mb-1">
        <div className="tleft">
          <Alert
            message="Error"
            description={
              <ul>
                {
                  this.props.errors && this.props.errors.length > 0 ? this.props.errors.map(e => {
                    return <li key={e}>{e}</li>
                  }) : null
                }
              </ul>
            }
            type="error"
          />
        </div>
      </div>
    );
    return (
      <AppLayout {...this.props}>
        <div className="l-auth">
          <div className="l-auth__road"></div>
          <div className="l-auth__panel">
            <div className="row mr-0 ml-0">
              <div className="col-12 tcenter">
                <img className="l-auth__brand" src={brandInline} />
              </div>
              <div className="col-12 col-lg-8 offset-lg-2 mt-2">
                {this.props.errors && this.props.errors.length > 0 ? error : success}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
}