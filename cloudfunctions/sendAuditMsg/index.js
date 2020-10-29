// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const messageResult = await db.collection('message').where({
      templateId: 'KWaC5p8fORBoPKNS04b__FdXVoQwLXcVc1R6NLP38o0',
      done: false,
      touser: event.openid
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
            done: true,
            'data.date3.value': new Date(),
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