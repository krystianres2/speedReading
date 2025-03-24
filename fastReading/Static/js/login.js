$(document).ready(function () {
  $(".toggle-password").on("click", function () {
    const passwordField = $("#password");
    const togglePasswordIcon = $("#togglePasswordIcon");
    if (passwordField.attr("type") === "password") {
      passwordField.attr("type", "text");
      togglePasswordIcon.removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      passwordField.attr("type", "password");
      togglePasswordIcon.removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });
});
