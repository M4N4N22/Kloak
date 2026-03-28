# Kloak

A privacy-first payment link system built on the Aleo blockchain, enabling secure and private transactions using zero-knowledge proofs.

## Overview

Kloak allows creators to generate payment links that can be paid using Aleo's native credits (ALEO) or stablecoins (USDCx, USAD) with full privacy preservation. The system integrates on-chain Aleo programs for transaction logic, a Next.js web application for user interfaces, Supabase for off-chain metadata, and a Telegram bot for notifications and control.

## Important Links

- Deployed App  
  https://kloak.vercel.app

- Demo Video  
  https://youtu.be/b1AdffOf_PM

- Create Payment Link  
  https://kloak.vercel.app/payment-links

- Get Kloak Telegram Bot  
  https://kloak.vercel.app/bots

- Create a Webhook  
  https://kloak.vercel.app/webhooks

- Wave 4 Detailed Updates  
  https://github.com/M4N4N22/Kloak/blob/main/Wave4_Updates.md

## Architecture

```mermaid
graph TB
    A[Creator] -->|Signs transaction| B[Aleo Program]
    B -->|On-chain state| C[Payment Links]
    B -->|Validates payments| D[Payment Processing]

    E[User] -->|Pays link| B
    E -->|Interacts via| F[Next.js Web App]

    F -->|API calls| G[Supabase DB]
    F -->|Metadata| G

    H[Telegram Bot] -->|Notifications| G
    H -->|Control| F

    I[Webhook System] -->|Events| G
```

### Core Components

- **Aleo Program**: Handles on-chain payment request creation and validation using zero-knowledge proofs.
- **Next.js App**: Web interface for creating payment links, processing payments, and user dashboards.
- **Supabase**: PostgreSQL database for storing payment link metadata, analytics, and webhook configurations.
- **Telegram Bot**: Provides notifications and administrative controls.

## Features

- **Private Payments**: All transactions use Aleo's zero-knowledge technology for privacy.
- **Multi-Token Support**: Pay with ALEO, USDCx, or USAD.
- **Payment Links**: Generate shareable links for payments.
- **Webhook Integration**: Receive notifications for payment events.
- **Telegram Integration**: Bot for notifications and link management.
- **Analytics**: Track payment link performance.

## Tech Stack

- **Blockchain**: Aleo
- **Frontend/Backend**: Next.js, React
- **Database**: Supabase (PostgreSQL)
- **Bot**: Telegram (Grammy framework)
- **ZK Proofs**: Aleo SDK
- **Styling**: Tailwind CSS, Radix UI

## Prerequisites

- Node.js 18+
- npm or yarn
- Aleo CLI (for program development)
- Supabase account
- Telegram Bot Token

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Kloak
   ```

2. Install dependencies for the Next.js app:
   ```bash
   cd next-app
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Environment Variables

Create a `.env` file in the `next-app` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Telegram Bot
BOT_TOKEN="your-telegram-bot-token"

# URLs
BACKEND_URL="http://localhost:3000"
APP_URL="https://your-app-url.com"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Security
JWT_SECRET="your-jwt-secret-key"
```

### Variable Explanations

- `DATABASE_URL`: Connection string for your Supabase PostgreSQL database.
- `BOT_TOKEN`: Token obtained from BotFather on Telegram for the bot integration.
- `BACKEND_URL`: URL for the backend API (localhost for development).
- `APP_URL`: Public URL of your deployed application.
- `NEXT_PUBLIC_BASE_URL`: Public base URL for the Next.js app (exposed to client-side).
- `JWT_SECRET`: Secret key for JWT token signing (use a strong, random string).

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. For the Telegram bot:
   ```bash
   # Run the bot script (assuming it's set up)
   npm run bot
   ```

## Building the Aleo Program

The Aleo program is located in `programs/kloak_protocol/`.

1. Install Aleo CLI if not already installed.

2. Build the program:
   ```bash
   cd programs/kloak_protocol
   leo build
   ```

3. Deploy to Aleo testnet/mainnet as needed.

## Deployment

### Next.js App
- Use Vercel, Netlify, or any Node.js hosting platform.
- Set environment variables in your hosting platform's dashboard.
- Run `npm run build` for production build.

### Database
- Use Supabase for managed PostgreSQL.
- Run migrations with Prisma.

### Aleo Program
- Deploy to Aleo network using Aleo CLI or wallet.

### Telegram Bot
- Host the bot on a server (e.g., Railway, Heroku) and set webhook or use polling.

## API Endpoints

- `POST /api/payment-links`: Create a new payment link
- `GET /api/payment-links/:id`: Get payment link details
- `POST /api/payments`: Process a payment
- `GET /api/analytics`: Get analytics data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request
