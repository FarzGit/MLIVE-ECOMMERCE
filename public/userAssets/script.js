document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("Cpassword");
    const passwordMismatchDiv = document.getElementById("password-mismatch");
  
    form.addEventListener("submit", function(event) {
      if (passwordField.value !== confirmPasswordField.value) {
        passwordMismatchDiv.style.display = "block";
        event.preventDefault(); // Prevent form submission
      } else {
        passwordMismatchDiv.style.display = "none";
     }
});
});



// ===========================================================================Validationform Address==========================================================


function validateForm() {
  var fullName = document.getElementById("FullName").value;
  var country = document.getElementById("country").value;
  var city = document.getElementById("city").value;
  var state = document.getElementById("state").value;
  var pincode = document.getElementById("pinCode").value;
  var mobile = document.getElementById("phone").value;

  // Function to display an error message
  function showError(inputElement, errorMessage, errorId) {
      var errorElement = document.getElementById(errorId);
      errorElement.innerHTML = errorMessage;
      errorElement.style.display = "block";
  }

  // Function to hide the error message
  function hideError(errorId) {
      var errorElement = document.getElementById(errorId);
      errorElement.innerHTML = "";
      errorElement.style.display = "none";
  }

  // Validation for Full Name (non-empty)
  if (fullName === "") {
      showError(document.getElementById("FullName"), "Full Name must be filled out", "fullNameError");
      return false;
  } else {
      hideError("fullNameError"); // Hide the error if the field is not empty
  }

  // Validation for Country (non-empty)
  if (country === "") {
      showError(document.getElementById("country"), "Country must be filled out", "countryError");
      return false;
  } else {
      hideError("countryError"); // Hide the error if the field is not empty
  }

  // Validation for City (non-empty)
  if (city === "") {
      showError(document.getElementById("city"), "City must be filled out", "cityError");
      return false;
  } else {
      hideError("cityError"); // Hide the error if the field is not empty
  }

  // Validation for State (non-empty)
  if (state === "") {
      showError(document.getElementById("state"), "State must be filled out", "stateError");
      return false;
  } else {
      hideError("stateError"); // Hide the error if the field is not empty
  }

  // Validation for Pin Code (non-empty, only numbers)
  var pinCodePattern = /^\d+$/;
  if (pincode === "") {
      showError(document.getElementById("pinCode"), "Pin Code must be filled out", "pinCodeError");
      return false;
  } else if (!pinCodePattern.test(pincode)) {
      showError(document.getElementById("pinCode"), "Pin Code should only contain numbers", "pinCodeError");
      return false;
  } else {
      hideError("pinCodeError"); // Hide the error if the field is not empty and valid
  }

  // Validation for Mobile Number (10 digits with the pattern "1111111111")
  var mobilePattern = /^\d{10}$/;
  if (!mobile.match(mobilePattern)) {
      showError(document.getElementById("phone"), "Mobile Number should be 10 digits in the format '1111111111'", "phoneError");
      return false;
  } else {
      hideError("phoneError"); // Hide the error if the field is valid
  }

  return true; // Form is valid
}