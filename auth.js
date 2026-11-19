(function () {
  var isGitHubPages = window.location.hostname.endsWith("github.io");
  var API_BASE = window.STACKLY_API_URL || (
    !isGitHubPages && (window.location.protocol === "http:" || window.location.protocol === "https:")
      ? window.location.origin
      : (!isGitHubPages ? "http://localhost:8000" : "")
  );

  // Check and process OAuth redirect response (token in query string)
  (function processOAuthRedirect() {
    try {
      var params = new URLSearchParams(window.location.search);
      var token = params.get("token");
      if (token) {
        var name = params.get("name") || "User";
        var email = params.get("email") || "";
        var provider = params.get("provider") || "social";
        localStorage.setItem("stackly-auth-token", token);
        localStorage.setItem("stackly-demo-session", JSON.stringify({
          name: decodeURIComponent(name),
          email: decodeURIComponent(email),
          provider: provider
        }));
        params.delete("token");
        params.delete("name");
        params.delete("email");
        params.delete("provider");
        var newSearch = params.toString() ? "?" + params.toString() : "";
        window.history.replaceState({}, document.title, window.location.pathname + newSearch);
      }
    } catch (e) {
      console.warn("Could not process OAuth redirect parameters.", e);
    }
  })();

  function getUsers() {
    var stored = localStorage.getItem("stackly-demo-users");
    if (!stored) return [];
    try { return JSON.parse(stored); } catch (error) {
      return [];
    }
  }

  function setMessage(form, message, isError) {
    var node = form.querySelector(".form-message");
    if (node) {
      node.textContent = message;
      node.style.color = isError ? "#e74c3c" : "var(--blue)";
    }
  }

  function setFormError(input, message) {
    input.setCustomValidity(message);
    input.reportValidity();
    input.addEventListener("input", function clearError() {
      input.setCustomValidity("");
      input.removeEventListener("input", clearError);
    }, { once: true });
  }

  // Global logout method accessible across pages and scripts
  window.stacklyLogout = function () {
    var token = localStorage.getItem("stackly-auth-token");
    if (token) {
      var targets = [];
      if (API_BASE) targets.push(API_BASE);
      if (!isGitHubPages && !window.location.protocol.startsWith("https")) {
        targets.push("http://localhost:8000");
      }
      targets.forEach(function (url) {
        if (url && url.startsWith("http")) {
          fetch(url + "/api/auth/logout", {
            method: "POST",
            headers: { "Authorization": "Bearer " + token }
          }).catch(function () {});
        }
      });
    }
    localStorage.removeItem("stackly-auth-token");
    localStorage.removeItem("stackly-demo-session");
    window.location.href = "signin.html";
  };

  // -------------------------------------------------------------
  // Google & Microsoft In-Page Interactive OAuth System
  // -------------------------------------------------------------
  function openOAuthModal(provider) {
    var isGoogle = provider.toLowerCase() === "google";
    var title = isGoogle ? "Sign in with Google" : "Sign in to Microsoft";
    var brandColor = isGoogle ? "#1a73e8" : "#00a4ef";
    var domain = isGoogle ? "gmail.com" : "outlook.com";
    
    var logoSvg = isGoogle ? 
      '<svg width="40" height="40" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>'
      : '<svg width="40" height="40" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>';

    var existing = document.querySelector(".oauth-modal-overlay");
    if (existing) existing.remove();

    var overlay = document.createElement("div");
    overlay.className = "oauth-modal-overlay";
    overlay.innerHTML = 
      '<div class="oauth-modal" role="dialog" aria-modal="true">' +
        '<button type="button" class="oauth-modal-close" aria-label="Close">&times;</button>' +
        '<div class="oauth-modal-logo">' + logoSvg + '</div>' +
        '<h2 class="oauth-modal-title">' + title + '</h2>' +
        '<p class="oauth-modal-subtitle">Choose an account to continue to <b>Stackly</b></p>' +
        '<div class="oauth-account-list">' +
          '<div class="oauth-account-item" data-account-name="User" data-account-email="user@' + domain + '">' +
            '<div class="oauth-account-avatar" style="background:' + brandColor + ';">U</div>' +
            '<div class="oauth-account-info">' +
              '<div class="oauth-account-name">User</div>' +
              '<div class="oauth-account-email">user@' + domain + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="oauth-divider"><span>Or enter your details</span></div>' +
        '<form class="oauth-custom-form">' +
          '<label>Display Name</label>' +
          '<input type="text" class="oauth-name-input" placeholder="Enter your name" required>' +
          '<label>Email Address</label>' +
          '<input type="email" class="oauth-email-input" placeholder="Enter your email address" required>' +
          '<button type="submit" class="oauth-submit-btn" style="background:' + brandColor + ';">Continue with ' + (isGoogle ? 'Google' : 'Microsoft') + '</button>' +
        '</form>' +
        '<p class="oauth-footer-note">To continue, Stackly will verify your identity with ' + (isGoogle ? 'Google' : 'Microsoft') + '.</p>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector(".oauth-modal-close").addEventListener("click", function () {
      overlay.remove();
    });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });

    overlay.querySelectorAll(".oauth-account-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var name = item.dataset.accountName;
        var email = item.dataset.accountEmail;
        completeSocialLogin(provider, name, email, overlay);
      });
    });

    overlay.querySelector(".oauth-custom-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = overlay.querySelector(".oauth-name-input").value.trim() || "User";
      var email = overlay.querySelector(".oauth-email-input").value.trim();
      if (!email) return;
      completeSocialLogin(provider, name, email, overlay);
    });
  }

  async function completeSocialLogin(provider, name, email, overlay) {
    if (overlay) {
      overlay.querySelector(".oauth-modal").innerHTML = 
        '<div style="padding: 30px 10px;">' +
          '<div style="font-size: 28px; margin-bottom: 14px;">⏳</div>' +
          '<h3 style="font-size: 18px; margin-bottom: 8px;">Connecting to ' + (provider === "google" ? "Google" : "Microsoft") + '…</h3>' +
          '<p style="font-size: 13px; color: #64748b;">Signing in as <b>' + email + '</b></p>' +
        '</div>';
    }

    var token = "jwt_social_" + provider + "_" + Date.now();
    var userObj = {
      name: name,
      email: email,
      provider: provider,
      created_at: new Date().toISOString()
    };

    // Try synchronizing with FastAPI backend (port 8000 or same origin)
    var backendEndpoints = [];
    if (API_BASE) {
      backendEndpoints.push(API_BASE + "/api/auth/oauth/social");
    }
    if (!isGitHubPages && !window.location.protocol.startsWith("https")) {
      backendEndpoints.push("http://localhost:8000/api/auth/oauth/social");
      backendEndpoints.push("http://127.0.0.1:8000/api/auth/oauth/social");
    }

    for (var i = 0; i < backendEndpoints.length; i++) {
      try {
        var res = await fetch(backendEndpoints[i], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: provider.toLowerCase(),
            email: email,
            name: name,
            provider_id: "oauth_" + provider + "_" + Math.floor(Math.random() * 1000000)
          })
        });
        if (res.ok) {
          var data = await res.json();
          if (data.token) token = data.token;
          if (data.user) userObj = data.user;
          break;
        }
      } catch (err) {
        // Backend not reachable, continue to fallback
      }
    }

    // Save active token and session in browser
    localStorage.setItem("stackly-auth-token", token);
    localStorage.setItem("stackly-demo-session", JSON.stringify(userObj));

    // Also persist in local users list
    var users = getUsers();
    if (!users.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) {
      users.push({ name: name, email: email, provider: provider });
      localStorage.setItem("stackly-demo-users", JSON.stringify(users));
    }

    if (overlay) {
      overlay.querySelector(".oauth-modal").innerHTML = 
        '<div style="padding: 30px 10px;">' +
          '<div style="font-size: 30px; color: #10b981; margin-bottom: 14px;">✓</div>' +
          '<h3 style="font-size: 18px; color: #10b981; margin-bottom: 8px;">Signed in successfully!</h3>' +
          '<p style="font-size: 13px; color: #64748b;">Welcome, <b>' + name + '</b>. Taking you to the store…</p>' +
        '</div>';
    }

    window.setTimeout(function () {
      window.location.href = "index.html";
    }, 700);
  }

  function ready() {
    // Password visibility toggle
    document.querySelectorAll(".password-toggle").forEach(function (button) {
      button.addEventListener("click", function () {
        var input = button.parentElement.querySelector("input");
        var isVisible = input.type === "text";
        input.type = isVisible ? "password" : "text";
        button.textContent = isVisible ? "Show" : "Hide";
        button.setAttribute("aria-label", isVisible ? "Show password" : "Hide password");
      });
    });

    // Google and Microsoft Social Auth Buttons
    document.querySelectorAll("[data-social-provider]").forEach(function (button) {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        var provider = button.dataset.socialProvider;
        openOAuthModal(provider);
      });
    });

    // Check if user is already signed in on signin.html
    var sessionData = localStorage.getItem("stackly-demo-session");
    var signInCard = document.querySelector(".auth-card");
    var isSignInPage = window.location.pathname.endsWith("signin.html");
    if (isSignInPage && sessionData && signInCard) {
      try {
        var currentUser = JSON.parse(sessionData);
        var existingForm = document.getElementById("signin-form");
        if (existingForm && currentUser.email) {
          var container = document.createElement("div");
          container.className = "auth-logged-in";
          container.innerHTML = 
            '<p>You are currently signed in as <b>' + (currentUser.name || currentUser.email) + '</b><br><small style="color:#7f8c8d;">(' + currentUser.email + ' &bull; ' + (currentUser.provider || 'local') + ')</small></p>' +
            '<button type="button" class="logout-btn" onclick="window.stacklyLogout()">Sign Out</button>' +
            '<a href="index.html" class="shop-btn">Continue Shopping</a>';
          existingForm.style.display = "none";
          var divider = signInCard.querySelector(".auth-divider");
          var social = signInCard.querySelector(".social-auth");
          var bottom = signInCard.querySelector(".auth-bottom");
          if (divider) divider.style.display = "none";
          if (social) social.style.display = "none";
          if (bottom) bottom.style.display = "none";
          signInCard.querySelector(".auth-intro").textContent = "Account Active";
          signInCard.insertBefore(container, signInCard.querySelector(".demo-note"));
        }
      } catch (e) {}
    }

    // Sign In Form Submission
    var signIn = document.getElementById("signin-form");
    if (signIn) {
      signIn.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!signIn.reportValidity()) return;
        var email = signIn.elements.email.value.trim().toLowerCase();
        var password = signIn.elements.password.value;
        var submitButton = signIn.querySelector(".auth-submit");
        if (submitButton) { submitButton.disabled = true; submitButton.textContent = "Signing in…"; }

        var success = false;
        var endpoints = [];
        if (API_BASE) {
          endpoints.push(API_BASE + "/api/auth/login");
        }
        if (!isGitHubPages && !window.location.protocol.startsWith("https")) {
          endpoints.push("http://localhost:8000/api/auth/login");
        }

        for (var i = 0; i < endpoints.length; i++) {
          try {
            var response = await fetch(endpoints[i], {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: email, password: password })
            });
            var data = await response.json();
            if (response.ok && data.token) {
              localStorage.setItem("stackly-auth-token", data.token);
              localStorage.setItem("stackly-demo-session", JSON.stringify(data.user));
              setMessage(signIn, "Signed in successfully! Redirecting…", false);
              window.setTimeout(function () { window.location.href = "index.html"; }, 700);
              success = true;
              break;
            } else if (response.status === 400 || response.status === 401) {
              setMessage(signIn, data.detail || "Invalid credentials.", true);
              if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Sign In"; }
              return;
            }
          } catch (e) {}
        }

        if (!success) {
          // Offline fallback
          var localUser = getUsers().find(function (item) { return item.email.toLowerCase() === email && item.password === password; });
          if (localUser) {
            localStorage.setItem("stackly-demo-session", JSON.stringify({ name: localUser.name, email: localUser.email }));
            setMessage(signIn, "Signed in! Redirecting…", false);
            window.setTimeout(function () { window.location.href = "index.html"; }, 700);
            return;
          }
          setMessage(signIn, "We couldn't match that email and password. Please check your details.", true);
          if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Sign In"; }
        }
      });
    }

    // Sign Up Form Submission
    var signUp = document.getElementById("signup-form");
    if (signUp) {
      signUp.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!signUp.reportValidity()) return;
        var password = signUp.elements.password.value;
        if (password !== signUp.elements.confirm.value) {
          setFormError(signUp.elements.confirm, "Passwords do not match.");
          return;
        }
        var name = signUp.elements.name.value.trim();
        var email = signUp.elements.email.value.trim().toLowerCase();
        var submitButton = signUp.querySelector(".auth-submit");
        if (submitButton) { submitButton.disabled = true; submitButton.textContent = "Creating account…"; }

        var success = false;
        var endpoints = [];
        if (API_BASE) {
          endpoints.push(API_BASE + "/api/auth/signup");
        }
        if (!isGitHubPages && !window.location.protocol.startsWith("https")) {
          endpoints.push("http://localhost:8000/api/auth/signup");
        }

        for (var i = 0; i < endpoints.length; i++) {
          try {
            var response = await fetch(endpoints[i], {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: name, email: email, password: password })
            });
            var data = await response.json();
            if (response.ok && data.token) {
              localStorage.setItem("stackly-auth-token", data.token);
              localStorage.setItem("stackly-demo-session", JSON.stringify(data.user));
              var users = getUsers();
              if (!users.some(function (u) { return u.email.toLowerCase() === email; })) {
                users.push({ name: name, email: email, password: password });
                localStorage.setItem("stackly-demo-users", JSON.stringify(users));
              }
              setMessage(signUp, "Account created successfully! Redirecting…", false);
              window.setTimeout(function () { window.location.href = "index.html"; }, 700);
              success = true;
              break;
            } else if (response.status === 400) {
              setMessage(signUp, data.detail || "Account already exists.", true);
              if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Create account"; }
              return;
            }
          } catch (e) {}
        }

        if (!success) {
          // Offline fallback
          var usersList = getUsers();
          if (usersList.some(function (u) { return u.email.toLowerCase() === email; })) {
            setMessage(signUp, "An account with this email already exists. Please sign in.", true);
            if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Create account"; }
            return;
          }
          var newUser = { name: name, email: email, password: password };
          usersList.push(newUser);
          localStorage.setItem("stackly-demo-users", JSON.stringify(usersList));
          localStorage.setItem("stackly-demo-session", JSON.stringify({ name: newUser.name, email: newUser.email }));
          setMessage(signUp, "Account created successfully! Redirecting…", false);
          window.setTimeout(function () { window.location.href = "index.html"; }, 700);
        }
      });
    }

    // Forgot Password Form Submission
    var forgot = document.getElementById("forgot-form");
    if (forgot) {
      forgot.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!forgot.reportValidity()) return;
        sessionStorage.setItem("stackly-recovery-email", forgot.elements.email.value.trim().toLowerCase());
        sessionStorage.setItem("stackly-auth-flow", "reset-verified");
        window.location.href = "reset-password.html";
      });
      var service = document.createElement("p");
      service.className = "auth-bottom";
      service.innerHTML = 'Need help? <a href="mailto:support@stackly.example">Contact Customer Service</a>';
      forgot.parentElement.appendChild(service);
    }

    // Reset Password Form Submission
    var reset = document.getElementById("reset-form");
    if (reset) {
      reset.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!reset.reportValidity()) return;
        if (reset.elements.password.value !== reset.elements.confirm.value) {
          setFormError(reset.elements.confirm, "Passwords do not match.");
          return;
        }
        var recoveryEmail = sessionStorage.getItem("stackly-recovery-email");
        if (!recoveryEmail) {
          setMessage(reset, "Please enter your recovery email first.", true);
          return;
        }
        var users = getUsers();
        var user = users.find(function (item) { return item.email.toLowerCase() === recoveryEmail.toLowerCase(); });
        if (user) {
          user.password = reset.elements.password.value;
          localStorage.setItem("stackly-demo-users", JSON.stringify(users));
        }
        sessionStorage.removeItem("stackly-recovery-email");
        sessionStorage.removeItem("stackly-auth-flow");
        setMessage(reset, "Password updated in this browser. Redirecting to sign in…", false);
        window.setTimeout(function () { window.location.href = "signin.html"; }, 900);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", ready);
})();
