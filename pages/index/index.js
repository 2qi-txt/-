Page({
    data: {
      themeClass: '',
      recentItems: [],
      stats: {
        generated: 0,
        optimized: 0
      }
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
      // 加載最近使用記錄
      const recentItems = wx.getStorageSync('recentItems') || [];
      // 过滤掉类型为 browse 的最近使用记录
      const filteredRecent = recentItems.filter(item => item.type !== 'browse');
      this.setData({ recentItems: filteredRecent });
  
      // 加载统计数据
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
  
    // 快速生成 - 直接跳转
    quickGenerate(e) {
      wx.vibrateShort({ type: 'light' });
      const type = e.currentTarget.dataset.type;
      wx.navigateTo({
        url: `/pages/generate/generate?type=${type}`
      });
    },
  
    // 打开最近使用项目（移除 browse 相关逻辑）
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