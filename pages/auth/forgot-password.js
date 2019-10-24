import Api from '../../services/Api';
import AppLayout from '../../components/AppLayout';
import Link from 'next/link';
import { Button, Input, Alert } from 'antd';
import brandInline from '../../assets/images/brand-inline.png';
import ReactGA from 'react-ga';

export default class ForgotPassword extends React.Component {

  static async getInitialProps({ req }) {
    return {
      page_attrs: {
        title: 'Recover Your Password - Motivate MD',
        description: 'Recover your Motivate MD password by requesting a password reset link.'
      },
      session: {
        logged_in: false,
        username: null
      }
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      show_success: false,
      loading: false
    }
    ReactGA.pageview('/ForgotPassword');
  }
  
  changeInput = (key, e) => {
    let new_state = {}
    new_state[key] = e.target.value;
    this.setState(new_state);
  }

  handleSubmit = () => {
    this.setState({ loading: true });
    const api = new Api();
    let { email } = this.state;
    api.send_reset_link(email)
      .then(resp => {
        this.setState({
          email: '',
          show_success: true,
          loading: false
        })
        ReactGA.event({ category: 'Forgot Password', action: 'Forgot password link sent' });
      })
      .catch(error => {
        this.setState({ loading: false });
        if (error.response && error.response.data && error.response.data.errors)
          this.setState({ errors: error.response.data.errors })
        else
          alert('Oops! Something is wrong and we are working on it.')
      })
  }

  render() {
    let { loading } = this.state;
    let forgot_form = (
      <div>
        <div className="row">
          <div className="col-12 pl-h pr-h mb-1">
            <Input
              id='email'
              size='large'
              value={this.state.email}
              onChange={(e) => this.changeInput('email', e)}
              type="text"
              placeholder="Email"
              autoComplete="off" />
          </div>
          {
            this.state.show_success ?
            <div className="col-12 pl-h pr-h mb-1">
              <div className="bp3-callout bp3-intent-success tleft">
                <Alert
                  description={<ul><li>If the email you specified exists in our system, we've sent a password reset link to it.</li></ul>}
                  type="success"
                  closable
                />
              </div>
            </div> : null
          }
        </div>
        <Button loading={loading} disabled={loading} onClick={this.handleSubmit}>Send Reset Link</Button>
        <div className="mt-2">
          <Link href="/auth/signup" as="/signup"><a>Don't have an account? Sign Up</a></Link>
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
                <span>Enter your email and we send you a password reset link.</span>
              </div>
              <div className="col-12 col-lg-8 offset-lg-2 mt-2">
                {forgot_form}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
}