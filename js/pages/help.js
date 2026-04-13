/**
 * 帮助中心页 - 页面组件
 * 对应原小程序: pages/help/help.js
 */

class HelpPage extends BasePage {
    constructor(params = {}) {
        super(params);
        this.state = {
            expandedItem: null
        };
        this._bindMethods();
    }

    _bindMethods() {
        this.toggleItem = this.toggleItem.bind(this);
    }

    onLoad() {}

    toggleItem(e) {
        const index = parseInt(e.currentTarget.dataset.index);
        this.state.expandedItem = this.state.expandedItem === index ? null : index;
        this.render();
    }

    render(container) {
        const { expandedItem } = this.state;
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        const faqs = [
            {
                q: '峡谷文案工坊是什么？',
                a: '峡谷文案工坊是一款专为各类场景设计的AI文案生成工具，采用王者荣耀电竞风格，帮助用户快速生成各类文案。'
            },
            {
                q: '每天有多少免费额度？',
                a: '普通用户每日有10次生成和10次优化额度。开通VIP后可获得更多额度（月卡50次/日，季卡100次/日，年卡200次/日）。'
            },
            {
                q: '如何开通VIP？',
                a: '进入"个人"页面，点击"VIP中心"，选择心仪的套餐完成支付即可开通。'
            },
            {
                q: '生成的文案版权归谁？',
                a: '您使用AI生成的文案版权归您所有，可以自由使用和分享。'
            },
            {
                q: '内容审核不通过怎么办？',
                a: '请确保输入内容符合法律法规和平台规范。如有疑问，可通过意见反馈联系我们。'
            },
            {
                q: '如何联系客服？',
                a: '您可以通过以下方式联系我们：\n- 意见反馈页面提交问题\n- 邮箱：support@example.com\n- 电话：400-888-8888（工作日9:00-18:00）'
            }
        ];

        targetContainer.innerHTML = `
            <div class="container page-enter help-page">
                <div class="page-header">
                    <div class="page-title gold-text">帮助中心</div>
                    <div class="page-desc">常见问题解答</div>
                </div>

                <div class="card">
                    <div class="faq-list">
                        ${faqs.map((item, index) => `
                            <div class="faq-item ${expandedItem === index ? 'expanded' : ''}" data-index="${index}">
                                <div class="faq-question">
                                    <span class="q-text">${item.q}</span>
                                    <span class="q-icon">${expandedItem === index ? '▼' : '▶'}</span>
                                </div>
                                ${expandedItem === index ? `
                                    <div class="faq-answer">${item.a.replace(/\n/g, '<br>')}</div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="section-header">
                    <span class="header-text">快捷操作</span>
                </div>
                <div class="card quick-actions">
                    <div class="quick-action-item" data-navigate="feedback">
                        <span class="action-icon">💬</span>
                        <span class="action-text">意见反馈</span>
                    </div>
                    <div class="quick-action-item" data-navigate="vip">
                        <span class="action-icon">👑</span>
                        <span class="action-text">开通VIP</span>
                    </div>
                </div>

                <div class="app-intro">
                    <div class="intro-title">关于峡谷文案</div>
                    <div class="intro-content">
                        <p>峡谷文案工坊是一款AI文案生成工具</p>
                        <p>将王者荣耀的电竞元素与各类场景完美结合</p>
                        <p>帮助用户快速生成各类优质文案</p>
                    </div>
                    <div class="intro-version">v1.0.0</div>
                </div>
            </div>
        `;

        this._bindEvents(targetContainer);
    }

    _bindEvents(container) {
        container.querySelectorAll('.faq-item').forEach(item => {
            item.addEventListener('click', this.toggleItem);
        });

        container.querySelectorAll('[data-navigate]').forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.navigate;
                if (page) this.navigate(page);
            });
        });
    }
}

window.HelpPage = HelpPage;
