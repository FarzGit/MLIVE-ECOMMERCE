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



// ===========================================================================Validationform Address ==========================================================


    function validateForm() {
      // Reset error messages
      document.getElementById("fullNameError").innerText = "";
      document.getElementById("countryError").innerText = "";
      document.getElementById("cityError").innerText = "";
      document.getElementById("stateError").innerText = "";
      document.getElementById("pinCodeError").innerText = "";
      document.getElementById("phoneError").innerText = "";
    
      // Get input values
      var fullName = document.getElementById("FullName").value;
      var country = document.getElementById("country").value;
      var city = document.getElementById("city").value;
      var state = document.getElementById("state").value;
      var pinCode = document.getElementById("pinCode").value;
      var phone = document.getElementById("phone").value;
    
      // Validation rules (you can modify these as needed)
      var valid = true;
    
      if (fullName.trim() === "") {
        document.getElementById("fullNameError").innerText = "Full Name is required";
        valid = false;
      }
    
      if (country.trim() === "") {
        document.getElementById("countryError").innerText = "Country is required";
        valid = false;
      }
    
      if (city.trim() === "") {
        document.getElementById("cityError").innerText = "City is required";
        valid = false;
      }
    
      if (state.trim() === "") {
        document.getElementById("stateError").innerText = "State is required";
        valid = false;
      }
    
      if (pinCode.trim() === "") {
        document.getElementById("pinCodeError").innerText = "Pin Code is required";
        valid = false;
      } else if (!/^\d{6}$/.test(pinCode)) {
        document.getElementById("pinCodeError").innerText = "Invalid Pin Code";
        valid = false;
      }
    
      if (phone.trim() === "") {
        document.getElementById("phoneError").innerText = "Mobile is required";
        valid = false;
      } else if (!/^\d{10}$/.test(phone)) {
        document.getElementById("phoneError").innerText = "Invalid Mobile Number (10 digits)";
        valid = false;
      }
    
      return valid;
    }
    
    // Clear error messages when the user interacts with the input fields
    document.getElementById("FullName").oninput = function() {
      document.getElementById("fullNameError").innerText = "";
    };
    
    document.getElementById("country").oninput = function() {
      document.getElementById("countryError").innerText = "";
    };
    
    document.getElementById("city").oninput = function() {
      document.getElementById("cityError").innerText = "";
    };
    
    document.getElementById("state").oninput = function() {
      document.getElementById("stateError").innerText = "";
    };
    
    document.getElementById("pinCode").oninput = function() {
      document.getElementById("pinCodeError").innerText = "";
    };
    
    document.getElementById("phone").oninput = function() {
      document.getElementById("phoneError").innerText = "";
    };
  