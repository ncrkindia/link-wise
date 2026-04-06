<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        ${msg("loginAccountTitle")}
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <#if realm.password>
                    <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                        <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                            <div class="alert alert-${message.type}">
                                <#if message.type = 'success'><span>✓</span></#if>
                                <#if message.type = 'warning'><span>⚠</span></#if>
                                <#if message.type = 'error'><span>✕</span></#if>
                                <#if message.type = 'info'><span>ℹ</span></#if>
                                <span>${kcSanitize(message.summary)?no_esc}</span>
                            </div>
                        </#if>

                        <div class="form-group">
                            <label for="username">
                                <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                            </label>
                            <input tabindex="1" 
                                   id="username" 
                                   name="username" 
                                   value="${(login.username!'')}" 
                                   type="text" 
                                   autofocus 
                                   autocomplete="off"
                                   placeholder="<#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>"
                                   aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>" />
                        </div>

                        <div class="form-group">
                            <label for="password">${msg("password")}</label>
                            <div class="password-wrapper">
                                <input tabindex="2" 
                                       id="password" 
                                       name="password" 
                                       type="password" 
                                       autocomplete="off"
                                       placeholder="${msg("password")}"
                                       aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>" />
                                <button type="button" class="password-toggle" onclick="togglePassword()">
                                    <span id="eye-icon">👁</span>
                                </button>
                            </div>
                        </div>

                        <div class="form-links">
                            <#if realm.rememberMe && !usernameHidden??>
                                <div class="checkbox-wrapper">
                                    <input tabindex="3" 
                                           id="rememberMe" 
                                           name="rememberMe" 
                                           type="checkbox"
                                           <#if login.rememberMe??>checked</#if> />
                                    <label for="rememberMe">${msg("rememberMe")}</label>
                                </div>
                            <#else>
                                <div></div>
                            </#if>

                            <#if realm.resetPasswordAllowed>
                                <a tabindex="5" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                            </#if>
                        </div>

                        <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                        
                        <button tabindex="4" 
                                class="btn btn-primary" 
                                name="login" 
                                id="kc-login" 
                                type="submit">
                            ${msg("doLogIn")}
                        </button>
                    </form>
                </#if>

                <#if realm.password && social.providers??>
                    <div class="divider">
                        <span>${msg("or")}</span>
                    </div>

                    <div class="social-login">
                        <#list social.providers as p>
                            <a id="social-${p.alias}" 
                               class="social-button" 
                               href="${p.loginUrl}">
                                <#if p.iconClasses?has_content>
                                    <i class="${p.iconClasses}" aria-hidden="true"></i>
                                </#if>
                                <span>${p.displayName}</span>
                            </a>
                        </#list>
                    </div>
                </#if>

                <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                    <div class="form-footer">
                        <span>${msg("noAccount")}</span>
                        <a tabindex="6" href="${url.registrationUrl}">${msg("doRegister")}</a>
                    </div>
                </#if>
            </div>
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
        </script>
    </#if>
</@layout.registrationLayout>
