const app = getApp();

Page({
  data: {
    themeClass: '',
    effectiveDate: '',
    contactEmail: 'privacy@campus.app',
    contactWechat: '电竞客服'
  },
  onLoad() {
    const d = new Date();
    const s = `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}-${('0'+d.getDate()).slice(-2)}`;
    this.setData({ effectiveDate: s });
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
  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});
