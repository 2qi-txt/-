/**
 * 占位页面组件 - 暂时不实现的功能页面
 */

class AvatarCropPage extends BasePage {
    constructor(params = {}) {
        super(params);
    }

    onLoad() {}

    render(container) {
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        targetContainer.innerHTML = `
            <div class="container page-enter">
                <div class="page-header">
                    <div class="page-title gold-text">头像裁剪</div>
                </div>
                <div class="card">
                    <div class="placeholder-content">
                        <p>头像裁剪功能开发中...</p>
                        <button class="btn btn-secondary" onclick="Router.navigate('settings')">返回设置</button>
                    </div>
                </div>
            </div>
        `;
    }
}

class ContentDetailPage extends BasePage {
    constructor(params = {}) {
        super(params);
    }

    onLoad() {}

    render(container) {
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        targetContainer.innerHTML = `
            <div class="container page-enter">
                <div class="page-header">
                    <div class="page-title gold-text">文案详情</div>
                </div>
                <div class="card">
                    <div class="placeholder-content">
                        <p>文案详情页面开发中...</p>
                        <button class="btn btn-secondary" onclick="Router.navigate('index')">返回首页</button>
                    </div>
                </div>
            </div>
        `;
    }
}

class SmartTemplatesPage extends BasePage {
    constructor(params = {}) {
        super(params);
    }

    onLoad() {}

    render(container) {
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        targetContainer.innerHTML = `
            <div class="container page-enter">
                <div class="page-header">
                    <div class="page-title gold-text">智能模板</div>
                </div>
                <div class="card">
                    <div class="placeholder-content">
                        <p>智能模板功能开发中...</p>
                        <button class="btn btn-secondary" onclick="Router.navigate('generate')">前往生成</button>
                    </div>
                </div>
            </div>
        `;
    }
}

class GamificationPage extends BasePage {
    constructor(params = {}) {
        super(params);
    }

    onLoad() {}

    render(container) {
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        targetContainer.innerHTML = `
            <div class="container page-enter">
                <div class="page-header">
                    <div class="page-title gold-text">游戏化成就</div>
                </div>
                <div class="card">
                    <div class="placeholder-content">
                        <p>游戏化成就系统开发中...</p>
                        <button class="btn btn-secondary" onclick="Router.navigate('index')">返回首页</button>
                    </div>
                </div>
            </div>
        `;
    }
}

class CollaborationPage extends BasePage {
    constructor(params = {}) {
        super(params);
    }

    onLoad() {}

    render(container) {
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        targetContainer.innerHTML = `
            <div class="container page-enter">
                <div class="page-header">
                    <div class="page-title gold-text">协作模式</div>
                </div>
                <div class="card">
                    <div class="placeholder-content">
                        <p>协作模式开发中...</p>
                        <button class="btn btn-secondary" onclick="Router.navigate('index')">返回首页</button>
                    </div>
                </div>
            </div>
        `;
    }
}

// 导出占位页面类
window.AvatarCropPage = AvatarCropPage;
window.ContentDetailPage = ContentDetailPage;
window.SmartTemplatesPage = SmartTemplatesPage;
window.GamificationPage = GamificationPage;
window.CollaborationPage = CollaborationPage;
