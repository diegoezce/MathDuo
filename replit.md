# MathDuo Workspace

## Overview

A Duolingo-style math learning app built with React + Vite frontend, Express backend, PostgreSQL database, and full gamification features.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Auth**: JWT (jsonwebtoken) stored in localStorage as `mathduo_token`
- **Routing**: wouter

## App Features

- Vertical skill tree with 12 lessons across: Addition, Subtraction, Multiplication, Division, Fractions, Algebra
- Exercise types: multiple choice, fill-in-the-blank, word problems
- Gamification: XP, levels, lives/hearts, streaks, leaderboard, achievements
- Adaptive difficulty via lesson unlock progression
- Immediate feedback with animated correct/incorrect responses
- User onboarding, registration, and login

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Project Structure

- `artifacts/mathduo/` — React + Vite frontend
- `artifacts/api-server/` — Express API server
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod schemas
- `lib/db/src/schema/` — Database schema (users, lessons, exercises, progress, achievements)

## API Routes

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (requires Bearer token)
- `GET /api/lessons` — List all lessons
- `POST /api/lessons/:id/start` — Start a lesson session
- `POST /api/sessions/:sessionId/answer` — Submit an answer
- `POST /api/sessions/:sessionId/complete` — Complete a lesson
- `GET /api/progress` — Get user's lesson progress
- `GET /api/progress/streak` — Get streak info
- `GET /api/gamification/leaderboard` — Top users by XP
- `GET /api/gamification/achievements` — User achievements
