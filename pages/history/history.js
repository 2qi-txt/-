Page({
  data: {
    themeClass: '',
    historyList: []
  },

  onLoad() {
    this.updateThemeClass();
    const app = getApp();
    app.subscribeTheme && app.subscribeTheme(() => this.updateThemeClass());
  },

  onShow() {
    this.loadHistory();
  },

  updateThemeClass() {
    const app = getApp();
    const theme = (app.globalData && app.globalData.theme) || wx.getStorageSync('theme') || 'skin-libai';
    this.setData({ themeClass: theme });
  },

  loadHistory() {
    const historyList = wx.getStorageSync('recentItems') || [];
    this.setData({ historyList });
  },

  copyItem(e) {
    const content = e.currentTarget.dataset.content;
    wx.setClipboardData({