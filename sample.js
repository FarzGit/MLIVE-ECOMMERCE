function imageEditor(existingImageURLs){
                  
    //multiple imge upload
    const imageUploadInput = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview');
   
    let  cropper;


    

    imageUploadInput.addEventListener('click',(e)=>{
        e.target.parentNode.querySelector('input').value=''
        selectedImagesArray=[]
        document.getElementById('image-preview').innerHTML=''
    })

    imageUploadInput.addEventListener('change', (event) => {
        imagePreviewContainer.innerHTML = ''; // Clear previous previews


        const selectedImages = event.target.files;
        if (selectedImages.length > 4) {
            alert('You can select a maximum of 4 images.');
            imageUploadInput.value = ''; // Clear the input field
            return;
        }
    

        setupEditableImages(selectedImages, existingImageURLs);


        
    });

       // Handle existing images on page load
   if (existingImageURLs && existingImageURLs.length > 0) {
       setupEditableImages([], existingImageURLs);
   }



   function setupEditableImages(selectedImages, existingImageURLs){
       console.log('---selectedImages-------',selectedImages)
       console.log('----existingImageURLs---',existingImageURLs)

       const imagesToDisplay = selectedImages.length > 0 ? selectedImages : existingImageURLs;
       selectedImagesArray=[]
       for (let i = 0; i < imagesToDisplay.length; i++) {
          
           // selectedImagesArray.push(imagesToDisplay[i]);

           const image = document.createElement('div');
           image.classList.add('image-preview-div');
   
           const imgElement = document.createElement('img');

           if (typeof imagesToDisplay[i] === 'string') {
               // It's an existing image URL
               const imageUrl = imagesToDisplay[i];
               convertUrlToFile(imageUrl, (file) => {
                   const identifier=`${Date.now()}${i}`
                   imgElement.src = URL.createObjectURL(file);
                   imgElement.setAttribute('identifier',identifier)
                   selectedImagesArray.push({image:file,identifier:identifier});
               });
           } else {
               // It's a newly added image as a Blob or File
               const identifier=`${Date.now()}${i}`
               imgElement.src = URL.createObjectURL(imagesToDisplay[i]);
               imgElement.setAttribute('identifier',identifier)
               selectedImagesArray.push({image:imagesToDisplay[i],identifier:identifier});
           }
           
           

           console.log('selectedImagesArray--------------after file conversion',selectedImagesArray)
   

           // ----------------------------------crop image

           const cropButton = document.createElement('a');
           cropButton.innerHTML = '<i class="mdi mdi-crop-free "></i>';
           cropButton.id=i
           cropButton.classList.add('image-view-button');


          


           // -------------------------------crop part ends

           const removeButton = document.createElement('a');
           removeButton.innerHTML = '<i class="mdi mdi-close-circle"></i>';
           removeButton.classList.add('image-preview-remove-button');
           // removeButton.setAttribute('index',i)
           
   
           removeButton.addEventListener('click', () => {
               image.remove(); // Remove the image and button when clicked
               const key=imgElement.getAttribute('identifier')
               
               const removedImageIndex = selectedImagesArray.findIndex(imageData=>imageData.identifier==key);
               
               if (removedImageIndex !== -1) {
                   selectedImagesArray.splice(removedImageIndex, 1); // Remove the image from the array
               }

       

           });


           cropButton.addEventListener('click',(e)=>{
       
                   const key=imgElement.getAttribute('identifier')
                
                   const index = selectedImagesArray.findIndex(imageData=>imageData.identifier==key);
                   

                       const imgSrc=imgElement.src;

                       //creating new imagepreview for image croping
                       const cropperDiv=document.createElement('div')
                       cropperDiv.classList.add('cropperDiv')

                       
                       const cropperImage=document.createElement('img')
                       cropperImage.src=imgSrc;

                       const saveCrop=document.createElement('a')
                       saveCrop.classList.add('saveCrop')
                       saveCrop.textContent='SAVE'
                       saveCrop.id='saveCrop'


                       cropperDiv.appendChild(cropperImage)
                       cropperDiv.appendChild(saveCrop)
                      
                      

                       const modal=document.getElementById('viewModal')
                       modal.style.display='block';
                       document.getElementById('viewModal').classList.remove('hidden');
                       document.getElementById('viewModal-content').innerHTML=''
                       document.getElementById('viewModal-content').appendChild(cropperDiv)

                       

                       document.getElementById('saveCrop').addEventListener('click',()=>{
                          
                           

                           // Capture the cropped image data
                           const croppedCanvas = cropper.getCroppedCanvas();
                           
                           // Convert the cropped canvas to a Blob
                           croppedCanvas.toBlob(function (blob) {
                               // Create a File object with a specified filename
                               const croppedFile = new File([blob], 'cropped_img'+Date.now()+'.png', { type: 'image/png' });
                               
               
                               imgElement.src = URL.createObjectURL(croppedFile);
                              
                               selectedImagesArray[index].image=croppedFile
                              console.log('at save crop ----------',selectedImagesArray)


                           }, 'image/png');

                           document.getElementById('viewModal').classList.add('hidden');


                       });

                       // cropperImage.src=imgSrc

                        cropper=new Cropper(cropperImage,{
                           aspectRatio:0,
                           viewMode:0
                       })

       },true)

   
           image.appendChild(imgElement);
           image.appendChild(removeButton)
           image.appendChild(cropButton);
           imagePreviewContainer.appendChild(image);

          
       }
   }
   


}

