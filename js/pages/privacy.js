/**
 * 隐私政策页 - 页面组件
 * 对应原小程序: pages/privacy/privacy.js
 */

class PrivacyPage extends BasePage {
    constructor(params = {}) {
        super(params);
    }

    onLoad() {}

    render(container) {
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        targetContainer.innerHTML = `
            <div class="container page-enter static-page">
                <div class="page-header">
                    <div class="page-title gold-text">隐私政策</div>
                    <div class="page-date">更新日期：2024年1月1日</div>
                </div>

                <div class="card">
                    <div class="content-section">
                        <h3>1. 信息收集</h3>
                        <p>我们承诺尊重并保护您的个人隐私。在您使用峡谷文案工坊时，我们可能会收集以下信息：</p>
                        <ul>
                            <li>设备信息：设备型号、操作系统版本等基本信息</li>
                            <li>使用信息：功能使用情况、生成内容等</li>
                            <li>反馈信息：您主动提交的问题和建议</li>
                        </ul>
                    </div>

                    <div class="content-section">
                        <h3>2. 信息使用</h3>
                        <p>我们收集的信息将用于：</p>
                        <ul>
                            <li>提供和改进我们的服务</li>
                            <li>个性化用户体验</li>
                            <li>处理您的反馈和建议</li>
                            <li>推送重要通知和更新</li>
                        </ul>
                    </div>

                    <div class="content-section">
                        <h3>3. 信息保护</h3>
                        <p>我们采取多种安全措施保护您的个人信息，包括数据加密、访问控制等。</p>
                    </div>

                    <div class="content-section">
                        <h3>4. 信息共享</h3>
                        <p>未经您的同意，我们不会与任何第三方分享您的个人信息，法律法规规定的除外。</p>
                    </div>

                    <div class="content-section">
                        <h3>5. Cookie使用</h3>
                        <p>我们使用Cookie来记住您的偏好设置，提供更好的用户体验。</p>
                    </div>

                    <div class="content-section">
                        <h3>6. 联系我们</h3>
                        <p>如您对本隐私政策有任何疑问，请通过意见反馈页面联系我们。</p>
                    </div>
                </div>
            </div>
        `;
    }
}

window.PrivacyPage = PrivacyPage;
