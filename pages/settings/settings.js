const app = getApp();
const StorageService = require('../../utils/storage.js');

Page({
  data: {
    themeClass: '',
    currentTheme: 'skin-libai',
    userInfo: {},
    showEditModal: false,
    editForm: {
      nickName: '',
      avatarUrl: '',
      desc: ''
    },
    settings: {
      notifications: true,
      autoSave: true,
      smartRecommend: true
    },
    stats: {
      generated: 0,
      optimized: 0,
      browsed: 0,
      favorites: 0,
      days: 0,
      daily: 0
    },
    appVersion: '1.0.0'
  },

  onLoad() {
    this.loadUserData();
    this.loadSettings();
    this.loadStats();
    this.updateThemeClass();
    const app = getApp();
    this._onTheme = (t) => this.updateThemeClass();
    app.subscribeTheme(this._onTheme);
  },

  onShow() {
    this.updateThemeClass();
    this.loadUserData();
  },

  // 加载用户数据
  loadUserData() {
    const stored = wx.getStorageSync('userProfile');
    if (stored && (stored.nickName || stored.avatarUrl)) {
      this.setData({ userInfo: stored });
      return;
    }
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({ userInfo: res.userInfo });
        wx.setStorageSync('userProfile', res.userInfo);
      },
      fail: () => {
        this.setData({
          userInfo: {
            nickName: '召唤师',
            avatarUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
            desc: ''
          }
        });
      }
    });
  },

  // 加载设置
  loadSettings() {
    const theme = wx.getStorageSync('theme') || 'skin-libai';
    const settings = wx.getStorageSync('settings') || this.data.settings;
    
    this.setData({
      currentTheme: theme,
      settings: settings
    });
    this.updateThemeClass();
  },

  // 加载统计数据
  loadStats() {
    const stats = {
      generated: wx.getStorageSync('generatedCount') || 0,
      optimized: wx.getStorageSync('optimizedCount') || 0,
      browsed: wx.getStorageSync('browsedCount') || 0,
      favorites: (wx.getStorageSync('favorites') || []).length,
      days: this.calculateDays(),
      daily: this.calculateDaily()
    };
    
    this.setData({ stats });
  },

  calculateDays() {
    const firstUse = wx.getStorageSync('firstUseDate');
    if (firstUse) {
      const now = new Date();
      const first = new Date(firstUse);
      return Math.ceil((now - first) / (1000 * 60 * 60 * 24));
    }
    return 1;
  },

  calculateDaily() {
    const days = this.calculateDays();
    const total = this.data.stats.generated + this.data.stats.optimized + this.data.stats.browsed;
    return days > 0 ? Math.round(total / days) : 0;
  },

  // 编辑个人资料
  editProfile() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    });
  },

  // 选择主题
  selectTheme(e) {
    const theme = e.currentTarget.dataset.theme;
    wx.vibrateShort({ type: 'light' });
    
    this.setData({ currentTheme: theme });
    app.applyTheme(theme);
    
    wx.showToast({
      title: '主题已切换',
      icon: 'success'
    });
  },

  updateThemeClass() {
    const app = getApp();
    const theme = (app.globalData && app.globalData.theme) || this.data.currentTheme || wx.getStorageSync('theme') || 'skin-libai';
    this.setData({ currentTheme: theme });
  },

  onUnload() {
    const app = getApp();
    if (this._onTheme) app.unsubscribeTheme(this._onTheme);
  },

  // 切换通知设置
  toggleNotifications(e) {
    const value = e.detail.value;
    this.setData({
      'settings.notifications': value
    });
    this.saveSettings();
  },

  // 切换自动保存
  toggleAutoSave(e) {
    const value = e.detail.value;
    this.setData({
      'settings.autoSave': value
    });
    this.saveSettings();
  },

  // 保存设置
  saveSettings() {
    wx.setStorageSync('settings', this.data.settings);
  },

  // 清理缓存
  clearCache() {
    wx.showModal({
      title: '清理缓存',
      content: '确定要清理应用缓存吗？这不会影响你的文案数据。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '清理中...'
          });
          
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '缓存已清理',
              icon: 'success'
            });
          }, 2000);
        }
      }
    });
  },

  // 导出数据
  exportData() {
    const json = StorageService.exportData();
    wx.setClipboardData({
      data: json,
      success: () => {
        wx.showModal({
          title: '导出数据',
          content: '已复制数据到剪贴板，可在其他设备粘贴导入。',
          showCancel: false
        });
      }
    });
  },

  // 导入数据
  importData() {
    wx.getClipboardData({
      success: (res) => {
        try {
          StorageService.importData(res.data || '{}');
          wx.showModal({
            title: '导入数据',
            content: '导入完成',
            showCancel: false
          });
        } catch (e) {
          wx.showModal({
            title: '导入失败',
            content: '请检查剪贴板内容是否为有效JSON。',
            showCancel: false
          });
        }
      }
    });
  },

  // 检查更新
  checkUpdate() {
    wx.showLoading({
      title: '检查中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '检查更新',
        content: '当前已是最新版本！',
        showCancel: false
      });
    }, 1500);
  },

  // 重置设置
  resetSettings() {
    wx.showModal({
      title: '重置设置',
      content: '确定要重置所有设置吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          const defaultSettings = {
            notifications: true,
            autoSave: true,
            smartRecommend: true
          };
          
          this.setData({
            settings: defaultSettings,
            currentTheme: 'skin-libai'
          });
          
          wx.setStorageSync('settings', defaultSettings);
          wx.setStorageSync('theme', 'skin-libai');
          
          app.applyTheme('skin-libai');
          
          wx.showToast({
            title: '设置已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '电竞文案优化 | 王者风格文案生成',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    };
  },

  navigateToVip() {
    wx.navigateTo({ url: '/pages/vip/vip' });
  },

  navigateToFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },

  navigateToPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' });
  },

  navigateToHelp() {
    wx.navigateTo({ url: '/pages/help/help' });
  }
});
