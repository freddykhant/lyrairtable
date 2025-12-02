# Airtable Clone

A full-featured spreadsheet application built to handle 100k+ rows with smooth performance.

## Features

- **Google Authentication** - secure login via NextAuth
- **Bases & Tables** - create and organize your data
- **Dynamic Columns** - add text and number columns on the fly
- **Cell Editing** - inline editing with keyboard navigation (arrow keys + tab)
- **Views System** - save configurations per view:
  - Column visibility (hide/show)
  - Sorting (A→Z, Z→A, 1→9, 9→1)
  - Filtering (contains, equals, greater than, etc.)
- **Virtualized Scrolling** - render 100k+ rows without lag
- **Database-Level Operations** - search, filter, and sort execute on PostgreSQL

## Tech Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Framework      | Next.js 15 (App Router) |
| Auth           | NextAuth (Google)       |
| API            | tRPC                    |
| Database       | PostgreSQL (Neon)       |
| ORM            | Drizzle                 |
| Styling        | Tailwind CSS            |
| Table          | TanStack Table          |
| Virtualization | TanStack Virtual        |
| Mock Data      | Faker.js                |

## Getting Started

```bash
# install dependencies
pnpm install

# set up environment variables
cp .env.example .env

# push database schema
pnpm db:push

# run development server
pnpm dev
```

## Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```
