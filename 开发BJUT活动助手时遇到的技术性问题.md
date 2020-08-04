# 开发BJUT活动助手时遇到的技术性问题
____

`[toc]`

##  :fa-cog spin:  IOS正常但Android有问题时 
* 考虑是不是用了`ES6`特性的问题
* 可以使用`babel`进行转换

## :fa-cog spin: Content-type
* 官网示例代码中content-type设置为'application/json'
但微信开发工具升级后(目前是0.12),请求的header的Content-type写法变了,要改成:
```
header: { content-type: 'json' }
```

## :fa-cog spin: 关键词 this & that
* this是相对于当前函数而言的。
* 如果在onLoad里定义了一个函数,并且需要调用根部数据
则可以在onLoad里先定义一个变量that,将this赋值给that
那此时调用的that,则是相对于onLoad()的当前对象
* eg 
onLoad函数内一个function需要用到setData;则可以在onLoad里先定义;再在function里调用that.setData
```javascript
onLoad : function(options){
   let that = this
   
   wx:wx.request({
      url: ''
      data:{userid:this.data.username},
      header: {
        'content-type': 'application/json'
      },
      method: 'POST',
      dataType: 'json',
      
      success: function(res) {

        console.log(JSON.parse(res.data.d));  
        var value = JSON.parse(res.data.d);
        that.setData({
          postData:value
        })

      },
      fail: function(res) {},
      complete: function(res) {},
     })
}
```
## :fa-cog spin: 关键词 var & let & const

* #### var声明的变量会挂在window上,let和const不会
* #### var声明的变量存在变量提升,即书写代码时使用该变量的位置位于声明前时 不会报错 会得到undefined的该变量,let和const不会
```
console.log(a); // undefined  ===>  a已声明还没赋值,默认得到undefined值
var a = 100;
```
```
console.log(b); // 报错:b is not defined  ===> 找不到b这个变量
let b = 10;
```
```
console.log(c); // 报错:c is not defined  ===> 找不到c这个变量
const c = 10;
```
* #### let和const声明形成块作用域,var有全局性
```
if(1){
    var a = 100;
    let b = 10;
}

console.log(a); // 100
console.log(b)  // 报错:b is not defined  ===> 找不到b这个变量
```
```
if(1){

    var a = 100;
        
    const c = 1;
}
 console.log(a); // 100
 console.log(c)  // 报错:c is not defined  ===> 找不到c这个变量
 ```
* #### 同一作用域下let和const不能生命同名变量,var可以
```
var a = 100;
console.log(a); // 100

var a = 10;
console.log(a); // 10
```
```
let a = 100;
let a = 10;

//  控制台报错:Identifier 'a' has already been declared  ===> 标识符a已经被声明了。
```
* #### 暂存死区
```
var a = 100;
if(1){    
	a = 10;    
    //在当前块作用域中存在a使用let/const声明的情况下,给a赋值10时,只会在当前作用域找变量a,    
    // 而这时,还未到声明时候,所以控制台Error:a is not defined    
    let a = 1;
 }
```
* #### const
	* 一旦声明必须赋值,不能使用null占位;
	* 声明后不能修改;
	* 但如果声明的时复合类型数据,可以修改其属性
```
const a = 100; 

const list = [];
list[0] = 10;
console.log(list);  // [10]

const obj = {a:100};
obj.name = 'apple';
obj.a = 10000;
console.log(obj);  // {a:10000,name:'apple'}
```
## :fa-cog spin: setData
* #### 对单个元素进行赋值
	直接this.setData({`ele` : `ele`})
    
* #### 对数组赋值
	先拼接字符串
eg:对Stu: ['Li' , 'Yang' , 'Wang']进行某一索引值
```JavaScript
var index = 0
var str = "Stu[" + index + "]"
for(index = 0; index < length; index++)
this.setData({
  str : ""
})
```
* #### 对对象赋值
	首先`let arr = this.data.arr`
   然后创造obj   ` let obj = {}`
   对obj赋值——类似于数组赋值,在拼接字符串时,后面加上`.属性`即可
   最后用arr.push(obj)
   
## :fa-cog spin: 数组push时被覆盖
* 问题描述
这是一个数据库读取事件,actLine被加值后,在下次开启加值时,会将之前加的值替换,但对原本的值无影响,即几次push后,所有push的值都会变成最后一次push的值
```
//原代码
if(res.data.length != 0){   //查询成功时
   for(let i = 0; i < res.data.length; i++){
        obj.title =  res.data[i].title
        obj.host =  res.data[i].host
        actLine.push(obj)) 
        console.log(i,actLine) 
}
```
* 解决方法
第五行push时将其改为以下内容
```
if(res.data.length != 0){   //查询成功时
   for(let i = 0; i < res.data.length; i++){
        obj.title =  res.data[i].title
        obj.host =  res.data[i].host
        actLine.push(Object.assign({}, obj)) 		//采用Object.assign将obj置于对象中再push给actLine
        console.log(i,actLine) 
}
```
* 原理
Object.assign() : 将所有可枚举的自有属性的值从一个或多个源对象复制到目标对象,返回目标对象。


