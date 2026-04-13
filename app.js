App({
  globalData: {
    userInfo: null,
    theme: 'skin-libai', // 主题设置：skin-libai, skin-diaochan, skin-lan, skin-caiwenji
    themeListeners: [],
    apiBaseUrl: 'https://api.example.com',
    version: '1.0.0'
  },

  onLaunch() {
    // 初始化主题
    this.initTheme();
    
    // 检查更新
    this.checkUpdate();
  },

  // 初始化主题
  initTheme() {
    const theme = wx.getStorageSync('theme') || 'skin-libai';
    this.globalData.theme = theme;
    this.applyTheme(theme);
  },

  // 应用主题
  applyTheme(theme) {
    this.globalData.theme = theme;
    wx.setStorageSync('theme', theme);
    
    // 动态设置导航栏颜色（固定为深色电竞风格）
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#0a0a12'
    });

    this.notifyThemeChanged(theme);
  },

  subscribeTheme(listener) {
    if (typeof listener === 'function') {
      this.globalData.themeListeners.push(listener);
    }
  },

  unsubscribeTheme(listener) {
    this.globalData.themeListeners = this.globalData.themeListeners.filter(l => l !== listener);
  },

  notifyThemeChanged(theme) {
    (this.globalData.themeListeners || []).forEach(fn => {
      try { fn(theme); } catch (e) {}
    });
  },

  // 获取当前主题颜色
  getThemeColors(theme) {
    const themes = {
      'skin-libai': {
        primary: '#6366f1',
        primaryLight: '#818cf8',
        primaryGlow: 'rgba(99, 102, 241, 0.5)',
        accent: '#c4b5fd',
        bgStart: '#0a0a12',
        bgEnd: '#0d0d18',
        cardBg: 'rgba(30, 30, 50, 0.6)',
        cardBorder: 'rgba(99, 102, 241, 0.3)'
      },
      'skin-diaochan': {
        primary: '#ec4899',
        primaryLight: '#f472b6',
        primaryGlow: 'rgba(236, 72, 153, 0.5)',
        accent: '#fbcfe8',
        bgStart: '#1a0a14',
        bgEnd: '#2d1f3d',
        cardBg: 'rgba(50, 30, 40, 0.6)',
        cardBorder: 'rgba(236, 72, 153, 0.3)'
      },
      'skin-lan': {
        primary: '#0891b2',
        primaryLight: '#06b6d4',
        primaryGlow: 'rgba(8, 145, 178, 0.5)',
        accent: '#a5f3fc',
        bgStart: '#061018',
        bgEnd: '#0c1a2e',
        cardBg: 'rgba(20, 40, 50, 0.6)',
        cardBorder: 'rgba(8, 145, 178, 0.3)'
      },
      'skin-caiwenji': {
        primary: '#f59e0b',
        primaryLight: '#fbbf24',
        primaryGlow: 'rgba(245, 158, 11, 0.5)',
        accent: '#fef3c7',
        bgStart: '#1a1008',
        bgEnd: '#2d2410',
        cardBg: 'rgba(50, 40, 20, 0.6)',
        cardBorder: 'rgba(245, 158, 11, 0.3)'
      }
    };
    return themes[theme] || themes['skin-libai'];
  },

  // 检查更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
        }
      });
    }
  }
});
