# Resume Portfolio - Next.js Full Stack

A modern, full-stack resume portfolio built with Next.js 15, TypeScript, Prisma, PostgreSQL, and NextAuth.

## Features

- **Full Stack Architecture**: Next.js 15 with App Router and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 for admin access
- **Data Management**: Admin dashboard to manage all resume data
- **Modern Tech Stack**: 
  - React Query for data fetching
  - Axios for HTTP requests
  - React Hook Form with Zod validation
  - Tailwind CSS for styling

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Git

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/resume_db?schema=public"

# NextAuth
AUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Admin Credentials (for initial setup)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password-here"
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

## Admin Dashboard

Access the admin dashboard at `/admin` to manage all resume data:

- **Hero Section**: Edit name, title, description, social links, and image
- **About Section**: Manage journey, personal values, and focus areas
- **Projects**: Add, edit, and delete projects
- **Skills**: Manage skill categories, advanced skills, and soft skills
- **Education**: Manage education entries
- **Certifications**: Manage certifications

**Login Credentials:**
- Use the email and password set in `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── admin/            # Admin components
│   └── ...               # Public components
├── hooks/                # Custom React Query hooks
├── lib/                  # Utility libraries
│   ├── axios.ts          # Axios configuration
│   ├── prisma.ts         # Prisma client
│   └── react-query.ts    # React Query setup
├── prisma/               # Prisma files
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── types/                # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database
- `npm run prisma:studio` - Open Prisma Studio

## Database Schema

The database includes models for:
- **Hero**: Personal information and social links
- **About**: Journey, values, and focus areas
- **Projects**: Project details with technologies and links
- **Skills**: Skill categories, advanced skills, and soft skills
- **Education**: Education history
- **Certifications**: Professional certifications
- **User**: Admin authentication

## Deployment

### Environment Variables

Make sure to set all environment variables in your deployment platform:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret (required for production)
- `NEXTAUTH_SECRET` - Alternative name for AUTH_SECRET (NextAuth v5 also accepts this)
- `NEXTAUTH_URL` - Your production URL (e.g., https://your-app.vercel.app) - Optional but recommended
- `ADMIN_EMAIL` - Admin email for seed script
- `ADMIN_PASSWORD` - Admin password for seed script

**Important for Vercel:**
- Make sure `AUTH_SECRET` is set in Vercel environment variables
- The `trustHost: true` option is set in NextAuth config for Vercel compatibility
- `ADMIN_EMAIL` - Admin email
- `ADMIN_PASSWORD` - Admin password (hashed in database)

### Build and Deploy

```bash
npm run build
npm run start
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **NextAuth.js v5** - Authentication
- **React Query** - Data fetching
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Tailwind CSS** - Styling

## License

MIT
