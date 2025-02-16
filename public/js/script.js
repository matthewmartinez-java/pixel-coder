document.addEventListener('DOMContentLoaded', function() {

    fetch('/footer')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footerPlaceholder').innerHTML = data;
        });

    fetch('/header')
        .then(response => response.text())
        .then(data => {
            document.getElementById('headerPlaceholder').innerHTML = data;
            const accountLink = document.getElementById('accountLink');
            const logoutLink = document.getElementById('logoutLink');
            const searchInput = document.getElementById('search');
            const themeSwitch = document.getElementById('themeSwitch');

            const token = localStorage.getItem('token');

            if (token) {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                console.log(decodedToken);
                accountLink.innerText = "Hello " + decodedToken.username;
                accountLink.style.display = 'block';
                logoutLink.style.display = 'block';
            } else {
                accountLink.innerText = 'Log-in';
                logoutLink.style.display = 'none';
            }

            accountLink.addEventListener('click', function(event) {
                event.preventDefault();
                const modal = document.getElementById('authModal');
                modal.style.display = 'block';
            });

            logoutLink.addEventListener('click', function(event) {
                event.preventDefault();
                logout();
            });

            searchInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    const searchTerm = searchInput.value;
                    window.location.href = `/query.html?search=${encodeURIComponent(searchTerm)}`;
                }
            });

            themeSwitch.addEventListener('click', function() {
                toggleTheme();
            });

            const storedTheme = localStorage.getItem('theme');
            const darkTheme = document.querySelector('link[href="css/gruvbox-dark.css"]');
            const lightTheme = document.querySelector('link[href="css/gruvbox-light.css"]');

            if (storedTheme === 'dark') {
                darkTheme.disabled = false;
                lightTheme.disabled = true;
            } else if (storedTheme === 'light') {
                darkTheme.disabled = true;
                lightTheme.disabled = false;
            }

        });

    fetch('/modal')
        .then(response => response.text())
        .then(data => {
            document.getElementById('modalPlaceholder').innerHTML = data;
            const modal = document.getElementById('authModal');
            const loginFormContainer = document.getElementById('loginFormContainer');
            const registerFormContainer = document.getElementById('registerFormContainer');
            const settingsFormContainer = document.getElementById('settingsFormContainer');
            const switchToRegister = document.getElementById('switchToRegister');
            const switchToLogin = document.getElementById('switchToLogin');
            const closeModal = document.getElementsByClassName('close')[0];

            closeModal.addEventListener('click', function() {
                modal.style.display = 'none';
            });

            switchToRegister.addEventListener('click', function() {
                loginFormContainer.style.display = 'none';
                registerFormContainer.style.display = 'block';
                settingsFormContainer.style.display = 'none';
            });

            switchToLogin.addEventListener('click', function() {
                registerFormContainer.style.display = 'none';
                loginFormContainer.style.display = 'block';
                settingsFormContainer.style.display = 'none';
            });

            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            const settingsForm = document.getElementById('settingsForm');

            const token = localStorage.getItem('token');
            if (token) {
                loginFormContainer.style.display = 'none';
                registerFormContainer.style.display = 'none';
                settingsFormContainer.style.display = 'block';
            } else {
                loginFormContainer.style.display = 'block';
                registerFormContainer.style.display = 'none';
                settingsFormContainer.style.display = 'none';
            }

            if (loginForm) {
                loginForm.addEventListener('submit', function(event) {
                    event.preventDefault();
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;
                    fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username, password })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                localStorage.setItem('token', data.token);
                                location.reload();
                            } else {
                                alert('Login failed: ' + data.message);
                            }
                        });
                });
            }
            if (registerForm) {
                registerForm.addEventListener('submit', function(event) {
                    event.preventDefault();
                    const username = document.getElementById('newuser').value;
                    const password1 = document.getElementById('password1').value;
                    const password2 = document.getElementById('password2').value;
                    const email = document.getElementById('email').value;
                    if (password1 === password2) {
                        let password = password1;
                        fetch('/api/auth/register', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ username, password, email })
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    alert('Registration successful. Please login.');
                                    location.reload();
                                } else {
                                    alert('Registration failed: ' + data.message);
                                }
                            });
                    } else {
                        alert("passwords do not match!");
                        window.location.href = 'register.html';
                    }
                });
            }
            if (settingsForm) {
                settingsForm.addEventListener('submit', function(event) {
                    event.preventDefault();
                    const username = document.getElementById('settingsUsername').value;
                    const email = document.getElementById('settingsEmail').value;
                    const currentPassword = document.getElementById('settingsCurrentPassword').value;
                    const newPassword = document.getElementById('settingsNewPassword').value;
                    const confirmPassword = document.getElementById('settingsConfirmPassword').value;

                    if (newPassword === confirmPassword) {
                        fetch('/api/users/update', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify({ username, email, currentPassword, newPassword })
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    alert('Settings updated successfully.');
                                    location.reload();
                                } else {
                                    alert('Failed to update settings: ' + data.message);
                                }
                            });
                    } else {
                        alert("New password and confirm password do not match!");
                    }
                });
            }
        });
});

function logout() {
    localStorage.removeItem('token');
    location.reload();
}

function toggleTheme() {
    const darkTheme = document.querySelector('link[href="css/gruvbox-dark.css"]');
    const lightTheme = document.querySelector('link[href="css/gruvbox-light.css"]');

    if (darkTheme.disabled) {
        darkTheme.disabled = false;
        lightTheme.disabled = true;
        localStorage.setItem('theme', 'dark');
    } else {
        darkTheme.disabled = true;
        lightTheme.disabled = false;
        localStorage.setItem('theme', 'light');
    }
}
