tinymce.init({
  selector: 'textarea#m',
  plugins: 'image code',
  toolbar: 'undo redo | image code',
  images_upload_handler: images_upload_handler,
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  init_instance_callback: init_instance_callback,
});


function images_upload_handler (blobInfo, success, failure, progress) {
  var xhr, formData;

  xhr = new XMLHttpRequest();
  xhr.withCredentials = false;
  xhr.open('POST', '/post/upload');

  xhr.upload.onprogress = function (e) {
    progress(e.loaded / e.total * 100);
  };

  xhr.onload = function() {
    var json;

    if (xhr.status === 403) {
      failure('HTTP Error: ' + xhr.status, { remove: true });
      return;
    }

    if (xhr.status < 200 || xhr.status >= 300) {
      failure('HTTP Error: ' + xhr.status);
      return;
    }

    json = JSON.parse(xhr.responseText);

    if (!json || typeof json.location != 'string') {
      failure('Invalid JSON: ' + xhr.responseText);
      return;
    }

    success(json.location);
  };

  xhr.onerror = function () {
    failure('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
  };

  formData = new FormData();
  formData.append('file', blobInfo.blob(), blobInfo.filename());

  xhr.send(formData);
};


function init_instance_callback (editor) {
  console.log("tinymce " + editor.id + " init finished.");
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  var observer = new MutationObserver(function (mutations, instance) {
      var addedImages = new Array();
      $.each(mutations, function (index, mutationRecord) {
          for (var i = 0; i < mutationRecord.addedNodes.length; i++) {
              var currentNode = mutationRecord.addedNodes[i];
              if (currentNode.nodeName == 'IMG' && currentNode.className != "mce-clonedresizable") {
                  if (addedImages.indexOf(currentNode.src) >= 0) continue;

                  addedImages.push(currentNode.getAttribute("src"));
                  continue;
              }
              var imgs = $(currentNode).find('img');
              for (var j = 0; j < imgs.length; j++) {
                  if (addedImages.indexOf(imgs[j].src) >= 0) continue;

                  addedImages.push(imgs[j].getAttribute("src"));
              }
          }
      });
      console.log('addedImages:', addedImages);
      var removedImages = new Array();
      $.each(mutations, function (index, mutationRecord) {
          for (var i = 0; i < mutationRecord.removedNodes.length; i++) {
              var currentNode = mutationRecord.removedNodes[i];
              if (currentNode.nodeName == 'IMG' && currentNode.className != "mce-clonedresizable") {
                  if (removedImages.indexOf(currentNode.src) >= 0) continue;

                  removedImages.push(currentNode.getAttribute("src"));
                  continue;
              }
              var imgs = $(currentNode).find('img');
              for (var j = 0; j < imgs.length; j++) {
                  if (removedImages.indexOf(imgs[j].src) >= 0) continue;

                  removedImages.push(imgs[j].getAttribute("src"));
              }
          }
      });
      console.log('removedImages:', removedImages);
      for (var i = 0; i < removedImages.length; i++) {
          var imageSrc = removedImages[i];
          if (addedImages.indexOf(imageSrc) >= 0) continue;
          if (confirm("delete image from server?\n" + imageSrc)) {
            console.log('imageSrc:', imageSrc);
            let filename = imageSrc.split('/').pop();
            console.log('filename:', filename);
            let xhr = new XMLHttpRequest();
            xhr.open('GET','/post/remove/'+filename);
            xhr.send();              
              //delete image from server.
          }
      };
  });    
  observer.observe(editor.getBody(), {
      childList: true,
      subtree: true
  });
  console.log('callback done.');
};



