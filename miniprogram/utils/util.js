const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 得到当前日期及星期
const today = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
	var week = date.getDay();
  return [year, month, day, week]
}

//特殊字符验证
function haveSpechars(val){
  var txt=/[ ,\\`,\\~,\\!,\\@,\#,\\$,\\%,\\^,\\+,\\*,\\&,\\\\,\\/,\\?,\\|,\\:,\\.,\\<,\\>,\\{,\\},\\(,\\),\\',\\;,\\=,\"]/
  if(txt.test(val)){
    return true;  //有特殊字符返回真
  }else return false;
}

//学号验证  此处还需完善
function isUid(val){
  var id = /^\d{8}$/
  if (id.test(val) ){
    return true;
} else {
    return false;
}
}
//手机号验证
function isTel(num) {
  var myreg=/^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/
  ;
  if (myreg.test(num)) {
      return true;
  } else {
      return false;
  }
}

//邮箱验证
function isEmail(val){
  
  var regu =/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/

  if(regu.test(val)){
    return true;
  }else return false;

 
}


// 表单验证时用  检验是否为纯数字
function isNumber(val) {
  var regPos = /^\d+(\.\d+)?$/; //非负浮点数
  var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数

  if (regPos.test(val) || regNeg.test(val)) {
    return true;
  } else {
    return false;
  }
}

// 表单验证时用  检验是否为正整数
function checkRate(number) {       
  var re = /^[0-9]+.?[0-9]*/;   //判断正整数/[1−9]+[0−9]∗]∗/   
  if (!re.test(number) || number == 0) {        
    return false;    
  }    
  return true;
}



module.exports = {
  formatTime: formatTime,
  isNumber : isNumber,
  checkRate : checkRate,
  today : today,
  isUid : isUid,
  haveSpechars : haveSpechars,
  isEmail : isEmail,
  isTel : isTel,
}