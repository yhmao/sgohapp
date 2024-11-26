// javascript for html : RecordEdit.pug

/**
 * 用户提交检查报告
 * @param {*} e 
 */
let submitCheckList = function(e){
    console.log("提交检查报告...");
    e.preventDefault();
    if ( !confirm("确定提交？")) { return false;} // 确认
    let _id = $("#_id").val()
    console.log(`docId is : ${_id}`)
    let data = $("#formCheckList").serialize();
    console.log(`提交数据：`,data);
    $.post(
        `/spotCheck/record/edit/${_id}`,
        data,
        function(res) {
            console.log('得到返回：', res)
            $("#msgCheckList").html(`
                    收到反馈：${res}<br>
                    你可以继续上传有关照片。
                `).show();
        }
    )
}


let container;

/**
 * 缩小一个图片
 * @param {*} image 类型 Image
 * @returns blob
 */
let downsizeImage = async function(image,max){
    console.log('downsizeImage');
    var canvas = document.createElement('canvas');
    // scale down to max size
    var max_size = max;         
    var width = image.width;
    var height = image.height;
    console.log(`图片原尺寸: ${width} x ${height}`)
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
    console.log(`图片新尺寸: ${width} x ${height}`)
    // 在canvas上画图
    canvas.width = width;
    canvas.height = height;
    console.log('width height:', width,height);
    canvas.getContext('2d').drawImage(image,0,0,width,height);

    return new Promise(function(resolve,reject) {
        canvas.toBlob( function(blob) {
        resolve(blob)
        })
    });  

};

/**
 * 处理一个文件
 * @param {*} file 类型File,来自input[file]
 */
let handleOneFile = async function(file) {
    console.log(`正在处理一个文件: `,file);
    let filename = file.name;
    console.log('文件名：',filename)

    let fileReader = new FileReader();   
    fileReader.onload = function () {
        console.log('fileReader.result:', fileReader.result)
        let image = new Image();

        image.onload = async function(){
            console.log('image.onLoad')
            // 缩小图片尺寸，得到一个Blob

            // 正常缩小
            let blob = await downsizeImage(image,630)
            console.log(`缩小尺寸后得到的Blob:`,blob)
            // 将缩小后的文件添加到 input files 等待提交
            console.log(`缩小后文件名：`,filename)
            let file = new File([blob], filename,{type:"image/jpeg", lastModified:new Date().getTime()});
            // let container = new DataTransfer();
            container.items.add(file);

            // thumbnail
            blob = await downsizeImage(image,165);
            console.log(`图标的Blob:`,blob)
            let filename_s = filename.split('.')[0] + '_thumbnail.' + filename.split('.')[filename.split('.').length-1]
            console.log(`小图标文件名：`,filename_s)
            file = new File([blob], filename_s, {type:"image/jpeg", lastModified: new Date().getTime()})
            container.items.add(file);

            console.log('container:', container)
            console.log('container.files:', container.files)
            document.getElementById('files').files = container.files;

        };   

        image.src = fileReader.result
    }

    fileReader.readAsDataURL(file); 
}


/**
 * 选择图片
 * @param {*} e 
 */
let pickerFileChange = async function(e) {
    console.log(`选择文件事件e:`, e);
    console.log(`e.target.files: `, e.target.files);
    document.getElementById('files').value ='';

    container = new DataTransfer();

    // 遍历所选文件：
    for ( var i = 0; i < e.target.files.length; i++ ) {
        console.log(`处理所选${e.target.files.length}个图片的第${i}个图片...`);
        var file = e.target.files[i];

        // 处理一个文件
        await handleOneFile(file); 
    }
}



/**
 * 用户上传照片（在提交报告后）
 * @param {*} e 
 */
let uploadFiles = function(e) {
    console.log('上传文件...');
    e.preventDefault();

    // 未选中文件，禁止上传。
    if ($("#files")[0].files.length == 0) {
        alert("没有选择文件，不能提交");
        console.log('未选择文件.')
        return false;
    }

    // 表单数据
    let data = new FormData(e.target)
    console.log('上传表单数据:', data);

    // 上传
    $.ajax({
        url: `/spotCheck/upload`,
        processData: false,
        contentType: false,
        data: data,
        type: 'POST',
        success: function(res){
            console.log('得到返回：', res)
            document.getElementById('files').value ='';
            document.getElementById('picker').value ='';
            $("#msgFileUpload").html(
                `总计上传了${res.doc.Files.length}张照片。`
            ).show();            
        },
        error: function(err) {
            console.log('出错:', err)
        }
    })
}

let removeFile = function(e){
    e.preventDefault();
    console.log(`e: `, e)
    if (confirm('确定要删除这张图？')) {
        $.get(e.currentTarget.href, function(data, status, xhr){
            $(e.currentTarget).append($(`<p style="color:red">${data}</p>`));
            $(e.currentTarget).parent().css('border', '2px solid red')
            // $(e.currentTarget).remove();
        })        
    }

}

let removeRecord = function(e){
    e.preventDefault();
    if (confirm('确定要删除？')) {
        $.get(e.currentTarget.href, function(data,status,xhr){
            console.log(e.currentTarget)
            $('body').append($(`<p style="color:red">${data} <a href="/spotCheck">或点击进入首页</a></p>`))
            $('body').css('background-color', 'lightcoral');
            console.log('set body done')
        })
    }
}

/**
 * 绑定表单提交处理方法
 */
$(document).ready(function(){
    $("#formCheckList").on("submit", e => submitCheckList(e));
    document.getElementById('picker').addEventListener('change', pickerFileChange, false);  
    $("#formFileUpload").on("submit", e => uploadFiles(e));
    $("a.removeFile").on("click", e => removeFile(e));
    $("a.removeRecord").on("click", e=> removeRecord(e));
})

