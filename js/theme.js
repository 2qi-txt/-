/**
 * 主题管理服务 - 王者荣耀电竞风格主题
 */

class ThemeService {
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
            shadow: '0 0 20px rgba(251, 191, 36, 0.3)'
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
            shadow: '0 0 20px rgba(126, 34, 206, 0.3)'
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
            shadow: '0 0 20px rgba(239, 68, 68, 0.3)'
        }
    };

    static currentTheme = 'light';

    static init() {
        this.currentTheme = window.StorageService.getTheme() || 'light';
        this.applyTheme(this.currentTheme);
    }

    static applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return false;
        this.currentTheme = themeName;
        window.StorageService.saveTheme(themeName);
        const root = document.documentElement;
        root.style.setProperty('--primary-gold', theme.primaryColor);
        root.style.setProperty('--primary-purple', theme.secondaryColor);
        root.style.setProperty('--deep-black', theme.cardBg);
        root.style.setProperty('--bg-black', theme.bgColor);
        root.style.setProperty('--border-gold', theme.borderColor);
        root.style.setProperty('--text-gold', theme.textColor);
        document.body.className = themeName + '-theme';
        return true;
    }

    static getCurrentTheme() {
        return this.currentTheme;
    }

    static switchTheme(themeName) {
        if (!this.themes[themeName]) return false;
        return this.applyTheme(themeName);
    }

    static listeners = [];

    static subscribe(listener) {
        if (typeof listener === 'function') this.listeners.push(listener);
    }

    static unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }
}

window.ThemeService = ThemeService;
