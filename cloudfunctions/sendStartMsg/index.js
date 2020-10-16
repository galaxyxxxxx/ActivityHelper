// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let now = new Date();
    const messageResult = db.collection('message').where({
      done: false,
      date: _.lt(now),
    }).get();
    const sendPromise = (await messageResult).data.map(async message => {
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: message.touser,
          page: message.page,
          data: message.data,
          templateId: message.templateId
        })
        return db.collection('message').doc(message._id).update({
          data: {
            done: true
          }
        })
      } catch (err) {
        console.log(err);
        return err;
      }
    })
  } catch (err) {
    console.log(err);
    return err;
  }
}