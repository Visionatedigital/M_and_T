# M&T Growth Gateway - Microfinance Management System

![M&T Microfinance](https://img.shields.io/badge/M%26T-Microfinance-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

A comprehensive microfinance management system for M&T Microfinance (U) Ltd, specializing in **individual loans** with flexible terms. Built with React, TypeScript, and Supabase.

## 🏦 About M&T Microfinance

M&T Microfinance (U) Ltd is a leading microfinance institution in Uganda, dedicated to providing accessible and affordable financial services to individuals, civil servants, and small to medium enterprises. Our motto: **"Developing Together"**.

### Core Business Model

- **Individual Loans**: Primary product offering for individual borrowers
- **Flexible Interest Rates**: Configurable rates per loan product
- **Personalized Terms**: Each loan tailored to individual borrower needs
- **Comprehensive Tracking**: Monitor loan performance and repayment progress

---

## ✨ Features

### Public Website
- 🏠 Homepage with hero carousel and company information
- 📋 Products page showcasing all loan products
- 🏢 About page with company history and board of directors
- 📍 Branch locations
- 📞 Contact form

### Staff Portal
- 🔐 **Staff Authentication** - Secure login for loan officers and admins
- 📊 **Dashboard** - Overview of applications, active loans, and statistics
- 🤖 **AI Financial Assistant** - Powered by OpenAI for data queries and insights

### Loan Management
- 📝 **Loan Applications** - Create, review, approve/reject applications
- 👤 **Individual Borrower Focus** - Streamlined application process for individual clients
- 💰 **Active Loans** - Track disbursed loans and repayment progress
- 📈 **Performance Tracking** - Monitor loan portfolio performance and trends
- 💵 **Repayment Management** - Track payments and schedules

### Administration
- 👤 **Client Management** - View and manage client profiles
- 📊 **Reports** - Loan, financial, and client reports
- 🛡️ **Collateral & Assets** - Register and track collateral
- 🏢 **Branch Management** - Multi-branch support
- 📦 **Product Management** - Configure loan products and rates

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions) |
| AI | OpenAI GPT-4o-mini |
| State Management | TanStack Query |
| Routing | React Router DOM |
| Forms | React Hook Form, Zod |
| Charts | Recharts |

---

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key (for AI assistant)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shammahkahangi/m-t-growth-gateway.git
   cd m-t-growth-gateway
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration file in SQL Editor:
     ```
     supabase/migrations/20251202101432_remix_migration_from_pg_dump.sql
     ```
   - Deploy the Edge Function:
     ```bash
     supabase functions deploy ai-financial-assistant
     ```
   - Set secrets in Supabase:
     ```bash
     supabase secrets set OPENAI_API_KEY=your-openai-key
     ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:8080
   ```

---

## 💳 Mobile Money Integration

### Overview

M&T Growth Gateway supports mobile money payments for loan disbursements and repayments, integrating with major Ugandan mobile money providers.

### Supported Providers

| Provider | API | Status |
|----------|-----|--------|
| MTN Mobile Money | MTN MoMo API | 🔜 Planned |
| Airtel Money | Airtel Money API | 🔜 Planned |

### Integration Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Supabase Edge  │────▶│  Mobile Money   │
│   (React)       │     │   Functions     │     │      API        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                       │
         │                      ▼                       │
         │              ┌─────────────────┐            │
         └─────────────▶│   PostgreSQL    │◀───────────┘
                        │   (Supabase)    │
                        └─────────────────┘
```

### MTN MoMo API Integration

To integrate MTN Mobile Money:

1. **Register for MTN MoMo API**
   - Visit: https://momodeveloper.mtn.com/
   - Create a developer account
   - Subscribe to the Collections and Disbursements products

2. **Configure API Credentials**
   ```bash
   # Set in Supabase secrets
   supabase secrets set MTN_MOMO_API_KEY=your-api-key
   supabase secrets set MTN_MOMO_API_SECRET=your-api-secret
   supabase secrets set MTN_MOMO_SUBSCRIPTION_KEY=your-subscription-key
   supabase secrets set MTN_MOMO_ENVIRONMENT=sandbox  # or production
   ```

3. **API Endpoints Used**
   - `POST /collection/v1_0/requesttopay` - Collect loan repayments
   - `POST /disbursement/v1_0/transfer` - Disburse approved loans
   - `GET /collection/v1_0/requesttopay/{referenceId}` - Check payment status

### Airtel Money API Integration

To integrate Airtel Money:

1. **Register for Airtel Money API**
   - Contact Airtel Uganda business team
   - Complete merchant registration

2. **Configure API Credentials**
   ```bash
   # Set in Supabase secrets
   supabase secrets set AIRTEL_CLIENT_ID=your-client-id
   supabase secrets set AIRTEL_CLIENT_SECRET=your-client-secret
   supabase secrets set AIRTEL_ENVIRONMENT=sandbox  # or production
   ```

### Payment Flow

#### Loan Disbursement (Outgoing Payment)
```
1. Loan approved by staff
2. System initiates disbursement via MoMo/Airtel API
3. Client receives funds on mobile money
4. Transaction recorded in database
5. Loan status updated to "disbursed"
```

#### Loan Repayment (Incoming Payment)
```
1. Client initiates payment on phone
2. Mobile money API sends callback
3. Edge function processes payment
4. Repayment recorded in database
5. Loan balance updated
```

### Sample Edge Function for Mobile Money

```typescript
// supabase/functions/momo-collection/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MTN_API_URL = Deno.env.get('MTN_MOMO_ENVIRONMENT') === 'production'
  ? 'https://proxy.momoapi.mtn.com'
  : 'https://sandbox.momodeveloper.mtn.com';

