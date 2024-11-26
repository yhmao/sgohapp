// javascript for html : spotOut.pug

/**
 * Find user for fp
 * Show different contents based on whether valid user
 * @param {*} fp 
 */
let fpCheck = function(fp) {
    console.log('提交fp识别...');
    $.post(
        `/spotCheck/fpCheck`,
        {fp},
        function(res){
            console.log('返回结果：', res)
            $("#waitingFp").hide();
            if (res.count == 0) {
                console.log(`${fp} 找到 0 个用户。`)
                fillWithInvalidUser(res);
            } else if(res.err) {
                console.log('系统出错')
                $("#errInfo").html(`系统出错：${res.err}`).show();
            } else if (res.count && res.count == 1 ) {         
                console.log(`${fp} 找到 1 个用户`)           
                fillWithValidUser(res);
            } else if (res.count && res.count > 1) {
                console.log(`${fp} 找到 ${res.count} 个用户.`);
                fillWithValidUser(res)
            }
        }
    )
};

let fillFps = function(fp) {
    $("input[name='fp']").val(fp)
}

/**
 * 获得用户客户端特征值
 * 然后：基于特片值找到对应用户
 */
let getFp = function(){
    import('https://openfpcdn.io/fingerprintjs/v4')
    .then(FingerprintJS => FingerprintJS.load())
    .then(fp => fp.get())
    .then(result =>{
        // This is the visitor identifier:
        const visitorId = result.visitorId
        console.log('fp:', visitorId)
        return visitorId                
    })
    .then((fp)=>{
        fpCheck(fp);
        fillFps(fp);
    }
    )
}
getFp();

/**
 * 有效用户时，隐藏与显示相应页面内容
 * @param {*} res 
 */
let fillWithValidUser = function(res) {
    console.log('更新页面（合法用户）...')
    $("#userInfo1").show(1000);
    $("#userInfo0").hide();
    $("#username").text(res.user.Name);
    $("#cellphone").text(res.user.Cellphone);


    $("#userInfo0").hide();
    $("#formFpAdd").hide();
    $("#errInfo").hide();

    $("#formOut").show();
    
    $("input[name='username']").val(res.user.Name);
    $("input[name='cellphone']").val(res.user.Cellphone);    
    $("input[name='role']").val(res.user.Role);   
}

/**
 * 如合法用户，显示相应内容
 * @param {*} res 
 */
let fillWithInvalidUser = function(res) {
    console.log('更新页面（不合法用户）...');
    $("#errInfo").hide();
    $("#userInfo1").hide();
    $("#userInfo0").show();
    $("#formFpAdd").show();
}

/**
 * 客户端从未记录过时，重新识别用户并添加新的客户端特征
 * @param {*} e 
 */
let fpAdd = function(e) {
    console.log('提交添加fp...')
    e.preventDefault();
    let data = $("#formFpAdd").serialize();
    console.log(`提交表单data: ${data}`)
    $.post(
        `/spotCheck/user/addFp`,
        data,
        function(res) {
            console.log('收到返回:', res)
            if (res.user && res.user.Name) {
                console.log(`返回为合法用户，更新页面...`)
                fillWithValidUser(res);
            } else {
                console.log(`返回为不合法用户，更新页面...`)
                fillWithInvalidUser(res)
            }
        }
    )
}

/**
 * 用户离场提交
 * @param {*} e 
 */
let out = function(e) {
    console.log('提交出场...')
    e.preventDefault();
    let data = $("#formOut").serialize();
    $.post(
        `/spotCheck/project/spot/out`,
        data,
        function(res) {
            console.log('得到返回：',res)
            $("#submitFormOut").val("你已离场").prop('disabled', true);
            $("#msgFormOut").html(`你已记录离场，请完成下列检查表并提交<br>如有相关照片，可以随后上传。`).show();
        }
    
    )
}


/**
 * 用户提交检查报告
 * @param {*} e 
 */
let submitCheckList = function(e){
    console.log("提交检查报告...");
    e.preventDefault();
    if ( !confirm("确定提交？")) { return false;} // 确认
    let data = $("#formCheckList").serialize();
    console.log(`提交数据：`,data);
    $.post(
        `/spotCheck/project/spot/record`,
        data,
        function(res) {
            console.log('得到返回：', res)
            $("#msgCheckList").html(`
                    报告已于${res.doc.DateCreated}成功提交。<br>
                    你可以继续上传有关照片。
                `).show();
            $("#formFileUpload").show();
            $("#divPicker").show();
            $("#docId").val(res.doc._id);
            $("#submitReport").val(`报告已提交`).prop('disabled', true);
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

    // 显示画布及其中图

    // document.body.append(canvas)


    // 以blob返回canvas上的图
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
        // document.body.appendChild(image)
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


/**
 * 绑定表单提交处理方法
 */
$(document).ready(function(){
    $("#formFpAdd").on("submit", e => fpAdd(e));
    $("#formOut").on("submit", e => out(e));
    $("#formCheckList").on("submit", e => submitCheckList(e));
    $("#formFileUpload").on("submit", e => uploadFiles(e));
    // $("#picker").on("change", (e) => pickerFileChange(e));
    document.getElementById('picker').addEventListener('change', pickerFileChange, false);  
})

