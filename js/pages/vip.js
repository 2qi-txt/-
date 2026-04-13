/**
 * VIP中心页 - 页面组件
 * 对应原小程序: pages/vip/vip.js
 * [接口4] http://127.0.0.1:8000/api/vip/info/
 * [接口5] http://127.0.0.1:8000/api/vip/recharge/
 * [接口6] http://127.0.0.1:8000/api/vip/pay/callback/
 */

class VipPage extends BasePage {
    constructor(params = {}) {
        super(params);
        this.state = {
            vipInfo: null,
            selectedPackage: null,
            isLoading: false
        };
        this._bindMethods();
    }

    _bindMethods() {
        this.selectPackage = this.selectPackage.bind(this);
        this.openVip = this.openVip.bind(this);
        this.checkVipStatus = this.checkVipStatus.bind(this);
    }

    onLoad() {
        this.checkVipStatus();
    }

    async checkVipStatus() {
        this.showLoading();
        try {
            // ===== [接口4] VIP信息查询 =====
            const res = await fetch('http://127.0.0.1:8000/api/vip/info/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: StorageService.get('userId') || 'guest'
                })
            });
            const result = await res.json();
            // ===== [接口4] 调用结束 =====

            this.hideLoading();
            if (result.success) {
                this.state.vipInfo = result.data;
                StorageService.saveVipStatus(result.data);
            } else {
                this.state.vipInfo = StorageService.getVipStatus();
            }
        } catch (error) {
            this.hideLoading();
            this.state.vipInfo = StorageService.getVipStatus();
        }
        this.render();
    }

    selectPackage(e) {
        const pkg = e.currentTarget.dataset.package;
        this.state.selectedPackage = pkg;
        this.render();
    }

    async openVip() {
        if (!this.state.selectedPackage) {
            this.showToast('请选择套餐', 'none');
            return;
        }

        const result = await this.showModal({
            title: '开通VIP',
            content: `确定要开通 ${this.state.selectedPackage.name} 吗？`,
            confirmText: '确认开通'
        });

        if (result.confirm) {
            this.showLoading('正在跳转支付...');
            
            try {
                // ===== [接口5] VIP充值 =====
                const res = await fetch('http://127.0.0.1:8000/api/vip/recharge/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: StorageService.get('userId') || 'guest',
                        packageId: this.state.selectedPackage.id,
                        amount: this.state.selectedPackage.price
                    })
                });
                const resultData = await res.json();
                // ===== [接口5] 调用结束 =====

                this.hideLoading();

                if (resultData.success) {
                    // 模拟支付回调
                    await this.handlePayCallback(resultData.orderId);
                } else {
                    this.showToast(resultData.error || '开通失败', 'none');
                }
            } catch (error) {
                this.hideLoading();
                this.showToast('网络异常', 'none');
            }
        }
    }

    async handlePayCallback(orderId) {
        try {
            // ===== [接口6] 支付回调 =====
            const res = await fetch('http://127.0.0.1:8000/api/vip/pay/callback/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderId,
                    status: 'success'
                })
            });
            const result = await res.json();
            // ===== [接口6] 调用结束 =====

            if (result.success) {
                this.state.vipInfo = result.data;
                StorageService.saveVipStatus(result.data);
                this.showToast('VIP开通成功！');
                this.render();
            } else {
                this.showToast('支付验证失败', 'none');
            }
        } catch (error) {
            this.showToast('支付验证异常', 'none');
        }
    }

    render(container) {
        const { vipInfo, selectedPackage } = this.state;
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        const packages = [
            { id: 'monthly', name: '月卡会员', price: 9.9, days: 30, dailyQuota: 50, features: ['每日50次生成', '每日50次优化', '专属主题', '优先通道'] },
            { id: 'quarterly', name: '季卡会员', price: 29.9, days: 90, dailyQuota: 100, features: ['每日100次生成', '每日100次优化', '专属主题', '优先通道', '专属客服'] },
            { id: 'yearly', name: '年卡会员', price: 99.9, days: 365, dailyQuota: 200, features: ['每日200次生成', '每日200次优化', '专属主题', '优先通道', '专属客服', '免费升级'] }
        ];

        const isVip = vipInfo?.isVip || false;

        targetContainer.innerHTML = `
            <div class="container page-enter vip-page">
                <div class="vip-header">
                    <div class="vip-title">👑 VIP中心</div>
                    <div class="vip-subtitle">解锁全部功能，成为最强王者</div>
                </div>

                ${isVip ? `
                <div class="vip-status-card active">
                    <div class="vip-badge">尊贵VIP</div>
                    <div class="vip-expire">到期时间：${vipInfo.expireTime || '永久'}</div>
                    <div class="vip-quota">
                        <span>每日额度：${vipInfo.dailyQuota?.generate || 200}</span>
                        <span>已用：${vipInfo.usedToday?.generate || 0}</span>
                    </div>
                </div>
                ` : `
                <div class="vip-status-card">
                    <div class="vip-badge">普通召唤师</div>
                    <div class="vip-expire">每日免费额度有限</div>
                    <div class="vip-quota">
                        <span>每日额度：10</span>
                        <span>已用：${vipInfo?.usedToday?.generate || 0}</span>
                    </div>
                </div>
                `}

                <div class="packages-section">
                    <div class="section-header">
                        <span class="header-text">选择套餐</span>
                    </div>
                    <div class="packages-grid">
                        ${packages.map(pkg => `
                            <div class="package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''} ${pkg.id === 'yearly' ? 'recommended' : ''}" data-package='${JSON.stringify(pkg)}'>
                                ${pkg.id === 'yearly' ? '<div class="recommended-tag">推荐</div>' : ''}
                                <div class="package-name">${pkg.name}</div>
                                <div class="package-price">
                                    <span class="price-symbol">¥</span>
                                    <span class="price-value">${pkg.price}</span>
                                </div>
                                <div class="package-days">${pkg.days}天</div>
                                <div class="package-features">
                                    ${pkg.features.map(f => `<div class="feature-item">✓ ${f}</div>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="vip-features">
                    <div class="section-header">
                        <span class="header-text">VIP特权</span>
                    </div>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">⚡</div>
                            <div class="feature-title">无限创作</div>
                            <div class="feature-desc">每日可用额度大幅提升</div>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🎨</div>
                            <div class="feature-title">专属主题</div>
                            <div class="feature-desc">解锁炫彩霓虹等专属主题</div>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🚀</div>
                            <div class="feature-title">优先通道</div>
                            <div class="feature-desc">AI响应速度提升50%</div>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">💎</div>
                            <div class="feature-title">专属客服</div>
                            <div class="feature-desc">7x24小时专属服务</div>
                        </div>
                    </div>
                </div>

                <div class="open-vip-btn">
                    <button class="btn btn-primary btn-large" data-action="open" ${!selectedPackage ? 'disabled' : ''}>
                        ${selectedPackage ? `立即开通 ${selectedPackage.name}` : '请选择套餐'}
                    </button>
                </div>
            </div>
        `;

        this._bindEvents(targetContainer);
    }

    _bindEvents(container) {
        container.querySelectorAll('.package-card').forEach(card => {
            card.addEventListener('click', this.selectPackage);
        });

        const openBtn = container.querySelector('[data-action="open"]');
        if (openBtn) openBtn.addEventListener('click', this.openVip);
    }
}

window.VipPage = VipPage;
