/**
 * 文案生成页 - 页面组件
 * 对应原小程序: pages/generate/generate.js
 * [接口1] http://127.0.0.1:8000/api/chatglm/generate/
 */

class GeneratePage extends BasePage {
    constructor(params = {}) {
        super(params);
        this.state = {
            currentTab: 'official',
            selectedScene: '',
            isGenerating: false,
            generatedContent: '',
            vipStatus: null,
            generateRemaining: 0,
            formData: {
                title: '',
                content: '',
                scene: '',
                style: 'formal',
                length: 'medium'
            }
        };
        this._bindMethods();
    }

    _bindMethods() {
        this.switchTab = this.switchTab.bind(this);
        this.selectScene = this.selectScene.bind(this);
        this.onInput = this.onInput.bind(this);
        this.generateContent = this.generateContent.bind(this);
        this.copyContent = this.copyContent.bind(this);
        this.saveContent = this.saveContent.bind(this);
    }

    onLoad() {
        this.refreshVipInfo();
        if (this.params?.type) {
            this.state.selectedScene = this.params.type;
            this.state.formData.scene = this.params.type;
        }
    }

    onShow() {
        this.refreshVipInfo();
    }

    refreshVipInfo() {
        const vipStatus = StorageService.getVipStatus();
        const limit = vipStatus.isVip ? (vipStatus.dailyQuota.generate || 50) : (vipStatus.dailyQuota.generate || 10);
        const used = vipStatus.usedToday.generate || 0;
        this.state.vipStatus = vipStatus;
        this.state.generateRemaining = Math.max(0, limit - used);
    }

    switchTab(e) {
        const tab = e.currentTarget.dataset.tab;
        this.state.currentTab = tab;
        this.state.selectedScene = '';
        this.state.formData.scene = '';
        this.render();
    }

    selectScene(e) {
        const scene = e.currentTarget.dataset.scene;
        this.state.selectedScene = scene;
        this.state.formData.scene = scene;
        this.render();
    }

    onInput(e) {
        const field = e.currentTarget.dataset.field;
        if (field) {
            this.state.formData[field] = e.currentTarget.value;
        }
    }

