
  //css
  function applyCss1(){  //不包括批注表单

    $(".form").addClass("container-fluid");
    $(".form>div").addClass("row");
    // console.log("head>div:", $(".head>div").children().filter(':even') );
    $(".form>div").children("div").filter(':even').addClass("col-5 col-md-2");
    $(".form>div").children("div").filter(':odd').addClass("col-7 col-md-10");
    $(".response").css("background-color","lightgrey");
    $(':text, textarea').css('width','100%').css('font-size','1.2em');
    $("button:contains('进行批注')").addClass('bg-warning');
    $("button:contains('关闭该项')").addClass('bg-warning');
    //巡视情况颜色区分显示(正常，关注，有问题，有疑问)
    var $record_anotation = $("#record_annotation");
    var v_record_annotation = $record_anotation.text().trim();
    if (v_record_annotation === "关注") {
      $record_anotation.css('color','brown');
    } else if ( v_record_annotation === "有问题") {
      $record_anotation.css('color','red');
    } else if ( v_record_annotation === "有疑问") {
      $record_anotation.css('color','blue');
    }

  }  
  $(document).ready(applyCss1());


  // pre-select/check according to record value
  $(document).ready(function(){
    // radio options (patroType:安全/日常)
    var v = $('#record_patrolType').text().trim();
    // console.log('v:',v);
		var o = $(":radio[value='" + v + "']");
		// console.log('o:',o);
    // o.click();
    o.prop('checked','checked');

    // selection selected (zone)
    var s = $('select');
    // console.log('s:',s);
    var vs = $('#record_zone').text().trim();   //need trim  ??????????
    // console.log('vs:',vs);
    var option_s = $("select option[value='" + vs + "']");
    // console.log('option_s:', option_s);
    $("select option[value='" + vs + "']").prop('selected','selected');

    // console.log('exposure:', $('#record_exposure').text());
    if ($('#record_exposure').text().trim() == 'private') {
      // console.log('private.')
      $('#exposure').prop('checked',true);
    }

    // select option 巡视情况(正常，关注，有问题，有疑问)
    var v_annotation = $("#record_annotation").text().trim();
    $("#annotation option[value='" + v_annotation + "']").prop('selected', 'selected');
    



  });







    $(function(){  //wrapper

      $('div.headEdit').hide();  // 先不显示主体编辑
      
      // display file size on file pick
      $(":file").bind("change",function(e){
        // console.log('this for change:', this);
        // console.log('filesize:', this.files[0].size);
        $('.file-size').remove();   // 清除以前
        $('.response').remove();   // 清除以前
        $('.preview').remove();   // 清除以前
        $(this).after(`<div class="file-size">${Math.floor(this.files[0].size/1000).toLocaleString()} kB</div>`);

        // console.log('check image? ', this.files[0].type.split('/')[0]);
        if (this.files[0].type.split('/')[0]=='image'){  // if image, preview
          // console.log('an image selected...');
          $(this).after($(
            `<div class="preview" style="width:100px"><img src="${URL.createObjectURL(this.files[0])}" width="40"  /></div>`    // <img>
          ));
        }
        if (Math.floor(this.files[0].size/1000)>20000) {
          console.log('file size too large.');
          $(this).val(null);
          alert("亲爱的，很不好意思，你所选的文件尺寸太大，我消化不了，麻烦你重新选择，谢谢！");
        
        }
      });




      // form submit : downsize if image, ajax
      $("form button, form input:submit").bind('click',function(e){
        // console.log('event:',event);
        event.preventDefault();
        var url = this.form.action;
        // console.log('action url: ', url);
        var thisForm = this.form;
        // console.log('thisForm:', thisForm);
        

        var file = null;
        var fileEle = $(this.form).find(":file")[0];
        // console.log('fileEle:', fileEle);
        if (fileEle) { file = $(this.form).find(":file")[0].files[0]; console.log('file:', file); }

        // var file = $(this.form).find(":file")[0].files[0];
        // console.log('file:',file);

        if (file) {      // if file
          if   
          (file.type.split('/')[0] == 'image')
          { // if image
                  console.log('image uploading and will be downsized first...')
                  var fileReader = new FileReader();
                  fileReader.onload = function(){
                    console.log('fileReader.onload...')
                    var image = new Image();
                    image.onload = function(){
                      console.log('image.onload...')
                      var canvas = document.createElement('canvas');
                      var max_size = 600;               // max image size
                      var width = image.width;
                      var height = image.height;
                      if (width > height) {
                        if (width > max_size){
                          height *= max_size/width;
                          width = max_size;
                        }
                      } else {
                        if (height > max_size){
                          width *= max_size/height;
                          height = max_size;
                        }
                      }
                      canvas.width = width;
                      canvas.height = height;
                      console.log('width height:', width,height);
                      canvas.getContext('2d').drawImage(image,0,0,width,height);
                      canvas.toBlob((blob)=>{
                        console.log('canvas.toBlob...');                        
                        var formData = new FormData(thisForm);
                        formData.set('file',blob,file.name);
                        //Display the values
                        console.log('form data:')
                        for (const value of formData.values()) {
                          console.log(value);
                        } 

                        $.ajax({             //ajax (image)
                          xhr: function(){
                            var xhr = new window.XMLHttpRequest();
                            xhr.upload.addEventListener("progress", function(evt){
                              if (evt.lengthComputable) {
                                console.log('evt.lengthComputable...');
                                var percentComplete = ((evt.loaded / evt.total) * 100 );
                                console.log('percentComplete:', percentComplete);
                                $(thisForm).parent().find(".progress-bar").width(percentComplete + '%');
                                $(thisForm).parent().find(".progress-bar").html(percentComplete + '%');
                              }
                            },false);
                            return xhr;
                          },
                          url:url, 
                          processData: false,
                          contentType: false,
                          data: formData,
                          type: 'POST',
                          beforeSend: function(){
                            console.log('beforeSend...');
                            $(thisForm).parent().find(".progress-bar").width('0%');
                            $(thisForm).parent().find(".uploadStatus").html('开始上传...');
                          }
                        })
                        .done(function(data){
                          console.log('ajax done data:', data);
                        })
                        .fail(function(xhr,status,errorThrown){
                          console.log('ajax fail xhr, stats, errorThrown:', xhr, status, errorThrown);
                        })
                        .always(function(xhr,status){
                          console.log('ajax always xhr, status:', xhr, status);
                          $(thisForm).append($(`<div class="response">${xhr},  ${status}</div>`));
                          $(thisForm).find(':file').val(null);
                          $(thisForm).find('.file-size, .preview').remove();
                          $(thisForm).find('#fileText').val(null); 
                          $(thisForm).parent().find(".uploadStatus").html('');
                        });
                  
                      });

                    };
                    image.src = fileReader.result;
                  };
                  fileReader.readAsDataURL(file);
          
          }  // end if image
          else{
            console.log( 'uploading not image...')
                    var formData = new FormData( thisForm );

                    $.ajax({               //ajax (not image)
                      xhr: function(){
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function(evt){
                          if (evt.lengthComputable) {
                            console.log('evt.lengthComputable...');
                            var percentComplete = ((evt.loaded / evt.total) * 100 );
                            console.log('percentComplete:', percentComplete);
                            $(thisForm).parent().find(".progress-bar").width(percentComplete + '%');
                            $(thisForm).parent().find(".progress-bar").html(percentComplete + '%');
                          }
                        },false);
                        return xhr;
                      },
                      url:url, 
                      processData: false,
                      contentType: false,
                      data: formData,
                      type: 'POST',
                      beforeSend: function(){
                        console.log('beforeSend...');
                        $(thisForm).parent().find(".progress-bar").width('0%');
                        $(thisForm).parent().find(".uploadStatus").html('开始上传...');
                      }
                    })
                    .done(function(data){
                      console.log('ajax done data:', data);
                    })
                    .fail(function(xhr,status,errorThrown){
                      console.log('ajax fail xhr, stats, errorThrown:', xhr, status, errorThrown);
                    })
                    .always(function(xhr,status){
                      console.log('ajax always xhr, status:', xhr, status);
                      $(thisForm).append($(`<div class="response">${xhr},  ${status}</div>`));
                      $(thisForm).find(':file').val(null);
                      $(thisForm).find('.file-size, .preview').remove();
                      $(thisForm).parent().find(".uploadStatus").html('');
                    })
                    ;
          }



        } else {           // no file picked
          console.log( 'no file ...')
                    // ensure file selected for record main
                    if ($(thisForm).attr("id") === "main_file_plus") { 
                      console.log('thisForm.id', $(thisForm).attr("id"));
                      console.log('must select file!!!');  
                      $(thisForm).append(`<b>请先选择文件再点击“上传”按钮</b>`);
                      return false;}
                    var formData = new FormData( thisForm );

                    console.log('url:',url);

                    $.ajax({                 // ajax only text fields
                      url:url, 
                      processData: false,
                      contentType: false,
                      data: formData,
                      type: 'POST',
                    })
                    .done(function(data){
                      console.log('ajax done data:', data);
                    })
                    .fail(function(xhr,status,errorThrown){
                      console.log('ajax fail xhr, stats, errorThrown:', xhr, status, errorThrown);
                    })
                    .always(function(xhr,status){
                      console.log('ajax always xhr, status:', xhr, status);
                      $(thisForm).append($(`<div class="response">${xhr},  ${status}</div>`));
                    });
        }        
      })


      // popup review form for main body image
      $(".showReview").bind('click',function(e){
        // console.log('===x====', $(this).parent().find(".fileId"));
        // console.log('e:',e);
        console.log('this:', this);
        console.log('recordId:',$(this).find(".recordId"));
        console.log('fileId:',$(this).find(".fileId"));
        $(this).after($(`
          <div class="">
            <form class="formReview review" action="/main_review" method="post" enctype="multipart/form-data">
              <div hidden ><div>id:</div><div><input type="text" name="recordId" value=${$(this).find(".recordId").text()}  ></div></div>
              <div hidden><div>fileId:</div><div><input type="text" name="fileId" value=${$(this).find(".fileId").text() }  ></div></div>
              <div><div>批注：</div><div><textarea   name="text"></textarea></div></div>
              <div><div>责任人：</div><div><select class="selectResponsible" name="responsible"></select></div></div>
              <div><div></div><input type="submit" name="submit" value="提交批注"></div>
            </form>
          </div>`
        ));
        // applyCss();
        // $(this).hide();

      });

    
      // popup review form for comment
      $(".showReviewComment").bind('click',function(e){
        // console.log('============', $(this).parent().find(".commentId"));  
        console.log('this:', this);
        console.log('recordId:',$(this).siblings(".recordId"));
        console.log('commentId:',$(this).siblings(".commentId"));
        $(this).after($(
          `
          <div class="">
            <form class="formReview review " action="/comment_review" method="post" enctype="multipart/form-data">
              <div hidden><div>(id)</div><div><input type="text" name="recordId" value=${$(this).find(".recordId").text()} ></div></div>
              <div hidden><div>(commentId)</div><div><input type="text" name="commentId" value=${$(this).find(".commentId").text()} ></div></div>
              <div><div>批注：</div><div><textarea name="text"></textarea></div></div>
              <div ><div>负责人：</div><div><select class="selectResponsible" name="responsible"></select></div></div>
              <div><div></div><input type="submit" name="submit" value="提交批注"></div>
            </form>
          </div>
          `
        ));  
        // applyCss(); 
        // $(this).hide();
      });


      // popup 图片说明
      $(".fileText button").bind('click',function(e){
        // console.log('============', $(this).parent().find(".commentId"));  
        console.log('this:', this);
        console.log('recordId:',$(this).parent().find(".recordId"));
        console.log('fileId:',$(this).parent().find(".fileId"));
        console.log('text:',$(this).parent().find(".fileTextOld").val()  );
        $(this).after($(`
          <div class="">
            <form class="formFileText" action="/main_fileText" method="post" enctype="multipart/form-data">
              <div hidden ><div>id:</div><div><input type="text" name="recordId" value=${$(this).parent().find(".recordId").text()}  ></div></div>
              <div hidden><div>fileId:</div><div><input type="text" name="fileId" value=${$(this).parent().find(".fileId").text() }  ></div></div>
              <div><div></div><div><input type="text" name="text" size="50" value=${$(this).parent().find(".fileTextOld").text() }>   </input></div></div>
              <div><div></div><input type="submit" name="submit" value="提交新的图片说明"></div>
            </form>
          </div>`
        ));
        // applyCss();
        // $(this).hide();
            // 照片说明
    $(".formFileText :submit").bind('click',function(e){
      e.preventDefault();
      var url = this.form.action;
      var thisForm = this.form;
      console.log('url:',url);
      console.log('thisForm', thisForm);
      var formData = new FormData(thisForm);

      $.ajax({
        url:url,
        processData:false,
        contentType:false,
        data:formData,
        type:'POST',
      })
      .done(function(data){
        console.log('ajax done data:', data);
      })
      .fail(function(xhr,status,errorThrown){
        console.log('ajax fail xhr,status,errorThrown:', xhr, status, errorThrown);
      })
      .always(function(xhr,status){
        console.log('ajax always xhr,status:', xhr, status);
        $(thisForm).after($(`<div class="response">${xhr},${status}</div>`));
      });
    });  // 照片说明



      });















      // Refresh record display
      $(".refresh").bind('click',function(e){
        console.log("href:",$(this).href());
        $("#recordShow").load($(this).href);
        e.preventDefault();
      });

      // Delete confirm and change to ajax
      $(":submit:contains('删除'), button:contains('删除')").bind('click', function(e){
        e.preventDefault();
        var checkstr = confirm("确定要删除吗？");
        console.log('this:', this);
        var url = $(this).parent().attr('href');
        var that = this;
        var enclosing = $(this).parents('.file');
        console.log('enclosing:', enclosing);
        // console.log('length:', enclosing.length);
        if (enclosing.length==0) {enclosing = $(this).parents('.comment');}

        console.log('enclosing:', enclosing);
        console.log('url:',url);
        if(!checkstr){return false;}
        else{
          $.get(url,function(data){
            console.log('data:', data);
            $(enclosing).after($(`<div class="response">${data}</div>`));
            enclosing.hide();
            
          });
        }
    });

    //Delete confirmation and change to ajax for 删除批注
    $(".removeReview").bind('click', function(e){
      e.preventDefault();
      var checkstr = confirm("确定要删除吗？");
      var url = $(this).parent().attr('href');
      var that = this;
      if ( !checkstr) { return false;}
      else {
        $.get(url, function(data){
          $(that).after($(`<span class="response">${data}</span>`));
        });
      }
    });





    });  //wrapper



    // Form review selection options
    $(document).on('click','form.review textarea',
      function(event){
        var select = $(this.form).find(".selectResponsible")[0];
        // console.log('==options=:', $(this.form).find(".selectResponsible")[0]);
        $.get('/user_select_options',function(data,status){
          // console.log('data:', data);
          $(select).append(data);
        });        
      }
    );  


    // submit comment review submit (dynamically form, put script outside wrapper)
    $(document).on('click','form.review input:submit',
      function(event){
          // console.log('event:',event);
          event.preventDefault();
          // console.log("=====this======",this);
          var url = this.form.action;
          // console.log('url:',url);
          var thisForm = this.form;
          // console.log('thisForm:', thisForm);
          var formData = new FormData(thisForm);
          // console.log('form data:', formData);        

          $.ajax({
            url:url,
            processData:false,
            contentType:false,
            data:formData,
            type:'POST'
          })
          .done(function(data){
            console.log('ajax done, data:', data);
          })
          .fail(function(xhr,status,errorThrown){
            console.log('ajax fail xhr,status,errorThrown: ', xhr, status, errorThrown);
          })
          .always(function(xhr,status){
            console.log('ajax always xhr, status', xhr, status);
            $(thisForm).append($(`<div class="response">${xhr},  ${status}</div>`));
          })
          ;
        }    
    );





