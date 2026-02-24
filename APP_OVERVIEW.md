# M&T Growth Gateway - Application Overview

## 🏗️ Technical Stack

The M&T Growth Gateway is a modern, full-stack web application built with a focus on performance, scalability, and ease of maintenance.

### Frontend
- **Framework:** [React 18](https://reactjs.org/) (Functional Components, Hooks)
- **Language:** [TypeScript](https://www.typescriptlang.org/) for type safety
- **Build Tool:** [Vite](https://vitejs.dev/) for ultra-fast development and optimized production builds
- **Styling:**
    - [Tailwind CSS](https://tailwindcss.com/) for utility-first responsive design
    - [shadcn/ui](https://ui.shadcn.com/) for high-quality, accessible UI components
    - [Lucide React](https://lucide.dev/) for consistent iconography
- **State Management:** [TanStack Query (React Query)](https://tanstack.com/query/latest) for server-state management and caching
- **Routing:** [React Router DOM v6](https://reactrouter.com/) for client-side navigation
- **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for robust validation
- **Charts:** [Recharts](https://recharts.org/) for data visualization in the dashboard
- **Animations:** `tailwindcss-animate` and `locomotive-scroll` for smooth transitions and interactions

### Backend & Infrastructure
- **Platform:** [Supabase](https://supabase.com/) (BaaS)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with Row-Level Security (RLS)
- **Authentication:** Supabase Auth (Email/Password)
- **Edge Functions:** Supabase Edge Functions (Deno) for server-side logic and integrations
- **AI Integration:** [OpenAI GPT-4o-mini](https://openai.com/) via Edge Functions for the AI Financial Assistant

### Integrations
- **Payment Processing:** Planned integration with **MTN MoMo API** and **Airtel Money** for disbursements and repayments.
- **AI Assistant:** Real-time financial insights and data queries using OpenAI.

---

## 🛠️ General Functionality

The application is divided into two primary sections: the **Public Website** and the **Staff Portal**.

### 1. Public Website
Designed to showcase the company's offerings and provide essential information to prospective clients.
- **Dynamic Homepage:** Hero section with featured carousels and core value propositions.
- **Product Catalog:** Detailed view of loan products, interest rates, and application requirements.
- **Company Profile:** Information about M&T Microfinance, its board of directors, and history.
- **Branch Locator:** Map and list view of physical locations and territories.
- **Lead Generation:** Integrated contact and inquiry forms.

### 2. Staff Portal (Management System)
A secure back-office system for loan officers and administrators to manage the entire loan lifecycle.
- **Authentication & Roles:** Secure login with role-based access control (Admin, Loan Officer).
- **Executive Dashboard:** High-level overview of total disbursements, active loans, and repayment trends.
- **AI Financial Assistant:** An interactive chat interface that allows staff to query database insights using natural language.
- **Loan Lifecycle Management:**
    - **Applications:** Create, track, and process loan applications (Pending -> Approved/Rejected).
    - **Active Loans:** Monitor disbursed loans, outstanding balances, and repayment progress.
    - **Repayment Tracking:** Record and schedule loan repayments.
- **Asset & Risk Management:**
    - **Collateral Registry:** Track physical and financial collateral associated with loans.
    - **Client Management:** Comprehensive database of client profiles and their financial history.
- **Administrative Tools:**
    - **Branch Management:** Track performance across different geographic branches.
    - **Product Management:** Configure interest rates, durations, and loan limits.
    - **Reporting:** Generate loan performance, financial status, and client demographic reports.

---

## 💰 Core Business Logic
The system is specifically tailored for **Individual Loans** with a flexible financial model:
- **Interest Model:** Configurable interest rates per loan product (flat rate applied to the total loan amount).
- **Individual Borrowers:** Each loan is issued to a single borrower with personalized terms.
- **Loan Performance Tracking:** Comprehensive reports to monitor loan portfolio performance and repayment trends.