## :fa-cog spin:  icon与文字对不齐
* 问题描述
使用vant组件库图标时,将icon与文字放在一个view标签里。显示情况,总是icon偏上一些,无论怎样调节字号都无效。
```
/*原代码*/
<view class="actLable"><van-icon name="label-o" size="40rpx" />{{item.lable}}</view>

```
* 解决办法
在wxss里对vant-icon设置垂直居中即可
```
van-icon {
  vertical-align:middle
}
```

## :fa-cog spin: icon 换行与连续空格
* 换行
wxml里的`/n`或者`br`都不会被识别;
通过后台中传入的富文本换行,富文本中的\n会被当作字符串处理;
所以要在`js里声明`,`wxml里调用`
```
/*js*/
Page({
  data: {
    text: '这是一个段落 \n 看我变身换行',
  },
})
```
```
/*wxml*/
<view>
  <text>这是一个段落 \n 看我变身换行</text>
</view>
<view>
  <text>{{text0}}</text>
</view>
```
* 连续空格
在view里输入多个空格,只会被当作一个处理;要`放在text标签`里,并且设置`decode为ture`
ensp:中文字符一半大小
emsp:中文字符大小
nbsp:根据字体设置
```
<view>
    <text decode="{{true}}">我要&ensp;开始&ensp;&ensp;&ensp;空格了(空格是中文字符一半大小)</text>
</view>
<view>
    <text decode="{{true}}">我要&emsp;开始&emsp;&emsp;&emsp;空格了(空格是中文字符大小)</text>
</view>
<view>
    <text decode="{{true}}">我要&nbsp;开始&nbsp;&nbsp;&nbsp;空格了(空格根据字体设置)</text>
</view>
```

## :fa-cog spin: icon 真机调试时超2mb无法调试
* 问题描述
在微信开发工具里点击真机调试时,显示超过2048kb而无法加载
* 解决方法
`分包`
重新规划文件目录,将pages下一部分页面拎出来,放在根目录的新建文件夹里;并在app.json里更改声明
详情见[官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/basic.html)
```
{
  "pages": [
    "pages/home/home"
  ],
  "subpackages": [
    {
      "root": "packageA",
      "pages": [
        "me/me",
        "index/index",  
        "info/info",
        "calendar/canlendar"
      ]
    }, {
      "root": "packageB",
      "pages": [
        "editActivity/editActivity",
        "regDetails/regDetails",
        "activityDetail/activityDetail",
        "newActivity/newActivity"
      ]
    }
  ]
 }
 ```
  
