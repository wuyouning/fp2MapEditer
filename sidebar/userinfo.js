function updateUserinfo() {
    // 从 localStorage 中获取用户信息
    const username = localStorage.getItem('username');
    const phone = localStorage.getItem('phoneInfo');
    const userId = localStorage.getItem('userId');

    // 将获取的信息填充到对应的 HTML 元素中
    document.getElementById('usernameInfo').textContent = username || '未设置';
    document.getElementById('phoneInfo').textContent = phone || '未设置';
    document.getElementById('userIdInfo').textContent = userId || '未设置';
};

function logoutAndClose() {
    localStorage.clear(); // 清空本地存储
    userManager.logout();
    alert('已退出登录');
    closeToolBar();
}