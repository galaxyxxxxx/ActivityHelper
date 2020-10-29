// 云函数入口文件
const cloud = require('wx-server-sdk')
const nodeExcel = require('node-xlsx');
const path = require('path');
const { rejects } = require('assert');
const { resolve } = require('path');

cloud.init({
  env: 'x1-vgiba'
})
const act = cloud.database().collection('activity');
const reg = cloud.database().collection('register');

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    var targetData = event.dataList;
    var aid = event.aid;
    var actName;
    await act.doc(aid).get().then(
      res => {
        // res.data 包含该记录的数据
        actName = res.data.title
        console.log(actName)
      }
    )
    let excelFileName = actName + '-' + parseInt(Date.now() / 10000) + "-export.xlsx"
    let alldata = [];
    let row = ["序号", "姓名", "学号", "学院", "电子邮箱", "手机号", "报名时间"]; //表属性
    alldata.push(row);
    console.log('data:', targetData);
    // 添加每一行数据
    for (let key in targetData) {
      let arr = [];
      arr.push(parseInt(key)+1);
      arr.push(targetData[key].name);
      arr.push(targetData[key].uid);
      arr.push(targetData[key].dep1);
      arr.push(targetData[key].email);
      arr.push(targetData[key].tel);
      arr.push(targetData[key].regTime);
      alldata.push(arr)
    }
    //3，把数据保存到excel里
    var buffer = nodeExcel.build([{
      name: "Sheet1",
      data: alldata
    }]);
    //4，把excel文件保存到云存储里
    return await cloud.uploadFile({
      cloudPath: 'outputExcels/' + excelFileName,
      fileContent: buffer, //excel二进制文件
    });
  } catch (err) {
    console.log(err);
  }
}