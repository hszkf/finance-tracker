# Finance Tracker

A production-ready personal finance application to track spending in London while living in Malaysia. Built with modern technologies and best practices.

## Features

- **Multi-currency Support**: GBP (primary) and MYR for Malaysian expenses
- **Spending Groups**: Share expenses with flatmates, friends, or travel companions
- **Split Expenses**: Split bills among group members with settlement tracking
- **Budget Tracking**: Set and monitor monthly budgets by category
- **Analytics Dashboard**: Visualize spending patterns with charts
- **Dark Mode**: Light/dark theme with system preference support
- **Responsive Design**: Works on desktop and mobile devices
- **Email Notifications**: Budget alerts and weekly summaries via Resend

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Backend | Hono.js |
| Frontend | React + TanStack Router |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Email | Resend |
| Testing | Bun test, Vitest, Playwright |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- [Supabase](https://supabase.com/) account
- [Resend](https://resend.com/) account (for emails)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hasifzulkifli17/finance-tracker.git
cd finance-tracker
```

2. Install dependencies:
```bash
bun install
```

3. Copy the environment file and configure:
```bash
cp .env.example .env
```

4. Set up your environment variables in `.env`:
```env
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
APP_URL=http://localhost:3000
```

5. Set up the database:
```bash
bun run db:push
bun run db:seed
```

6. Start the development server:
```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

## Available Scripts

### Development
```bash
bun run dev           # Start both backend and frontend
bun run dev:backend   # Start Hono.js API server (port 3001)
bun run dev:frontend  # Start Vite frontend (port 3000)
```

### Database
```bash
bun run db:generate   # Generate Drizzle migrations
bun run db:migrate    # Apply migrations
bun run db:push       # Push schema directly (dev only)
bun run db:seed       # Seed default categories
bun run db:studio     # Open Drizzle Studio
```

### Testing
```bash
bun test              # Run backend tests
bun run test:frontend # Run frontend tests
bun run test:e2e      # Run Playwright E2E tests
bun run test:all      # Run all tests
```

### Build & Production
```bash
bun run build         # Build for production
bun run start         # Start production server
```

## Project Structure

```
src/
├── api/              # Hono.js API routes
│   ├── routes/       # Route handlers
│   ├── middleware/   # Auth, validation middleware
│   └── services/     # Business logic
├── db/
│   ├── schema/       # Drizzle schema definitions
│   └── migrations/   # Database migrations
├── features/         # Feature-based components
│   ├── auth/
│   ├── transactions/
│   ├── groups/
│   └── dashboard/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── forms/        # Form components
│   └── layout/       # Layout components
├── lib/              # Utilities and configurations
├── routes/           # TanStack Router pages
└── tests/
    ├── e2e/          # Playwright tests
    └── mocks/        # MSW handlers
```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes with tests
3. Run `bun run test:prepush` to verify
4. Commit with conventional commits: `git commit -m "feat: add new feature"`
5. Push and create a PR

## License

MIT License - see [LICENSE](LICENSE) for details.
