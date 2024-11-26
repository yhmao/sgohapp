// javascript for html : spotIn.pug

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
    console.log('fillWithValidUser...')
    $("#userInfo1").show(1000);
    $("#userInfo0").hide();
    $("#username").text(res.user.Name);
    $("#cellphone").text(res.user.Cellphone);

    $("#userInfo0").hide();
    $("#formFpAdd").hide();
    $("#errInfo").hide();
    $("#linkRegister").hide();

    $("#formIn").show();
    
    $("input[name='username']").val(res.user.Name);
    $("input[name='cellphone']").val(res.user.Cellphone);
    
}

/**
 * 如不合法用户，显示相应内容
 * @param {*} res 
 */
let fillWithInvalidUser = function(res) {
    console.log('fillWithInvalidUser...');
    $("#errInfo").hide();
    $("#userInfo1").hide();
    $("#userInfo0").show();
    $("#formFpAdd").show();
    $("#linkRegister").show();  // 注册
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
 * 用户进场提交
 * @param {*} e 
 */
let enter = function(e) {
    console.log('in...')
    e.preventDefault();
    let data = $("#formIn").serialize();

    $.post(
        `/spotCheck/project/spot/in`,
        data,
        function(res) {
            console.log('进场提交反馈：',res)
            $("#submitFormIn").val("你已进场").prop('disabled', true);
            $("#msgFormIn").html(`
                你已进场，请注意安全，并按清单进行巡查。<br>
                记得出场时扫描出场码，并完成记录报告。<br>
                `)
        }    
    )
}

/**
 * 绑定表单提交处理方法
 */
$(document).ready(function(){
    $("#formFpAdd").on("submit", e => fpAdd(e));
    $("#formIn").on("submit", e => enter(e));
})