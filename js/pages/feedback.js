/**
 * 意见反馈页 - 页面组件
 * 对应原小程序: pages/feedback/feedback.js
 * [接口3] http://47.104.165.250:8000/api/feedback/submit/
 */

class FeedbackPage extends BasePage {
    constructor(params = {}) {
        super(params);
        this.state = {
            feedbackType: 'suggestion',
            feedbackContent: '',
            contactInfo: '',
            images: [],
            historyList: []
        };
        this._bindMethods();
    }

    _bindMethods() {
        this.setFeedbackType = this.setFeedbackType.bind(this);
        this.onContentInput = this.onContentInput.bind(this);
        this.onContactInput = this.onContactInput.bind(this);
        this.submitFeedback = this.submitFeedback.bind(this);
    }

    onLoad() {
        this.state.historyList = StorageService.getFeedbackItems();
    }

    setFeedbackType(e) {
        const type = e.currentTarget.dataset.type;
        this.state.feedbackType = type;
        this.render();
    }

    onContentInput(e) {
        this.state.feedbackContent = e.target.value;
    }

    onContactInput(e) {
        this.state.contactInfo = e.target.value;
    }

    async submitFeedback() {
        const { feedbackType, feedbackContent, contactInfo } = this.state;

        if (!feedbackContent.trim()) {
            this.showToast('请输入反馈内容', 'none');
            return;
        }

        this.showLoading('提交中...');

        try {
            // ===== [接口3] 提交反馈 =====
            const res = await fetch('http://47.104.165.250:8000/api/feedback/submit/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: feedbackType,
                    content: feedbackContent,
                    contact: contactInfo,
                    userId: StorageService.get('userId') || 'guest',
                    timestamp: new Date().toISOString()
                })
            });
            const result = await res.json();
            // ===== [接口3] 调用结束 =====

            this.hideLoading();

            if (result.success) {
                StorageService.saveFeedbackItem({
                    id: Date.now(),
                    type: feedbackType,
                    content: feedbackContent,
                    time: new Date().toLocaleString(),
                    status: 'pending'
                });
                
                this.state.feedbackContent = '';
                this.state.contactInfo = '';
                this.state.historyList = StorageService.getFeedbackItems();
                
                this.showToast('反馈提交成功');
                this.render();
            } else {
                this.showToast(result.error || '提交失败', 'none');
            }
        } catch (error) {
            this.hideLoading();
            this.showToast('网络异常', 'none');
        }
    }

    render(container) {
        const { feedbackType, feedbackContent, contactInfo, historyList } = this.state;
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        const types = [
            { id: 'suggestion', name: '功能建议', icon: '💡' },
            { id: 'bug', name: '问题反馈', icon: '🐛' },
            { id: 'complaint', name: '投诉建议', icon: '😠' },
            { id: 'other', name: '其他', icon: '📝' }
        ];

        targetContainer.innerHTML = `
            <div class="container page-enter feedback-page">
                <div class="page-header">
                    <div class="page-title gold-text">意见反馈</div>
                    <div class="page-desc">您的意见对我们很重要</div>
                </div>

                <div class="card">
                    <div class="form-item">
                        <div class="form-label">反馈类型</div>
                        <div class="type-grid">
                            ${types.map(t => `
                                <div class="type-item ${feedbackType === t.id ? 'active' : ''}" data-type="${t.id}">
                                    <div class="type-icon">${t.icon}</div>
                                    <div class="type-name">${t.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-item">
                        <div class="form-label">反馈内容</div>
                        <textarea class="textarea" placeholder="请详细描述您的问题或建议...">${feedbackContent}</textarea>
                    </div>

                    <div class="form-item">
                        <div class="form-label">联系方式（选填）</div>
                        <input class="input" type="text" placeholder="手机号/邮箱" value="${contactInfo}" />
                    </div>

                    <button class="btn btn-primary btn-block" data-action="submit">
                        提交反馈
                    </button>
                </div>

                ${historyList.length > 0 ? `
                <div class="section-header">
                    <span class="header-text">反馈历史</span>
                </div>
                <div class="card">
                    ${historyList.map(item => `
                        <div class="history-item">
                            <div class="history-header">
                                <span class="history-type">${types.find(t => t.id === item.type)?.name || item.type}</span>
                                <span class="history-status">${item.status === 'pending' ? '待处理' : '已处理'}</span>
                            </div>
                            <div class="history-content">${item.content}</div>
                            <div class="history-time">${item.time}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <div class="contact-section">
                    <div class="section-header">
                        <span class="header-text">联系我们</span>
                    </div>
                    <div class="card contact-card">
                        <div class="contact-item">
                            <span class="contact-icon">📧</span>
                            <span>邮箱：support@example.com</span>
                        </div>
                        <div class="contact-item">
                            <span class="contact-icon">📞</span>
                            <span>电话：400-888-8888</span>
                        </div>
                        <div class="contact-item">
                            <span class="contact-icon">⏰</span>
                            <span>时间：工作日 9:00-18:00</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this._bindEvents(targetContainer);
    }

    _bindEvents(container) {
        container.querySelectorAll('.type-item').forEach(item => {
            item.addEventListener('click', this.setFeedbackType);
        });

        const textarea = container.querySelector('textarea');
        if (textarea) textarea.addEventListener('input', this.onContentInput);

        const contactInput = container.querySelector('input[type="text"]');
        if (contactInput) contactInput.addEventListener('input', this.onContactInput);

        const submitBtn = container.querySelector('[data-action="submit"]');
        if (submitBtn) submitBtn.addEventListener('click', this.submitFeedback);
    }
}

window.FeedbackPage = FeedbackPage;
