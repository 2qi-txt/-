/**
 * 个人设置页 - 页面组件
 * 对应原小程序: pages/settings/settings.js
 */

class SettingsPage extends BasePage {
    constructor(params = {}) {
        super(params);
        this.state = {
            userProfile: null,
            currentTheme: 'light'
        };
        this._bindMethods();
    }

    _bindMethods() {
        this.changeTheme = this.changeTheme.bind(this);
        this.clearCache = this.clearCache.bind(this);
        this.exportData = this.exportData.bind(this);
        this.importData = this.importData.bind(this);
    }

    onLoad() {
        this.state.userProfile = StorageService.getUserProfile();
        this.state.currentTheme = StorageService.getTheme();
    }

    onShow() {
        this.state.userProfile = StorageService.getUserProfile();
    }

    async changeTheme(e) {
        const theme = e.currentTarget.dataset.theme;
        this.state.currentTheme = theme;
        StorageService.saveTheme(theme);
        ThemeService.applyTheme(theme);
        this.render();
        this.showToast('主题切换成功');
    }

    async clearCache() {
        const result = await this.showModal({
            title: '清理缓存',
            content: '确定要清理所有缓存数据吗？',
            confirmText: '确定',
            cancelText: '取消'
        });

        if (result.confirm) {
            StorageService.clearCache();
            this.showToast('缓存清理成功');
        }
    }

    exportData() {
        const data = StorageService.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('数据导出成功');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const result = StorageService.importData(evt.target.result);
                    if (result) {
                        this.showToast('数据导入成功');
                        this.onLoad();
                        this.render();
                    } else {
                        this.showToast('数据导入失败', 'none');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    render(container) {
        const { userProfile, currentTheme } = this.state;
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        targetContainer.innerHTML = `
            <div class="container page-enter">
                <div class="page-header">
                    <div class="page-title gold-text">个人中心</div>
                </div>

                <!-- 用户卡片 -->
                <div class="card user-card">
                    <div class="user-info">
                        <div class="user-avatar" data-navigate="profile-edit">
                            ${userProfile?.avatarUrl ? 
                                `<img src="${userProfile.avatarUrl}" alt="头像" />` : 
                                '<span class="avatar-placeholder">👤</span>'
                            }
                        </div>
                        <div class="user-details">
                            <div class="user-name">${userProfile?.nickName || '最强召唤师'}</div>
                            <div class="user-desc">${userProfile?.desc || '这个人很懒，什么都没写'}</div>
                        </div>
                        <div class="edit-icon" data-navigate="profile-edit">✏️</div>
                    </div>
                </div>

                <!-- 主题切换 -->
                <div class="section-header">
                    <span class="header-text">主题风格</span>
                </div>
                <div class="card">
                    <div class="theme-grid">
                        <div class="theme-item ${currentTheme === 'light' ? 'active' : ''}" data-theme="light">
                            <div class="theme-preview light-preview"></div>
                            <div class="theme-name">经典电竞</div>
                        </div>
                        <div class="theme-item ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark">
                            <div class="theme-preview dark-preview"></div>
                            <div class="theme-name">暗夜战神</div>
                        </div>
                        <div class="theme-item ${currentTheme === 'colorful' ? 'active' : ''}" data-theme="colorful">
                            <div class="theme-preview colorful-preview"></div>
                            <div class="theme-name">炫彩霓虹</div>
                        </div>
                    </div>
                </div>

                <!-- 赛季统计 -->
                <div class="section-header">
                    <span class="header-text">赛季数据</span>
                </div>
                <div class="card season-card">
                    <div class="season-rank-display">
                        <div class="rank-badge">永恒钻石</div>
                        <div class="rank-title">当前段位</div>
                    </div>
                    <div class="season-stats-grid">
                        <div class="stats-item">
                            <div class="stats-value gold-text">${StorageService.get('generatedCount') || 0}</div>
                            <div class="stats-label">总生成</div>
                        </div>
                        <div class="stats-item">
                            <div class="stats-value gold-text">${StorageService.get('optimizedCount') || 0}</div>
                            <div class="stats-label">总优化</div>
                        </div>
                        <div class="stats-item">
                            <div class="stats-value gold-text">${StorageService.get('favorites')?.length || 0}</div>
                            <div class="stats-label">收藏数</div>
                        </div>
                    </div>
                </div>

                <!-- 功能菜单 -->
                <div class="section-header">
                    <span class="header-text">更多功能</span>
                </div>
                <div class="card menu-card">
                    <div class="menu-item" data-navigate="feedback">
                        <span class="menu-icon">💬</span>
                        <span class="menu-text">意见反馈</span>
                        <span class="menu-arrow">▶</span>
                    </div>
                    <div class="menu-item" data-navigate="help">
                        <span class="menu-icon">❓</span>
                        <span class="menu-text">帮助中心</span>
                        <span class="menu-arrow">▶</span>
                    </div>
                    <div class="menu-item" data-navigate="privacy">
                        <span class="menu-icon">🔒</span>
                        <span class="menu-text">隐私政策</span>
                        <span class="menu-arrow">▶</span>
                    </div>
                </div>

                <!-- 数据管理 -->
                <div class="section-header">
                    <span class="header-text">数据管理</span>
                </div>
                <div class="card menu-card">
                    <div class="menu-item" data-action="export">
                        <span class="menu-icon">📤</span>
                        <span class="menu-text">导出数据</span>
                        <span class="menu-arrow">▶</span>
                    </div>
                    <div class="menu-item" data-action="import">
                        <span class="menu-icon">📥</span>
                        <span class="menu-text">导入数据</span>
                        <span class="menu-arrow">▶</span>
                    </div>
                    <div class="menu-item" data-action="clear">
                        <span class="menu-icon">🗑️</span>
                        <span class="menu-text">清理缓存</span>
                        <span class="menu-arrow">▶</span>
                    </div>
                </div>

                <div class="version-info">
                    <div>峡谷文案工坊 v1.0.0</div>
                    <div>Powered by AI</div>
                </div>
            </div>
        `;

        this._bindEvents(targetContainer);
    }

    _bindEvents(container) {
        container.querySelectorAll('[data-navigate]').forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.navigate;
                if (page) this.navigate(page);
            });
        });

        container.querySelectorAll('.theme-item').forEach(item => {
            item.addEventListener('click', this.changeTheme);
        });

        const exportBtn = container.querySelector('[data-action="export"]');
        if (exportBtn) {
            exportBtn.style.cursor = 'pointer';
            exportBtn.addEventListener('click', this.exportData);
        }

        const importBtn = container.querySelector('[data-action="import"]');
        if (importBtn) {
            importBtn.style.cursor = 'pointer';
            importBtn.addEventListener('click', this.importData);
        }

        const clearBtn = container.querySelector('[data-action="clear"]');
        if (clearBtn) {
            clearBtn.style.cursor = 'pointer';
            clearBtn.addEventListener('click', this.clearCache);
        }
    }
}

window.SettingsPage = SettingsPage;
