(function() {
  'use strict';

  var Questionnaire = React.createClass({
    score: 0,
    message: 'You scored ',
    calculateScore: function() {
      for (var i=0; i<this.answers.length; i++) {
        this.score += parseInt(this.answers[i].value)
      }
    },
    buildResultsMessage: function() {
      if (this.score <= 4) {
        this.message += this.score + ' (no depression).';
      } else if (this.score <= 9) {
        this.message += this.score + ' (mild depression).';
      } else if (this.score <= 14) {
        this.message += this.score + ' (moderate depression).';
      } else if (this.score <= 19) {
        this.message += this.score + ' (moderately severe depression).';
      } else {
        this.message += this.score + ' (severe depression).';
      }
    },
    showDoctors: function() {
      this.message = this.message + " Please choose a doctor to get in touch with:"
      this.showMessage();

      $(document).ready(function(){
        $.getJSON('js/doctors.json', function(data) {
          var doctors = data["doctors"];

          ReactDOM.render(
            <div className="doctors">
              {doctors.map(function(d, i) {
                return <Doctor key={i} name={d.name} />;
              })}
            </div>, document.querySelector('.page_content')
          );
        });
      });
    },
    showMessage: function(className) {
      ReactDOM.render(
        <Message text={this.message} className={className} />,
        document.querySelector('.messaging')
      )
      $('html, body').animate({ scrollTop: 0 }, 500);
    },
    processForm: function(e) {
      e.preventDefault();
      this.answers = $(e.target).serializeArray();

      if (this.answers.length < $(e.target).find('.choices').length) {
        this.message = "Please answer all the questions."
        this.showMessage("error")
      } else {
        this.calculateScore();
        this.buildResultsMessage();
        if (this.score > 10) {
          this.showDoctors();
        } else {
          this.showMessage();
          ReactDOM.unmountComponentAtNode(document.querySelector('.page_content'));
        }
      }
    },
    render: function() {
      return (
        <form className='questions' onSubmit={this.processForm}>
          {this.props.questions.map(function(q, i){
            return <Question key={i} question={q.text} score={q.score} questionNum={i + 1} />;
          })}
          <input type="submit" className="submit" value="Go" />
        </form>
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
    showConfirmation: function(name) {
      var message = "Thank you. " + name + " will be in touch with you soon!";
      ReactDOM.render(
        <Message text={message} />, document.querySelector('.messaging')
      );
      ReactDOM.unmountComponentAtNode(document.querySelector('.page_content'));
    },
    submitDoctor: function(e) {
      var doctorName = $(e.target).text();

      // here we would submit the doctor and patient info to the back end

      this.showConfirmation(doctorName);
    },
    render: function() {
      return (
        <div className="doctor" onClick={this.submitDoctor}>
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
        <div>Over the last two weeks, how often have you been bothered by any of the following problems?
        <Questionnaire questions={questions} /></div>,
        document.querySelector('.page_content')
       );
    });
  });
}());
