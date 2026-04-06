<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html class="${properties.kcHtmlClass!}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <#if properties.meta?has_content>
        <#list properties.meta?split(' ') as meta>
            <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}"/>
        </#list>
    </#if>
    
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <link rel="icon" href="${url.resourcesPath}/img/favicon.ico" />
    
    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
        </#list>
    </#if>
    <#if scripts??>
        <#list scripts as script>
            <script src="${script}" type="text/javascript"></script>
        </#list>
    </#if>
</head>

<body>
    <div class="login-pf-page">
        <div class="split-container">
            <!-- Left Side - Branding -->
            <div class="brand-side">
                <div class="brand-content">
                    <div class="brand-logo">
                        <div class="brand-icon">🛡️</div>
                        <h1 class="brand-name">Pahchaan</h1>
                    </div>
                    <p class="brand-tagline">your single identity</p>
                    
                    <div class="brand-features">
                        <div class="feature-item">
                            <div class="feature-icon">🔐</div>
                            <div class="feature-text">
                                <h3>Secure Authentication</h3>
                                <p>Enterprise-grade security with multi-factor authentication</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">🔗</div>
                            <div class="feature-text">
                                <h3>Single Sign-On</h3>
                                <p>Access all SL Pro and other supported third-party apps with one account</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">⚡</div>
                            <div class="feature-text">
                                <h3>Seamless Experience</h3>
                                <p>Fast, reliable, and easy to use across all devices</p>
                            </div>
                        </div>
						<div class="feature-item">
                            <div class="feature-icon">🚀</div>
                            <div class="feature-text">
                                <h3>Innovative Digital Solutions</h3>
                                <p>Empowering businesses with cutting-edge applications and seamless digital experiences</p>
                            </div>
                        </div>						
                    </div>
                </div>
            </div>

            <!-- Right Side - Form -->
            <div class="form-side">
                <div class="form-container">

                    <#if displayRequiredFields>
                        <div class="alert alert-info">
                            <span>*</span> ${msg("requiredFields")}
                        </div>
                    </#if>

          <!--          <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                        <div class="alert alert-${message.type}">
                            <#if message.type = 'success'>✓</#if>
                            <#if message.type = 'warning'>⚠</#if>
                            <#if message.type = 'error'>✕</#if>
                            <#if message.type = 'info'>ℹ</#if>
                            ${kcSanitize(message.summary)?no_esc}
                        </div>
                    </#if>
--!>
                    <div class="form-header">
                        <h1>
                            <#nested "header">
                        </h1>
                        <!--
                        <#if displayInfo>
                            <p>
                                <#nested "info">
                            </p>
                        </#if>
                        --!>
                    </div>

                    <#nested "form">

                    <#if displayInfo>
                        <div id="kc-info">
                            <div id="kc-info-wrapper">
                                <#nested "info">
                            </div>
                        </div>
                    </#if>
                </div>
            </div>
        </div>
    </div>
	<footer>
		<p> Pahchaan - A Product of SL Pro Eco System</p>
        <p>© 2026 SL Pro. All rights reserved. | Building the future of digital solutions.</p>
        <p>Contact us: <a href="mailto:support@slpro.com" style="color: rgba(255,255,255,0.9);">support@slpro.com</a></p>
    </footer>
</body>
</html>
</#macro>