## 正则表达式
* [数据来源](https://c.runoob.com/front-end/854)
* 常用数字校验
```
数字:^[0-9]*$
n位的数字:^\d{n}$
至少n位的数字:^\d{n,}$
m-n位的数字:^\d{m,n}$
零和非零开头的数字:^(0|[1-9][0-9]*)$
非零开头的最多带两位小数的数字:^([1-9][0-9]*)+(\.[0-9]{1,2})?$
带1-2位小数的正数或负数:^(\-)?\d+(\.\d{1,2})$
正数、负数、和小数:^(\-|\+)?\d+(\.\d+)?$
有两位小数的正实数:^[0-9]+(\.[0-9]{2})?$
有1~3位小数的正实数:^[0-9]+(\.[0-9]{1,3})?$
非零的正整数:^[1-9]\d*$ 或 ^([1-9][0-9]*){1,3}$ 或 ^\+?[1-9][0-9]*$
非零的负整数:^\-[1-9][]0-9"*$ 或 ^-[1-9]\d*$
非负整数:^\d+$ 或 ^[1-9]\d*|0$
非正整数:^-[1-9]\d*|0$ 或 ^((-\d+)|(0+))$
非负浮点数:^\d+(\.\d+)?$ 或 ^[1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0$
非正浮点数:^((-\d+(\.\d+)?)|(0+(\.0+)?))$ 或 ^(-([1-9]\d*\.\d*|0\.\d*[1-9]\d*))|0?\.0+|0$
正浮点数:^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$ 或 ^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$
负浮点数:^-([1-9]\d*\.\d*|0\.\d*[1-9]\d*)$ 或 ^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$
浮点数:^(-?\d+)(\.\d+)?$ 或 ^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$
```

* 常用字符校验

```
汉字:^[\u4e00-\u9fa5]{0,}$
英文和数字:^[A-Za-z0-9]+$ 或 ^[A-Za-z0-9]{4,40}$
长度为3-20的所有字符:^.{3,20}$
由26个英文字母组成的字符串:^[A-Za-z]+$
由26个大写英文字母组成的字符串:^[A-Z]+$
由26个小写英文字母组成的字符串:^[a-z]+$
由数字和26个英文字母组成的字符串:^[A-Za-z0-9]+$
由数字、26个英文字母或者下划线组成的字符串:^\w+$ 或 ^\w{3,20}$
中文、英文、数字包括下划线:^[\u4E00-\u9FA5A-Za-z0-9_]+$
中文、英文、数字但不包括下划线等符号:^[\u4E00-\u9FA5A-Za-z0-9]+$ 或 ^[\u4E00-\u9FA5A-Za-z0-9]{2,20}$
可以输入含有^%&',;=?$\"等字符:[^%&',;=?$\x22]+
禁止输入含有~的字符:[^~\x22]+
```

* 一些套路

```
Email地址:^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$
域名:[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?
InternetURL:[a-zA-z]+://[^\s]* 或 ^http://([\w-]+\.)+[\w-]+(/[\w-./?%&=]*)?$
手机号码:^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$
电话号码("XXX-XXXXXXX"、"XXXX-XXXXXXXX"、"XXX-XXXXXXX"、"XXX-XXXXXXXX"、"XXXXXXX"和"XXXXXXXX):^(\(\d{3,4}-)|\d{3.4}-)?\d{7,8}$ 
国内电话号码(0511-4405222、021-87888822):\d{3}-\d{8}|\d{4}-\d{7}
电话号码正则表达式(支持手机号码,3-4位区号,7-8位直播号码,1-4位分机号): ((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)
身份证号(15位、18位数字),最后一位是校验位,可能为数字或字符X:(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)
帐号是否合法(字母开头,允许5-16字节,允许字母数字下划线):^[a-zA-Z][a-zA-Z0-9_]{4,15}$
密码(以字母开头,长度在6~18之间,只能包含字母、数字和下划线):^[a-zA-Z]\w{5,17}$
强密码(必须包含大小写字母和数字的组合,不能使用特殊字符,长度在 8-10 之间):^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,10}$ 
强密码(必须包含大小写字母和数字的组合,可以使用特殊字符,长度在8-10之间):^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,10}$ 
日期格式:^\d{4}-\d{1,2}-\d{1,2}
一年的12个月(01~09和1~12):^(0?[1-9]|1[0-2])$
一个月的31天(01~09和1~31):^((0?[1-9])|((1|2)[0-9])|30|31)$ 
钱的输入格式:
    有四种钱的表示形式我们可以接受:"10000.00" 和 "10,000.00", 和没有 "分" 的 "10000" 和 "10,000":^[1-9][0-9]*$ 
    这表示任意一个不以0开头的数字,但是,这也意味着一个字符"0"不通过,所以我们采用下面的形式:^(0|[1-9][0-9]*)$ 
    一个0或者一个不以0开头的数字.我们还可以允许开头有一个负号:^(0|-?[1-9][0-9]*)$ 
    这表示一个0或者一个可能为负的开头不为0的数字.让用户以0开头好了.把负号的也去掉,因为钱总不能是负的吧。下面我们要加的是说明可能的小数部分:^[0-9]+(.[0-9]+)?$ 
    必须说明的是,小数点后面至少应该有1位数,所以"10."是不通过的,但是 "10" 和 "10.2" 是通过的:^[0-9]+(.[0-9]{2})?$ 
    这样我们规定小数点后面必须有两位,如果你认为太苛刻了,可以这样:^[0-9]+(.[0-9]{1,2})?$ 
    这样就允许用户只写一位小数.下面我们该考虑数字中的逗号了,我们可以这样:^[0-9]{1,3}(,[0-9]{3})*(.[0-9]{1,2})?$ 
    1到3个数字,后面跟着任意个 逗号+3个数字,逗号成为可选,而不是必须:^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(.[0-9]{1,2})?$ 
    备注:这就是最终结果了,别忘了"+"可以用"*"替代如果你觉得空字符串也可以接受的话(奇怪,为什么?)最后,别忘了在用函数时去掉去掉那个反斜杠,一般的错误都在这里
xml文件:^([a-zA-Z]+-?)+[a-zA-Z0-9]+\\.[x|X][m|M][l|L]$
中文字符的正则表达式:[\u4e00-\u9fa5]
双字节字符:[^\x00-\xff] (包括汉字在内,可以用来计算字符串的长度(一个双字节字符长度计2,ASCII字符计1))
空白行的正则表达式:\n\s*\r (可以用来删除空白行)
HTML标记的正则表达式:<(\S*?)[^>]*>.*?|<.*? /> ( 首尾空白字符的正则表达式:^\s*|\s*$或(^\s*)|(\s*$) (可以用来删除行首行尾的空白字符(包括空格、制表符、换页符等等),非常有用的表达式)
腾讯QQ号:[1-9][0-9]{4,} (腾讯QQ号从10000开始)
中国邮政编码:[1-9]\d{5}(?!\d) (中国邮政编码为6位数字)
IP地址:((?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)) 
```
























