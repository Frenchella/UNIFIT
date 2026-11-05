(() => {
    const currentPath = location.pathname;
    const hasSession = Boolean(sessionStorage.getItem('unifitStudentSession'));
    if (hasSession && currentPath.endsWith('welcome.html')) {
        location.replace('index.html');
        return;
    }
    const signedIn = hasSession;
    if (signedIn) {
        document.documentElement.classList.remove('welcome-mode');
function askUniFitLogout() {
    return new Promise(resolve => {
        const dialog = document.createElement('dialog');
        dialog.innerHTML = '<form method="dialog"><p>Do you want to log out?</p><div><button value="no">No</button><button value="yes">Yes</button></div></form>';
        dialog.style.cssText = 'position:fixed;inset:0;margin:auto;border:0;border-radius:12px;padding:24px;width:min(360px,calc(100vw - 32px));box-shadow:0 18px 60px rgba(0,0,0,.32);color:#3e2723;background:#fffdf8;';
        const form = dialog.querySelector('form');
        form.style.cssText = 'display:grid;gap:20px;margin:0;text-align:center;font:600 16px system-ui,sans-serif;';
        const buttons = dialog.querySelector('div');
        buttons.style.cssText = 'display:flex;justify-content:center;gap:12px;';
        dialog.querySelectorAll('button').forEach(button => {
            button.style.cssText = 'min-width:88px;padding:9px 16px;border:1px solid #b8956f;border-radius:6px;cursor:pointer;font:600 14px system-ui,sans-serif;';
        });
        dialog.addEventListener('close', () => {
            resolve(dialog.returnValue === 'yes');
            dialog.remove();
        }, {once: true});
        document.body.append(dialog);
        dialog.showModal();
    });
}

async function finishUniFitLogout() {
    try { await fetch('/api/student-logout', {method: 'POST'}); } catch (error) { /* Clear the local UI session even if offline. */ }
    sessionStorage.removeItem('unifitStudentSession');
    localStorage.removeItem('unifitLoggedIn');
    localStorage.removeItem('unifitCurrentUser');
    window.location.href = 'welcome.html';
}

        document.querySelectorAll('a[href="login.html"]').forEach(link => {
            link.textContent = 'Log out';
            link.href = '#logout';
            link.addEventListener('click', async event => {
                event.preventDefault();
                if (await askUniFitLogout()) await finishUniFitLogout();
            });
        });
        return;
    }
    document.documentElement.classList.add('welcome-mode');
    const main = document.createElement('main');
    main.id = 'welcomePage';
    main.innerHTML = `<section class="welcome-card"><a class="welcome-brand" href="index.html"><img src="assets/images/Group%206.png" alt="UniFit logo"><span>UniFit</span></a><p class="welcome-eyebrow">YOUR SCHOOL ESSENTIALS</p><h1>Your school look,<br>all in one place.</h1><p class="welcome-copy">Welcome to UniFit. Log in to browse uniforms, customize your set, and keep track of your orders.</p><div class="welcome-actions"><a class="welcome-primary" href="login.html">Log In</a><a class="welcome-secondary" href="register.html">Create an Account</a></div><div class="welcome-admin"><span>School store personnel?</span><a href="http://localhost:8000/admin-login.html">Admin Login →</a></div></section><aside class="welcome-visual" aria-label="School and PE uniform sets"><img src="uniform%20sets/m%20fs.png" alt="School uniform and PE essentials"><p>Ready for class. Ready for campus.</p></aside>`;
    document.body.prepend(main);
})();
