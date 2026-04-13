/**
 * 主应用入口
 */

class App {
    static globalData = {
        userInfo: null,
        theme: 'light',
        apiBaseUrl: 'http://127.0.0.1:8000',
        version: '1.0.0'
    };

    static init() {
        // 初始化主题
        ThemeService.init();

        // 初始化路由
        Router.init();

        // 绑定TabBar事件
        this.bindTabBar();

        // 绑定全局事件
        this.bindEvents();
    }

    static bindTabBar() {
        const tabBar = document.getElementById('tab-bar');
        if (!tabBar) return;

        tabBar.addEventListener('click', (e) => {
            const tabItem = e.target.closest('.tab-item');
            if (!tabItem) return;

            const page = tabItem.dataset.page;
            if (page) {
                Router.navigate(page);
            }
        });
    }

    static bindEvents() {
        // 阻止默认行为
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
            }
        });
    }

    static showToast(message, icon = 'success', duration = 2000) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.innerHTML = `<span class="toast-icon">${icon === 'success' ? '✓' : icon === 'fail' ? '✗' : 'ℹ'}</span><span class="toast-message">${message}</span>`;
        toast.className = 'toast show';

        setTimeout(() => {
            toast.className = 'toast';
        }, duration);
    }

    static showLoading(title = '加载中...') {
        const mask = document.getElementById('loading-mask');
        if (!mask) return;
        mask.querySelector('.loading-text').textContent = title;
        mask.className = 'loading-mask show';
    }

    static hideLoading() {
        const mask = document.getElementById('loading-mask');
        if (!mask) return;
        mask.className = 'loading-mask';
    }

    static showModal(options) {
        return new Promise((resolve) => {
            const modal = document.getElementById('modal-container');
            if (!modal) return;

            modal.innerHTML = `
                <div class="modal-overlay show">
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="modal-title">${options.title || '提示'}</div>
                        </div>
                        <div class="modal-body">${options.content || ''}</div>
                        <div class="modal-footer">
                            ${options.showCancel !== false ? `<button class="modal-btn cancel" data-action="cancel">${options.cancelText || '取消'}</button>` : ''}
                            <button class="modal-btn confirm" data-action="confirm">${options.confirmText || '确定'}</button>
                        </div>
                    </div>
                </div>
            `;

            modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    resolve({ confirm: false, cancel: true });
                    modal.innerHTML = '';
                }
            });

            modal.querySelectorAll('.modal-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    resolve({ confirm: action === 'confirm', cancel: action === 'cancel' });
                    modal.innerHTML = '';
                });
            });
        });
    }
}

// 页面基类 - 兼容小程序的Page形式
class BasePage {
    constructor(params = {}) {
        this.state = {};
        this.params = params;
    }

    // 设置状态并重新渲染
    setData(obj) {
        Object.assign(this.state, obj);
        if (this.render) {
            this.render();
        }
    }

    // 显示Toast提示
    showToast(message, icon = 'success', duration = 2000) {
        App.showToast(message, icon, duration);
    }

    // 显示加载中
    showLoading(title = '加载中...') {
        App.showLoading(title);
    }

    // 隐藏加载中
    hideLoading() {
        App.hideLoading();
    }

    // 显示模态框
    showModal(options) {
        return App.showModal(options);
    }

    // 导航到页面
    navigate(page, params = {}) {
        Router.navigate(page, params);
    }

    // 生命周期钩子 - 页面加载
    onLoad() {}

    // 生命周期钩子 - 页面显示
    onShow() {}

    // 生命周期钩子 - 页面卸载
    onUnload() {}
}

// 兼容性别名
class Page extends BasePage {}

// 启动应用 - 使用window.onload确保所有脚本加载完成
window.addEventListener('load', () => {
    // 初始化主题
    ThemeService.init();

    // 初始化路由
    Router.init();

    // 绑定TabBar事件
    App.bindTabBar();

    // 绑定全局事件
    App.bindEvents();
    
    console.log('峡谷文案工坊 初始化完成');
});

window.App = App;
window.BasePage = BasePage;
window.Page = Page;

// Storage 别名（兼容页面组件中使用 Storage.get/Storage.set）
window.Storage = {
    get: StorageService.get.bind(StorageService),
    set: StorageService.save.bind(StorageService),
    remove: StorageService.remove.bind(StorageService),
    clear: StorageService.clear.bind(StorageService)
};

// 将App方法绑定到App对象
App.bindTabBar = function() {
    const tabBar = document.getElementById('tab-bar');
    if (!tabBar) return;

    tabBar.addEventListener('click', (e) => {
        const tabItem = e.target.closest('.tab-item');
        if (!tabItem) return;

        const page = tabItem.dataset.page;
        if (page) {
            Router.navigate(page);
        }
    });
};

App.bindEvents = function() {
    // 阻止默认行为
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
        }
    });
};
