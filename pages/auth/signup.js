import Api from '../../services/Api';
import CookieManager from '../../services/CookieManager';
import AppLayout from '../../components/AppLayout';
import Link from 'next/link';
import { Button, Input, Alert } from 'antd';
import brandInline from '../../assets/images/brand-inline.png';
import goals_ci    from '../../assets/images/color_icons/goals.svg';
import calendar_ci from '../../assets/images/color_icons/calendar.svg';
import progress_ci from '../../assets/images/color_icons/progress.svg';
import school_check_ci from '../../assets/images/color_icons/school_check.svg';
import { validateEmail,loginErrorMessage } from '../../utils/helpers';
import ReactGA from 'react-ga';

export default class Signup extends React.Component {
  static async getInitialProps({ req }) {
    return {
      page_attrs: {
        title: 'Sign Up - Motivate MD',
        description: 'Sign up for a new Motivate MD account.'
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
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      password_repeat: '',
      errors: [],
      show_check_mail: false,
      loading: false
    }
    ReactGA.pageview('/SignUp');
  }

  changeInput = (key, e) => {
    let new_state = {}
    new_state[key] = e.target.value;
    this.setState(new_state);
  }

  handleSignup = () => {
    if(this.validateForm()){
        const cm = new CookieManager();
        const api = new Api(cm.getIdToken());
        let { firstname, lastname, email, password, password_repeat } = this.state;
        if (password !== password_repeat) {
          this.setState({
            errors: ['Passwords do not match']
          });
          return
        }
        this.setState({ loading: true });
        api.signup(firstname, lastname, email, password)
          .then(resp => {
            this.setState({
              show_check_mail: true,
              loading: false
            })
          })
          .catch(error => {
            this.setState({ loading: false });
            if (error.response && error.response.data && error.response.data.errors)
              this.setState({ errors: error.response.data.errors });
            else
              alert('Oops! Something is wrong and we are working on it.')
          })
     }
  }


  validateForm = () => {
        let errorsArePresent = false;
        let errorMessage = '';
        let { firstname, lastname, email, password } = this.state;

        if(firstname === ''){
          errorsArePresent = true;
          errorMessage="First name can't be blank.";
        } else if(lastname === ''){
          errorsArePresent = true;
          errorMessage="Last name can't be blank.";
        }else if (!validateEmail(email)) {
          errorsArePresent = true;
          errorMessage = "Email is invalid"
        } else if (password === '') {
          errorsArePresent = true;
          errorMessage = "Password can't be blank."
        }

        if (errorsArePresent) {
          this.setState({ errors: [errorMessage]})
        } else {
          return true;
        }
  }

  detectEnterKeyDown = (e) => {
      if(e.key === 'Enter'){
        this.handleSignup();
      }
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
          />
        </div>
      </div>;

    let signup_form = (
      <div>
        <div className="row">
          <div className="col-sm-12 col-md-6 pl-h pr-h mb-1">
            <Input
              id='firstname'
              size='large'
              value={this.state.firstname}
              onChange={(e) => this.changeInput('firstname', e)}
              type="text"
              placeholder="First Name"
              onKeyDown={this.detectEnterKeyDown}
              autoComplete="off" />
          </div>
          <div className="col-sm-12 col-md-6 pl-h pr-h mb-1">
            <Input
              id='lastname'
              size='large'
              value={this.state.lastname}
              onChange={(e) => this.changeInput('lastname', e)}
              type="text"
              placeholder="Last Name"
              onKeyDown={this.detectEnterKeyDown}
              autoComplete="off" />
          </div>
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
          <div className="col-12 pl-h pr-h mb-1">
            <Input
              id='password_repeat'
              size='large'
              value={this.state.password_repeat}
              onChange={(e) => this.changeInput('password_repeat', e)}
              type="password"
              placeholder="Confirm Password"
              onKeyDown={this.detectEnterKeyDown}
              autoComplete="off" />
          </div>
          {errors_if_any}
        </div>
        <Button loading={loading} disabled={loading} onClick={this.handleSignup}>Sign Up</Button>
        <div className="mt-1">
          <Link href="/auth/login" as="/login"><a>Already have an account? Sign In</a></Link>
        </div>
      </div>
    );

    let activation_msg = (
      <div className="mt-2 tleft">
        <h3 className="mb-1">Check Your Email</h3>
        <p>An activation link has been sent to <strong>{this.state.email}</strong>.</p>
        <p>Your account will be activated once you confirm your email address by clicking on the activation link.</p>
        <p>Thanks,<br />Motivate MD Support</p>
      </div>
    );
    
    return (
      <AppLayout {...this.props}>
        <div className="l-auth">
          <div className="l-auth__road">
            <div className="row l-auth__road__list">
              <div className="col-12 col-lg-6 offset-lg-3">
                <ul className="c-signup_road">
                  <li><img className="c-signup_road__icon" src={goals_ci} /> Set Goals</li>
                  <li><img className="c-signup_road__icon" src={calendar_ci} /> Schedule Tasks</li>
                  <li><img className="c-signup_road__icon" src={progress_ci} /> Track Progress</li>
                  <li><img className="c-signup_road__icon" src={school_check_ci} /> Get Accepted</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="l-auth__panel">
            <div className="row mr-0 ml-0">
              <div className="col-12 tcenter">
                <img className="l-auth__brand" src={brandInline} />
                {
                  !this.state.show_check_mail ? 
                    <span>Your ultimate roadmap to med school acceptance in one place.</span> :
                      null
                }
              </div>
              <div className="col-12 col-lg-8 offset-lg-2 mt-2">
                { this.state.show_check_mail ? activation_msg : signup_form }
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
}