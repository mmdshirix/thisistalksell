# Next.js 14 Full-Stack Application

A complete, production-ready Next.js 14 application with TypeScript, PostgreSQL, and modern development practices. Optimized for deployment on cloud platforms like Liara, Vercel, Railway, and Render.

## 🚀 Features

### Core Technologies
- **Next.js 14** with App Router and TypeScript
- **PostgreSQL** database with Prisma ORM
- **shadcn/ui** components with Tailwind CSS
- **JWT Authentication** with bcrypt password hashing
- **Structured Logging** with Pino
- **Input Validation** with Zod schemas
- **Docker** support with multi-stage builds

### Production Ready
- ✅ Optimized Docker configuration with Alpine Linux
- ✅ Security headers and best practices
- ✅ Health checks and monitoring endpoints
- ✅ Environment variable management
- ✅ Database connection pooling
- ✅ Error handling and logging
- ✅ Performance optimizations
- ✅ SEO and accessibility features

### Development Experience
- ✅ TypeScript with strict configuration
- ✅ ESLint and Prettier setup
- ✅ Husky pre-commit hooks
- ✅ Jest testing framework
- ✅ Hot reload and fast refresh
- ✅ Database migrations and seeding

## 📦 Quick Start

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository:**
\`\`\`bash
git clone <repository-url>
cd nextjs-fullstack-app
\`\`\`

2. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables:**
\`\`\`bash
cp .env.example .env
# Edit .env with your database credentials and secrets
\`\`\`

4. **Set up the database:**
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database
npm run db:seed
\`\`\`

5. **Run the development server:**
\`\`\`bash
npm run dev
\`\`\`

6. **Open your browser:**
Visit [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Build and Run with Docker

1. **Build the Docker image:**
\`\`\`bash
docker build --build-arg DATABASE_URL="your-database-url" -t nextjs-app .
\`\`\`

2. **Run the container:**
\`\`\`bash
docker run -p 3000:3000 \\
  -e DATABASE_URL="your-database-url" \\
  -e JWT_SECRET="your-jwt-secret" \\
  nextjs-app
\`\`\`

### Docker Compose (Development)

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
\`\`\`

## ☁️ Cloud Deployment

### Liara Deployment

1. **Install Liara CLI:**
\`\`\`bash
npm install -g @liara/cli
\`\`\`

2. **Login to Liara:**
\`\`\`bash
liara login
\`\`\`

3. **Create liara.json:**
\`\`\`json
{
  "platform": "docker",
  "app": "your-app-name",
  "port": 3000,
  "buildArgs": {
    "DATABASE_URL": "$DATABASE_URL"
  }
}
\`\`\`

4. **Deploy:**
\`\`\`bash
liara deploy
\`\`\`

### Vercel Deployment

1. **Install Vercel CLI:**
\`\`\`bash
npm install -g vercel
\`\`\`

2. **Deploy:**
\`\`\`bash
vercel --prod
\`\`\`

### Railway Deployment

1. **Connect your GitHub repository to Railway**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically on push**

## 📁 Project Structure

\`\`\`
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Core utilities
│   │   ├── auth.ts            # Authentication functions
│   │   ├── db.ts              # Database connection
│   │   ├── logger.ts          # Logging configuration
│   │   └── utils.ts           # Utility functions
│   ├── services/              # Business logic
│   │   ├── admin.service.ts   # Admin operations
│   │   └── chatbot.service.ts # Chatbot operations
│   └── utils/                 # Helper utilities
│       ├── constants.ts       # Application constants
│       └── validation.ts      # Validation schemas
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma          # Prisma schema
│   └── seed.ts                # Database seeding
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose setup
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
\`\`\`

## 🔧 API Endpoints

### Health & System
- \`GET /api/health\` - Application health check
- \`GET /api/database/test\` - Database connection test
- \`POST /api/database/init\` - Initialize database with sample data

### Authentication
- \`POST /api/admin-panel/[id]/login\` - Admin login
- \`POST /api/admin-panel/[id]/logout\` - Admin logout

### Chatbots
- \`GET /api/chatbots\` - Get all chatbots
- \`POST /api/chatbots\` - Create new chatbot
- \`GET /api/chatbots/[id]\` - Get chatbot by ID
- \`PUT /api/chatbots/[id]\` - Update chatbot
- \`DELETE /api/chatbots/[id]\` - Delete chatbot

## 🛠️ Development Commands

\`\`\`bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
\`\`\`

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| \`DATABASE_URL\` | PostgreSQL connection string | ✅ | - |
| \`JWT_SECRET\` | JWT signing secret (min 32 chars) | ✅ | - |
| \`NODE_ENV\` | Environment mode | ❌ | development |
| \`PORT\` | Server port | ❌ | 3000 |
| \`LOG_LEVEL\` | Logging level | ❌ | info |
| \`NEXT_PUBLIC_APP_URL\` | Public app URL | ❌ | http://localhost:3000 |

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcrypt (12 rounds)
- **Input Validation** with Zod schemas
- **SQL Injection Protection** via Prisma ORM
- **Security Headers** (CSP, HSTS, etc.)
- **Rate Limiting** for API endpoints
- **CORS Configuration** for cross-origin requests
- **Environment Variable Validation**

## 📊 Performance Optimizations

- **Next.js Standalone Output** for smaller Docker images
- **Multi-stage Docker Builds** for production efficiency
- **Database Connection Pooling** with Prisma
- **Image Optimization** with Next.js Image component
- **Bundle Analysis** and code splitting
- **CSS Optimization** with Tailwind CSS purging
- **Compression** and minification in production

## 🧪 Testing

The project includes a comprehensive testing setup:

\`\`\`bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
\`\`\`

## 📈 Monitoring & Logging

- **Structured Logging** with Pino
- **Health Check Endpoints** for monitoring
- **Error Tracking** with detailed stack traces
- **Performance Metrics** collection
- **Database Query Logging** in development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Make your changes and add tests
4. Run the test suite: \`npm run test\`
5. Run linting: \`npm run lint:fix\`
6. Commit your changes: \`git commit -m 'Add amazing feature'\`
7. Push to the branch: \`git push origin feature/amazing-feature\`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/nextjs-fullstack-app/issues) page
2. Create a new issue with detailed information
3. Join our [Discord community](https://discord.gg/your-invite)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Prisma](https://prisma.io/) - Next-generation ORM for Node.js
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vercel](https://vercel.com/) - Platform for frontend frameworks

---

**Built with ❤️ for the developer community**
