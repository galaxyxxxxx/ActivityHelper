const formatDate = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join('/');
};

const formatTime = date => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return formatDate(date) + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

const formatTimeMessage = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join('-');
};
const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};
// 时间显示 一周以内的时间以周几显示 大于一周的以mm/dd显示 不在本年度的以yyyy/mm/dd显示
function showTime(str) {
  let str2 = str.substr(0, 10);
  console.log(str2);
  var date = new Date(Date.parse(str2.replace(/-/g, '/'))); //时间戳格式的日期
  console.log('geshihua', date);
  const week = date.getDay(); //当前周几 一周以内显示这个
  // 当前几月几号 一年之内显示这个
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const mmdd = month + '月' + day + '日';
  const weekShow = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  if (this.sameWeek(str)) {
    return weekShow[week - 1];
  } else if (this.sameYear(str)) {
    return mmdd;
  } else {
    console.log('date', str);
    return date;
  }
}

// 判断是否在同一周里
function sameWeek(str) {
  const date1 = new Date(str.replace(/-/g, '/')); //传入时间标准化    
  const date2 = new Date(); //当前时间  
  const curWeek = date2.getDay(); //获取当前星期几    
  const day = date2.getDay() || 7;
  const monday = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate() + 1 - day); //计算出星期一    
  const sunday = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate() + 7 - day); //计算出星期天
  if (date1 <= monday || date1 >= sunday) {
    return false; //不在同一个星期内    
  } else {
    return true; //在同一个星期内    
  }
}

//判断是否在同一年里
function sameYear(date) {
  const date1 = new Date(date.replace(/-/g, '/'));
  const date2 = new Date();
  const curYear = date2.getFullYear();
  const dateYear = date1.getFullYear();
  if (curYear == dateYear) {
    return true;
  } else {
    return false;
  }
}

// 得到当前日期及星期
const today = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const week = date.getDay();
  return [year, month, day, week];
};

//在书里看到的时间转换方法
// 根据客户端的时间信息得到发表评论的时间格式
// 多少分钟前，多少小时前，昨天，月日
// Para:
//  recordTime - {float}  时间戳
//  yearsFlag - {bool}  是否要年份
function getDiffTime(recordTime, yearsFlag) {
  if (recordTime) {
    recordTime = new Date(parseFloat(recordTime) * 1000);
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var now = new Date();
    var diff = now - recordTime;
    var result = '';
    if (diff < 0) {
      return result;
    }
    var weekR = diff / (7 * day);
    var dayC = diff / day;
    var hourC = diff / hour;
    var minC = diff / minute;
    if (weekR >= 1) {
      var formate = 'MM-dd hh:mm';
      if (yearsFlag) {
        formate = 'yyyy-MM-dd hh:mm';
      }
      return recordTime.format(formate);
    } else if (dayC == 1 || (hourC < 24 && recordTime.getDate() != now.getDate())) {
      result = '昨天' + recordTime.format('hh:mm');
      return result;
    } else if (dayC > 1) {
      formate = 'MM-dd hh:mm';
      if (yearsFlag) {
        formate = 'yyyy-MM-dd hh:mm';
      }
      return recordTime.format(formate);
    } else if (hourC >= 1) {
      result = parseInt(hourC) + '小时前';
      return result;
    } else if (minC >= 1) {
      result = parseInt(minC) + '分钟前';
      return result;
    } else {
      result = '刚刚';
      return result;
    }
  }
  return '';
}

// 扩展Date方法 得到格式化的日期形式
// Parameters：
//  format: {string} 目标日期格式 类似('yyyy-MM-dd')
//  Return：{string} 格式化后的日期
(function initTimeFormat() {
  Date.prototype.format = function (format) {
    var o = {
      'M+': this.getMonth() + 1,
      'd+': this.getDate(),
      'h+': this.getHours(),
      'm+': this.getMinutes(),
      's+': this.getSeconds(),
      'q+': Math.floor((this.getMonth() + 3) / 3),
      'S': this.getMilliseconds()
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp('(' + k + ')').test(format))
        format = format.replace(RegExp.$1, RegExp, $1.length == 1 ? o[k] : ('00' + o[k].substr('' + o[k]).length));
    return format;
  };

});

//特殊字符验证
function haveSpechars(val) {
  const txt = /[ ,\\`,\\~,\\!,\\@,#,\\$,\\%,\\^,\\+,\\*,\\&,\\\\,\\/,\\?,\\|,\\:,\\.,\\<,\\>,\\{,\\},\\(,\\),\\',\\;,\\=,"]/;
  if (txt.test(val)) {
    return true; //有特殊字符返回真
  } else return false;
}

//学号验证  此处还需完善
function isUid(val) {
  const id = /^\d{8}$/;
  if (id.test(val)) {
    return true;
  } else {
    return false;
  }
}
//手机号验证
function isTel(num) {
  return /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/.test(num);
}

//邮箱验证
function isEmail(val) {
  return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(val);
}


// 表单验证时用  检验是否为纯数字
function isNumber(val) {
  const regPos = /^\d+(\.\d+)?$/; //非负浮点数
  const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数

  return (regPos.test(val) || regNeg.test(val));
}

// 表单验证时用  检验是否为正整数
function checkRate(number) {
  const re = /^[1-9]\d*/; //判断正整数/[1−9]+[0−9]∗]∗/   
  console.log('正整数校验 开始', number);
  if (!re.test(number) || number == 0) {
    console.log('正整数校验 失败');
    return false;
  }
  console.log('正整数校验 成功');
  return true;
}

module.exports = {
  formatDate: formatDate,
  formatTime: formatTime,
  formatNumber: formatNumber,
  formatTimeMessage: formatTimeMessage,
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
  getDiffTime: getDiffTime
};