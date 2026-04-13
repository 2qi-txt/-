// 主題管理工具類
class ThemeService {
  // 主題配置（全面改造为王者荣耀电竞风格）
  static themes = {
    light: {
      name: '荣耀金',
      primaryColor: '#fbbf24',
      secondaryColor: '#7e22ce',
      accentColor: '#c29c4a',
      textColor: '#fde68a',
      bgColor: '#0a0a12',
      cardBg: '#0f0f17',
      borderColor: '#c29c4a',
      shadow: '0 0 20rpx rgba(251, 191, 36, 0.3)'
    },
    dark: {
      name: '永夜紫',
      primaryColor: '#7e22ce',
      secondaryColor: '#fbbf24',
      accentColor: '#4c1d95',
      textColor: '#e2e8f0',
      bgColor: '#0a0a12',
      cardBg: '#0f0f17',
      borderColor: '#7e22ce',
      shadow: '0 0 20rpx rgba(126, 34, 206, 0.3)'
    },
    colorful: {
      name: '传说红',
      primaryColor: '#ef4444',
      secondaryColor: '#fbbf24',
      accentColor: '#991b1b',
      textColor: '#fee2e2',
      bgColor: '#0a0a12',
      cardBg: '#0f0f17',
      borderColor: '#ef4444',
      shadow: '0 0 20rpx rgba(239, 68, 68, 0.3)'
    }
  };

  // 應用主題
  static applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) {
      console.error('未知主题:', themeName);
      return false;
    }

    try {
      // 保存主题设置
      wx.setStorageSync('theme', themeName);
      
      // 动态设置导航栏颜色
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#0f0f17'
      });

      // 设置状态栏样式
      wx.setNavigationBarTitle({
        title: '电竞文案助手'
      });

      return true;
    } catch (error) {
      console.error('应用主题失败:', error);
      return false;
    }
  }

  // 获取当前主题
  static getCurrentTheme() {
    try {
      return wx.getStorageSync('theme') || 'light';
    } catch (error) {
      console.error('获取当前主题失败:', error);
      return 'light';
    }
  }

  // 獲取主題配置
  static getThemeConfig(themeName) {
    return this.themes[themeName] || this.themes.light;
  }

  // 獲取所有主題
  static getAllThemes() {
    return Object.keys(this.themes).map(key => ({
      key,
      ...this.themes[key]
    }));
  }

  // 初始化主題
  static initTheme() {
    const currentTheme = this.getCurrentTheme();
    return this.applyTheme(currentTheme);
  }

  // 切换主题
  static switchTheme(themeName) {
    if (!this.themes[themeName]) {
      console.error('主题不存在:', themeName);
      return false;
    }

    return this.applyTheme(themeName);
  }

  // 获取主题CSS变量
  static getThemeCSS(themeName) {
    const theme = this.getThemeConfig(themeName);
    return `
      --primary-color: ${theme.primaryColor};
      --secondary-color: ${theme.secondaryColor};
      --accent-color: ${theme.accentColor};
      --text-color: ${theme.textColor};
      --bg-color: ${theme.bgColor};
      --card-bg: ${theme.cardBg};
      --border-color: ${theme.borderColor};
      --shadow: ${theme.shadow};
    `;
  }

  // 动态更新页面样式
  static updatePageStyle(themeName) {
    const theme = this.getThemeConfig(themeName);
    
    // 这里可以动态更新页面的CSS变量
    // 由于小程序限制，主要通过重新渲染页面来实现主题切换
    return theme;
  }

  // 预览主题
  static previewTheme(themeName) {
    const theme = this.getThemeConfig(themeName);
    
    // 创建主题预览数据
    return {
      name: theme.name,
      colors: {
        primary: theme.primaryColor,
        secondary: theme.secondaryColor,
        accent: theme.accentColor,
        text: theme.textColor,
        background: theme.bgColor,
        card: theme.cardBg
      }
    };
  }

  // 自定义主题
  static createCustomTheme(themeData) {
    const customTheme = {
      name: themeData.name || '自定义主题',
      primaryColor: themeData.primaryColor || '#4A90E2',
      secondaryColor: themeData.secondaryColor || '#7ED321',
      accentColor: themeData.accentColor || '#FF6B6B',
      textColor: themeData.textColor || '#333333',
      bgColor: themeData.bgColor || '#f8f9fa',
      cardBg: themeData.cardBg || '#ffffff',
      borderColor: themeData.borderColor || '#e1e5e9',
      shadow: themeData.shadow || '0 2px 8px rgba(0, 0, 0, 0.1)'
    };

    // 保存自定义主题
    try {
      const customThemes = wx.getStorageSync('customThemes') || {};
      customThemes[themeData.name] = customTheme;
      wx.setStorageSync('customThemes', customThemes);
      return true;
    } catch (error) {
      console.error('保存自定义主题失败:', error);
      return false;
    }
  }

  // 获取自定义主题
  static getCustomThemes() {
    try {
      return wx.getStorageSync('customThemes') || {};
    } catch (error) {
      console.error('获取自定义主题失败:', error);
      return {};
    }
  }
}

module.exports = ThemeService;




