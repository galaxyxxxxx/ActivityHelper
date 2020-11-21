import {
  TagLog
} from '../../utils/taggedLog';

const log = (message) => {
  TagLog('activity-card: ', message);
};

Component({
  properties: {
    activityId: String,
    cover: String,
    title: String,
    addr: String,
    actTimeBegin: String,
    actTimeEnd: String,
    regNum: Number,
    host: String,
    isCollected: Boolean,
    index: Number,
    actForm: String
  },

  methods: {
    toDetailPage: function () {
      if (this.data.actForm == '打卡') {
        wx.navigateTo({
          url: '/packageA/clockinDetail/clockinDetail?aid=' + this.data.activityId
        });
      } else {
        wx.navigateTo({
          url: '/packageA/activityDetail/activityDetail?aid=' + this.data.activityId
        });
      }
    },

    onTap: function (event) {
      log(event);
      if (event.mark.starMark !== 'star') {
        this.toDetailPage();
      } else {
        log('emit collect event');
        this.triggerEvent('collect', {
          activityId: this.data.activityId,
          index: this.data.index
        });
      }
    }
  }
});