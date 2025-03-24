$(document).ready(function () {
  // Cache selectors
  const $bodyElements = $("body *");
  const $textContent = $("#text");
  const $startBtn = $("#start_btn");
  const $time = $("#time");
  const $doneBtn = $("#done_btn").hide();
  const $quizContainer = $("#quiz_container").hide();
  const $textContainer = $("#text_container");
  const $startBtnContainer = $("#start_btn_container");
  const $container = $("#container");
  const $alert = $("#alert");

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
        $startBtnContainer.remove();
        $alert.remove();

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
    $textContent.show();
    $startBtn.show();
    $time.show().text("Czas: 00-00");
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
    $container.remove();
    $quizContainer.show();

    class Question {
      constructor(question, answers, correctAnswer) {
        this.question = question;
        this.answers = answers;
        this.correctAnswer = correctAnswer;
      }
    }

    // Ensure quizData.questions exists and is an array
    if (quizData && Array.isArray(quizData.questions)) {
      let questionsList = quizData.questions.map(
        (q) => new Question(q.question, q.options, q.correct_answer)
      );

      renderQuiz(questionsList);
    } else {
      console.error("Invalid quiz data");
    }
  }

  function renderQuiz(questionsList) {
    console.log("coś");
    // Clear the quiz container and show it
    $quizContainer.show();

    // Create a container for the entire quiz
    let quizContainerDiv = $("<div>")
      .addClass("container mb-5 mt-4 p-4 bg-white")
      .appendTo($quizContainer);

    // Create a row to hold the questions
    let rowDiv = $("<div>").addClass("row").appendTo(quizContainerDiv);

    // Loop through each question and create the structure
    questionsList.forEach((questionObj, questionIndex) => {
      // Create a column for each question
      let colDiv = $("<div>").addClass("col-12 col-md-6 mb-4").appendTo(rowDiv); // Changed to col-md-6 for even split on larger screens

      // Display the question text
      $("<p>")
        .addClass("fw-bold fs-5")
        .text(questionIndex + 1 + ". " + questionObj.question)
        .appendTo(colDiv);

      // Create a div to hold the answer options
      let answerDiv = $("<div>").appendTo(colDiv);

      // Loop through the answers and create radio buttons and labels
      questionObj.answers.forEach((answer, answerIndex) => {
        // Create the radio input element
        let inputId = "one" + (questionIndex + 1);
        if (answerIndex > 0) {
          inputId =
            ["two", "three", "four"][answerIndex - 1] + (questionIndex + 1);
        }
        $("<input>")
          .attr("type", "radio")
          .attr("name", "group" + (questionIndex + 1))
          .attr("id", inputId)
          .attr("value", answer)
          .prop("checked", answerIndex === 0) // Set first option as checked by default
          .appendTo(answerDiv);

        // Create the label for the radio input
        let labelDiv = $("<label>")
          .addClass("box " + ["first", "second", "third", "forth"][answerIndex]) // Add class for styling
          .attr("for", inputId)
          .appendTo(answerDiv);

        // Create the inner div for label content (circle and text)
        let courseDiv = $("<div>").addClass("course").appendTo(labelDiv);
        $("<span>").addClass("circle").appendTo(courseDiv); // Circle element
        $("<span>").addClass("subject").text(answer).appendTo(courseDiv); // Answer text
      });
    });

    // Add a submit button at the end of the quiz
    let buttonRow = $("<div>").addClass("col-12 mb-3").appendTo(rowDiv);
    let buttonWrapper = $("<div>")
      .addClass("d-flex justify-content-center")
      .appendTo(buttonRow);
    $("<button>")
      .addClass("btn btn-primary btn-lg px-4 py-2 fw-bold")
      .text("Zatwierdź")
      .appendTo(buttonWrapper)
      .click(function () {
        let correctAnswers = checkCorrectAnswers(questionsList);
        displayQuizResults(correctAnswers, questionsList.length);
        console.log("Correct answers:", correctAnswers);
      });
  }

  function displayQuizResults(correctAnswers, totalQuestions) {
    // Remove the quiz container
    $quizContainer.remove();

    // Create the result card container
    let resultContainer = $("<div>").addClass(
      "container d-flex align-items-center justify-content-center vh-100"
    );

    // Create the card element
    let card = $("<div>")
      .addClass("card text-center p-4")
      .css("width", "22rem")
      .appendTo(resultContainer);

    // Add the image to the card
    if (correctAnswers >= 3) {
      $("<img>")
        .attr("src", happyFaceUrl)
        .attr("alt", "")
        .addClass("card-img-top mx-auto mt-3")
        .appendTo(card);
    } else {
      $("<img>")
        .attr("src", sadFaceUrl)
        .attr("alt", "")
        .addClass("card-img-top mx-auto mt-3")
        .appendTo(card);
    }
    // Create the card body
    let cardBody = $("<div>").addClass("card-body pt-4").appendTo(card);

    // Add the card title
    $("<h4>").addClass("card-title").text("Podsumowanie").appendTo(cardBody);

    // Add the correct answers text
    $("<p>")
      .addClass("card-text fs-5 mb-3")
      .html(
        `Udało ci się odpowiedzieć poprawnie na: <strong>${correctAnswers} z ${totalQuestions} pytań</strong>`
      )
      .appendTo(cardBody);

    // Add the exit button
    $("<a>")
      .attr("href", "#")
      .addClass("btn btn-primary btn-lg px-4")
      .text("Wyjdź")
      .appendTo(cardBody)
      .click(function () {
        submitQuiz(correctAnswers, totalQuestions);
      });

    // Append the result container to the body
    $("body").append(resultContainer);
  }
  
  function checkCorrectAnswers(questionsList) {
    let correctAnswersCount = 0;

    questionsList.forEach((question, questionIndex) => {
      // Get the selected answer for the current question
      let selectedAnswer = $(
        `input[name='group${questionIndex + 1}']:checked`
      ).val();

      // Compare the selected answer with the correct answer
      if (selectedAnswer === question.correctAnswer) {
        correctAnswersCount++;
      }
    });

    return correctAnswersCount;
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
      $time.text(`Czas: ${minutes}-${seconds}`);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(intervalId2);
  }
});
