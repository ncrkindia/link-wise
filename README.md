# Link-Wise 🔗 📊
**High-Performance Link Analytics & Stealth Email Tracking Platform**

Created by **[Naveen Chauhan](https://github.com/ncrkindia)**

Link-Wise is an enterprise-ready URL shortening and analytics platform with integrated "Stealth Tracking" for email campaigns. It allows you to monitor link performance, track email conversions without annoying recipients, and manage global analytics across multiple user accounts and domains.

## 🚀 Core Features

- **Smart URL Shortening**: Custom link creation with optional password protection and expiry dates.
- **Pixel Intelligence**: Zero-footprint 1x1 tracking pixels for email campaigns. Monitor opens, delivery, and interaction stealthily.
- **Email Campaign Engine**: Launch and track email blasts directly from the dashboard using your own SMTP relays.
- **Interactive Analytics**: Real-time charts, geographical heatmaps (Coming Soon), and device/browser intelligence.
- **Admin Hub**: Global oversight of all system-wide links, users, and campaigns via the **LW_ADMIN** role.
- **Professional Reporting**: Send high-fidelity PDF/HTML reports with detailed filtering, generation metadata, and legal disclaimers.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Database**: MariaDB (Integrated in standalone bundle)
- **Auth**: Keycloak (OIDC) / NextAuth.js v5
- **UI**: Tailwind CSS, Shadcn/UI, Lucide Iconography
- **Process Management**: Supervisor (All-In-One Orchestration)

---

## 📦 Production Deployment (Standalone Bundle)

Link-Wise is optimized for production as an **All-In-One Docker Bundle**. This single image contains the Next.js app, MariaDB, and a pre-configured Keycloak server, managed by Supervisor for maximum reliability.

### 1. Build the All-In-One Image
```bash
docker build -t linkwise-standalone:latest -f Dockerfile.standalone .
```

### 2. Run the Platform

#### 🏠 Local Development (Quick Start)
Run with zero configuration. The platform will default to `localhost:3010` and `localhost:8080`.
```bash
docker run -d \
  -p 3010:3010 -p 8080:8080 -p 3306:3306 \
  --name linkwise-local linkwise-standalone:latest
```

#### 🌐 Production Deployment (Full Configuration)
Deploy with custom domains, branding, and SMTP tracking enabled.
```bash
docker run -d \
  -p 3010:3010 -p 8080:8080 -p 3306:3306 \
  -e AUTH_URL="<https://linkwise.slpro.in>" \
  -e KC_HOSTNAME="<pahchaan.slpro.in>" \
  -e NEXT_PUBLIC_APP_NAME="<LinkWise Pro>" \
  -e NEXT_PUBLIC_SUPPORT_EMAIL="<support@slpro.in>" \
  -e SMTP_HOST="<smtp.gmail.com>" \
  -e SMTP_PORT="587" \
  -e SMTP_USER="<your-email@gmail.com>" \
  -e SMTP_PASS="<your-app-password>" \
  -e SMTP_FROM_NAME="<LinkWise Support>" \
  -e SMTP_FROM_EMAIL="support@slpro.in" \
  --restart always \
  --name linkwise-prod linkwise-standalone:latest
```

### 🌐 Key Access Points
*   **App Interface**: `http://localhost:3010` (or your configured `AUTH_URL`)
*   **Auth Console**: `http://localhost:8080` (or `https://${KC_HOSTNAME}`)
*   **Admin Creds**: `admin@slpro.in` / `admin123` (Requires **LW_ADMIN** role)
*   **Test Creds**: `test@slpro.in` / `test123` (Standard User)
> [!IMPORTANT]
> **Production Security**: You must change the default credentials immediately after deployment. This includes the Master Realm admin password (`admin`/`admin`) and the LinkWise client secret (`linkwise-client`/`linkwise-secret`). Use the Keycloak Auth Console to update these at the earliest.

---

## ⚙️ Configuration Reference

The standalone image is highly configurable via environment variables. Use these to tailor the platform to your domain and branding.

### Core Platform Settings
| Variable | Requirement | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `AUTH_URL` | **Optional** | `http://localhost:3010` | Public base URL of the Link-Wise application. |
| `KC_HOSTNAME` | **Optional** | `localhost` | Public domain for the Keycloak identity server. |
| `NEXT_PUBLIC_APP_NAME` | **Optional** | `LinkWise` | Custom branding name shown in the UI and report headers. |
| `NEXT_PUBLIC_SUPPORT_EMAIL`| **Optional** | `linkwise@slpro.in` | Support contact email shown in the footer and reports. |

### SMTP Configuration (Required for Campaigns & Reports)
| Variable | Requirement | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `SMTP_HOST` | **Mandatory** | `""` | Outgoing mail server (e.g., `smtp.gmail.com`). |
| `SMTP_PORT` | **Mandatory** | `""` | SMTP port (typically `587` for TLS). |
| `SMTP_USER` | **Mandatory** | `""` | Your SMTP username/email. |
| `SMTP_PASS` | **Mandatory** | `""` | Your SMTP password or App Password. |
| `SMTP_FROM_NAME` | **Optional** | `Link-Wise` | The name that appears in the "From" field of sent emails. |
| `SMTP_FROM_EMAIL`| **Mandatory** | `""` | The actual email address used as the sender. |

> [!TIP]
> **Dynamic DNS Support**: If you provide a custom `AUTH_URL`, the system automatically reconfigures the internal Next.js `NEXT_PUBLIC_APP_URL` and Keycloak's OIDC `redirectUris` on startup to match your new domain.

---

## 🛠 Manual Development Setup

If you wish to develop Link-Wise locally without the full bundle:

1. **Clone & Install**:
   ```bash
   git clone https://github.com/ncrkindia/link-wise.git
   cd link-wise && npm install --legacy-peer-deps
   ```

2. **Database Initialization**:
   The application will automatically create the required schema on its first connection to the database. Ensure `DATABASE_URL` is set in your `.env.local`.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 🛡 Security & Compliance

- **Role-Based Access**: Administrative features are gated by the **LW_ADMIN** role in Keycloak. 
- **Automatic Sync**: The application automatically syncs Keycloak roles to the local database on every sign-in.
- **Reporting Logs**: System reports include generator metadata and legal disclaimers for professional auditing.

---

## 📄 License

This project is licensed under the **MIT License**.

Developed with ❤️ by [Naveen Chauhan](https://github.com/ncrkindia)