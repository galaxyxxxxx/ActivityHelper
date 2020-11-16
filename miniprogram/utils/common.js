/**
 * 从活动信息数据库中获取活动，同时查询每条活动的报名人数和当前用户是否收藏。
 * 目前没有考虑出现异常的情况(比如断开网络连接，此时可能会一直显示加载框而不
 * 是弹出断网的提示)
 * @param {DB.Database} db 数据库
 * @param {string} openId 用户OpenId
 * @param {{
 *      filter: DB.IQueryCondition, 
 *      skip: number, 
 *      limit: number, 
 *      orderBy: {field: string, order: string}
 * }} config 查询条件
 */
export const fetchActivities = async (db, openId, config) => {
  const activityDB = db.collection('activity');
  const collectDB = db.collection('collect');
  const registerDB = db.collection('register');
  const activities = await activityDB.where(config.filter)
    .orderBy(config.orderBy.field, config.orderBy.order)
    .skip(config.skip)
    .limit(config.limit)
    .get();
  if (activities.data.length === 0) {
    return [];
  }
  wx.showLoading({
    title: '正在加载活动',
    mask: true
  });

  for (const activity of activities.data) {
    const collected = await collectDB.where({
      _openid: openId,
      aid: activity._id
    }).get();

    activity.isCollected = collected.data.length > 0;

    const registedNumber = await registerDB.where({
      aid: activity._id
    }).get();

    activity.regNum = registedNumber.data.length;
  }
  wx.hideLoading();
  return activities.data;
};

/**
 * 收藏或取消收藏一个活动，返回收藏或取消收藏的结果。
 * 如：已收藏，点击星星后返回false表示本活动现在已经不再被收藏；
 * 返回true表示取消收藏失败；反之亦然。目前没有考虑出现异常的情
 * 况。
 * @param {DB.Database} db 数据库
 * @param {string} activityId 活动id
 * @param {string} openId 用户的OpenId
 * @returns 返回当前活动的收藏状态
 */
export const collectOrUncollectActivity = async (db, activityId, openId) => {
  const collect = db.collection('collect');
  const collectionInfo = await collect.where({
    _openid: openId,
    aid: activityId
  }).get();
  if (collectionInfo.data.length == 0) { //如果未收藏，需要改为已收藏
    await collect.add({
      data: {
        aid: activityId,
        openid: openId,
        collectTime: new Date()
      }
    });
    wx.showToast({
      title: '成功收藏',
      icon: 'success',
      duration: 1000
    });
    return true;
  } else {
    await collect.doc(collectionInfo.data[0]._id).remove();
    wx.showToast({
      title: '已取消收藏',
      icon: 'success',
      duration: 1000
    });
    return false;
  }
};