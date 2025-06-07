# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
npm run dev              # Start development server (port 5000)

# Build & Production
npm run build           # Build client and server for production
npm run start           # Start production server

# Type Checking
npm run check           # Run TypeScript type checking

# Database
npm run db:push         # Push Drizzle schema changes to database
```

## Architecture Overview

This is a full-stack TypeScript application for browsing and learning from 57 AI prompting protocols in Uzbek.

### Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Express + TypeScript + Drizzle ORM + PostgreSQL/Supabase
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Query (TanStack Query)
- **Search**: Fuse.js for fuzzy search

### Key Architectural Decisions

1. **Hybrid Storage System**: The backend (server/storage.ts) implements a fallback mechanism - if database connection fails, it uses in-memory storage with the seeded data.

2. **Shared Types**: All types are defined in `shared/schema.ts` using Drizzle ORM, ensuring type safety across frontend and backend.

3. **API Structure**:
   - `GET /api/protocols` - Paginated list with search/filter support
   - `GET /api/protocols/:id` - Single protocol details
   - `GET /api/categories` - All categories
   - `POST /api/auth/login` - Basic authentication

4. **Design System**: 
   - Colors: Black (#000), White (#FFF), Accent (#FF4F30)
   - Font: Inter Black 900 for headers
   - Components: Using shadcn/ui component library

## Database Schema

Three main tables defined in `shared/schema.ts`:
- `protocols`: Main content (id, number, title, description, examples, etc.)
- `categories`: 6 protocol categories
- `users`: Basic user authentication

## Important Implementation Details

- Protocols data is loaded from `/attached_assets/prtocols.txt`
- The app runs on port 5000 by default
- Environment variables: `SUPABASE_DB_PASSWORD` or `DATABASE_URL` for database connection
- Client-side search uses Fuse.js for fuzzy matching
- Pagination: 20 items per page
- Mobile-first responsive design

## Development Tools

- Using docker for containerization and consistent development environment