    async generateContent() {
        const { selectedScene, formData } = this.state;
        
        if (!selectedScene) {
            this.showToast('请先选择场景', 'none');
            return;
        }

        if (!formData.title.trim()) {
            this.showToast('请输入主题内容', 'none');
            return;
        }

        const vipStatus = StorageService.getVipStatus();
        const limit = vipStatus.isVip ? (vipStatus.dailyQuota.generate || 50) : 10;
        const used = vipStatus.usedToday.generate || 0;

        if (used >= limit) {
            const result = await this.showModal({
                title: '额度已用完',
                content: '开通VIP可提升每日额度与速度',
                confirmText: '去开通'
            });
            if (result.confirm) {
                this.navigate('vip');
            }
            return;
        }

        this.state.isGenerating = true;
        this.render();
        this.showLoading('生成中...');

        try {
            // ===== [接口1] 调用开始 =====
            const res = await fetch('http://127.0.0.1:8000/api/chatglm/generate/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scene: selectedScene,
                    title: formData.title,
                    description: formData.content,
                    keywords: '',
                    style: formData.style,
                    length: formData.length,
                    temperature: 0.8
                })
            });
            const result = await res.json();
            // ===== [接口1] 调用结束 =====

            this.hideLoading();

            if (result.success) {
                this.state.generatedContent = result.data.content;
                this.state.isGenerating = false;
                
                vipStatus.usedToday.generate = used + 1;
                StorageService.saveVipStatus(vipStatus);
                StorageService.updateStats('generated');

                StorageService.saveRecentItem({
                    id: Date.now(),
                    title: formData.title,
                    type: 'generate',
                    time: new Date().toLocaleString()
                });

                this.showToast('AI生成成功');
                this.refreshVipInfo();
                this.render();
            } else {
                this.state.isGenerating = false;
                this.showToast(result.error || '生成失败', 'none');
                this.render();
            }
        } catch (error) {
            this.hideLoading();
            this.state.isGenerating = false;
            this.showToast('网络异常', 'none');
            this.render();
        }
    }

    copyContent() {
        const content = this.state.generatedContent;
        navigator.clipboard.writeText(content).then(() => {
            this.showToast('复制成功');
        }).catch(() => {
            this.showToast('复制失败', 'none');
        });
    }

    saveContent() {
        const { formData, generatedContent } = this.state;
        StorageService.saveContent({
            title: formData.title,
            content: generatedContent,
            scene: formData.scene,
            type: 'generated'
        });
        this.showToast('保存成功');
    }

    render(container) {
        const { currentTab, selectedScene, isGenerating, generatedContent, vipStatus, generateRemaining, formData } = this.state;
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        const rankText = vipStatus && vipStatus.isVip ? '最强王者' : '永恒钻石';
        const energyPercent = generateRemaining * 10;

        targetContainer.innerHTML = `
            <div class="container page-enter">
                <div class="page-header esports-header">
                    <div class="header-content">
                        <div class="page-title gold-text">全能备战室</div>
                        <div class="page-desc">选择你的作战场景，生成神级文案</div>
                    </div>
                    
                    <div class="vip-status-card">
                        <div class="vip-info">
                            <span class="rank-label">段位：</span>
                            <span class="rank-value ${vipStatus && vipStatus.isVip ? 'gold-text' : ''}">${rankText}</span>
                        </div>
                        <div class="energy-bar-container">
                            <div class="energy-label">剩余能量：${generateRemaining}/10</div>
                            <div class="energy-bar">
                                <div class="energy-fill" style="width: ${energyPercent}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="scene-menu">
                    <div class="menu-tabs">
                        <div class="menu-tab ${currentTab === 'official' ? 'active' : ''}" data-tab="official">
                            <span class="tab-text">官方对线</span>
                            <div class="tab-indicator"></div>
                        </div>
                        <div class="menu-tab ${currentTab === 'social' ? 'active' : ''}" data-tab="social">
                            <span class="tab-text">社交团战</span>
                            <div class="tab-indicator"></div>
                        </div>
                    </div>
                </div>

                <div class="content-area">
                    ${currentTab === 'official' ? `
                    <div class="scene-grid">
                        <div class="scene-card ${selectedScene === 'notice' ? 'selected' : ''}" data-scene="notice">
                            <div class="card-icon">📢</div>
                            <div class="card-name">导员通知</div>
                        </div>
                        <div class="scene-card ${selectedScene === 'announcement' ? 'selected' : ''}" data-scene="announcement">
                            <div class="card-icon">📋</div>
                            <div class="card-name">公告通知</div>
                        </div>
                        <div class="scene-card ${selectedScene === 'club' ? 'selected' : ''}" data-scene="club">
                            <div class="card-icon">🎭</div>
                            <div class="card-name">社团事务</div>
                        </div>
                    </div>
                    ` : `
                    <div class="scene-grid">
                        <div class="scene-card ${selectedScene === 'xiaohongshu' ? 'selected' : ''}" data-scene="xiaohongshu">
                            <div class="card-icon">📱</div>
                            <div class="card-name">小红书</div>
                        </div>
                        <div class="scene-card ${selectedScene === 'wechat' ? 'selected' : ''}" data-scene="wechat">
                            <div class="card-icon">💬</div>
                            <div class="card-name">朋友圈</div>
                        </div>
                        <div class="scene-card ${selectedScene === 'douyin' ? 'selected' : ''}" data-scene="douyin">
                            <div class="card-icon">🎵</div>
                            <div class="card-name">抖音</div>
                        </div>
                        <div class="scene-card ${selectedScene === 'trade' ? 'selected' : ''}" data-scene="trade">
                            <div class="card-icon">🛒</div>
                            <div class="card-name">二手交易</div>
                        </div>
                    </div>
                    `}
                </div>

                <div class="battle-form card ${selectedScene ? '' : 'hidden'}">
                    <div class="form-header">
                        <span class="gold-text">作战需求</span>
                    </div>
                    
                    <div class="input-group">
                        <span class="label">核心主题</span>
                        <input class="input" type="text" placeholder="输入作战主题..." value="${formData.title}" data-field="title" />
                    </div>

                    <div class="input-group">
                        <span class="label">详细情报</span>
                        <textarea class="input text-area" placeholder="补充详细对线情报..." data-field="content">${formData.content}</textarea>
                    </div>

                    <div class="action-area">
                        <button class="btn btn-primary skill-btn" data-action="generate" ${isGenerating ? 'disabled' : ''}>
                            <span class="skill-icon">⚡</span>
                            <span>${isGenerating ? '正在施法...' : '释放灵感'}</span>
                        </button>
                    </div>
                </div>

                ${generatedContent ? `
                <div class="result-section">
                    <div class="section-header">
                        <span class="header-text">情报摘要</span>
                    </div>
                    <div class="result-card card">
                        <div class="result-body">${generatedContent.replace(/\n/g, '<br>')}</div>
                        <div class="result-actions">
                            <button class="btn btn-secondary" data-action="copy">一键复制</button>
                            <button class="btn btn-primary" data-action="save">保存战报</button>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        // 绑定事件
        this._bindEvents(targetContainer);
    }

    _bindEvents(container) {
        container.querySelectorAll('.menu-tab').forEach(tab => {
            tab.addEventListener('click', this.switchTab);
        });
        container.querySelectorAll('.scene-card').forEach(card => {
            card.addEventListener('click', this.selectScene);
        });
        container.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', this.onInput);
        });
        
        const generateBtn = container.querySelector('[data-action="generate"]');
        if (generateBtn) generateBtn.addEventListener('click', this.generateContent);
        
        const copyBtn = container.querySelector('[data-action="copy"]');
        if (copyBtn) copyBtn.addEventListener('click', this.copyContent);
        
        const saveBtn = container.querySelector('[data-action="save"]');
        if (saveBtn) saveBtn.addEventListener('click', this.saveContent);
    }
}

window.GeneratePage = GeneratePage;
