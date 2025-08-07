# Next.js 14 Full-Stack Application

A complete Next.js 14 application with TypeScript, PostgreSQL, and shadcn/ui components, optimized for deployment on Liara or Docker.

## 🚀 Features

- **Next.js 14** with App Router and TypeScript
- **shadcn/ui** components (Card, Button, Input, Label, Alert)
- **PostgreSQL** database integration with @vercel/postgres
- **JWT Authentication** for admin panel
- **Docker** support with Node.js 20 Alpine
- **Production-ready** configuration
- **Health checks** and monitoring
- **Responsive design** with Tailwind CSS

## 📦 Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd nextjs-fullstack-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your database credentials
\`\`\`

4. Initialize the database:
\`\`\`bash
curl -X POST http://localhost:3000/api/database/init
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## 🐳 Docker Deployment

1. Build the Docker image:
\`\`\`bash
docker build --build-arg DATABASE_URL="your-database-url" -t nextjs-app .
\`\`\`

2. Run the container:
\`\`\`bash
docker run -p 3000:3000 -e DATABASE_URL="your-database-url" nextjs-app
\`\`\`

## 🚀 Liara Deployment

1. Install Liara CLI:
\`\`\`bash
npm install -g @liara/cli
\`\`\`

2. Login to Liara:
\`\`\`bash
liara login
\`\`\`

3. Deploy:
\`\`\`bash
liara deploy
\`\`\`

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js App Router
│   ├── admin-panel/       # Admin panel pages
│   ├── api/               # API routes
│   ├── chatbots/          # Chatbot management
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── admin-auth.ts      # Authentication functions
│   ├── db.ts              # Database functions
│   └── utils.ts           # Utility functions
├── Dockerfile             # Docker configuration
└── next.config.mjs        # Next.js configuration
\`\`\`

## 🔧 API Endpoints

- `GET /api/health` - Health check
- `GET /api/database/test` - Test database connection
- `POST /api/database/init` - Initialize database
- `GET /api/chatbots` - Get all chatbots
- `POST /api/chatbots` - Create new chatbot
- `POST /api/admin-panel/[id]/login` - Admin login

## 🛠️ Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 3000 |
| `NEXT_PUBLIC_APP_URL` | Public app URL | http://localhost:3000 |

## 🔒 Security Features

- JWT-based authentication
- Non-root Docker user
- Input validation
- SQL injection protection
- CORS configuration
- Health monitoring

## 📊 Performance Optimizations

- Standalone Next.js output
- Docker multi-stage builds
- Image optimization
- CSS optimization
- Bundle analysis
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
