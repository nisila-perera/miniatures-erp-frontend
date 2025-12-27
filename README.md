# Miniatures.lk ERP System - Frontend

Next.js frontend for the Miniatures.lk ERP System. This repository contains the complete frontend application with React components, TypeScript, and Tailwind CSS.

## Features

- **Order Management**: Create, view, and manage orders with status tracking
- **Product Catalog**: Browse and manage products with categories
- **Customer Management**: View and manage customer information
- **Financial Dashboard**: Payment tracking and expense management
- **Invoicing**: Generate and send invoices
- **Reports & Analytics**: Sales reports, profit/loss statements
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 with App Router |
| UI Library | React 19 |
| Language | TypeScript 5.3 |
| Styling | Tailwind CSS 3.4 |
| Linting | ESLint 9 (flat config) |
| Testing | Jest 29 |
| Containerization | Docker, Docker Compose |
| Runtime | Node.js 20+ |

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Git installed
- Backend API running (see miniatures-erp-backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd miniatures-erp-frontend
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   # Set NEXT_PUBLIC_API_URL to your backend API URL
   ```

3. **Start the development environment**
   ```bash
   make dev
   # Or: docker compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000

### Docker Commands

```bash
make dev          # Start development environment
make prod         # Start production environment
make down         # Stop all containers
make logs-dev     # View development logs
make test         # Run frontend tests
make shell        # Open shell in frontend container
make health       # Check services health
```

## Local Development (Without Docker)

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env - set NEXT_PUBLIC_API_URL to your backend URL
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000

## Project Structure

```
miniatures-erp-frontend/
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── config/            # Application configuration
│   ├── services/          # API client services
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── __tests__/         # Test files
├── public/                # Static assets
├── docker/nginx/          # Nginx configuration (production)
├── docker-compose.yml     # Development Docker Compose
├── docker-compose.prod.yml # Production Docker Compose
├── Dockerfile             # Multi-stage Docker build
├── Makefile               # Convenience commands
├── eslint.config.mjs      # ESLint flat config (ESLint 9+)
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Node.js dependencies
```

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm test          # Run tests
npm run lint      # Run ESLint
```

## Environment Variables

See `.env.example` for all available configuration options.

### Required Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g., http://localhost:8000) |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BRAND_NAME` | Brand name displayed in UI | Miniatures.lk |
| `NEXT_PUBLIC_PRIMARY_COLOR` | Primary brand color | #C9A66B |
| `NEXT_PUBLIC_SECONDARY_COLOR` | Secondary brand color | #EBD3A0 |
| `NEXT_PUBLIC_DARK_COLOR` | Dark theme color | #2F2F2F |

## Production Deployment

1. **Configure production environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   # Set NEXT_PUBLIC_API_URL to /api if using nginx reverse proxy
   ```

2. **Build and start production**
   ```bash
   make prod
   ```

## Brand Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary | `#C9A66B` | Main brand color |
| Secondary | `#EBD3A0` | Accent color |
| Dark | `#2F2F2F` | Text and backgrounds |

## License

Proprietary - All rights reserved

## Support

For support, contact: support@miniatures.lk

