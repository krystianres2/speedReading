$(document).ready(function () {
  let pairs = [];
  let gameState = 0;
  let gamePoints = 0;
  let intervalId;

  // Cache DOM elements
  const $startBtn = $("#start_btn");
  const $start = $("#start");
  const $manual = $("#manual");
  const $gridContainer = $("#grid_container").hide();
  const $content = $("#content").hide();
  const $elements = $("#elements").hide();
  const $timer = $("#timer").hide();
  const $summary = $("#summary").hide();
  const $summaryText = $("#summary_text").hide();
  const $summaryBtn = $("#summary_btn").hide();

  // Initialization function to set up the game
  function init() {
    loadCharacterPairs();
    setupEventHandlers();
  }

  // Load character pairs from the server
  function loadCharacterPairs() {
    $.getJSON("/character-pairs")
      .done((data) => {
        pairs = JSON.parse(data.character_pairs);
        console.log(pairs);
        displayStart();
      })
      .fail(() => {
        alert("Błąd podczas ładowania danych. Spróbuj ponownie.");
      });
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

  // Display the start screen
  function displayStart() {
    $start.show();
    $manual.show();
    $startBtn.show();
    $gridContainer.show();
    displayGrid();
    $content.show();
  }

  // Start the game
  function startGame() {
    startTimer();
    $start.hide();
    $manual.hide();
    $startBtn.hide();
    $elements.show();
    $timer.show();
    $gridContainer.show();
  }

  // Display the game grid with character pairs
  function displayGrid() {
    let randomPairs = getRandomPairs();
    console.log(randomPairs);
    let randomElements = displayRandomElements(randomPairs);
    let $grid = $("<div>").addClass("grid");

    for (let i = 0; i < 3; i++) {
      let $row = $("<div>").addClass("row");
      for (let j = 0; j < 5; j++) {
        let $cell = $("<div>")
          .addClass("cell")
          .text(randomPairs[i * 5 + j])
          .css("user-select", "none")
          .click(function () {
            checkPair($(this).text(), randomElements[gameState % 3]);
          });
        $row.append($cell);
      }
      $grid.append($row);
    }

    $gridContainer.append($grid);
    addBackgroundColorByIndex(gameState % 3, "lightgrey");
  }

  // Check if the selected pair matches the target
  function checkPair(selectedPair, targetPair) {
    if (selectedPair === targetPair) {
      gameState++;
      gamePoints++;
      addBackgroundColorByIndex(gameState % 3, "lightgrey");
      removeBackgroundColorByIndex((gameState - 1) % 3);
    }

    if (gameState === 3) {
      gameState = 0;
      $elements.empty();
      $gridContainer.empty();
      displayGrid();
    }
  }

  // Display random elements to match in the grid
  function displayRandomElements(randomPairs) {
    let randomElements = [];
    while (randomElements.length < 3) {
      let randomIndex = Math.floor(Math.random() * randomPairs.length);
      let randomElement = randomPairs[randomIndex];
      if (!randomElements.includes(randomElement)) {
        randomElements.push(randomElement);
      }
    }

    let $row = $("<div>").addClass("elements-row");
    randomElements.forEach((element) => {
      let $element = $("<div>")
        .addClass("element")
        .css("user-select", "none")
        .text(element);
      $row.append($element);
    });
    $elements.append($row);
    return randomElements;
  }

  // Highlight the current element by index
  function addBackgroundColorByIndex(index, color) {
    $(".element").eq(index).css("background-color", color);
  }

  // Remove highlight from the previous element by index
  function removeBackgroundColorByIndex(index) {
    $(".element").eq(index).css("background-color", "");
  }

  // Get a list of random pairs for the grid
  function getRandomPairs() {
    return pairs.sort(() => 0.5 - Math.random()).slice(0, 15);
  }

  // Start the game timer
  function startTimer() {
    let totalSeconds = 0;

    intervalId = setInterval(() => {
      totalSeconds++;

      let seconds = totalSeconds % 60;
      let minutes = Math.floor(totalSeconds / 60);

      $timer.text(
        `${minutes.toString().padStart(2, "0")}-${seconds
          .toString()
          .padStart(2, "0")}`
      );

      if (totalSeconds >= 30) {
        stopTimer();
        showSummary();
      }
    }, 1000);
  }

  // Stop the game timer
  function stopTimer() {
    clearInterval(intervalId);
  }

  // Display the summary screen with the result
  function showSummary() {
    $elements.hide();
    $timer.hide();
    $gridContainer.hide();
    $summary.show();
    $summaryText.show().text(`Zaznaczyłeś ${gamePoints} par.`);
    $summaryBtn.show();
  }

  // Submit the game result to the server
  function submitResults() {
    $.ajax({
      url: "/exercise5-submission",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ gamePoints }),
      success(response) {
        window.location.href = response.redirect;
      },
      error() {
        console.log("Błąd podczas przesyłania danych.");
      },
    });
  }

  // Call the init function to start the application
  init();
});
