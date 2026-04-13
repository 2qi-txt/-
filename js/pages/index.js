/**
 * 首页 - 页面组件
 * 对应原小程序: pages/index/index.js
 */

class IndexPage extends BasePage {
    constructor(params = {}) {
        super(params);
        this.state = {
            recentItems: [],
            stats: { generated: 0, optimized: 0 },
            themeClass: ''
        };
    }

    onLoad() {
        this.loadData();
        this.updateThemeClass();
    }

    onShow() {
        this.loadData();
        this.render();
    }

    loadData() {
        this.state.recentItems = StorageService.getRecentItems();
        this.state.stats = {
            generated: StorageService.get('generatedCount') || 0,
            optimized: StorageService.get('optimizedCount') || 0
        };
    }

    updateThemeClass() {
        const theme = StorageService.getTheme();
        const cls = theme === 'dark' ? 'dark-theme' : theme === 'colorful' ? 'colorful-theme' : '';
        this.state.themeClass = cls;
    }

    render(container) {
        const { recentItems, stats, themeClass } = this.state;
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        targetContainer.innerHTML = `
            <div class="container page-enter ${themeClass} index-page">
                <!-- Banner 区域 -->
                <div class="banner">
                    <div class="banner-content">
                        <div>
                            <div class="banner-title">峡谷文案</div>
                            <div class="banner-subtitle">电竞版 · ESPORTS</div>
                        </div>
                        <div class="banner-stats">
                            <div class="stat-item">
                                <div class="stat-value">${stats.generated}</div>
                                <div class="stat-label">生成</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${stats.optimized}</div>
                                <div class="stat-label">优化</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 功能导航 -->
                <div class="nav-grid">
                    <div class="nav-item" data-navigate="generate">
                        <div class="nav-icon">📝</div>
                        <div class="nav-text">文案生成</div>
                    </div>
                    <div class="nav-item" data-navigate="optimize">
                        <div class="nav-icon">🛡️</div>
                        <div class="nav-text">文案优化</div>
                    </div>
                    <div class="nav-item" data-navigate="vip">
                        <div class="nav-icon">👑</div>
                        <div class="nav-text">VIP中心</div>
                    </div>
                    <div class="nav-item" data-navigate="settings">
                        <div class="nav-icon">⚙️</div>
                        <div class="nav-text">设置</div>
                    </div>
                </div>

                <!-- 模式选择 -->
                <div class="mode-section">
                    <div class="section-header">
                        <span class="header-text">快速进入</span>
                    </div>
                    <div class="mode-grid">
                        <div class="mode-card official" data-navigate="generate" data-params='{"type":"notice"}'>
                            <div class="mode-icon">📢</div>
                            <div class="mode-title">导员通知</div>
                            <div class="mode-desc">班级通知文案</div>
                        </div>
                        <div class="mode-card" data-navigate="generate" data-params='{"type":"announcement"}'>
                            <div class="mode-icon">📋</div>
                            <div class="mode-title">公告通知</div>
                            <div class="mode-desc">官方公告文案</div>
                        </div>
                        <div class="mode-card" data-navigate="generate" data-params='{"type":"club"}'>
                            <div class="mode-icon">🎭</div>
                            <div class="mode-title">社团事务</div>
                            <div class="mode-desc">社团活动文案</div>
                        </div>
                        <div class="mode-card" data-navigate="generate" data-params='{"type":"social"}'>
                            <div class="mode-icon">📱</div>
                            <div class="mode-title">社交平台</div>
                            <div class="mode-desc">朋友圈/微博</div>
                        </div>
                    </div>
                </div>

                <!-- 最近使用 -->
                ${recentItems.length > 0 ? `
                <div class="recent-section">
                    <div class="section-header">
                        <span class="header-text">最近战绩</span>
                    </div>
                    <div class="recent-list">
                        ${recentItems.slice(0, 5).map(item => `
                            <div class="recent-item" data-navigate="${item.type === 'generate' ? 'generate' : 'optimize'}">
                                <div class="recent-icon">${item.type === 'generate' ? '📝' : '🛡️'}</div>
                                <div class="recent-content">
                                    <div class="recent-title">${item.title || '未命名文案'}</div>
                                    <div class="recent-time">${item.time}</div>
                                </div>
                                <div class="recent-arrow">▶</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- 赛季统计 -->
                <div class="season-section">
                    <div class="season-card card">
                        <div class="season-header">
                            <span class="season-title">赛季统计</span>
                            <span class="season-rank">永恒钻石</span>
                        </div>
                        <div class="season-stats">
                            <div class="season-stat">
                                <div class="season-stat-value gold-text">${stats.generated}</div>
                                <div class="season-stat-label">击败灵感荒漠</div>
                            </div>
                            <div class="season-stat">
                                <div class="season-stat-value gold-text">${stats.optimized}</div>
                                <div class="season-stat-label">文案助攻数</div>
                            </div>
                            <div class="season-stat">
                                <div class="season-stat-value gold-text">${StorageService.get('favorites')?.length || 0}</div>
                                <div class="season-stat-label">收藏勋章</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 快速入口 -->
                <div class="quick-section">
                    <div class="section-header">
                        <span class="header-text">快捷入口</span>
                    </div>
                    <div class="quick-links">
                        <div class="quick-link" data-navigate="feedback">
                            <div class="quick-icon">💬</div>
                            <div class="quick-text">意见反馈</div>
                        </div>
                        <div class="quick-link" data-navigate="help">
                            <div class="quick-icon">❓</div>
                            <div class="quick-text">帮助中心</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

window.IndexPage = IndexPage;
