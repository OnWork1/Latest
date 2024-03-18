# Nuxt 3 Project Template

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
pnpm install

```

Create a .env file & populate all ENV variables as listed in .env.example file:

```bash

DATABASE_URL=''
TRANSACTION_TIMEOUT=30000
S3_REGION=
S3_ACCESS_KEY_ID=
S3_ACCESS_KEY=
S3_RECEIPT_BUCKET_NAME=
NUXT_PUBLIC_API_URL='http://localhost:5000/api'
NUXT_AZURE_AD_CLIENT_ID=''
NUXT_AZURE_AD_CLIENT_SECRET=''
NUXT_AZURE_AD_TENANT_ID=''
NUXT_PUBLIC_AZURE_AD_TENANT_ID=''
NEXTAUTH_URL='http://localhost:5000'
AUTH_ORIGIN ='http://localhost:5000/api/auth'
NUXT_AUTH_SECRET=''
NODE_PORT=5000
NUXT_PORT=5000
PORT=5000
NEXTAUTH_URL='http://localhost:5000'
NUXT_PUBLIC_DEPLOYMENT_ENV=
NUXT_PUBLIC_BUILD_VERSION=v0.0.0.0000

```

## Development Server

Start the development server on `http://localhost:5000`:

```bash

pnpm run dev

```

## Production

Build the application for production:

```bash

pnpm run build

```

Locally preview production build:

```bash

pnpm run preview

```
