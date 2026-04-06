<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        ${msg("emailForgotTitle")}
    <#elseif section = "form">
        <a href="${url.loginUrl}" class="back-link">
            ← ${kcSanitize(msg("backToLogin"))}
        </a>

        <form id="kc-reset-password-form" action="${url.loginAction}" method="post">
            <div class="form-group">
                <label for="username">
                    <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                </label>
                <input type="text" 
                       id="username" 
                       name="username" 
                       autofocus 
                       value="${(auth.attemptedUsername!'')}"
                       placeholder="<#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>"
                       aria-invalid="<#if messagesPerField.existsError('username')>true</#if>" />
                <#if messagesPerField.existsError('username')>
                    <span class="error-message">
                        ${kcSanitize(messagesPerField.get('username'))?no_esc}
                    </span>
                </#if>
            </div>

            <button class="btn btn-primary" type="submit">
                ${msg("doSubmit")}
            </button>
        </form>
    <#elseif section = "info">
       <p>${msg("emailInstruction")}</p>
    </#if>
</@layout.registrationLayout>
