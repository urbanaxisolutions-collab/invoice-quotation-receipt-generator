# DocsFlow — Invoice + Quotation + Receipt Generator

Production-grade, GitHub-connected full-stack application built with **Next.js 14 (App Router)**, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and NextAuth.

**One source of truth.** Convert Quotation → Invoice → Receipt seamlessly while preserving line items, tax, discounts, and currency.

## Current Status

| Phase | Status          | Commit |
|-------|------------------|--------|
| 0     | ✅ Done         | Master rules accepted |
| 1     | ✅ **Complete** | Scaffold + Prisma + Auth + Seed |
| 2     | ✅ **Complete** | Core Calculation Engine + Zod + Numbering + Tests |
| 3     | ✅ **Complete** | Document CRUD + Live Editor UI |
| 4     | ✅ **Complete** | Conversion Workflow (Quotation → Invoice → Receipt) |
| 5     | ✅ **Complete** | PDF Generation with React-PDF |
| 6     | ⏳ Pending      | Payments & Automation |

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials + Google)
- **Validation**: Zod (client + server)
- **PDF**: React-PDF
- **Money**: All values stored as integer cents (no floats)

## Getting Started (Local Development)

```bash
git clone https://github.com/urbanaxisolutions-collab/invoice-quotation-receipt-generator.git
cd invoice-quotation-receipt-generator

npm install
cp .env.example .env          # Add your DATABASE_URL and NEXTAUTH_SECRET

npx prisma migrate dev
npm run prisma:seed

npm run dev
```

## Project Structure

```
app/
├── (dashboard)/          # Protected routes
├── api/
├── login/
├── register/
components/
lib/
  ├── money.ts            # (Phase 2)
  ├── schemas.ts          # Zod schemas
  └── numbering.ts
prisma/
server/                   # Server Actions
types/
```

## Key Principles

- Every monetary value uses **minor units (cents)**
- All forms validated with **Zod on both client and server**
- Clean, reviewable commits only
- Mobile-first + WCAG AA accessibility
- Professional PDF output with theming

---

Built phase-by-phase with Grok as senior full-stack engineer.