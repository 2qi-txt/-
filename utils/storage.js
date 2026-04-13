// 本地存儲工具類
class StorageService {
  // 保存文案
  static saveContent(content) {
    try {
      let contents = wx.getStorageSync('contents') || [];
      content.id = Date.now();
      content.time = new Date().toLocaleString();
      contents.unshift(content);
      
      // 只保留最近100條
      if (contents.length > 100) {
        contents = contents.slice(0, 100);
      }
      
      wx.setStorageSync('contents', contents);
      return true;
    } catch (error) {
      console.error('保存文案失败:', error);
      return false;
    }
  }

  // 獲取文案列表
  static getContents(filter = 'all') {
    try {
      let contents = wx.getStorageSync('contents') || [];
      
      if (filter === 'generated') {
        contents = contents.filter(item => item.type === 'generated');
      } else if (filter === 'optimized') {
        contents = contents.filter(item => item.type === 'optimized');
      } else if (filter === 'favorites') {
        contents = contents.filter(item => item.isFavorite);
      }
      
      return contents;
    } catch (error) {
      console.error('获取文案列表失败:', error);
      return [];
    }
  }

  // 搜索文案
  static searchContents(keyword) {
    try {
      const contents = wx.getStorageSync('contents') || [];
      return contents.filter(item => 
        item.title.includes(keyword) || 
        item.content.includes(keyword)
      );
    } catch (error) {
      console.error('搜索文案失败:', error);
      return [];
    }
  }

  // 保存收藏
  static saveFavorite(contentId) {
    try {
      let favorites = wx.getStorageSync('favorites') || [];
      if (!favorites.includes(contentId)) {
        favorites.push(contentId);
        wx.setStorageSync('favorites', favorites);
      }
      return true;
    } catch (error) {
      console.error('保存收藏失败:', error);
      return false;
    }
  }

  // 取消收藏
  static removeFavorite(contentId) {
    try {
      let favorites = wx.getStorageSync('favorites') || [];
      favorites = favorites.filter(id => id !== contentId);
      wx.setStorageSync('favorites', favorites);
      return true;
    } catch (error) {
      console.error('取消收藏失败:', error);
      return false;
    }
  }

  // 獲取收藏列表
  static getFavorites() {
    try {
      const favorites = wx.getStorageSync('favorites') || [];
      const contents = wx.getStorageSync('contents') || [];
      return contents.filter(item => favorites.includes(item.id));
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      return [];
    }
  }

  // 保存設置
  static saveSettings(settings) {
    try {
      wx.setStorageSync('settings', settings);
      return true;
    } catch (error) {
      console.error('保存设置失败:', error);
      return false;
    }
  }

  // 獲取設置
  static getSettings() {
    try {
      return wx.getStorageSync('settings') || {
        notifications: true,
        autoSave: true,
        smartRecommend: true
      };
    } catch (error) {
      console.error('获取设置失败:', error);
      return {
        notifications: true,
        autoSave: true,
        smartRecommend: true
      };
    }
  }

  // 保存主題
  static saveTheme(theme) {
    try {
      wx.setStorageSync('theme', theme);
      return true;
    } catch (error) {
      console.error('保存主题失败:', error);
      return false;
    }
  }

  // 獲取主題
  static getTheme() {
    try {
      return wx.getStorageSync('theme') || 'light';
    } catch (error) {
      console.error('获取主题失败:', error);
      return 'light';
    }
  }

  // 更新統計
  static updateStats(type) {
    try {
      const key = `${type}Count`;
      const count = wx.getStorageSync(key) || 0;
      wx.setStorageSync(key, count + 1);
      return true;
    } catch (error) {
      console.error('更新统计失败:', error);
      return false;
    }
  }

  // 獲取統計
  static getStats() {
    try {
      return {
        generated: wx.getStorageSync('generatedCount') || 0,
        optimized: wx.getStorageSync('optimizedCount') || 0,
        browsed: wx.getStorageSync('browsedCount') || 0,
        favorites: (wx.getStorageSync('favorites') || []).length
      };
    } catch (error) {
      console.error('获取统计失败:', error);
      return {
        generated: 0,
        optimized: 0,
        browsed: 0,
        favorites: 0
      };
    }
  }

  // 清理緩存
  static clearCache() {
    try {
      // 保留重要數據，只清理緩存
      const importantKeys = ['settings', 'theme', 'contents', 'favorites'];
      const allKeys = wx.getStorageInfoSync().keys;
      
      allKeys.forEach(key => {
        if (!importantKeys.includes(key)) {
          wx.removeStorageSync(key);
        }
      });
      
      return true;
    } catch (error) {
      console.error('清理缓存失败:', error);
      return false;
    }
  }

  // 導出數據
  static exportData() {
    try {
      const data = {
        contents: wx.getStorageSync('contents') || [],
        favorites: wx.getStorageSync('favorites') || [],
        settings: wx.getStorageSync('settings') || {},
        stats: this.getStats(),
        exportTime: new Date().toISOString()
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('导出数据失败:', error);
      return null;
    }
  }

  // 導入數據
  static importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.contents) {
        wx.setStorageSync('contents', data.contents);
      }
      if (data.favorites) {
        wx.setStorageSync('favorites', data.favorites);
      }
      if (data.settings) {
        wx.setStorageSync('settings', data.settings);
      }
      
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}

module.exports = StorageService;




