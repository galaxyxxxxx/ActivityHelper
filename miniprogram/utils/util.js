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
// 时间显示 一周以内的时间以周几显示 大于一周的以mm/dd显示 不在本年度的以yyyy/mm/dd显示
function showTime(str) {
  let str2 = str.substr(0,10)
  console.log(str2)
  var date = new Date(Date.parse(str2.replace(/-/g,"/")));  //时间戳格式的日期
  console.log("geshihua",date)
  const week = date.getDay(); //当前周几 一周以内显示这个
  // 当前几月几号 一年之内显示这个
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const mmdd = month + "月" + day + "日";
  const weekShow = ["周一","周二","周三","周四","周五","周六","周日"]

  if(this.sameWeek(str)){
    return weekShow[week-1];
  }else if(this.sameYear(str)){
    return mmdd;
  }
  else{
    console.log("date",str)
    return date;
  }
}

// 判断是否在同一周里
function sameWeek(str){
  const date1 = new Date(str.replace(/-/g, "/")); //传入时间标准化    
  const date2 = new Date(); //当前时间  
  const curWeek = date2.getDay(); //获取当前星期几    
  const day = date2.getDay() || 7;
  const monday = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate() + 1 - day); //计算出星期一    
  const sunday = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate() + 7 - day); //计算出星期天
  if (date1 < monday || date1 > sunday) {
    return false; //不在同一个星期内    
  } else {
    return true; //在同一个星期内    
  }
}

//判断是否在同一年里
function sameYear(date){
  const date1 = new Date(date.replace(/-/g,"/"));
  const date2 = new Date();
  const curYear = date2.getFullYear();
  const dateYear = date1.getFullYear();
  if(curYear == dateYear){
    return true;
  }else{
    return false;
  }
}

// 得到当前日期及星期
const today = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const week = date.getDay();
  return [year, month, day, week]
}


//特殊字符验证
function haveSpechars(val) {
  const txt = /[ ,\\`,\\~,\\!,\\@,\#,\\$,\\%,\\^,\\+,\\*,\\&,\\\\,\\/,\\?,\\|,\\:,\\.,\\<,\\>,\\{,\\},\\(,\\),\\',\\;,\\=,\"]/
  if (txt.test(val)) {
    return true; //有特殊字符返回真
  } else return false;
}

//学号验证  此处还需完善
function isUid(val) {
  const id = /^\d{8}$/
  if (id.test(val)) {
    return true;
  } else {
    return false;
  }
}
//手机号验证
function isTel(num) {
  const myreg = /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/;
  if (myreg.test(num)) {
    return true;
  } else {
    return false;
  }
}

//邮箱验证
function isEmail(val) {

  const regu = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/

  if (regu.test(val)) {
    return true;
  } else return false;


}


// 表单验证时用  检验是否为纯数字
function isNumber(val) {
  const regPos = /^\d+(\.\d+)?$/; //非负浮点数
  const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数

  if (regPos.test(val) || regNeg.test(val)) {
    return true;
  } else {
    return false;
  }
}

// 表单验证时用  检验是否为正整数
function checkRate(number) {
  const re = /^[0-9]+.?[0-9]*/; //判断正整数/[1−9]+[0−9]∗]∗/   
  if (!re.test(number) || number == 0) {
    return false;
  }
  return true;
}

module.exports = {
  formatTime: formatTime,
  isNumber: isNumber,
  checkRate: checkRate,
  today: today,
  isUid: isUid,
  haveSpechars: haveSpechars,
  isEmail: isEmail,
  isTel: isTel,
  showTime: showTime,
  sameWeek: sameWeek,
  sameYear: sameYear,
}