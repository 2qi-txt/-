/**
 * 资料编辑页 - 页面组件
 * 对应原小程序: pages/profile-edit/profile-edit.js
 */

class ProfileEditPage extends BasePage {
    constructor(params = {}) {
        super(params);
        this.state = {
            nickName: '',
            avatarUrl: '',
            desc: ''
        };
        this._bindMethods();
    }

    _bindMethods() {
        this.onNickNameInput = this.onNickNameInput.bind(this);
        this.onDescInput = this.onDescInput.bind(this);
        this.saveProfile = this.saveProfile.bind(this);
    }

    onLoad() {
        const profile = StorageService.getUserProfile();
        this.state.nickName = profile.nickName || '';
        this.state.avatarUrl = profile.avatarUrl || '';
        this.state.desc = profile.desc || '';
    }

    onNickNameInput(e) {
        this.state.nickName = e.target.value;
    }

    onDescInput(e) {
        this.state.desc = e.target.value;
    }

    saveProfile() {
        if (!this.state.nickName.trim()) {
            this.showToast('请输入昵称', 'none');
            return;
        }

        StorageService.saveUserProfile({
            nickName: this.state.nickName,
            avatarUrl: this.state.avatarUrl,
            desc: this.state.desc
        });

        this.showToast('保存成功');
        setTimeout(() => {
            this.navigate('settings');
        }, 1000);
    }

    render(container) {
        const { nickName, avatarUrl, desc } = this.state;
        const targetContainer = container || document.getElementById('page-container');
        if (!targetContainer) return;

        targetContainer.innerHTML = `
            <div class="container page-enter">
                <div class="page-header">
                    <div class="page-title gold-text">编辑资料</div>
                </div>

                <div class="card">
                    <div class="avatar-section">
                        <div class="avatar-preview">
                            ${avatarUrl ? 
                                `<img src="${avatarUrl}" alt="头像" />` : 
                                '<span class="avatar-placeholder">👤</span>'
                            }
                        </div>
                        <button class="btn btn-secondary btn-mini">更换头像</button>
                    </div>

                    <div class="form-item">
                        <div class="form-label">昵称</div>
                        <input class="input" type="text" placeholder="输入昵称" value="${nickName}" />
                    </div>

                    <div class="form-item">
                        <div class="form-label">个性签名</div>
                        <textarea class="textarea" placeholder="这个人很懒，什么都没写">${desc}</textarea>
                    </div>

                    <button class="btn btn-primary btn-block" data-action="save">
                        保存修改
                    </button>
                </div>
            </div>
        `;

        this._bindEvents(targetContainer);
    }

    _bindEvents(container) {
        const nickInput = container.querySelector('input[type="text"]');
        if (nickInput) nickInput.addEventListener('input', this.onNickNameInput);

        const descInput = container.querySelector('textarea');
        if (descInput) descInput.addEventListener('input', this.onDescInput);

        const saveBtn = container.querySelector('[data-action="save"]');
        if (saveBtn) saveBtn.addEventListener('click', this.saveProfile);
    }
}

window.ProfileEditPage = ProfileEditPage;
