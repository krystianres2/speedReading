$(document).ready(function () {
  let numbersList = [];
  let elementsList = [];
  let gamePoints = 0;
  let gameStarted = false;
  let intervalId;
  let totalSeconds = 0;

  // Cache DOM elements
  const $startBtn = $("#startBtn");
  const $start = $("#start");
  const $manual = $("#manual");
  const $gridContainer = $("#grid_container");
  const $content = $("#content");
  const $elements = $("#elements");
  const $timer = $("#timer").hide();
  const $summary = $("#summary").hide();
  const $summaryText = $("#summaryText").hide();
  const $summaryBtn = $("#summaryBtn").hide();

  function setupLists() {
    // Initialize numbersList with numbers from 1 to 25
    numbersList = Array.from({ length: 25 }, (_, i) => i + 1);

    // Shuffle the numbersList using Fisher-Yates algorithm
    for (let i = numbersList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbersList[i], numbersList[j]] = [numbersList[j], numbersList[i]];
    }
    console.log(numbersList);

    // Initalize elementsList
    elementsList = Array.from({ length: 25 }, (_, i) => i + 1);
    elementsList = elementsList.map((num) => num.toString());
    console.log(elementsList);
  }

  // Set up event handlers for the game
  function setupEventHandlers() {
    $startBtn.click(() => {
      startGame();
    });

    $summaryBtn.click(() => {
      submitResults();
    });
  }

  function displayGrid() {
    let $grid = $("<div>").addClass("grid");

    for (let i = 0; i < 5; i++) {
      let $row = $("<div>").addClass("row");
      for (let j = 0; j < 5; j++) {
        let $cell = $("<div>")
          .addClass("cell")
          .text(numbersList[i * 5 + j])
          .css("user-select", "none")
          .click(function () {
            checkNumber($(this).text(), elementsList[gamePoints]);
            console.log("Clicked on", $(this).text());
          });
        $row.append($cell);
      }
      $grid.append($row);
    }

    $gridContainer.append($grid);
  }

  function displayStart() {
    displayGrid();
    displayElements();
    setupEventHandlers();
  }

  function displayElements() {
    let $elementsRow = $("<div>").addClass("elements-row");

    elementsList.forEach((element) => {
      let $elementCell = $("<div>")
        .addClass("element-cell")
        .text(element)
        .css("user-select", "none");
      $elementsRow.append($elementCell);
    });

    $elements.empty().append($elementsRow).show();
    addColorByIndex(0);
  }

  // Highlight the current element by index
  function addColorByIndex(index, color = "lightgrey") {
    $(".element-cell").eq(index).css({
      color: color,
      "font-weight": "bold",
      "font-size": "1.2em",
    });
  }

  // Remove highlight from the previous element by index
  function removeColorByIndex(index) {
    $(".element-cell").eq(index).css({
      color: "",
      "font-weight": "",
      "font-size": "",
    });
  }
  function startGame() {
    gameStarted = true;
    startTimer();
    $start.hide();
    $manual.hide();
    $startBtn.hide();
    $timer.show();
  }

  function checkNumber(selectedNumber, targetNumber) {
    if (gameStarted === false) {
      return;
    }
    console.log("Target: " + targetNumber + " Selected: " + selectedNumber);
    console.log(selectedNumber === targetNumber);
    if (selectedNumber === targetNumber) {
      gamePoints++;
      addColorByIndex(gamePoints, "lightgrey");
      removeColorByIndex(gamePoints - 1);
    }
    if (gamePoints === 25) {
      stopTimer();
      showSummary();
    }
  }

  // Display the summary screen with the result
  function showSummary() {
    $elements.hide();
    $timer.hide();
    $gridContainer.hide();
    $summary.show();
    $summaryText
      .show()
      .text(
        `Zaznaczyłeś ${
          gamePoints == 25 ? "wszystkie liczby." : gamePoints + " liczb."
        }`
      );
    $summaryBtn.show();
  }

  // Start the game timer
  function startTimer() {
    totalSeconds = 0;

    intervalId = setInterval(() => {
      totalSeconds++;

      let seconds = totalSeconds % 60;
      let minutes = Math.floor(totalSeconds / 60);

      $timer.text(
        `${minutes.toString().padStart(2, "0")}-${seconds
          .toString()
          .padStart(2, "0")}`
      );

      if (totalSeconds >= 80) {
        stopTimer();
        showSummary();
      }
    }, 1000);
  }

  // Stop the game timer
  function stopTimer() {
    clearInterval(intervalId);
  }

  // Submit the game result to the server
  function submitResults() {
    $.ajax({
      url: "/submit_ex8",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        gamePoints: gamePoints,
        totalSeconds: totalSeconds,
      }),
      success(response) {
        window.location.href = response.redirect;
      },
      error() {
        console.log("Błąd podczas przesyłania danych.");
      },
    });
  }

  setupLists();

  displayStart();
});
