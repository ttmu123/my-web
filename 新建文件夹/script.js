document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const captchaModal = document.getElementById('captchaModal');
    const closeCaptchaBtn = document.getElementById('closeCaptcha');
    const sliderThumb = document.getElementById('sliderThumb');
    const sliderTrack = document.querySelector('.slider-track');
    const loginForm = document.getElementById('loginForm');
    
    // 注册相关元素
    const showRegisterLink = document.getElementById('showRegister');
    const registerModal = document.getElementById('registerModal');
    const closeRegisterBtn = document.getElementById('closeRegister');
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    
    // 用户数据存储（使用localStorage）
    const USERS_KEY = 'registeredUsers';
    
    // 获取已注册用户列表
    function getRegisteredUsers() {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : {};
    }
    
    // 保存用户信息
    function saveUser(phone, password) {
        const users = getRegisteredUsers();
        users[phone] = password;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    
    // 检查用户是否存在
    function isUserRegistered(phone) {
        const users = getRegisteredUsers();
        return phone in users;
    }
    
    // 验证用户密码
    function verifyUserPassword(phone, password) {
        const users = getRegisteredUsers();
        return users[phone] === password;
    }
    
    // 半透明提示弹窗功能
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    function showToast(message, type = 'default', duration = 2000) {
        // 移除之前的类型类
        toast.classList.remove('guide', 'error', 'success');
        
        // 根据类型添加相应的类
        if (type === 'guide') {
            toast.classList.add('guide');
        } else if (type === 'error') {
            toast.classList.add('error');
        } else if (type === 'success') {
            toast.classList.add('success');
        }
        
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
    
    let isDragging = false;
    let startX = 0;
    let thumbStartX = 0;
    const sliderWidth = 310; // 滑块轨道宽度
    const verifyThreshold = 280; // 验证阈值（需要拖动到这个位置才验证成功）
    
    // 打开验证弹窗
    loginBtn.addEventListener('click', function() {
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        
        // 分别检查手机号和密码的填写情况
        if (!phone && !password) {
            showToast('请填写账号和密码');
            return;
        }
        
        if (!phone) {
            showToast('请输入账号');
            document.getElementById('phone').focus();
            return;
        }
        
        if (!password) {
            showToast('请输入密码');
            document.getElementById('password').focus();
            return;
        }
        
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            showToast('请输入正确的手机号', 'error');
            return;
        }
        
        // 检查用户是否已注册
        if (!isUserRegistered(phone)) {
            showToast('该账号未注册，请点击下方注册', 'guide', 3000);
            return;
        }
        
        // 验证密码是否正确
        if (!verifyUserPassword(phone, password)) {
            showToast('密码错误，请重新输入');
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
            return;
        }
        
        captchaModal.style.display = 'block';
        resetSlider();
    });
    //注册新用户功能
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.style.display = 'block';
        registerForm.reset();
    });
    
    // 关闭注册弹窗
    closeRegisterBtn.addEventListener('click', function() {
        registerModal.style.display = 'none';
    });
    
    // 关闭登录验证弹窗
    closeCaptchaBtn.addEventListener('click', function() {
        captchaModal.style.display = 'none';
        resetSlider();
    });
    
    // 移除点击模态框外部关闭功能，用户只能通过×按钮关闭验证窗口
    // 注册弹窗也不允许外部点击关闭
    window.addEventListener('click', function(event) {
        if (event.target === registerModal) {
            // 不允许关闭注册弹窗
            return;
        }
        if (event.target === captchaModal) {
            // 不允许关闭验证弹窗
            return;
        }
    });
    
    // 滑块拖动功能
    sliderThumb.addEventListener('mousedown', startDrag);
    sliderThumb.addEventListener('touchstart', startDrag);
    
    function startDrag(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        thumbStartX = parseInt(sliderThumb.style.left) || 0;
        
        // 添加拖动样式
        sliderThumb.style.cursor = 'grabbing';
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
        
        e.preventDefault();
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const deltaX = clientX - startX;
        let newX = thumbStartX + deltaX;
        
        // 限制拖动范围
        newX = Math.max(0, Math.min(newX, sliderWidth));
        
        // 更新滑块位置和进度条
        sliderThumb.style.left = newX + 'px';
        if (sliderTrack) {
            sliderTrack.style.width = newX + 'px';
        }
        
        // 检查是否验证成功（需要拖动到阈值位置）
        if (newX >= verifyThreshold) {
            document.querySelector('.slider-success').style.opacity = '1';
            // 只有当用户释放鼠标时才验证成功
        } else {
            document.querySelector('.slider-success').style.opacity = '0';
        }
    }
    
    function stopDrag() {
        isDragging = false;
        
        // 恢复光标样式
        sliderThumb.style.cursor = 'grab';
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
        
        // 检查是否已经验证成功（只有在释放时才验证）
        const currentX = parseInt(sliderThumb.style.left) || 0;
        if (currentX >= verifyThreshold) {
            // 如果已经拖动到最右边，自动完成验证
            sliderThumb.style.left = sliderWidth + 'px';
            if (sliderTrack) {
                sliderTrack.style.width = sliderWidth + 'px';
            }
            // 添加一点延迟让用户看到验证成功效果
            setTimeout(autoVerifySuccess, 300);
        } else {
            // 如果没有拖动到阈值，自动回弹到起点
            sliderThumb.style.left = '0px';
            if (sliderTrack) {
                sliderTrack.style.width = '0px';
            }
        }
    }
    
    // 注册按钮点击事件
    registerBtn.addEventListener('click', function() {
        const regPhone = document.getElementById('regPhone').value;
        const regPassword = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 表单验证
        if (!regPhone || !regPassword || !confirmPassword) {
            showToast('请填写所有必填项');
            return;
        }
        
        if (!/^1[3-9]\d{9}$/.test(regPhone)) {
            showToast('请输入正确的手机号');
            return;
        }
        
        if (regPassword.length < 6) {
            showToast('密码长度至少6位');
            return;
        }
        
        if (regPassword !== confirmPassword) {
            showToast('两次输入的密码不一致');
            return;
        }
        
        // 检查手机号是否已被注册
        if (isUserRegistered(regPhone)) {
            showToast('该手机号已被注册，请直接登录或使用其他手机号');
            return;
        }
        
        // 保存用户信息到本地存储
        saveUser(regPhone, regPassword);
        
        console.log('注册信息:', { phone: regPhone, password: regPassword });
        showToast('注册成功！请使用新账号登录', 'success');
        
        // 关闭注册弹窗
        registerModal.style.display = 'none';
        
        // 自动填充登录表单
        document.getElementById('phone').value = regPhone;
        document.getElementById('password').value = regPassword;
    });
    
    // 自动验证成功函数
    function autoVerifySuccess() {
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        
        // 再次验证用户信息（确保数据一致性）
        if (!isUserRegistered(phone)) {
            showToast('用户不存在，请重新登录');
            captchaModal.style.display = 'none';
            resetSlider();
            loginForm.reset();
            return;
        }
        
        if (!verifyUserPassword(phone, password)) {
            showToast('密码验证失败，请重新登录');
            captchaModal.style.display = 'none';
            resetSlider();
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
            return;
        }
        
        // 登录成功
        console.log('登录成功:', { phone, password });
        showToast(`登录成功！欢迎用户 ${phone}`, 'success');
        
        // 关闭弹窗
        captchaModal.style.display = 'none';
        resetSlider();
        
        // 清空表单（可选）
        loginForm.reset();
    }
    
    // 重置滑块
    function resetSlider() {
        sliderThumb.style.left = '0px';
        document.querySelector('.slider-track').style.width = '0px';
        document.querySelector('.slider-success').style.opacity = '0';
    }
    
    // 添加键盘支持（回车键登录）
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
});