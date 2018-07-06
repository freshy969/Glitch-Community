import React from 'react';
import PropTypes from 'prop-types';
import PopoverContainer from './popover-container.jsx';


// TODO
// styles
// needs api
// has to handle team name taken error case

class CreateTeamPop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // teamName: '',
      teamUrl: 'my-cool-team',
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // componentDidMount(){
  //  this.nameInput.focus(); 
  // }

  handleChange(event) {
    this.setState({teamUrl: event.target.value.toUpperCase()});
  }

  handleSubmit(event) {
    alert('A team name and url was submitted: ' + this.state.teamUrl);
    event.preventDefault();
  }


  render() {
    return (
      <dialog className="pop-over create-team-pop">
        <section className="pop-over-info">
          <div className="pop-title">
            Create Team
          </div>
        </section>
        <section className="pop-over-actions">
          
        <form onSubmit={this.handleSubmit}>
          <input className="pop-over-input team-name-input" onChange={this.handleChange} type="text" autoFocus placeholder="My Cool Team"/>
          <p className="action-description">
            /{this.state.teamUrl}
          </p>          
          <input type="submit" value="Create Team" className="button-small has-emoji" />
        </form>



        </section>
        <section className="pop-over-info">
          <p className="info-description">
            You can change this later
          </p>
        </section>      
      </dialog>
    )
  }
}


// CreateTeamPop.propTypes = {
//   api: PropTypes.func.isRequired,
// };

export default CreateTeamPop;