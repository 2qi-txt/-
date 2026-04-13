Page({
  data: {
    themeClass: '',
    favList: []
  },

  onLoad() {
    this.updateThemeClass();
    const app = getApp();
    app.subscribeTheme && app.subscribeTheme(() => this.updateThemeClass());
  },

  onShow() {
    const favList = wx.getStorageSync('favorites') || [];
    this.setData({ favList });
  },

  updateThemeClass() {
    const app = getApp();
    const theme = (app.globalData && app.globalData.theme) || wx.getStorageSync('theme') || 'skin-libai';
    this.setData({ themeClass: theme });
  },

  copyItem(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.content,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  }
});
