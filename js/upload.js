/*global chrome, alert, XMLHttpRequest, FormData, document, window, setTimeout */

function thereIsAnError(textToShow, errorToShow, imageUrl) {
  "use strict";

  document.getElementById('wrap').innerHTML = '<p></p><br/><br/><center><h1>Wow! Some error arrived!</h1></center><br/><br/><p>' + textToShow + '</p><br/><br/><p>' + errorToShow + '</p><p>' + imageUrl + '</p>';
}

/**
 * Main function to upload an image
 *
 * @param  {string} imageUrl URL of the uploaded image
 * @param  {string} fileName Name of the new uploaded file on VK documents
 * @param  {string} accToken Access token with vk authentication permissions
 */
 function upload(imageUrl, fileName, accToken) {
     "use strict";

     var uploadHttpRequest = new XMLHttpRequest();

     uploadHttpRequest.onload = function () {

         var documentUploadServer = new XMLHttpRequest(),
             requestFormData,
             documentUploadRequest;

         documentUploadServer.open('GET', 'https://api.vk.com/method/docs.getUploadServer?access_token=' + accToken);

         documentUploadServer.onload = function () {

             var answer = JSON.parse(documentUploadServer.response);

             if (answer.error !== undefined) {
                 chrome.storage.local.remove('vkaccess_token');

                 document.getElementById('wrap').innerHTML = '<p></p><br/><br/><center><h1>Ops. Something went wrong. Please try again.</h1></center><br/>';
                 setTimeout(function () { window.close(); }, 3000);

                 return;
             }

             if (answer.response.upload_url === undefined) {
                 thereIsAnError('documentUploadServer response problem', answer, imageUrl);

                 return;
             }

             requestFormData       = new FormData();
             documentUploadRequest = new XMLHttpRequest();

             requestFormData.append("file", uploadHttpRequest.response, fileName);

             documentUploadRequest.open('POST', answer.response.upload_url, true);

             documentUploadRequest.onload = function () {

                 var answer = JSON.parse(documentUploadRequest.response),
                     documentSaveRequest;

                 if (answer.file === undefined) {
                     thereIsAnError('Upload blob problem response problem', answer, imageUrl);

                     return;
                 }

                 documentSaveRequest = new XMLHttpRequest();

                 documentSaveRequest.open('GET', 'https://api.vk.com/method/docs.save?file=' + answer.file + '&access_token=' + accToken);

                 documentSaveRequest.onload = function () {

                     var answer = JSON.parse(documentSaveRequest.response);

                     if (answer.response[0].url === undefined) {
                         thereIsAnError('documentSaveRequest - no file in response', answer, imageUrl);

                         return;
                     }

                     document.getElementById('wrap').innerHTML = '<p></p><br/><br/><center><h1>Successfully uploaded!</h1></center><br/>';
                     setTimeout(function () { window.close(); }, 3000);
                 };

                 documentSaveRequest.send();
             };

             documentUploadRequest.send(requestFormData);
         };

         documentUploadServer.send();
     };

     uploadHttpRequest.responseType = 'blob';
     uploadHttpRequest.open('GET', imageUrl);
     uploadHttpRequest.send();
 }

/**
 * Add a listener for DOMContentLoaded event
 *
 * @param {string}   Event name
 * @param {function} Event handler
 */
document.addEventListener("DOMContentLoaded", function() {
  "use strict";

  var params = window.location.hash.substring(1).split('&'),
    imageUrl = null,
    filename,
    imageName,
    description;

  if (params === undefined || params.length === undefined || params.length !== 2) {
    thereIsAnError('Parsing image url', 'params || params.length != 2', imageUrl);
    return;
  }

  filename = params[0].split('/');

  if (filename.length === undefined || filename.length === 0) {
    thereIsAnError('Getting image filename', 'filename.length <= 0', imageUrl);
    return;
  }

  imageUrl = params[0];

  imageName = filename[filename.length - 1];

  description = "some text should be here";

  if (imageName.indexOf('?') > -1) {
    imageName = imageName.slice(0, imageName.indexOf('?'));
  }

  if (imageName.indexOf('#') > -1) {
    imageName = imageName.slice(0, imageName.indexOf('#'));
  }

  if (imageName.indexOf('&') > -1) {
    imageName = imageName.slice(0, imageName.indexOf('&'));
  }

  uploadAjax(params[1]);
});

function uploadAjax(TOKEN) {

  var ALBUM_ID = 230013795;
  var GROUP_ID = 118100154;
  $.ajax({
    url: 'https://api.vk.com/method/photos.getUploadServer',
    type: 'POST',
    data: {
      'group_id': GROUP_ID,
      'album_id': ALBUM_ID,
      'access_token': TOKEN
    }
  })
  .success(function(result) {
    toastr.success('success1: ' + result);
    console.dir(result);
    sendBlob(result.response.upload_url);
  })
  .error(function() {
    toastr.error('error1' + result);
    console.dir(result);
  })
  ;
}

function sendBlob(upload_url) {
  var url = window.location.hash.substring(1).split('&')[0];
  var blob = null;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
  xhr.onload = function()
  {
    blob = xhr.response;//xhr.response is now a blob object
    console.dir(blob);
    sendUploadPhotos(upload_url, blob);
  };
    xhr.send();
}


function sendUploadPhotos(upload_url, image) {
    if (upload_url === undefined) {
      console.log('there is no URL');
      return false;
    }
    var params = window.location.hash.substring(1).split('&');
    var filename = params[0].split('/');
    var tokenR = params[1];
    var imageName = filename[filename.length - 1];
    //var caption = filename[filename.length - 1];
    var caption = 'here should be some description for each file i want to upload';
    var formData = new FormData();
    formData.append('file', image, imageName);
  $.ajax({
    url: upload_url,
    type: "POST",
    dataType: "JSON",
    processData: false,
    contentType: false,
    data: formData
  })
  .success(function(result) {
    toastr.success('success2' + result);
      savePhotos(result, caption, tokenR);
  })
  .error(function(result) {
    toastr.error('error2' + result);
    console.dir(result);
  });
}

function savePhotos(data, caption, tokenR) {
    console.dir(data);
    $.ajax({
            url: 'https://api.vk.com/method/photos.save',
            type: "GET",
            dataType: "JSON",
            data: {
                'album_id': data.aid,
                'group_id': data.gid,
                'server': data.server,
                'photos_list': data.photos_list,
                'hash': data.hash,
                'access_token': tokenR,
                'caption': caption
            }
        })
        .success(function(result) {
            toastr.success('success3' + result);
        })
        .error(function(result) {
            toastr.error('error3' + result);
            console.dir(result);
        });

}