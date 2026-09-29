# Income Manager

Income Manager is a modern, responsive financial management web application built with React, Vite, and Tailwind CSS. It allows freelancers, online entrepreneurs, and professionals to record daily income, manage multiple revenue sources, categorize payments, set monthly targets, inspect detailed analytics, and export financial reports.

---

## Features

- **Dashboard**: High-level KPIs (Today, This Week, This Month, Monthly Target) with interactive daily income and monthly trend charts.
- **Income History**: Full transaction ledger with search, multi-criteria filtering (Today, This Month, Source, Category, Payment Method), and CSV export.
- **Daily View & Calendar**: Date-by-date inspection and an interactive heatmap calendar with color-coded income intensity.
- **Target Tracking**: Set targets per month with live velocity calculations, run-rate projections, and celebration feedback upon achievement.
- **Categories & Sources**: Customized management of clients, platforms, and services with real-time revenue contribution percentages.
- **Reports & Analytics**: Daily, Weekly, Monthly, and Yearly financial summaries with print-ready statement views.
- **Data Export**: Direct CSV spreadsheet download, JSON backup & restore, and print-to-PDF formatting.
- **Offline / Local Persistence**: All records, categories, sources, and settings are saved securely in browser storage.
- **Dark & Light Mode**: Deep navy fintech aesthetic with emerald green indicators and seamless theme switching.

---

## Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abdulmanan143/Income-Manage.git
   cd Income-Manage
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` (or the port indicated in terminal).

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build locally**:
   ```bash
   npm run preview
   ```

---

## GitHub Pages Deployment

### 1. How the Project is Built
The project is built using [Vite](https://vitejs.dev/) with React and TypeScript. Running `npm run build` runs `vite build`, which compiles TypeScript and bundles all assets into the `dist/` directory.

In `vite.config.ts`, the application's base path is configured dynamically:
- In production builds (`npm run build`), the base path is automatically set to `/Income-Manage/`.
- In local development (`npm run dev`), the base path defaults to `/` for localhost testing.

An SPA redirect fallback (`public/404.html`) and redirect receiver in `index.html` ensure direct navigation and page reloads work smoothly on GitHub Pages without 404 errors.

### 2. How Deployment Works
Deployment is fully automated using GitHub Actions via `.github/workflows/deploy.yml`:
1. You commit and push changes to the `main` branch.
2. The GitHub Actions workflow triggers automatically.
3. Node.js 20 environment is initialized and dependencies are installed (`npm ci`).
4. The production bundle is generated (`npm run build`).
5. The `dist/` directory is uploaded as a Pages artifact.
6. The official GitHub Pages deployment action (`actions/deploy-pages@v4`) deploys the artifact.
7. Your updated application is instantly live.

### 3. Which Branch is Used
- **Branch**: `main`
- Every push to `main` triggers an automatic deployment.
- You can also manually trigger a deployment from the **Actions** tab on GitHub via `workflow_dispatch`.

### 4. Expected GitHub Pages URL
Your deployed application will be accessible at:
```
https://abdulmanan143.github.io/Income-Manage/
```

### 5. Required GitHub Repository Settings
You must configure the GitHub Pages deployment source in your GitHub repository once:

1. Open your repository on GitHub: `https://github.com/abdulmanan143/Income-Manage`
2. Click on **Settings** (top navigation tab).
3. In the left sidebar under **Code and automation**, click on **Pages**.
4. Under **Build and deployment** -> **Source**, select **GitHub Actions** (instead of "Deploy from a branch").
5. Save the settings.

### 6. Environment Variables and Secrets
- **No secrets are required** for basic operation: the entire Income Manager runs client-side with full data isolation and local storage persistence.
- If you integrate external server-side APIs or AI features in the future:
  - Add your secrets under **Settings** -> **Secrets and variables** -> **Actions** -> **Repository secrets**.
  - Reference them in `.github/workflows/deploy.yml` as environment variables if needed during the build step.
