// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const res = await db.collection('message').add({
      data: {
        touser: event.openid,
        page: 'pages/me/me',
        data: event.data,
        templateId: event.templateId,
        date : event.date,
        done: false,
      },
    });
    return res;
  } catch (err) {
    console.log(err)
    return err
  }
}