// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const img = (await cloud.downloadFile({
    fileID : event.img
  })).fileContent;

  return cloud.openapi.security.imgSecCheck({
    media:{
      contentType:'image/png',
      value:img
    }
  })
}