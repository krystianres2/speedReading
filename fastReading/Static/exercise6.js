$(document).ready(function () {
  // Cache DOM elements for reuse
  const $start = $("#start");
  const $startBtn = $("#startBtn");
  const $doneBtn = $("#doneBtn").hide();
  const $textContent = $("#textContent").hide();
  const $quizContainer = $("#quiz-container").hide();

  let text = "";
  let quizData = {};

  // Function to initialize the application
  function init() {
    loadText();
    setupEventHandlers();
  }

  // Initial function to load text and quiz data
  function loadText() {
    $.getJSON("/get_text_quiz")
      .done((data) => {
        text = data.file_content;
        quizData = JSON.parse(data.quiz_content);
        console.log(text);
        displayStart();
      })
      .fail(() => {
        console.log("Błąd podczas ładowania danych. Spróbuj ponownie.");
      });
  }

  // Display the start button and instruction
  function displayStart() {
    $start.show();
  }

  // Set up event handlers for buttons
  function setupEventHandlers() {
    $startBtn.click(() => {
      $start.hide();
      $doneBtn.show();
      displayProcessedText(text);
    });

    $doneBtn.click(() => {
      startQuiz(quizData);
    });
  }

  // Display the processed text with masked first and last words
  function displayProcessedText(text) {
    $textContent.show().empty();
    const sentences = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/);

    const processedText = sentences
      .map((sentence) => {
        let words = sentence.split(" ");
        if (words.length > 1) {
          words[0] = "****";
          words[words.length - 1] = "****";
        }
        return words.join(" ");
      })
      .join(". ");

    $textContent.append(`<p>${processedText}</p>`);
  }

  // Initialize the quiz display
  function startQuiz(quizData) {
    $textContent.hide();
    $doneBtn.hide();
    renderQuiz(quizData.questions);
  }

  // Render quiz questions and options
  function renderQuiz(questions) {
    $quizContainer.show().empty();

    questions.forEach((question, questionIndex) => {
      let questionDiv = $("<div>").addClass("question").appendTo($quizContainer);
      $("<p>").text(question.question).appendTo(questionDiv);

      question.options.forEach((option) => {
        let optionDiv = $("<div>").addClass("option").appendTo(questionDiv);
        $("<input>")
          .attr({
            type: "radio",
            name: `question-${questionIndex}`,
            value: option,
          })
          .appendTo(optionDiv);
        $("<label>").text(option).appendTo(optionDiv);
      });
    });

    $("<button>")
      .text("Zatwierdź")
      .attr("id", "submitQuizBtn")
      .click(() => {
        const correctAnswers = checkCorrectAnswers(questions);
        showResults(correctAnswers, questions.length);
      })
      .appendTo($quizContainer);
  }

  // Check the correctness of the selected answers
  function checkCorrectAnswers(questions) {
    let correctAnswers = 0;

    questions.forEach((question, questionIndex) => {
      const selectedOption = $(`input[name=question-${questionIndex}]:checked`).val();
      if (selectedOption === question.correct_answer) {
        correctAnswers++;
      }
    });

    return correctAnswers;
  }

  // Display the quiz results
  function showResults(correctAnswers, totalQuestions) {
    $quizContainer.hide();

    const resultText = `Poprawne odpowiedzi: ${correctAnswers}/${totalQuestions}`;
    $("<p>").text(resultText).attr("id", "result").appendTo("body");

    $("<button>")
      .text("Zakończ")
      .attr("id", "finishBtn")
      .click(() => {
        submitResults(correctAnswers, totalQuestions);
      })
      .appendTo("body");
  }

  // Submit quiz results to the server
  function submitResults(correctAnswers, totalQuestions) {
    const percentage = (correctAnswers / totalQuestions) * 100;

    $.ajax({
      url: "/submit_ex6",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ percentage }),
      success(response) {
        console.log(response);
        window.location.href = response.redirect;
      },
      error() {
        console.log("Błąd podczas przesyłania danych. Spróbuj ponownie.");
      },
    });
  }

  // Call the init function to start the application
  init();
});
