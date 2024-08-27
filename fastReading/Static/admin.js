$(document).ready(function () {
  // Handle file input and form submission as before
  

  $("#fileInput1").on("change", function () {
    let file1 = this.files[0];
    if (!file1) {
      $("#NumOfWords").text("");
      $("#info").text("File1 must be selected");
      return;
    }
    if (file1.type !== "text/plain") {
      $("#NumOfWords").text("");
      $("#info").text("File1 must be a .txt file");
      return;
    }
    let reader = new FileReader();
    reader.onload = function (e) {
      let text = e.target.result;
      let wordCount = text.split(/\s+/).filter(function (word) {
        return word.length > 0;
      }).length;
      $("#NumOfWords").text(`Text file contains ${wordCount} words`);
    };
    reader.readAsText(file1);
  });

  $("#uploadForm").on("submit", function (event) {
    event.preventDefault();

    let file1 = $("#fileInput1")[0].files[0];
    let file2 = $("#fileInput2")[0].files[0];
    if (!file1 || !file2) {
      $("#info").text("Both files must be selected");
      return;
    }
    if (file1.type !== "text/plain") {
      $("#info").text("File1 must be a .txt file");
      return;
    }
    if (file2.type !== "application/json") {
      $("#info").text("File2 must be a .json file");
      return;
    }

    let formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);

    let selectedOption = $('input[name="option"]:checked').val();
    formData.append("option", selectedOption);

    $.ajax({
      url: "/upload_files",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        window.location.href = response.redirect;
      },
      error: function (error) {
        if (error.responseJSON && error.responseJSON.error) {
          $("#info").text(error.responseJSON.error);
        } else {
          $("#info").text("An unexpected error occurred. Please try again.");
        }
      },
    });
  });
});
