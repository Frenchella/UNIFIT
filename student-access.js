(() => {
    let valid = false;
    try {
        const user = JSON.parse(sessionStorage.getItem('unifitStudentSession') || 'null');
        valid = Boolean(user && user.email);
    } catch (error) { /* An invalid session requires another login. */ }
    const page = location.pathname.split('/').pop() || 'index.html';
    if (!valid) {
        document.documentElement.style.visibility = 'hidden';
        location.replace(page === 'index.html' ? 'welcome.html' : 'login.html');
    }
})();
