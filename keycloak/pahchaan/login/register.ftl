<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm'); section>
    <#if section = "header">
        ${msg("registerTitle")}
    <#elseif section = "form">
        <a href="${url.loginUrl}" class="back-link">
            ← ${kcSanitize(msg("backToLogin"))}
        </a>

        <form id="kc-register-form" action="${url.registrationAction}" method="post">
            <div class="form-group">
                <label for="firstName">${msg("firstName")}</label>
                <input type="text" 
                       id="firstName" 
                       name="firstName" 
                       value="${(register.formData.firstName!'')}"
                       placeholder="${msg("firstName")}"
                       aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>" />
                <#if messagesPerField.existsError('firstName')>
                    <span class="error-message" style="color: var(--red-600); font-size: 0.875rem;">
                        ${kcSanitize(messagesPerField.get('firstName'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="form-group">
                <label for="lastName">${msg("lastName")}</label>
                <input type="text" 
                       id="lastName" 
                       name="lastName" 
                       value="${(register.formData.lastName!'')}"
                       placeholder="${msg("lastName")}"
                       aria-invalid="<#if messagesPerField.existsError('lastName')>true</#if>" />
                <#if messagesPerField.existsError('lastName')>
                    <span class="error-message" style="color: var(--red-600); font-size: 0.875rem;">
                        ${kcSanitize(messagesPerField.get('lastName'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="form-group">
                <label for="email">${msg("email")}</label>
                <input type="email" 
                       id="email" 
                       name="email" 
                       value="${(register.formData.email!'')}" 
                       autocomplete="email"
                       placeholder="${msg("email")}"
                       aria-invalid="<#if messagesPerField.existsError('email')>true</#if>" />
                <#if messagesPerField.existsError('email')>
                    <span class="error-message" style="color: var(--red-600); font-size: 0.875rem;">
                        ${kcSanitize(messagesPerField.get('email'))?no_esc}
                    </span>
                </#if>
            </div>

            <#if !realm.registrationEmailAsUsername>
                <div class="form-group">
                    <label for="username">${msg("username")}</label>
                    <input type="text" 
                           id="username" 
                           name="username" 
                           value="${(register.formData.username!'')}" 
                           autocomplete="username"
                           placeholder="${msg("username")}"
                           aria-invalid="<#if messagesPerField.existsError('username')>true</#if>" />
                    <#if messagesPerField.existsError('username')>
                        <span class="error-message" style="color: var(--red-600); font-size: 0.875rem;">
                            ${kcSanitize(messagesPerField.get('username'))?no_esc}
                        </span>
                    </#if>
                </div>
            </#if>

            <#if passwordRequired??>
                <div class="form-group">
                    <label for="password">${msg("password")}</label>
                    <div class="password-wrapper">
                        <input type="password" 
                               id="password" 
                               name="password" 
                               autocomplete="new-password"
                               placeholder="${msg("password")}"
                               aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>" />
                        <button type="button" class="password-toggle" onclick="togglePassword()">
                            <span id="eye-icon">👁</span>
                        </button>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--gray-500); margin: 0.25rem 0 0 0;">
                        ${msg("passwordRequirements")}
                    </p>
                    <#if messagesPerField.existsError('password')>
                        <span class="error-message" style="color: var(--red-600); font-size: 0.875rem;">
                            ${kcSanitize(messagesPerField.get('password'))?no_esc}
                        </span>
                    </#if>
                </div>

                <div class="form-group">
                    <label for="password-confirm">${msg("passwordConfirm")}</label>
                    <div class="password-wrapper">
                        <input type="password" 
                               id="password-confirm" 
                               name="password-confirm"
                               autocomplete="new-password"
                               placeholder="${msg("passwordConfirm")}"
                               aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>" />
                        <button type="button" class="password-toggle" onclick="togglePasswordConfirm()">
                            <span id="eye-icon-confirm">👁</span>
                        </button>
                    </div>
                    <#if messagesPerField.existsError('password-confirm')>
                        <span class="error-message" style="color: var(--red-600); font-size: 0.875rem;">
                            ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                        </span>
                    </#if>
                </div>
            </#if>

            <#if recaptchaRequired??>
                <div class="form-group">
                    <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                </div>
            </#if>

            <button type="submit" class="btn btn-primary">
                ${msg("doRegister")}
            </button>
        </form>

        <div class="form-footer">
            <span>${msg("alreadyHaveAccount")}</span>
            <a href="${url.loginUrl}">${msg("doLogIn")}</a>
        </div>

        <script>
            function togglePassword() {
                var passwordInput = document.getElementById('password');
                var eyeIcon = document.getElementById('eye-icon');
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    eyeIcon.textContent = '👁‍🗨';
                } else {
                    passwordInput.type = 'password';
                    eyeIcon.textContent = '👁';
                }
            }

            function togglePasswordConfirm() {
                var passwordInput = document.getElementById('password-confirm');
                var eyeIcon = document.getElementById('eye-icon-confirm');
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    eyeIcon.textContent = '👁‍🗨';
                } else {
                    passwordInput.type = 'password';
                    eyeIcon.textContent = '👁';
                }
            }
        </script>
    </#if>
</@layout.registrationLayout>
