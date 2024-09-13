$(document).ready(function () {
  // Cache selectors
  const $bodyElements = $("body *");
  const $exerciseDescription = $("#manual");
  const $textContent = $("#text");
  const $startBtn = $("#start_btn");
  const $time = $("#time");
  const $doneBtn = $("#done_btn");
  const $quizContainer = $("#quiz");

  $bodyElements.hide();

  let text;
  let intervalId;
  let intervalId2;
  let speed = 500;

  async function getText() {
    $.getJSON("/text-quiz/short", async function (data) {
      text = data.text.split(/\s+/);
      const quizData = JSON.parse(data.quiz);
      const averageWpm = await getAverageWpm();
      speed = (2 / averageWpm) * 60 * 1000;
      console.log(speed);
      displayStart(text);
      $startBtn.click(function () {
        $exerciseDescription.hide();
        $startBtn.hide();
        uncoverText(quizData);
      });
    });
  }
  getText();

  function getAverageWpm() {
    return $.getJSON("/user/average-wpm").then((data) => {
      console.log(data);
      return data.average_wpm;
    });
  }

  function displayStart(text) {
    $exerciseDescription.show();
    $textContent.show();
    $startBtn.show();
    $time.show().text("00-00");
    $textContent.html(
      text.map((word) => `<span class="cover">${word}</span>`).join(" ")
    );
  }

  function uncoverText(quizData) {
    let wordElements = $textContent.find(".cover");
    let index = 0;
    startTimer();
    intervalId = setInterval(() => {
      if (index < wordElements.length) {
        $(wordElements[index]).removeClass("cover");
        if (index + 1 < wordElements.length) {
          $(wordElements[index + 1]).removeClass("cover");
        }
        index += 2;
      } else {
        clearInterval(intervalId);
        finishReading(quizData);
      }
    }, speed);
  }

  function finishReading(quizData) {
    stopTimer();
    $doneBtn.show().click(function () {
      quiz(quizData);
    });
  }

  function quiz(quizData) {
    $bodyElements.hide();
    $doneBtn.hide();

    class Question {
      constructor(question, options, correct_answer) {
        this.question = question;
        this.options = options;
        this.correct_answer = correct_answer;
      }
    }
    let questionsList = quizData.questions.map(
      (q) => new Question(q.question, q.options, q.correct_answer)
    );
    renderQuiz(questionsList);
    $("#done-button").click(function () {
      let correctAnswers = checkCorrectAnswers(questionsList);
      $bodyElements.hide();
      $("<p>")
        .text(`Poprawne odpowiedzi: ${correctAnswers}/${questionsList.length}`)
        .attr("id", "result")
        .appendTo("body");
      $("<button>")
        .text("Zakończ")
        .attr("id", "finish-button")
        .appendTo("body");
      $("#finish-button").click(function () {
        submitQuiz(correctAnswers, questionsList.length);
      });
    });
  }

  function renderQuiz(questionsList) {
    $quizContainer.show().empty();
    questionsList.forEach((question, questionIndex) => {
      let questionDiv = $("<div>")
        .addClass("question")
        .appendTo($quizContainer);
      $("<p id='question'>").text(question.question).appendTo(questionDiv);
      question.options.forEach((option, index) => {
        let optionDiv = $("<div>").addClass("option").appendTo(questionDiv);
        $("<input>")
          .attr("type", "radio")
          .attr("name", questionIndex)
          .attr("value", option)
          .prop("checked", true)
          .appendTo(optionDiv);
        $("<label>").text(option).appendTo(optionDiv);
      });
    });
    $("<button>")
      .text("Zatwierdź")
      .attr("id", "done-button")
      .appendTo($quizContainer);
  }

  function checkCorrectAnswers(questionsList) {
    let correctAnswers = 0;
    questionsList.forEach((question, questionIndex) => {
      let selectedOption = $(`input[name=${questionIndex}]:checked`).val();
      if (selectedOption == question.correct_answer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  }

  function submitQuiz(correctAnswers, length) {
    let percentage = (correctAnswers / length) * 100;
    $.ajax({
      url: "/exercise2-submission",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ percentage: percentage }),
      success: function (response) {
        console.log(response);
        window.location.href = response.redirect;
      },
    });
  }

  function startTimer() {
    let totalSeconds = 0;
    intervalId2 = setInterval(function () {
      totalSeconds++;
      let minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
      let seconds = (totalSeconds % 60).toString().padStart(2, "0");
      $time.text(`${minutes}-${seconds}`);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(intervalId2);
  }
});
