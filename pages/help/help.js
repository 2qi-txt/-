const app = getApp();

Page({
  data: {
    themeClass: ''
  },
  onLoad() {
    this.updateThemeClass();
    this._onTheme = () => this.updateThemeClass();
    app.subscribeTheme && app.subscribeTheme(this._onTheme);
  },
  onShow() {
    this.updateThemeClass();
  },
  onUnload() {
    if (this._onTheme) app.unsubscribeTheme && app.unsubscribeTheme(this._onTheme);
  },
  updateThemeClass() {
    const theme = (app.globalData && app.globalData.theme) || wx.getStorageSync('theme') || 'light';
    const cls = theme === 'dark' ? 'dark-theme' : theme === 'colorful' ? 'colorful-theme' : 'light-theme';
    this.setData({ themeClass: cls });
  },
  goToFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },
  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});
