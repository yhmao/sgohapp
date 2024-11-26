// home.pug 代码

/**
 * 识别客户端
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
            if (res.user && res.count == 0) {
                console.log(`${fp} 找到 0 个用户。`)
                fillWithInvalidUser(res);
            } else if(res.err) {
                console.log('系统出错')
                $("#errInfo").html(`系统出错：${res.err}`).show();
            } else if (res.user && res.count == 1 ) {   
                console.log(`${fp} 找到 1 个用户`)             
                fillWithValidUser(res);
            } else if (res.user && res.count > 1) {
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
    console.log('有效用户...')
    $("#userInfo1").show(1000);
    $("#userInfo0").hide();
    $("#waitingFp").hide();
    $("#username").text(res.user.Name);
    $("#cellphone").text(res.user.Cellphone);

    $("#formFpAdd").hide();
    $("#linkRegister").hide();

    showFooter(res.user);

    
}

/**
 * 当有效用户时
 * 显页脚：我的巡视记录列表，我的进出场列表
 * @param {*} user 
 */
let showFooter = async function(user) {
    $('.container').append(`
        <hr/>
        <a href="/spotCheck/self/record/find/${user.Cellphone}">
            <button>
                ${user.Name}的巡视记录
            </button>
        </a> 
        <span> &nbsp;&nbsp; </span>
        <a href="/spotCheck/user/find/${user.Cellphone}/inOutList">
            <button>
                ${user.Name}的进出场
            </button>
        </a>
    `)
}

/**
 * 如合法用户，显示相应内容
 * @param {*} res 
 */
let fillWithInvalidUser = function(res) {
    console.log('无效用户...')
    $("#userInfo1").hide();
    $("#userInfo0").show();

    $("#formFpAdd").show();
    $("#errInfo").hide();
    $("#linkRegister").hide();
}

/**
 * 客户端从未记录过时，重新识别用户并添加新的客户端特征
 * @param {*} e 
 */
let fpAdd = function(e) {
    console.log('提交添加fp...')
    e.preventDefault();
    let data = $("#formFpAdd").serialize();
    console.log(`提交表单数据:${data}`)
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
                fillWithInvalidUser(res);
                $("#linkRegister").show();
            }
        }
    )
};

/**
 * 清除显示内容
 */
let divEmpty = function(){
    $("#divInOut").empty();
    $("#divSpotReport").empty();

}

/**
 * 用户进出场查询（列出时间列表）
 * @param {*} e 
 */
let findUserInOut = async function(e) {
    console.log(`提交用户进出场查询...`);
    e.preventDefault();
    let data = $("#formInOut").serialize();
    console.log(`提交表单数据:${data}`);
    $.post(
        `/spotCheck/find/InOut`,  
        data,
        function(res){
            console.log(`收到回复:`, res);
            divEmpty();
            $("#divInOut").html(res);
        }
    )
}

/**
 * 某场所检查报告汇总查询
 * @param {*} e 
 */
let formSpotReportSubmit = async function(e) {
    console.log(`提交场所报告查询...`);
    console.log('e:', e)
    console.log('e.submitter:', e.submitter)
    console.log('document.activeElement:', document.activeElement)
    console.log('document.activeElement["value"]:', document.activeElement['value'])
    // e.preventDefault();
    let data = $("#formSpotReport").serialize();
    console.log(`提交表单数据: ${data}`);
    if (document.activeElement['name'] == "submit") {
        e.preventDefault();

        $.post(
            `/spotCheck/find/record/spotReport/display`,
            data,
            function(res){
                console.log(`收到回复:`, res);
                divEmpty();
                $("#divSpotReport").html(res).show();
            }
        )

    } else if (document.activeElement['name'] == "download") {
        console.log("点击了‘下载’按钮。")   /* 按下载键时不使用Ajax */
        console.log("此时不使用Ajax发送请求。使用缺省方式请求。")

        // $.post(
        //     `/spotCheck/find/record/spotReport/download`,
        //     data,
        //     function(res) {
        //         console.log(`点击下载后收到回复：`, res);
        //         divEmpty();
        //         $("#divSpotReport").html("正在保存下载文件").show();

        //         console.log('typeof res:', typeof res)

        //         let blob = new Blob([res],{ type: "application/text" });
        //         console.log('blob:', blob)

        //         var link = document.createElement('a');
        //         link.href = window.URL.createObjectURL(res);
        //         link.download = "report1.doc";
        //         link.click();
        //     }
        // )
        
    }

}

/**
 * 人员进出场总数统计
 * @param {*} e 
 */
let formInOutCountSubmit = async function(e) {
    console.log(`提交人员进出场数统计查询...`);
    e.preventDefault();
    let data = $("#formInOutCount").serialize();
    console.log(`提交表单数据: ${data}`);
    $.post(
        `/spotCheck/find/count/inOut`,
        data,
        function(res){
            console.log(`收到回复:`, res);
            divEmpty();
            $("#divInOut").html(res).show();
        }
    )
}




/**
 * 绑定表单提交处理方法
 */
$(document).ready(function(){
    $("#formFpAdd").on("submit", e => fpAdd(e));
    $("#formInOut").on("submit", e => findUserInOut(e));
    $("#formSpotReport").on("submit", e => formSpotReportSubmit(e));
    $("#formInOutCount").on("submit", e => formInOutCountSubmit(e));

})

