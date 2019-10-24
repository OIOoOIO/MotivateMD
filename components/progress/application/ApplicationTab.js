import { Progress } from 'antd';
import ApplicationSection from "./ApplicationSection";
import GoalProgressBar from '../goals/GoalProgressBar';
import ReactGA from 'react-ga';

export default class ApplicationTab extends React.Component {

  constructor(props) {
    super(props);
    //console.log('Application getInitialProps');
    ReactGA.modalview('/Application');
  }
  getCount = () => {
    let overall = {
      total: 0,
      complete: 0
    };
    //let kinds = ['personal_statements', 'recoms', 'courses', 'extracur_essays',  'school_list', 'your_notes'];
    let kinds = ['personal_statements', 'recoms', 'courses', 'extracur_essays'];

    for (var i = 0; i < kinds.length; i++) {
      let kind = kinds[i];
      if (this.props[kind]) {
        overall.total += this.props[kind].length;
        if(this.props[kind] !== 'your_notes' || this.props[kind] !== 'schools'){
            overall.complete += this.props[kind].filter(e => e.complete).length
        }
      }
    }
    return overall;
  }
  render() {
    let { personal_statements, recoms, courses, extracur_essays, school_list, your_notes, universities } = this.props;

    let { total, complete } = this.getCount();
    return (
      <div>
        {/*<div className="coming-soon-title">
            <h1 className="coming-soon-bold"> Coming soon </h1>
        </div>*/}
        <div className="c-progress c-progress--goal">
          <div className="row mr-0 ml-0" style={{alignItems: 'center'}}>
            <div className="col-2 tright c-progress__title progress-title">Overall</div>
            <div className="col-7 progress-bar">
              <GoalProgressBar
                is_large={true}
                left_text={`${total - complete} Steps Left`}
                done_text={`Completed ${complete} Steps`}
                total={total}
                completed={complete}
                color="#064277" />
            </div>
            <div className="col-2 c-progress__title">
              {total} Steps
            </div>
          </div>
        </div>


        <ApplicationSection 
          title="Required Courses"
          kind="course"
          more_text={["Required courses will vary from school to school, however, most schools require the following courses: <ul><li>One year of Biology with lab</li><li>One year of General Chemistry with lab</li><li>One year of Organic Chemistry with lab</li><li>One semester of Biochemistry</li><li>One year of Physics with lab</li><li>One year of English</li></ul><br/>Medical schools will list their required courses on their website.  If you have a list of “Top Schools”, it would be worth your time to visit each school’s website and log which courses you have already completed or are enrolled, and those you still need to schedule/complete.  Use this map: (<a href='https://www.motivatemd.com/medical-school-map/'  target='_blank'>https://www.motivatemd.com/medical-school-map/</a>) of all MD and DO schools in the U.S. to find each school’s website."]}
          items={courses}
          updateItems={this.props.updateCourses} />
         <ApplicationSection
          title="Letters of Recommendation"
          kind="recom"
          more_text="The specific type and minimum number of letters of recommendation (also referred to as “Letters of Evaluation”), are different for every medical school you apply to.  That said, there is typically significant overlap between schools.  Most schools require around 3-4 letters, but you should aim at getting 4 letters to be safe.  Here is a list of possible letter authors (those marked with “***” are our minimum recommendations to cover as many school requirements as possible):<ul><li>Science Professor***</li><li>Non-Science Professor***</li><li>Doctor that you shadowed for a significant amount of time.***</li><li>Principal Investigator of the research lab in which you worked.</li><li>Pre-med Advisor</li><li>Volunteer Coordinator</li><li>Employer (This is more pertinent if you have been working for several years after graduating).</li></ul>If you have a list of “Top Schools”, it would be worth your time to visit each school’s website and determine the types of letters.  Use this section to track which types of letters you need, who will write those letters, and communication with your letter authors.  Use this map: (<a href='https://www.motivatemd.com/medical-school-map/' target='_blank'>https://www.motivatemd.com/medical-school-map/</a>) of all MD and DO schools in the U.S. to find each school’s website."
          items={recoms}
          updateItems={this.props.updateRecoms} />
        <ApplicationSection
          title="Personal Statement"
          kind="personal_statement"
          more_text="This important essay is critical for being memorable to admissions committee members.  The prompt that AMCAS provides is simply “Use the space provided to explain why you want to go to medical school.”  This is obviously very broad, but this essay really should answer these 2 questions:<ul><li>Why do you want to be a doctor?</li><li>Why are you going to be an amazing doctor?</li></ul>This essay has a 5,300-character limit which equals about 1.5 pages, single-spaced and in 12-point-font.  Effective personal statements stay focused and have no forcible digressions or irrelevant material.  Writing a memorable essay takes time and multiple revisions from experienced editors, so we recommend that you start the brainstorming and outlining process as early as possible."
          items={personal_statements}
          updateItems={this.props.updatePersonalStatements} />
        <ApplicationSection 
          title="Work & Activities Essays"
          kind="extracur_essay"
          more_text="A maximum of 15 essays (from a max of 15 experiences) can be added to your application.  Of your chosen experiences, you will then choose three experiences that you deem the “Most Meaningful” to elaborate on.  As far as essay length, you will have 700 characters to summarize each experience with an additional 1,325 characters (2,325 total) to explain why your “Most Meaningful Experiences” were particularly meaningful to you.  Again, these essays are another opportunity to make a lasting impressions and their importance should not be overlooked."
          items={extracur_essays}
          updateItems={this.props.updateExtracurEssays} />
        <ApplicationSection
          title="Top Schools"
          kind="school_list"
          more_text="Creating your school list can take a lot of time and energy.  You want to hit the sweet spot of applying to just enough schools to get accepted while not wasting too much money on applying to schools you don’t even want to attend.  There are many factors you should consider when choosing a school like: geography, class size, in-state vs. out-of-state, public vs. private, overall competitiveness (average gpa, MCAT, etc.), tuition, MD vs. DO, etc.  Luckily for you, we at Motivate MD have created a Medical School Map (<a href='https://www.motivatemd.com/medical-school-map/' target='_blank'> https://www.motivatemd.com/medical-school-map/</a>) that is free for you to use! Use this map of all MD and DO schools in the US to find all the details you need to help create your Top Schools list."
          items={school_list}
          universities={universities}
          updateItems={this.props.updateSchoolList} />
        <ApplicationSection
          title="My Application Notes"
          kind="your_notes"
          more_text=""
          items={your_notes}
          updateItems={this.props.updateYourNotes} />

      </div>
    );
  }
}