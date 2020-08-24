// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: x1 - vgiba
})

const db = cloud.database({
  // 该参数从 wx-server-sdk 1.7.0 开始支持，默认为 true，指定 false 后可使得 doc.get 在找不到记录时不抛出异常
  throwOnNotFound: false,
})
const _ = db.command

// 云函数入口函数
exports.main = async (event) => {
  try {
    const result = await db.runTransaction(async transaction => {
      const collect
    })

  } catch (error) {
    return {}
  }



}