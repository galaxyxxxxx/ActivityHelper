// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  var form = event.form
  try {
    console.log("in Function", form);
    return await db.collection('activity').doc(form.id).update({
      data: {
        title: form.title,
        host: form.host,
        numMax: form.numMax,
        addr: form.addr,
        type: form.type_id,
        actTimeBegin: form.actTimeBegin,
        actTimeEnd: form.actTimeEnd,
        regTimeBegin: form.regTimeBegin,
        regTimeEnd: form.regTimeEnd,
        description: form.description,
        cover: form.coverUrl,
      }
    })
  } catch (e) {
    console.error(e);  
  }
}