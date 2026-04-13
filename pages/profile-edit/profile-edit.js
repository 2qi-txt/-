Page({
  data: {
    themeClass: '',
    currentTheme: '',
    form: {
      nickName: '',
      avatarUrl: '',
      desc: ''
    }
  },

  onLoad() {
    this.updateThemeClass();
    const app = getApp();
    this._onTheme = () => this.updateThemeClass();
    app.subscribeTheme(this._onTheme);

    const stored = wx.getStorageSync('userProfile') || {};
    this.setData({
      form: {
        nickName: stored.nickName || '用户',
        avatarUrl: stored.avatarUrl || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
        desc: stored.desc || ''
      }
    });
  },

  onShow() {
    this.updateThemeClass();
  },

  updateThemeClass() {
    const app = getApp();
    const theme = (app.globalData && app.globalData.theme) || wx.getStorageSync('theme') || 'skin-libai';
    this.setData({ currentTheme: theme, themeClass: theme });
  },

  onUnload() {
    const app = getApp();
    if (this._onTheme) app.unsubscribeTheme(this._onTheme);
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`form.${field}`]: value });
  },

  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const temp = res.tempFilePaths[0];
        if (!temp) return;
        wx.navigateTo({
          url: `/pages/avatar-crop/avatar-crop?src=${encodeURIComponent(temp)}`,
          events: {
            cropped: (path) => {
              this.setData({ 'form.avatarUrl': path });
            }
          }
        });
      }
    });
  },

  onAvatarError() {
    const fallback = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    if (this.data.form.avatarUrl !== fallback) {
      this.setData({ 'form.avatarUrl': fallback });
    }
  },

  saveProfile() {
    const { form } = this.data;
    const persistAndSave = (finalPath) => {
      const profile = {
        nickName: (form.nickName || '用户').trim(),
        avatarUrl: finalPath || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
        desc: (form.desc || '').trim()
      };
      wx.setStorageSync('userProfile', profile);
      wx.showToast({ title: '资料已保存', icon: 'success' });
      wx.navigateBack({ delta: 1 });
    };

    const path = form.avatarUrl || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    if (path.indexOf('/tmp_') !== -1) {
      wx.saveFile({
        tempFilePath: path,
        success: (s) => persistAndSave(s.savedFilePath),
        fail: () => persistAndSave(path)
      });
    } else {
      persistAndSave(path);
    }
  },

  cancelEdit() {
    wx.navigateBack();
  }
});
