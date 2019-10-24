import { Input } from 'antd';
import ReactGA from 'react-ga';

export default class Degrees extends React.Component {
  constructor(props) {
    super(props);
    ReactGA.modalview('/Goals/GPA/Degrees');
  }
  render() {
    return (
      <div>
        {
          this.props.degrees.map((degree, i) => {
            if (i == 0) {
              return (
                <div key={`degree_${i}`} className="row c-form__row">
                  <div className="col-md-3 c-form__label">Degree</div>
                  <div className="col-md-4 c-form__input">
                    <Input value={degree}
                      onChange={(e) => this.props.changeDegree(i, e.target.value)}
                      placeholder="Degree" />
                  </div>
                  <div className="col-md-5 c-form__label c-form__label--left">
                    <a onClick={() => this.props.addToDegrees()}>+ Add Another Degree</a>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={`degree_${i}`} className="row c-form__row">
                  <div className="offset-md-3 col-md-4 c-form__input">
                    <Input value={degree}
                      onChange={(e) => this.props.changeDegree(i, e.target.value)}
                      placeholder="Degree" />
                  </div>
                  <div className="col-md-5 c-form__label c-form__label--left">
                    <a onClick={() => this.props.removeDegree(i)}>- Remove</a>
                  </div>
                </div>
              );
            }
          })

        }
        {
            this.props.degrees.length === 0 ?
                <div className="row c-form__row">
                  <div className="col-md-3 c-form__label">Degree</div>
                  <div className="col-md-4 c-form__input">
                    <Input
                      onChange={(e) => this.props.changeDegree(0, e.target.value)}
                      placeholder="Degree" />
                  </div>
                </div>
            : null
        }

      </div>
    );
  }
}