import AppLayout from '../../components/AppLayout';
import Api from '../../services/Api';
import CookieManager from '../../services/CookieManager';
import Link from 'next/link';
import { Button, Input, Alert } from 'antd';
import brandInline from '../../assets/images/brand-inline.png';
import ReactGA from 'react-ga';

import { validateEmail,loginErrorMessage } from '../../utils/helpers';

export default class Login extends React.Component {
  static async getInitialProps({ req }) {
    return {
      page_attrs: {
        title: 'Log In - Motivate MD',
        description: 'Log in to your Motivate MD account.'
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
      password: '',
      errors: [],
      loading: false
    }
    ReactGA.modalview('/login');
  }

  changeInput = (key, e) => {
    let new_state = {}
    new_state[key] = e.target.value;
    this.setState(new_state);
  }

  handleLogin = () => {
    let { email, password } = this.state;
    if(this.validateForm()){
         this.setState({ loading: true });
         const cm = new CookieManager();
         //const api = new Api(cm.getIdToken())
         const api = new Api()
         api.login(email, password)
          .then(resp => {
        	  window.location.href = "/";
        	  //console.log("login_wp =========================>",resp);
          })
          .catch(error => {
            this.setState({ loading: false });
            if (error.response && error.response.data && error.response.data.errors){
              this.setState({ errors: error.response.data.errors})
            }else
              alert('Oops! Something is wrong and we are working on it.');
          })
    }
  }


  validateForm = () => {
      let errorsArePresent = false;
      let { email, password } = this.state;
      if (!validateEmail(email)) {
        errorsArePresent = true;
      }

      if (password === '') {
        errorsArePresent = true;
      }

      if (errorsArePresent) {
        this.setState({ errors: [loginErrorMessage]})
      } else {
        return true;
      }
  }

  detectEnterKeyDown = (e) => {
    if(e.key === 'Enter'){
      this.handleLogin();
    }
  }

  spliceString = ( ori_string,idx,rem,str ) => {
      return ori_string.slice(0, idx) + str + ori_string.slice(idx + Math.abs(rem));
  };

  render() {
    let { loading, errors } = this.state;
    let a_tag_index = errors.indexOf("<a");
    a_tag_index >= 0 ? errors = this.spliceString(errors,(a_tag_index+2),0,' target="_blank" ') : null;
    let errors_if_any = this.state.errors.length == 0 ? null :
      <div className="col-12 pl-h pr-h mb-1">
        <div className="tleft">
         <Alert
            description={<ul><div className="login-error" dangerouslySetInnerHTML={{__html: errors}}></div></ul>}
            type="error"
          />
        </div>
      </div>;
    let login_form = (
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
              onKeyDown={this.detectEnterKeyDown}
              autoComplete="off" />
          </div>
          <div className="col-12 pl-h pr-h mb-1">
            <Input
              id='password'
              size='large'
              value={this.state.password}
              onChange={(e) => this.changeInput('password', e)}
              type="password"
              placeholder="Password"
              onKeyDown={this.detectEnterKeyDown}
              autoComplete="off" />
          </div>
          { errors_if_any }
        </div>
        <Button loading={loading} disabled={loading} onClick={this.handleLogin}>Log In</Button>
        <div className="mt-2">
          <Link href="https://www.motivatemd.com/the-premed-app/"><a>Don't have an account? Sign Up</a></Link>
        </div>
        <div className="mt-h">
          <Link href="https://www.motivatemd.com/app-log-in/?action=forgot_password"><a>Forgot Password</a></Link>
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
                <span>Welcome back! Please login to your account.</span>
              </div>
              <div className="col-12 col-lg-8 offset-lg-2 mt-2">
                {login_form}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
}