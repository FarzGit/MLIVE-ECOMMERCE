// ADD PRODUCT PAGE LOADING FUNCTION CALL ON fetch.js
async function addProductPageLoad(){

    try {

        // MAIN DIV FOR PAGE VIEW SIDE
        const contentPlaceholder = document.getElementById("dynamic_page");

        // FETCH TO SEND A API REQUEST FOR ADD PRODUCT PAGE
        const response = await fetch("/admin/addproduct");

            if(response.status == 401){
                window.location.href = '/admin'
                return;
            }

            // RESPONSE CHECK
            if(!response.ok){

                window.location.href = '/admin/error500';
                return;
            }

        // RESPONSE CONVERTED TO TEXT
        const html = await response.text();
        contentPlaceholder.innerHTML = html;

        document.querySelector('title').innerHTML = 'Add Products'
    } catch (error) {
        console.log(error.message)
    }

    // ADD PRODUCT FORM CATEGORY SELECTION DIV
    selectingCategoryInAddProduct();

    // ADD PRODUCT FORM IMAGE ADD AND SUBMIT DATA FUNCTION CALLING INSIDE THIS FUNCTION
    addProductImageAndSubmitData();

}


// SELECTING CATEGORY IN ADD PRODUCT FORM
function selectingCategoryInAddProduct(){

    // DROP DOWN DISPLAY FOR SELECT A CATEGORY
    document.getElementById('select-box').addEventListener('click',function(){
        const optionsContainer = document.getElementById('options-container');

        if (optionsContainer.style.display == 'block') {
            optionsContainer.style.display = 'none';
        } else {
            optionsContainer.style.display = 'block';
        }
    })


    const optionInputs = document.querySelectorAll('.option-input');
    const selectedOptions = document.querySelector('.selected-options');
    const categoryHidden = document.getElementById('categoryHidden');

    // SELECTING THE INPUT FIELD
    optionInputs.forEach((input) => {
        input.addEventListener('change', function () {
            const selected = Array.from(optionInputs)
                .filter((input) => input.checked)
                .map((input) => {
                    return input.value
                });
            selectedOptions.textContent = selected.length > 0 ? selected.join(', ') : 'Select options';

            const selectedId = Array.from(optionInputs)
            .filter((input) => input.checked)
            .map((input) => {
                return input.getAttribute('data-category-id')
            });
            categoryHidden.value = selectedId;
        });
    });
}


// FORM PROUCT IMAGE CROPPING AND SETTING FUNCTION CALL INSIDE THE FUNCTION AND INCLUDE THE FORM SUBMIT FUNTIONALITY
function addProductImageAndSubmitData(){
    
    // IMAGE VIEW IMAGE FIELD CHANGE TIME
    const imageFile = [];
    document.getElementById('productImage').addEventListener('change',(event)=>{

        const fileInput = event.target; 
        // UPDATING THE INPUT FILED CALL THIS FUNCTION AND UPDATING THE IMAGES IN ARRAY AND UPDATING THE VIEW
        productImagePreview(fileInput,imageFile)
          
    });


    // REMOVE IMAGES FROM THE CLOSE BUTTON 
    document.getElementById('image-preview-main-div').addEventListener('click',(event) =>{
        event.preventDefault();

        
        // VIEW IMAGE REMOVE
        if(event.target.classList.contains("remove")){

            // CALL THE FUNCTION REMOVING THAT IMAGE
            removePreviewImage(event.target,imageFile);

        }else if(event.target.classList.contains("cropperBtn")){

            // CROP BUTTON TO VIEW MODAL
            cropperWindowView(event.target, imageFile);
            
            addProductImageCropClose();

            imageCropResult(imageFile);
        }
    })



    // ***** PRODUCT SUBMIT FUNCTIONALITY CALLING SECTION *********

    // SELECTING THE BRAND ID FROM THE BRANDED SELECT OPTION TAG  
    let brandId;
    document.getElementById('productbrandname').addEventListener('change',()=>{
        const selectedElement = productbrandname.options[productbrandname.selectedIndex]; 
        brandId = selectedElement.getAttribute('data-brand-id');
    })


    // SUBMIT THE ADD PRODUCT FORM DATA
    document.getElementById('addProduct-form').addEventListener('submit',async(event) => {
        event.preventDefault();
        
        // IMAGES FILE TO CALL THE VALIDATE FUNCTION
        const validate = validateProductData(imageFile);
        if(validate)
            submitNewProductData(imageFile,brandId);
    })
}