serve(async (req) => {
  const { amount, phone_number, loan_id, reference } = await req.json();
  
  // Request to pay
  const response = await fetch(`${MTN_API_URL}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getAccessToken()}`,
      'X-Reference-Id': reference,
      'X-Target-Environment': Deno.env.get('MTN_MOMO_ENVIRONMENT'),
      'Ocp-Apim-Subscription-Key': Deno.env.get('MTN_MOMO_SUBSCRIPTION_KEY'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount.toString(),
      currency: 'UGX',
      externalId: loan_id,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phone_number,
      },
      payerMessage: 'M&T Loan Repayment',
      payeeNote: `Loan repayment for ${loan_id}`,
    }),
  });

  return new Response(JSON.stringify({ success: response.ok }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## 💰 Loan Calculation

### Interest Rate Structure

| Parameter | Value |
|-----------|-------|
| Interest Rate | Configurable per loan product |
| Calculation Method | Simple interest on principal |
| Applied | Once over the entire loan cycle |

### Calculation Formula

```
Principal Amount:     P
Interest Rate:        R (configurable per product)
Total Interest:       P × R
Total Amount:         P + (P × R) = P × (1 + R)
Monthly Payment:      Total Amount ÷ Loan Duration (months)
```

### Example Calculation (20% Interest Rate)

| Loan Amount | Duration | Interest (20%) | Total | Monthly Payment |
|-------------|----------|----------|-------|-----------------|
| UGX 1,000,000 | 12 months | UGX 200,000 | UGX 1,200,000 | UGX 100,000 |
| UGX 5,000,000 | 24 months | UGX 1,000,000 | UGX 6,000,000 | UGX 250,000 |
| UGX 10,000,000 | 36 months | UGX 2,000,000 | UGX 12,000,000 | UGX 333,333 |

---

## 🗄️ Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (clients and staff) |
| `user_roles` | Role assignments (admin, loan_officer, client) |
| `loan_applications` | Loan application records |
| `loan_products` | Available loan products |
| `collateral` | Collateral registered against loans |
| `branches` | Branch information |
| `territories` | Geographic territories |

### Key Relationships

```
profiles ──────┬───── user_roles
               │
               └───── loan_applications ───── collateral
                              │
                              └───── loan_products
```

---

## 🔐 Authentication & Authorization

### User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full system access |
| `loan_officer` | Manage applications, clients, repayments |
| `client` | View own loans and make payments |

### Access Control

- Staff portal requires `admin` or `loan_officer` role
- Row-level security (RLS) enforced at database level
- JWT tokens managed by Supabase Auth

---

## 📱 API Reference

### Supabase Edge Functions

| Function | Description |
|----------|-------------|
| `ai-financial-assistant` | AI-powered financial queries |
| `momo-collection` | MTN MoMo payment collection (planned) |
| `momo-disbursement` | MTN MoMo loan disbursement (planned) |
| `airtel-payment` | Airtel Money integration (planned) |

---

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Deploy

### Local Tunnel (ngrok)

For temporary sharing:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start ngrok
npx -y ngrok http 8080
```

---

## 📁 Project Structure

```
m-t-growth-gateway/
├── src/
│   ├── components/
│   │   ├── staff/          # Staff portal components
│   │   └── ui/             # shadcn/ui components
│   ├── integrations/
│   │   └── supabase/       # Supabase client & types
│   ├── pages/
│   │   ├── staff/          # Staff dashboard pages
│   │   └── *.tsx           # Public pages
│   └── hooks/              # Custom React hooks
├── supabase/
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software owned by M&T Microfinance (U) Ltd.

---

## 📞 Contact

**M&T Microfinance (U) Ltd**

- 📍 Plot 2D/2E Nakasero Hill Road, P.O.Box 29692 Kampala, Uganda
- 📱 +256 785 609 370 / +256 756 790 357
- 📧 info@m&tmicrofinance.com

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [OpenAI](https://openai.com) - AI assistant capabilities
- [Tailwind CSS](https://tailwindcss.com) - Styling framework

---

Built with ❤️ for M&T Microfinance (U) Ltd
