<#import "template.ftl" as layout>
<@layout.emailLayout>
    <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
        ${msg("emailVerificationTitle")}
    </h2>

    <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        ${msg("emailVerificationGreeting", user.firstName!"")}
    </p>

    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        ${msg("emailVerificationBody")}
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="text-align: center; padding: 20px 0;">
                <a href="${link}" 
                   style="display: inline-block; background: linear-gradient(to right, #4f46e5, #9333ea); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    ${msg("emailVerificationButton")}
                </a>
            </td>
        </tr>
    </table>

    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 500;">
            ℹ️ ${msg("emailVerificationInfo")}
        </p>
        <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 14px;">
            ${msg("emailVerificationExpiry", linkExpiration)}
        </p>
    </div>

    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        ${msg("emailVerificationAlternative")}
    </p>
    <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px; word-break: break-all;">
        <a href="${link}" style="color: #4f46e5;">${link}</a>
    </p>

    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        ${msg("emailClosing")}<br>
        ${msg("emailSignature")}
    </p>
</@layout.emailLayout>