// FUNCTON FOR ADD VIEW IMAGE IN THAT DIV WHEN CHANGING THE INPUT FIELD
function productImagePreview(fileInput,imageFile){

    // IMAGE VALLIDATION STATEMENT PRINTING TAG
    const validateImage = document.getElementById('validate-addProduct');

    // IMAGE VIEW DIV 
    const imagePreview = document.getElementById('product-image-preview');


    // CHECKING THE IMAGE LIMIT CONDITON
    if(imageFile.length < 5 && fileInput.files.length <= 4){

        // IMAGE FILE NAME ARRAY STORE THE FILE DATA 
        for(let i = 0; i < fileInput.files.length;i++){
            
            let index;
            if(imageFile.length == 0){
                index = 0;
            }else{
                index = imageFile.length
            }

            // IMAGE FILE PUSH INTO AN ARRAY
            imageFile.push(fileInput.files[i]);

            if(imageFile.length > 4){

                validateImage.innerHTML = 'Image Upload Limit Exceeded ! Only Upload 4 Images . You Can Removed Then Add.'

                setTimeout(() => {
                    validateImage.innerHTML = '';
                }, 2000);

                imageFile.pop();
                return;
            }

            

            // DYNAMICALLY CREATE THE IMAGE TAG
            const img = document.createElement('img');
            img.src = URL.createObjectURL(fileInput.files[i]);
            img.classList.add("addProductImage");
            img.name = index
            img.width = 100;

            // DYNAMICALLY CREATE A DELETE BUTTON
            const btn = document.createElement('button');
            btn.id = index;
            btn.classList.add("remove");
            btn.innerHTML = `<i class="bi bi-x remove" id='${index}'></i>`;

            // DYNAMICALLY CREATE CROP BUTTON
            const cropperBtn = document.createElement('button');
            cropperBtn.id = `cropperBtn${index}`;
            cropperBtn.classList.add("cropperBtn-product");
            cropperBtn.innerHTML = `<i class="mdi mdi-crop cropperBtn" id="cropperBtn${index}" name='${index}'></i>`;

            // BUTTON VIEW CREATE DIV
            const BtnDiv = document.createElement('div');
            BtnDiv.classList.add("imagePreview-BtnDiv");
            BtnDiv.id = `btnDiv${index}`,

            // APPEND ON DIV ABOVE CREATED ALL TAGS
            imagePreview.appendChild(img);
            imagePreview.appendChild(BtnDiv)
            BtnDiv.appendChild(btn);
            BtnDiv.appendChild(cropperBtn);
        }

    }else{

        validateImage.innerHTML = 'Image Upload Limit Exceeded ! Only Upload 4 Images . You Can Removed Then Add.'

        setTimeout(() => {
            validateImage.innerHTML = '';
        }, 2000);
    }
}





