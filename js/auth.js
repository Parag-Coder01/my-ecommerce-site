document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  if (App.getUser()) {
    window.location.href = 'profile.html';
    return;
  }

  const loginFormWrapper = document.getElementById('form-login')?.closest('.auth-panel');
  const recoveryFormWrapper = document.getElementById('recovery-form-wrapper');

  // Handle Recovery link toggle
  document.getElementById('forgot-pwd-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (recoveryFormWrapper) {
      recoveryFormWrapper.style.display = 'block';
      recoveryFormWrapper.scrollIntoView({ behavior: 'smooth' });
    }
  });

  document.getElementById('switch-to-login-from-recovery')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (recoveryFormWrapper) recoveryFormWrapper.style.display = 'none';
  });

  // Password strength logic
  const signupPwd = document.getElementById('signup-password');
  const pwdContainer = document.getElementById('pwd-strength-container');
  const pwdBar = document.getElementById('pwd-strength-bar');

  if (signupPwd) {
    signupPwd.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length > 0) {
        pwdContainer.style.display = 'block';
        let strength = 0;
        if (val.length >= 6) strength += 33;
        if (val.match(/[A-Z]/)) strength += 33;
        if (val.match(/[0-9]/)) strength += 34;

        pwdBar.style.width = strength + '%';
        if (strength < 50) pwdBar.style.backgroundColor = 'var(--danger)';
        else if (strength < 100) pwdBar.style.backgroundColor = 'var(--warning)';
        else pwdBar.style.backgroundColor = 'var(--success)';
      } else {
        pwdContainer.style.display = 'none';
      }
    });
  }

  // Handle Login
  document.getElementById('form-login')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pwd = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === pwd);

    if (user) {
      App.showToast('Login successful!');
      localStorage.setItem('currentUser', JSON.stringify(user));
      setTimeout(() => window.location.href = 'index.html', 1000);
    } else {
      App.showToast('Invalid credentials. Please try again.');
    }
  });

  // Handle Signup
  document.getElementById('form-signup')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const pwd = document.getElementById('signup-password').value;

    if (pwd.length < 6) {
      App.showToast('Password must be at least 6 characters.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.find(u => u.email === email)) {
      App.showToast('Email already in use!');
      return;
    }

    const newUser = { id: Date.now(), name, email, password: pwd, orders: [] };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    App.showToast('Account created! Please log in.');
    // Switch to sign-in tab
    if (typeof switchAuthTab === 'function') switchAuthTab('signin');
  });

  // Handle Recovery
  document.getElementById('form-recovery')?.addEventListener('submit', (e) => {
    e.preventDefault();
    App.showToast('Reset link sent to your email (simulated).');
    setTimeout(() => {
      if (recoveryFormWrapper) recoveryFormWrapper.style.display = 'none';
    }, 2000);
  });
});
