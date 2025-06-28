# Boilerplate Example Repo

## Stack - TW + Shadcn-ui + Vite + React + TS + Tanstack Router + Clerk + Supabase

- This template provides a minimal setup to get React working in Vite + Tailwind + Tanstack Router + Shadcn UI
- Includes Clerk authentication and Supabase database integration
- Tanstack Devtools has been intentionally included in demo

## Authentication & Database Setup

### Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your Clerk and Supabase credentials:
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Features Included
- **Authentication**: Clerk integration with sign-in/sign-up modals
- **Database**: Supabase client with Clerk JWT integration
- **Realtime**: Supabase realtime presence hooks
- **Route Protection**: Automatic redirect to login for protected routes
- **Auth Components**: Pre-built auth buttons and user management

### Getting Started
1. Install dependencies: `npm install`
2. Set up environment variables (see above)
3. Start development server: `npm run dev`
4. Configure your Clerk and Supabase projects as needed


