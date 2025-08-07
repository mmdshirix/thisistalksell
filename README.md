# Next.js 14 Full-Stack Application

Complete Next.js 14 project with TypeScript, PostgreSQL, and shadcn/ui components.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ PostgreSQL database connection
- ✅ shadcn/ui components (card, button, input, label, alert)
- ✅ TailwindCSS styling
- ✅ Admin login page
- ✅ Docker support with Node.js 20
- ✅ Production-ready build

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your database URL
\`\`\`

3. Run development server:
\`\`\`bash
npm run dev
\`\`\`

4. Build for production:
\`\`\`bash
npm run build
\`\`\`

## Docker Deployment

1. Build Docker image:
\`\`\`bash
docker build -t nextjs-app .
\`\`\`

2. Run container:
\`\`\`bash
docker run -p 3000:3000 -e DATABASE_URL="your_database_url" nextjs-app
\`\`\`

## Project Structure

- `/app` - Next.js App Router pages and API routes
- `/components/ui` - shadcn/ui components
- `/lib` - Utility functions and database connection
- `Dockerfile` - Production Docker configuration

## Admin Panel

Access the admin login at: `/admin-panel/[id]/login`

Demo credentials:
- Username: `admin`
- Password: `password`