// REMOVE FIEL FROM THE DIV AND AT THAT TIME REMOVE IMAGE FROM THAT ARRAY
function removePreviewImage(button,imageFile){


    // INDEX VALUE RETRIEVE THE EVENT EMITING BUTTON
    const id = button.getAttribute('id');

    //* Image and Button id Taken For Removing *
    const imagePreview = document.getElementById('product-image-preview');
    const imageRemove = document.querySelector(`img[name="${id}"]`);
    const btnDiv = document.querySelector(`div[id="btnDiv${id}"]`);
    const images = document.querySelectorAll('img[class="addProductImage"]');
    

   
    // REMOVE THAT INDEX IMAGE FROM ARRAY
    imageFile.splice(id,1);

    // REMOVE IMAGE FROM THE MAIN DIV
    imagePreview.removeChild(imageRemove);
    imagePreview.removeChild(btnDiv);

    const remove = document.querySelectorAll('button i.bi.bi-x.remove');

    const cropperBtn = document.querySelectorAll('button i.mdi.mdi-crop.cropperBtn');

    const addProductImage = document.querySelectorAll('img[class="addProductImage"]');

    const imagePreviewBtnDiv = document.querySelectorAll('.imagePreview-BtnDiv');

    imageFile.forEach(function(file,i) {

        // DYNAMICALLY CREATE THE IMAGE TAG VALUE ASSIGN
        addProductImage[i].src = URL.createObjectURL(file);
        addProductImage[i].name = i

        // DYNAMICALLY CREATE A DELETE BUTTON VALUE ASSIGN
        remove[i].parentElement.id = i;
        remove[i].id = i;

        // DYNAMICALLY CREATE CROP BUTTON VALUE ASSIGN
        cropperBtn[i].parentElement.id = `cropperBtn${i}`;
        cropperBtn[i].name = i.toString();
        cropperBtn[i].id = `cropperBtn${i}`;

        // BUTTON VIEW CREATE DIV
        imagePreviewBtnDiv[i].id = `btnDiv${i}`

    });  

}


// CROPPER VARIABLE CREATION THEN THE FUCTION CREATE THE CROPPER WINDOW AND VIEW IN MODAL
let cropperAddProduct;
function cropperWindowView(event, imageFile){

    document.getElementById('addProductCropModal').style.display = 'block';

    // TAKING THE INDEX VALUE OF THAT IMAGE
    let indexOfImage = event.getAttribute('id');
    indexOfImage = indexOfImage[indexOfImage.length -1];

    // CROP RESULT INDEX VALUE ADDED
    const addProductCropResultBTn = document.getElementById('addProductCropResult');
    addProductCropResultBTn.setAttribute('name',indexOfImage);

    // CROPPING IMAGE RETRIEVE
    const imageSrc = document.querySelector(`img[name="${indexOfImage}"]`);

    // SET THE DATA TO MODAL IMAGE
    const image = document.getElementById('addProductCroppingImageView');
    image.src = imageSrc.src;

        //  CROPPER OBJECT CREATION
        cropperAddProduct = new Cropper(image, {
            aspectRatio: NaN, // Allow freeform cropping
            viewMode: 0,      // Display the cropped area in the preview
        });

}



// CROPPER MODAL CLOSE BUTTON TO REMOVE MODAL
function addProductImageCropClose(){
    document.getElementById('addProductImageCropClose').addEventListener('click',()=>{
        document.getElementById('addProductCropModal').style.display = 'none'; 
        cropperAddProduct.destroy();
    })
}


// IMAGE CROP RESULT AND VIEW ON IMAGE DIV AND STORED TO ARRAY
function imageCropResult(imageFile){
    document.getElementById('addProductCropResult').addEventListener('click',()=>{

        const addProductCropResultBTn = document.getElementById('addProductCropResult');
        const indexOfImage = addProductCropResultBTn.getAttribute('name');

        if (cropperAddProduct) {
            const cropperCanvas = cropperAddProduct.getCroppedCanvas();

            if (cropperCanvas) {
                cropperCanvas.toBlob(async (blob) => {
                    const imageElement = document.querySelector(`img[name="${indexOfImage}"]`);
                    imageElement.src = URL.createObjectURL(blob);
                    const customName = "cropped-Product.png";
                    const file = new File([blob], customName, { type: 'image/png' });
                    imageFile[indexOfImage] = file;

                });
            }

            cropperAddProduct.destroy(); // Move the destroy call here

            console.log(imageFile)
        }

        // Hide the modal
        document.getElementById('addProductCropModal').style.display = "none";

    })
}




