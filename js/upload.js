/*global chrome, alert, XMLHttpRequest, FormData, document, window, setTimeout */

/**
 * Add a listener for DOMContentLoaded event
 *
 * @param {string}   Event name
 * @param {function} Event handler
 */
document.addEventListener("DOMContentLoaded", function() {
  "use strict";
  var params = window.location.hash.substring(1).split('&');
  uploadAjax(params[1]);
});

/**
 * [uploadAjax description]
 * @param  {string} TOKEN token from VK
 */
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
  });
}

/**
 * Get image BLOB by url
 * @param  {string} upload_url URL, we got from first step
 */
function sendBlob(upload_url) {
  var url = window.location.hash.substring(1).split('&')[0];
  var blob = null;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "blob"; //force the HTTP response, response-type header to be blob
  xhr.onload = function() {
    blob = xhr.response; //xhr.response is now a blob object
    console.dir(blob);
    sendUploadPhotos(upload_url, blob);
  };
  xhr.send();
}

/**
 * Send photos to VK
 * @param  {string} upload_url url to upload photos
 * @param  {blob} image
 */
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
/**
 * Save uploaded in previous step photos_list
 * @param  {JSON} data    json response from previous step
 * @param  {string} caption deescription for image in album_id
 * @param  {string} tokenR  [description]
 * @return {[type]}         [description]
 */
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
