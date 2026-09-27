# MyResume

**Dynamic full-stack portfolio with Next.js 15, PostgreSQL, and an authenticated admin dashboard.**

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

---

## What It Does

A database-driven portfolio where all content (projects, skills, experience) is managed through an authenticated admin CMS rather than hardcoded.

**Key Features:**
- **Dynamic Content** — powered by PostgreSQL + Prisma
- **Admin CMS** — authenticated CRUD interface
- **Server Components** — Next.js 15 App Router optimizations
- **Type Safety** — React Hook Form + Zod validation
- **State Management** — React Query for client-side caching

## Architecture

```
Public Portfolio ↔ Next.js App Router (Server Components) ↔ Prisma ↔ PostgreSQL
                            ↕
Admin CMS ↔ NextAuth v5 (Authentication)
```

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 |
| UI | Tailwind CSS |

## My Role

I designed the database schema, planned the admin CRUD workflow, and selected NextAuth for authentication. Code generation was accelerated using AI tools; session handling, Prisma migration issues, and React Query cache invalidation are mine.

## Quick Start

```bash
git clone https://github.com/AdityaPandey-DEV/MyResume.git && cd MyResume
npm install
# Configure .env.local (PostgreSQL + NextAuth)
npm run prisma:db push && npm run dev
```

---

<div align="center">

*Architected & built by [Aditya Pandey](https://github.com/AdityaPandey-DEV) — AI-augmented development*

</div>