// Function to convert URL to File
function convertUrlToFile(url, callback) {

fetch(url)
.then(response => response.blob())
.then(blob => {
const filename = url.substring(url.lastIndexOf('/') + 1);
const file = new File([blob], filename, { type: blob.type });

callback(file);
})
.catch(error => console.error('Error converting URL to File:', error));
}





















































































<form class="forms-sample" action="/admin/editProduct" method="post" enctype="multipart/form-data" style="background-color: #efefef;">

<div class="row">
  <div class="col-6">
    <div class="form-group">
      <label for="exampleInputName1" class="font-weight-bold pl-3" style="color: #000000;">Product Name</label>
      <input type="text" class="form-control form-style" name="productName" id="exampleInputName1" placeholder="Name" value="<%=product.productName%>" >
      <span class="error" style="color: red;  margin-left: 15px; font-size: 10px;"></span>

    </div>
  </div>
  <div class="col-6">
    <div class="form-group">
      <label for="exampleInputName1" class="font-weight-bold pl-3" style="color: #080000;">Price</label>
      <input type="number" class="form-control form-style" id="exampleInputName1" name="price" placeholder="price" value="<%=product.price%>" >
      <span class="error" style="color: red;  margin-left: 15px; font-size: 10px;"></span>

    </div>
  </div>
</div>

<div class="row">
  <div class="col-6">
    <div class="form-group">
      <label for="exampleInputName1" class="font-weight-bold pl-3" style="color: #000000;">Brand</label>
      <input type="text" class="form-control form-style" name="brand" id="exampleInputName1" placeholder="brand" value="<%= product.brand %>">
    </div>
  </div>
  <div class="col-6">
    <div class="form-group">
      <label class="font-weight-bold pl-3" style="color: #000000;">Category</label>
      <select name="category" class="form-control form-style" required>
        <% for(i in cartData){%>
          <option value="<%=cartData[i]._id%>" <% if(product.category==cartData[i].name ){%>selected<%}%>
              <% if(cartData[i].is_active==false) {%>
                disabled
                <%}%>
                  ><%= cartData[i].name %>
          </option>
          <%}%>
      </select>
    </div>
  </div>
</div>

<div class="row">
  <div class="col-6">
    <div class="form-group">
      <label for="exampleInputName1" class="font-weight-bold pl-3" style="color: #000000;">Status</label>
      <input type="text" class="form-control form-style" id="exampleInputName1" name="status" placeholder="status" value="<%=product.status%>" >
      <span class="error" style="color: red;  margin-left: 15px; font-size: 10px;"></span>

    </div>
  </div>
  <div class="col-6">
    <div class="form-group">
      <label class="font-weight-bold pl-3" style="color: #000000;">Quantity</label>
      <input type="number" class="form-control form-style" id="exampleInputName1" name="quantity" placeholder="Enter Stock" value="<%=product.quantity %>" >
    </div>
  </div>
</div>

<div class="form-group mt-2">
  <label for="exampleTextarea1" class="font-weight-bold pl-3 " style="color: #000000;">Description</label>
  <div class="row">
    <div class="col-6">
      <textarea name="description" class="form-control  form-style" id="exampleTextarea1" rows="6" >
        <%= product.description || "Enter description here" %>
      </textarea>
    </div>                    
    <div class="col-6">
      <div class="form-group">
        
        <div class="col-lg-12 col-md-6 rounded-image-preview">
          <label class="upload__btn ms-3">
            <p class="font-weight-bold pl-1" style="color: #000000;">Upload Images</p>
            <input type="file" id="formFile" name="image" multiple data-max_length="20" class="upload__inputfile" >
          </label>
        </div>
        <div class="old-image-preview">
          <!-- Display the old image if it exists -->
          <% if (product.image) { %>
           <% for(let i=0;i<product.image.length;i++){%>
            <img style="width: 100px; height: 150px;" src="/static/adminAssets/images/<%=product.image[i] %>" alt="Old Image">
            <%}%>
          <% } %>
        </div>
        
      </div>
    </div>
  </div>
</div>  
<input type="hidden" name="id" value="<%=product._id%>">

<div class="d-flex justify-content-center">
  <button type="submit" class="btn btn-lg btn-primary mr-2 mt-5">Update</button>
</div>
</form>































































<nav aria-label="Page navigation example">
          <ul class="pagination justify-content-center">
            <li class="page-item <%= currentPage === 1 ? 'disabled' : '' %>">
              <a class="page-link" href="/Product?page=<%= currentPage - 1 %>" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
                <span class="sr-only">Previous</span>
              </a>
            </li>
            <% for (let i = 1; i <= pages; i++) { %>
              <li class="page-item <%= currentPage === i ? 'active' : '' %>">
                <a class="page-link" href="/Product?page=<%= i %>"><%= i %></a>
              </li>
            <% } %>
            <li class="page-item <%= currentPage === pages ? 'disabled' : '' %>">
              <a class="page-link" href="/Product?page=<%= currentPage + 1 %>" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
                <span class="sr-only">Next</span>
              </a>
            </li>
          </ul>
        </nav>