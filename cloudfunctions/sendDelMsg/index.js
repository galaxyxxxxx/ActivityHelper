// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // let now = new Date();
    const messageResult = db.collection('message').where({
      templateId: "8Dki6a-8B4bfGKfCgN2gUD9A4OFsb2c_hKoUv5gs2yA"
    }).get();
    const sendPromises = messageResult.data.map(async message => {
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: message.touser,
          page: message.page,
          data: message.data,
          templateId: message.templateId
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