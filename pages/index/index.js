Page({
  data: {
    themeClass: '',
    recentItems: [],
stats: {
        generated: 0,
        optimized: 0
      },
      historyCount: 0,
      favCount: 0
    },

  onLoad() {
    this.updateThemeClass();
    const app = getApp();
    this._onTheme = (t) => this.updateThemeClass();
    app.subscribeTheme(this._onTheme);
    this.loadUserData();
  },

  onShow() {
    this.updateThemeClass();
    this.updateStats();
  },

  updateThemeClass() {
    const app = getApp();
    const theme = (app.globalData && app.globalData.theme) || wx.getStorageSync('theme') || 'skin-libai';
    this.setData({ themeClass: theme });
  },

  onUnload() {
    const app = getApp();
    if (this._onTheme) app.unsubscribeTheme(this._onTheme);
  },

  // 加載用戶數據
  loadUserData() {
    const recentItems = wx.getStorageSync('recentItems') || [];
    const filteredRecent = recentItems.filter(item => item.type !== 'browse');
    const historyCount = recentItems.length;
    const favCount = (wx.getStorageSync('favorites') || []).length;
    this.setData({ recentItems: filteredRecent, historyCount, favCount });
    this.updateStats();
  },

  // 更新统计数据
  updateStats() {
    const stats = {
      generated: wx.getStorageSync('generatedCount') || 0,
      optimized: wx.getStorageSync('optimizedCount') || 0
    };
    this.setData({ stats });
  },

  // 导航到生成页面
  navigateToGenerate() {
    wx.vibrateShort({ type: 'medium' });
    wx.switchTab({
      url: '/pages/generate/generate'
    });
  },

  // 导航到优化页面
  navigateToOptimize() {
    wx.vibrateShort({ type: 'medium' });
    wx.switchTab({
      url: '/pages/optimize/optimize'
    });
  },

  // 快捷操作：历史记录
  goHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  // 快捷操作：使用帮助
  goHelp() {
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },

  // 快捷操作：清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有本地缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            wx.showToast({ title: '缓存已清除', icon: 'success' });
            this.setData({ historyCount: 0, recentItems: [] });
          } catch (e) {
            wx.showToast({ title: '清除失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 快捷操作：VIP
  goVIP() {
    wx.navigateTo({
      url: '/pages/vip/vip'
    });
  },

  // 打开最近使用项目
  openRecent(e) {
    const item = e.currentTarget.dataset.item;
    const pageMap = {
      generate: '/pages/generate/generate',
      optimize: '/pages/optimize/optimize'
    };

    if (pageMap[item.type]) {
      wx.navigateTo({
        url: pageMap[item.type] + (item.params ? '?' + item.params : '')
      });
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '电竞文案优化 | 王者风格文案生成',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '电竞文案优化 | 王者风格文案生成',
      imageUrl: '/images/share.png'
    };
  }
});
