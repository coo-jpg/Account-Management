# BBCSS Account Management System v4.0
## Built for the J3S Office

### Deploy to Vercel (easiest)
```bash
npm install
npx vercel
```

### Deploy to Netlify
```bash
npm install
npm run build
# Upload the 'dist' folder to Netlify
```

### Deploy manually
```bash
npm install
npm run build
# Serve the 'dist' folder with any static host (nginx, apache, S3, etc.)
```

### Local development
```bash
npm install
npm run dev
```

### Branding logo
- Place your logo at `public/logo.png` (recommended transparent PNG).
- The app now shows this logo on the login screen and top navigation bar, with a `BBCSS` fallback if the file is missing.

### Login Credentials
| Username | Password | Role  |
|----------|----------|-------|
| sajid    | admin123 | Admin |
| ops      | 123      | User  |

### Supabase Backend
- Project: BBCSS Ops (iqccddabidfcrsbdehiq)
- Region: ap-south-1 (Mumbai)
- Tables: accounts, account_payments, account_documents, account_settings, acm_users

### Features
- Server-side bcrypt authentication via Supabase RPC
- Admin/User role-based access control
- Create new users from the webapp
- Account management with code, staff breakdown by role, compliance tracking
- Document uploads to Supabase Storage (5MB, PDF/DOC/IMG/XLS)
- Payment recording with full history
- Collection health analytics with aging analysis
- Renewal pipeline tracking
- Effectiveness scoring (Staffing, Collection, Compliance, Renewal)
- CSV export
- Fully customizable settings
