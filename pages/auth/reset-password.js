import AppLayout from '../../components/AppLayout';
import Api from '../../services/Api';
import Link from 'next/link';
import { Button, Input, Alert } from 'antd';
import brandInline from '../../assets/images/brand-inline.png';
import ReactGA from 'react-ga';

export default class ForgotPassword extends React.Component {

  static async getInitialProps({ req }) {
    const api = new Api();
    let props = null;
    try {
      const res = await api.validate_pass_reset_token(req.params.token);
      props = {
        ...res.data,
        token: req.params.token
      };
    } catch (e) {
      props = {
        token_is_valid: false,
        token: req.params.token
      };
    }
    return {
      ...props,
      page_attrs: {
        title: 'Reset Your Password - Motivate MD',
        description: 'Reset the password to your Motivate MD account.'
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
      password: '',
      confirm: '',
      show_success: false, 
      errors: [],
      loading: false
    }
    ReactGA.pageview('/ResetPassword');
  }

  changeInput = (key, e) => {
    let new_state = {}
    new_state[key] = e.target.value;
    this.setState(new_state);
  }

  handleSubmit = () => {
    this.setState({ loading: true });
    const api = new Api();
    let { password, confirm } = this.state;
    api.reset_password(this.props.token, password, confirm)
      .then(resp => {
        this.setState({
          show_success: true,
          loading: false
        })
        ReactGA.event({ category: 'Reset Password', action: 'Reset link sent' });
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
    let errors = this.state.errors.map(e => {
      return <li key={e}>{e}</li>
    });
    let errors_if_any = this.state.errors.length == 0 ? null :
      <div className="col-12 pl-h pr-h mb-1">
        <div className="tleft">
          <Alert
            description={<ul>{errors}</ul>}
            type="error"
            closable
          />
        </div>
      </div>;
    let pass_reset_form = (
      <div>
        <div className="row">
          <div className="col-12 pl-h pr-h mb-1">
            <Input
              id='password'
              value={this.state.password}
              onChange={(e) => this.changeInput('password', e)}
              type="password"
              placeholder="New Password"
              autoComplete="off" />
          </div>
          <div className="col-12 pl-h pr-h mb-1">
            <Input
              id='password_repeat'
              value={this.state.confirm}
              onChange={(e) => this.changeInput('confirm', e)}
              type="password"
              placeholder="Repeat New Password"
              autoComplete="off" />
          </div>
          { errors_if_any }
        </div>
        <Button loading={loading} disabled={loading} onClick={this.handleSubmit}>Submit</Button>
      </div>
    );
    let invalid_token_error = (
      <div className="col-12 pl-h pr-h mb-1">
        <div className="tleft">
          <Alert
            message="Error"
            description={<ul><li>This token is invalid.</li></ul>}
            type="error"
          />
        </div>
      </div>
    );
    let success = (
      <div>
        <h3 className="mb-1">All Set</h3>
        <p>Your password was changed.</p>
        <Link href="/auth/login" as="/login"><a>Continue</a></Link>
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
                {
                  this.props.token_is_valid && !this.state.show_success ? 
                    'Enter a new password.' : 
                      null
                }
              </div>
              <div className="col-12 col-lg-8 offset-lg-2 mt-2">
                {
                  this.state.show_success ? success :
                    this.props.token_is_valid ? pass_reset_form : 
                      invalid_token_error
                }
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
}