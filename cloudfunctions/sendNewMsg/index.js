// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const messageResult = await db.collection('message').where({
      templateId: 'CJpRUgZOMZEJVNUIc3-CfXiJXOoZzgd0qKynIeTu0wg',
      aid: event.aid,
      done: false
    }).get();
    const sendPromises = messageResult.data.map(async message => {
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: message.touser,
          page: message.page,
          data: message.data,
          template_id: message.templateId
        });
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
    return Promise.all(sendPromises);
  } catch (err) {
    console.log(err);
    return err;
  }
}