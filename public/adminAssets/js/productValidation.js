$(document).ready(function () {
  $("#productForm").submit(function (event) {
    // Clear previous error messages
    $(".error").text("");

    // Validate Product Name
    if ($("#productName").val().trim() === "") {
      $("#productName + .error").text("Product Name is required");
      event.preventDefault();
    }

    // Validate Price
    var price = parseFloat($("#price").val());
    if (isNaN(price) || price <= 0) {
      $("#price + .error").text("Price must be a positive number");
      event.preventDefault();
    }

    // Validate Brand
    if ($("#brand").val().trim() === "") {
      $("#brand + .error").text("Brand is required");
      event.preventDefault();
    }

    // Validate Category
    if ($("#category").val() === "Select Category") {
      $("#category + .error").text("Please select a category");
      event.preventDefault();
    }

    // Validate Status
    if ($("#status").val().trim() === "") {
      $("#status + .error").text("Status is required");
      event.preventDefault();
    }

    // Validate Quantity
    var quantity = parseInt($("#quantity").val());
    if (isNaN(quantity) || quantity <= 0) {
      $("#quantity + .error").text("Quantity must be a positive integer");
      event.preventDefault();
    }

    // Validate Description
    if ($("#description").val().trim() === "") {
      $("#description + .error").text("Description is required");
      event.preventDefault();
    }

    // Validate Image
    var inputFile = $("#formFile");
    if (inputFile.get(0).files.length === 0) {
      $("#formFile + .error").text("Please upload at least one image");
      event.preventDefault();
    }
  });
});