// SUBMIT NEW PRODUCT FORM DATA
async function submitNewProductData(imageFile,brandId){
  
    //* Retrieve The Form And Creating Form Data *
    const form = document.getElementById('addProduct-form');
    const formData = new FormData(form);


    // * RETRIEVE BRAND DATA ID AND ASSIGN TO FORM DATA *
    formData.append('productBrandName',brandId);


    //* Retrieve the CategoryData View in Div . Then Appending the Category Array Into Form Data *
    const category = document.getElementById('categoryHidden').value;
    const productCategorys = category.split(',');
    productCategorys.forEach((val,i)=>{
        formData.append('productCategory',productCategorys[i]);
    })



    //* ImageFile Passing Through The Fuction This Value Added To The Form Data *
    imageFile.forEach((val,i) => {
        formData.append('productImage',imageFile[i]);
    })

    imageFile.splice(0,imageFile.length)
    


    try{

        const result = document.getElementById("add-product-submit-result");
        result.style.display = 'block';

        const response = await fetch('/admin/productadd',{
            method:'POST',
            body:formData
        })

        if(!response.ok){
            window.location.href = '/admin/error500'
        }

        const data = await response.json();


        if (data.status) {

            result.setAttribute('class','alert alert-success');
            result.innerHTML = data.message;
            window.scroll(0,0);
            document.getElementById("addProduct-form").reset();
            document.getElementById('product-image-preview').style.display = 'none';

        }else{
            
            result.setAttribute('class','alert alert-danger');
            window.scroll(0,0);
            result.innerHTML = data.message;
        }

        setTimeout(()=>{
            result.style.display = 'none';
        },2000);

    }catch(error){

        console.log(error.message);

    }
}



// ADD PRODUCT FORM VALIDATION
function validateProductData(imageFile){

    
    // Selecting The Error Message Printing P tag
    const errorElements = document.querySelectorAll('p[name="validate-addProduct"]');


    // * Show error Message hiding *
    errorElementReset();


    // Retrieve the Values From form 
    const productname = document.getElementById('productname').value;
    const category = document.getElementById('productcategory').innerHTML;
    const description = document.getElementById('productdescription').value;
    const brandName = document.getElementById('productbrandname').value;
    const stock = document.getElementById('productstock').value;
    const price = document.getElementById('productprice').value;
    const size = document.getElementById('productsize').value;
    const material = document.getElementById('productmaterial').value;
    const color = document.getElementById('productcolor').value;
    const specification = document.getElementById('productspecification').value ;
    const imgLength = imageFile.length;


    // Validation Checking
    if(productname.trim() == ''){

        errorElements[0].innerHTML = "* enter productname";
        return false;

    }else if(category == 'Select Category'){

        errorElements[1].innerHTML = "* select category";
        return false;

    }else if(description.trim() == ''){

        errorElements[2].innerHTML = "* enter description";
        return false;

    }else if(brandName.trim() == ''){

        errorElements[3].innerHTML = "* select brand";
        return false;

    }else if(stock.trim() == ''){

        errorElements[4].innerHTML = "* enter the stock";
        return false;

    }else if(stock < 0){

        errorElements[4].innerHTML = "* stock can not be negative";
        return false;

    }else if(price <= 0){

        errorElements[5].innerHTML = "* price can not be negative / zero";
        return false;

    }else if(size.trim() == ''){

        errorElements[6].innerHTML = "* enter size";
        return false;

    }else if(size < 0){

        errorElements[6].innerHTML = "* size can not be negative ";
        return false;

    }else if(material.trim() == ''){

        errorElements[7].innerHTML = "* enter material";
        return false;

    }else if(imageFile.length < 2){

        errorElements[8].innerHTML = "* upload atleast two images";
        return false;

    }else if(specification.trim() == ''){

        errorElements[9].innerHTML = "* enter specification";
        return false;

    }else{
        return true;
    }



}



// ERROR ELEMENT HIDE
function errorElementReset(){
    const errorElements = document.querySelectorAll('p[name="validate-addProduct"]');
    
    errorElements.forEach((val,i) => {
        val.innerHTML = '';
    })
}