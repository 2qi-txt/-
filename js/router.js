/**
 * 路由管理 - SPA单页应用路由
 */

class Router {
    static routes = {};
    static currentPage = 'index';
    static params = {};

    static init() {
        // 事件委托处理页面内导航
        document.addEventListener('click', (e) => {
            const navTarget = e.target.closest('[data-navigate]');
            if (navTarget) {
                const page = navTarget.dataset.navigate;
                let params = {};
                const paramsStr = navTarget.dataset.params;
                if (paramsStr) {
                    try {
                        params = JSON.parse(paramsStr);
                    } catch (err) {}
                }
                this.navigate(page, params);
                e.preventDefault();
            }
        });

        // 监听浏览器后退
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'index';
            const params = e.state?.params || {};
            this.navigate(page, params, false);
        });

        // 初始化路由表
        this.routes = {
            'index': IndexPage,
            'generate': GeneratePage,
            'optimize': OptimizePage,
            'settings': SettingsPage,
            'vip': VipPage,
            'profile-edit': ProfileEditPage,
            'avatar-crop': AvatarCropPage,
            'content-detail': ContentDetailPage,
            'smart-templates': SmartTemplatesPage,
            'gamification': GamificationPage,
            'collaboration': CollaborationPage,
            'feedback': FeedbackPage,
            'privacy': PrivacyPage,
            'help': HelpPage
        };

        // 获取初始页面
        const urlParams = new URLSearchParams(window.location.search);
        const initPage = urlParams.get('page') || 'index';
        
        // 确保页面组件已加载
        if (!this.routes[initPage]) {
            console.warn('页面组件未找到，使用默认首页');
            this.navigate('index', {}, false);
        } else {
            this.navigate(initPage, {}, false);
        }
    }

    static navigate(page, params = {}, pushState = true) {
        if (!this.routes[page]) {
            console.error('页面不存在:', page);
            return;
        }

        this.currentPage = page;
        this.params = params;

        // 更新URL
        if (pushState) {
            const url = `?page=${page}`;
            history.pushState({ page, params }, '', url);
        }

        // 渲染页面
        this.renderPage(page, params);
    }

    static navigateTo(path, options = {}) {
        const page = path.replace('/pages/', '').replace(/\/\w+$/, '');
        this.navigate(page, options.params || {});
    }

    static navigateBack(delta = 1) {
        history.go(-delta);
    }

    static renderPage(page, params) {
        const container = document.getElementById('page-container');
        if (!container) {
            console.error('页面容器不存在');
            return;
        }

        container.innerHTML = '';
        container.className = 'page-container page-enter';

        const PageClass = this.routes[page];
        if (PageClass) {
            try {
                const pageInstance = new PageClass(params);
                pageInstance.params = params;
                pageInstance.onLoad && pageInstance.onLoad();
                pageInstance.onShow && pageInstance.onShow();
                pageInstance.render(container);
                window.currentPageInstance = pageInstance;
            } catch (err) {
                console.error('页面渲染错误:', err);
                container.innerHTML = `<div class="error-page"><p>页面加载失败</p><button onclick="Router.navigate('index')">返回首页</button></div>`;
            }
        } else {
            container.innerHTML = `<div class="error-page"><p>页面不存在</p><button onclick="Router.navigate('index')">返回首页</button></div>`;
        }

        this.updateTabBar(page);
        window.scrollTo(0, 0);
    }

    static updateTabBar(page) {
        const tabBar = document.getElementById('tab-bar');
        if (!tabBar) return;

        const tabItems = tabBar.querySelectorAll('.tab-item');
        tabItems.forEach(item => {
            const pageName = item.dataset.page;
            if (pageName === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        const mainPages = ['index', 'generate', 'optimize', 'settings'];
        if (mainPages.includes(page)) {
            tabBar.style.display = 'flex';
        } else {
            tabBar.style.display = 'none';
        }
    }

    static getCurrentPage() {
        return this.currentPage;
    }

    static getParams() {
        return this.params;
    }
}

window.Router = Router;
