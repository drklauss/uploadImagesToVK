/*global chrome, alert, XMLHttpRequest, FormData, document, window, setTimeout */

var TOKEN = parseUrl('token');
var ALBUM_ID = 230013795;
var GROUP_ID = 118100154;
/**
 * Add a listener for DOMContentLoaded event
 *
 * @param {string}   Event name
 * @param {function} Event handler
 */
document.addEventListener("DOMContentLoaded", function() {
  "use strict";
  uploadAjax();
});

/**
 * [uploadAjax description]
 * @param  {string} TOKEN token from VK
 */
function uploadAjax() {

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
    sendBlob(result.response.upload_url);
  })
  .error(function() {
    toastr.error('error1' + result);
  });
}

/**
 * Get image BLOB by url
 * @param  {string} upload_url URL, we got from first step
 */
function sendBlob(upload_url) {
  var url = parseUrl('imageUrl');
  var blob = null;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "blob"; //force the HTTP response, response-type header to be blob
  xhr.onload = function() {
    blob = xhr.response; //xhr.response is now a blob object
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
  var imageName = parseUrl('imageName');
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
    savePhotos(result);
  })
  .error(function(result) {
    toastr.error('error2' + result);
  });
}
/**
 * Save uploaded in previous step photos_list
 * @param  {JSON} data    json response from previous step
 * @param  {string} caption deescription for image in album_id
 * @return {[type]}         [description]
 */
function savePhotos(data) {
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
      'access_token': parseUrl('token'),
      'caption': parseUrl('caption')
    }
  })
  .success(function(result) {
    toastr.success('success3' + result);
  })
  .error(function(result) {
    toastr.error('error3' + result);
  });
}

/**
 * get text from URL
 * @param  {string} getType [description]
 * @return {string}         [description]
 */
function parseUrl(getType){
  var PARAMS = window.location.hash.substring(1).split('&');
  switch (getType) {
    case 'imageUrl':
    return PARAMS[0];
    case 'token':
      return PARAMS[1];
    case 'imageName':
      var urlArray = PARAMS[0].split('/');
      return urlArray[urlArray.length - 1];
    case 'caption':
    if (!PARAMS[2]) {
      return 'This is default caption';
    } else {
      return PARAMS[2];
    }
  }
}

function selectSite(site){
  switch (site) {
    case 'sima':
      return parseSimaCaption();
    default:
      return 'There is no caption';
  }
}

function parseSimaCaption(){
  var url = '//st-cdn.r.worldssl.net/items/470/470393/0/140.jpg';
  $('img').each(function() {
    if ($(this).attr('src') == url) {
      console.log($(this).attr('title'));
    }
  });
}
