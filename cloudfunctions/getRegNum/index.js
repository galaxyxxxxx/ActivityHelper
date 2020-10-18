// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  let aid = event.aid
  try {
    db.collection('register').where({
      aid:aid
    })
    .get()
    .then(
      res => {
        return res.data.length
      }
    )
  } catch (err) {
    console.log("报名人数云函数获取失败",err);
  }
}