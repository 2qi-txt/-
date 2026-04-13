/**
 * 本地存储服务 - 对应原小程序的 wx.getStorageSync / wx.setStorageSync
 */

class StorageService {
    static save(key, data) {
        try {
            const jsonStr = JSON.stringify(data);
            localStorage.setItem(key, jsonStr);
            return true;
        } catch (error) {
            console.error('保存失败:', error);
            return false;
        }
    }

    static get(key, defaultValue = null) {
        try {
            const jsonStr = localStorage.getItem(key);
            if (jsonStr === null) return defaultValue;
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('读取失败:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            return false;
        }
    }

    // 保存文案
    static saveContent(content) {
        let contents = this.get('contents') || [];
        content.id = Date.now();
        content.time = new Date().toLocaleString();
        contents.unshift(content);
        if (contents.length > 100) {
            contents = contents.slice(0, 100);
        }
        return this.save('contents', contents);
    }

    // 获取文案列表
    static getContents(filter = 'all') {
        let contents = this.get('contents') || [];
        
        if (filter === 'generated') {
            contents = contents.filter(item => item.type === 'generated');
        } else if (filter === 'optimized') {
            contents = contents.filter(item => item.type === 'optimized');
        } else if (filter === 'favorites') {
            contents = contents.filter(item => item.isFavorite);
        }
        
        return contents;
    }

    // 搜索文案
    static searchContents(keyword) {
        const contents = this.get('contents') || [];
        return contents.filter(item => 
            (item.title && item.title.includes(keyword)) || 
            (item.content && item.content.includes(keyword))
        );
    }

    // 保存收藏
    static saveFavorite(contentId) {
        let favorites = this.get('favorites') || [];
        if (!favorites.includes(contentId)) {
            favorites.push(contentId);
            this.save('favorites', favorites);
        }
        return true;
    }

    // 取消收藏
    static removeFavorite(contentId) {
        let favorites = this.get('favorites') || [];
        favorites = favorites.filter(id => id !== contentId);
        return this.save('favorites', favorites);
    }

    // 获取收藏列表
    static getFavorites() {
        const favorites = this.get('favorites') || [];
        const contents = this.get('contents') || [];
        return contents.filter(item => favorites.includes(item.id));
    }

    // 保存设置
    static saveSettings(settings) {
        return this.save('settings', settings);
    }

    // 获取设置
    static getSettings() {
        return this.get('settings', {
            notifications: true,
            autoSave: true,
            smartRecommend: true
        });
    }

    // 保存主题
    static saveTheme(theme) {
        return this.save('theme', theme);
    }

    // 获取主题
    static getTheme() {
        return this.get('theme', 'light');
    }

    // 更新统计
    static updateStats(type) {
        const key = `${type}Count`;
        const count = this.get(key) || 0;
        return this.save(key, count + 1);
    }

    // 获取统计
    static getStats() {
        return {
            generated: this.get('generatedCount') || 0,
            optimized: this.get('optimizedCount') || 0,
            browsed: this.get('browsedCount') || 0,
            favorites: (this.get('favorites') || []).length
        };
    }

    // 清理缓存
    static clearCache() {
        const importantKeys = ['settings', 'theme', 'contents', 'favorites', 'userProfile', 'vipStatus'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!importantKeys.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        return true;
    }

    // 导出数据
    static exportData() {
        const data = {
            contents: this.get('contents') || [],
            favorites: this.get('favorites') || [],
            settings: this.get('settings') || {},
            stats: this.getStats(),
            exportTime: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    // 导入数据
    static importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.contents) this.save('contents', data.contents);
            if (data.favorites) this.save('favorites', data.favorites);
            if (data.settings) this.save('settings', data.settings);
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    // 保存VIP状态
    static saveVipStatus(status) {
        return this.save('vipStatus', status);
    }

    // 获取VIP状态
    static getVipStatus() {
        const now = new Date().toDateString();
        let s = this.get('vipStatus') || {
            isVip: false,
            vipLevel: '',
            expireTime: '',
            dailyQuota: { generate: 10, optimize: 10 },
            usedToday: { generate: 0, optimize: 0 },
            lastDate: now
        };
        
        if (s.lastDate !== now) {
            s.usedToday = { generate: 0, optimize: 0 };
            s.lastDate = now;
            this.save('vipStatus', s);
        }
        
        return s;
    }

    // 保存用户资料
    static saveUserProfile(profile) {
        return this.save('userProfile', profile);
    }

    // 获取用户资料
    static getUserProfile() {
        return this.get('userProfile', {
            nickName: '最强召唤师',
            avatarUrl: '',
            desc: ''
        });
    }

    // 保存最近使用
    static saveRecentItem(item) {
        let recentItems = this.get('recentItems') || [];
        recentItems.unshift(item);
        if (recentItems.length > 10) {
            recentItems = recentItems.slice(0, 10);
        }
        return this.save('recentItems', recentItems);
    }

    // 获取最近使用
    static getRecentItems() {
        const recentItems = this.get('recentItems') || [];
        return recentItems.filter(item => item.type !== 'browse');
    }

    // 保存反馈列表
    static saveFeedbackItem(item) {
        let list = this.get('feedbackItems') || [];
        list.unshift(item);
        if (list.length > 20) list = list.slice(0, 20);
        return this.save('feedbackItems', list);
    }

    // 获取反馈列表
    static getFeedbackItems() {
        return this.get('feedbackItems') || [];
    }
}

window.StorageService = StorageService;
