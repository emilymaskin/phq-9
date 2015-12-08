(function() {
  'use strict';

  var Questionnaire = React.createClass({

    getInitialState: function() {
      return {
        score: 0,
        message: '',
        error: false,
        showQuestions: true
      }
    },

    componentDidUpdate: function() {
      ReactDOM.render(
        <Message text={this.state.message} className={this.state.error ? 'error' : ''} />,
        document.querySelector('.messaging')
      );
    },

    calculateScore: function(answers) {
      var score = this.state.score;
      for (var i=0; i<answers.length; i++) {
        score += parseInt(answers[i].value);
      }
      return score;
    },

    buildResultsMessage: function(score) {
      var message = 'You scored ';
      if (score <= 4) {
        message += score + ' (no depression).';
      } else if (score <= 9) {
        message += score + ' (mild depression).';
      } else if (score <= 14) {
        message += score + ' (moderate depression).';
      } else if (score <= 19) {
        message += score + ' (moderately severe depression).';
      } else {
        message += score + ' (severe depression).';
      }
      return message;
    },

    showDoctors: function() {
      var _this = this;

      $.getJSON('js/doctors.json', function(data) {
        var doctors = data["doctors"];
        var message = _this.state.message + " Please choose a doctor to get in touch with:";

        _this.setState({message: message});

        ReactDOM.render(
          <div>
            {doctors.map(function(d, i) {
              return <Doctor key={i} name={d.name} onclick={_this.submitDoctor} />;
            })}
          </div>, document.querySelector('.doctors')
        );
      });
    },

    showConfirmation: function(name) {
      var message = "Thank you. " + name + " will be in touch with you soon!";

      this.setState({message: message});

      ReactDOM.unmountComponentAtNode(document.querySelector('.doctors'));
    },

    submitDoctor: function(e) {
      var doctorName = $(e.target).text();

      // here we would submit the doctor and patient info to the back end

      this.showConfirmation(doctorName);
    },

    processForm: function(e) {
      e.preventDefault();

      var answers = $(e.target).serializeArray();
      var score;
      var message;

      if (answers.length < $(e.target).find('.choices').length) {
        this.setState({message: 'Please answer all the questions.', error: true});
      } else {
        score = this.calculateScore(answers);
        message = this.buildResultsMessage(score);
        this.setState({score: score, message: message, error: false, showQuestions: false}, function() {
           if (this.state.score >= 10) {
             this.showDoctors();
           }
        })
      }
    },

    render: function() {
      return (
        <div>
        <form className={'questions' + (this.state.showQuestions ? ' show' : '')} onSubmit={this.processForm}>
          Over the last two weeks, how often have you been bothered by any of the following problems?
          {this.props.questions.map(function(q, i){
            return <Question key={i} question={q.text} score={q.score} questionNum={i + 1} />;
          })}
          <input type="submit" className="submit" value="Go" />
        </form>
        <div className="doctors"></div>
        </div>
      );
    }
  });

  var Question = React.createClass({
    render: function() {
      var name = "q" + this.props.questionNum;
      return (
        <div className="question">
          <p>{this.props.questionNum}. {this.props.question}</p>
          <div className="choices">
            <Choice value="0" name={name} text="Not at all" />
            <Choice value="1" name={name} text="Several days" />
            <Choice value="2" name={name} text="More than half the days" />
            <Choice value="3" name={name} text="Nearly every day" />
          </div>
        </div>
      );
    }
  });

  var Choice = React.createClass({
    render: function() {
      var id = this.props.name + this.props.value; //unique ID for each input
      return (
        <div className="choice">
          <input type="radio" id={id} value={this.props.value} name={this.props.name} />
          <label htmlFor={id}>{this.props.text}</label>
        </div>
      );
    }
  });

  var Doctor = React.createClass({
    render: function() {
      return (
        <div className="doctor" onClick={this.props.onclick}>
          {this.props.name}
        </div>
      );
    }
  });

  var Message = React.createClass({
    render: function() {
      return (
        <div className={this.props.className}>{this.props.text}</div>
      );
    }
  });

  $(document).ready(function(){
    $.getJSON('js/questions.json', function(data) {
      var questions = data["questions"];
      ReactDOM.render(
        <Questionnaire questions={questions} />,
        document.querySelector('.page_content')
       );
    });
  });
}());
