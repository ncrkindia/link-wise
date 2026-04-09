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

## 🚀 Deployment Options

Link-Wise offers three ways to deploy, depending on your environment and requirements.

### Option 1: Unified Standalone Bundle (Recommended for Quick Start)
The **All-In-One Docker Bundle** is optimized for rapid production deployment. It bundles the Next.js app, MariaDB, and Keycloak (IAM) into a single container managed by Supervisor.

#### 1. Build the Image
```bash
docker build -t linkwise-standalone:latest -f Dockerfile.standalone .
```

#### 2. Run the Platform
Run with zero configuration for local testing (defaults to `localhost:3010` and `localhost:8080`).
```bash
docker run -d \
  -p 3010:3010 -p 8080:8080 -p 3306:3306 \
  --name linkwise-bundle linkwise-standalone:latest
```

#### 🌐 Key Access Points
*   **App Interface**: `http://localhost:3010`
*   **Auth Console**: `http://localhost:8080`
*   **Default Creds**: `admin@slpro.in` / `admin123`

---

### Option 2: Modular Production (External Services)
Use this option if you have an existing MySQL/MariaDB and Keycloak instance. This uses the standard `Dockerfile` to build only the application container.

#### 1. Build the Application Image
```bash
docker build -t linkwise-app:latest .
```

#### 2. Configure & Run
You can use `docker-compose.yml` for orchestration or run the container manually with environment variables pointing to your external services.

```bash
docker run -d \
  -p 3010:3010 \
  -e DATABASE_URL="mysql://user:pass@your-db-host:3306/dbname" \
  -e AUTH_KEYCLOAK_ID="linkwise-client" \
  -e AUTH_KEYCLOAK_SECRET="your-client-secret" \
  -e AUTH_KEYCLOAK_ISSUER="https://your-keycloak/realms/your-realm" \
  -e AUTH_SECRET="your-nextauth-secret" \
  -e AUTH_URL="https://your-app-domain.com" \
  --name linkwise-app linkwise-app:latest
```


> [!TIP]
> Refer to the `docker-compose.yml` in the root directory for a complete orchestration example including health checks and dependency management.

---

### Option 3: Native Run (Directly from Git Repo)
Ideal for local development or custom server environments where Docker is not used.

#### 1. Clone & Install
```bash
git clone https://github.com/ncrkindia/link-wise.git
cd link-wise
npm install --legacy-peer-deps
```

#### 2. Environment Setup
Create a `.env.local` file in the root and configure your connection strings:
```env
DATABASE_URL="mysql://user:pass@localhost:3306/linkwise"
AUTH_KEYCLOAK_ID="linkwise-client"
AUTH_KEYCLOAK_SECRET="..."
AUTH_KEYCLOAK_ISSUER="..."
AUTH_SECRET="..."
AUTH_URL="http://localhost:3010"
```

#### 3. Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:9002`.

#### 4. Build & Start (Production Mode)
```bash
npm run build
npm run start
```

---

## ⚙️ Configuration Reference

Use these environment variables to customize the platform. You can set them in a `.env.local` file when running natively, or pass them as `-e` flags when using Docker.

### Core & Branding
| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `AUTH_URL` | Public base URL of the application. | `http://localhost:3010` |
| `NEXT_PUBLIC_APP_NAME` | Custom branding name shown in the UI. | `LinkWise` |
| `NEXT_PUBLIC_SUPPORT_EMAIL`| Support email shown in reports/footers. | `linkwise@slpro.in` |

### Database & Authentication
| Variable | Description | Mandatory |
| :--- | :--- | :--- |
| `DATABASE_URL` | MySQL/MariaDB connection string. | **Yes** |
| `AUTH_SECRET` | Secret key for session encryption. | **Yes** |
| `AUTH_KEYCLOAK_ID` | Keycloak client ID. | **Yes** |
| `AUTH_KEYCLOAK_SECRET` | Keycloak client secret. | **Yes** |
| `AUTH_KEYCLOAK_ISSUER` | Keycloak realm URL. | **Yes** |

### SMTP Settings (Required for Campaigns)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `SMTP_HOST` | Outgoing mail server. | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port (TLS). | `587` |
| `SMTP_USER` | SMTP username. | `user@gmail.com` |
| `SMTP_PASS` | SMTP password/App password. | `xxxx-xxxx-...` |
| `SMTP_FROM_NAME` | Sender display name. | `Link-Wise Support` |
| `SMTP_FROM_EMAIL`| Actual sender email address. | `support@slpro.in` |

---

## 📂 Project Structure

- `src/`: Application source code (Next.js).
- `Dockerfile.standalone`: All-In-One Docker bundle configuration.
- `supervisord-standalone.conf`: Process management for the standalone bundle.
- `public/`: Static assets.
- `Dockerfile` & `docker-compose.yml`: Standard multi-container deployment files.

---

## 🛡 Security & Compliance

- **Role-Based Access**: Administrative features are gated by the **LW_ADMIN** role in Keycloak. 
- **Automatic Sync**: The application automatically syncs Keycloak roles to the local database on every sign-in.
- **Reporting Logs**: System reports include generator metadata and legal disclaimers for professional auditing.

---

## 📄 License

This project is licensed under the **MIT License**.

Developed with ❤️ by [Naveen Chauhan](https://github.com/ncrkindia)
