<h1 align="center">
    Semaphore Boilerplate
</h1>

<p align="center">
    <a href="https://github.com/semaphore-protocol" target="_blank">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/boilerplate/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/boilerplate.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/boilerplate/actions?query=workflow%3Astyle">
        <img alt="GitHub Workflow style" src="https://img.shields.io/github/actions/workflow/status/semaphore-protocol/boilerplate/style.yml?branch=main&label=style&style=flat-square&logo=github">
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint">
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <a href="https://www.gitpoap.io/gh/semaphore-protocol/boilerplate" target="_blank">
        <img src="https://public-api.gitpoap.io/v1/repo/semaphore-protocol/boilerplate/badge">
    </a>
</p>

| The repository is divided into two components: [web app](./apps/web-app) and [contracts](./apps/contracts). The app allows users to create their own Semaphore identity, join a group and then send their feedback anonymously (currently on Sepolia). |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |

> **🔐 OpenZeppelin Relayer Integration**: This boilerplate now includes full integration with [OpenZeppelin Relayer](https://github.com/OpenZeppelin/openzeppelin-relayer) for gasless, anonymous transactions. Users can interact with the dapp without needing ETH for gas fees. See the [OpenZeppelin Relayer Setup](#-openzeppelin-relayer-setup) section for detailed configuration instructions.

## 🛠 Install

Use this repository as a Github [template](https://github.com/semaphore-protocol/boilerplate/generate).

Clone your repository:

```bash
git clone https://github.com/<your-username>/<your-repo>.git
```

and install the dependencies:

```bash
cd <your-repo> && yarn
```

## 📜 Usage

Copy the `.env.example` file as `.env`:

```bash
cp .env.example .env
```

and add your environment variables or run the app in a local network.

## 🔐 OpenZeppelin Relayer Setup

This boilerplate integrates with **OpenZeppelin Relayer** for gasless, anonymous transactions. Users can join groups and send feedback without paying gas fees directly.

### Why OpenZeppelin Relayer?

- **Gasless Transactions**: Users don't need ETH to interact with the contract
- **Privacy**: Relayer address signs transactions, not user wallet
- **Security**: Server-side API key management
- **Reliability**: Automatic gas price optimization and transaction monitoring

### Step 1: Install OpenZeppelin Relayer

#### Prerequisites

- **Docker and Docker Compose** ([Install Docker](https://docs.docker.com/get-docker/)) - **Recommended method**
- Rust toolchain (optional, only if not using Docker) - ([Install Rust](https://rustup.rs/))

> **💡 Tip**: This guide focuses on Docker deployment, which is the easiest and most reliable method. Docker Compose automatically handles both the relayer service and Redis.

#### Installation

1. **Clone the OpenZeppelin Relayer repository:**

```bash
git clone https://github.com/OpenZeppelin/openzeppelin-relayer
cd openzeppelin-relayer
```

2. **Build with Docker** (recommended):

```bash
docker compose build
```

Or **build with Rust** (if not using Docker):

```bash
cargo build --release
```

### Step 2: Configure the Relayer

#### 2.1 Create Configuration File

```bash
cp config/config.example.json config/config.json
```

Edit `config/config.json` to configure your relayer for Sepolia:

```json
{
  "relayers": [
    {
      "id": "sepolia-example",
      "name": "Sepolia Example",
      "network": "sepolia",
      "network_type": "evm",
      "paused": false,
      "policies": {
        "min_balance": 0,
        "gas_limit_estimation": true
      },
      "signer_id": "local-signer",
      "notification_id": "notification-example",
      "custom_rpc_urls": {
        "sepolia": "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
      }
    }
  ],
  "signers": [
    {
      "id": "local-signer",
      "type": "keystore",
      "path": "config/keys/local-signer.json"
    }
  ],
  "notifications": [
    {
      "id": "notification-example",
      "url": "https://webhook.site/your-unique-url",
      "signing_key": "your-webhook-signing-key"
    }
  ]
}
```

#### 2.2 Generate Signer Keystore

Create a keystore file for signing transactions:

```bash
cargo run --example create_key -- \
  --password YourStrongPassword123! \
  --output-dir config/keys \
  --filename local-signer.json
```

**Important**: Fund this address with Sepolia ETH for gas fees!

Get the address:
```bash
cargo run --example get_address -- \
  --keystore config/keys/local-signer.json \
  --password YourStrongPassword123!
```

#### 2.3 Configure Environment Variables

Create `.env` file in the relayer directory:

```bash
# Keystore password
KEYSTORE_PASSPHRASE=YourStrongPassword123!

# API authentication
API_KEY=d75e66d1-7e34-43ef-8f0d-d927beeab3ae  # Generate with: uuidgen

# Webhook signing (for transaction notifications)
WEBHOOK_SIGNING_KEY=your-webhook-signing-key  # Generate with: uuidgen

# Redis connection (docker-compose internal)
REDIS_URL=redis://redis:6379

# Server configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
```

**Note**: When using Docker Compose, Redis runs in a separate container and is accessible at `redis://redis:6379` (using Docker's internal networking).

### Step 3: Run the Relayer with Docker

The easiest way to run the relayer is using Docker Compose, which automatically handles both the relayer service and Redis:

```bash
docker compose up -d
```

This command:
- ✅ Starts Redis container automatically
- ✅ Starts the OpenZeppelin Relayer
- ✅ Handles networking between services
- ✅ Runs everything in the background (`-d` flag)

**View logs**:
```bash
docker compose logs -f relayer
```

**Stop the services**:
```bash
docker compose down
```

**Alternative: Run without Docker**

If you prefer to run locally without Docker:

1. Start Redis:
   ```bash
   # Update .env to use: REDIS_URL=redis://localhost:6379
   docker run --name oz-relayer-redis -p 6379:6379 -d redis:latest
   ```

2. Run the relayer:
   ```bash
   cargo run --release
   ```

**Verify it's running**:
```bash
curl -X GET http://localhost:8080/api/v1/relayers \
  -H "Content-Type: application/json" \
  -H "AUTHORIZATION: Bearer YOUR_API_KEY"
```

Replace `YOUR_API_KEY` with your actual API key from the `.env` file (e.g., `d75e66d1-7e34-43ef-8f0d-d927beeab3ae`).

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "sepolia-example",
      "name": "Sepolia Example",
      "network": "sepolia",
      "address": "0x70f1d86da2a4ea90b79b8cd6e3fcb6860d7b4278"
    }
  ]
}
```

**Troubleshooting**:
- If the curl command fails, check Docker logs: `docker compose logs -f`
- Ensure ports are not blocked: `docker ps` should show port `8080:8080` mapped
- Verify containers are running: `docker compose ps`

### Step 4: Configure the Semaphore Dapp

Update your `.env` file in the project root with the following variables:

```bash
# Network Configuration
NEXT_PUBLIC_DEFAULT_NETWORK=sepolia

# Infura Configuration (for reading blockchain state)
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key
INFURA_API_KEY=your_infura_api_key

# Contract Addresses
NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS=your_feedback_contract_address
NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS=0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131
NEXT_PUBLIC_GROUP_ID=1

# OpenZeppelin Relayer Configuration
NEXT_PUBLIC_OZ_RELAYER_BASE_URL=http://localhost:8080
NEXT_PUBLIC_OZ_RELAYER_ID=sepolia-example
NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID=11155111
OZ_RELAYER_API_KEY=d75e66d1-7e34-43ef-8f0d-d927beeab3ae

# Backend Fallback (optional - used if relayer not available)
ETHEREUM_PRIVATE_KEY=your_ethereum_private_key

# Etherscan (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### Environment Variables Explained

| Variable | Description | Required | Public/Private |
|----------|-------------|----------|----------------|
| `NEXT_PUBLIC_OZ_RELAYER_BASE_URL` | Base URL of your OZ Relayer instance | Yes | Public |
| `NEXT_PUBLIC_OZ_RELAYER_ID` | Relayer ID from config (e.g., "sepolia-example") | Yes | Public |
| `NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID` | Chain ID (11155111 for Sepolia) | Yes | Public |
| `OZ_RELAYER_API_KEY` | API key for authenticating with the relayer | Yes | **Server-side only** |

**Security Note**: `OZ_RELAYER_API_KEY` must NEVER be exposed to the client. It's used only in the server-side API proxy route.

### Step 5: Understanding the Request Format

The application sends transactions to the OpenZeppelin Relayer using this format:

#### Endpoint Structure

```
POST {BASE_URL}/api/v1/relayers/{RELAYER_ID}/transactions
```

Example:
```
POST http://localhost:8080/api/v1/relayers/sepolia-example/transactions
```

#### Request Format

```json
{
  "to": "0x3f0072B0B0812bb033340D43d093D07c9DFb8188",
  "data": "0x7b85d27a0000...",
  "value": "0",
  "gasLimit": 500000,
  "speed": "fast"
}
```

#### Field Descriptions

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `to` | `string` | Contract address to call | Yes |
| `data` | `string` | Encoded function call data (from ethers.js) | Yes |
| `value` | `string` | Amount of ETH to send (in wei, usually "0") | Yes |
| `gasLimit` | `number` | Maximum gas units for the transaction | Yes |
| `speed` | `string` | Gas price tier: "slow", "medium", or "fast" | Yes |

**Important Notes:**
- ❌ Do NOT include `chainId` in the request body (the relayer knows its network)
- ✅ `gasLimit` must be a number, not a string
- ✅ `speed` tells the relayer to auto-calculate optimal gas prices
- ✅ The relayer will sign the transaction with its own private key

#### Response Format

**Success Response (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "id": "274397f5-52ef-456f-8108-ef24982088d5",
    "hash": null,
    "status": "pending",
    "from": "0x70f1d86da2a4ea90b79b8cd6e3fcb6860d7b4278",
    "to": "0x3f0072B0B0812bb033340D43d093D07c9DFb8188",
    "relayer_id": "sepolia-example"
  },
  "error": null
}
```

**Response Fields:**
- `id`: Transaction ID in the relayer system
- `hash`: Blockchain transaction hash (null when pending, populated when sent)
- `status`: Transaction status: "pending" → "sent" → "confirmed" → "succeeded"
- `from`: Relayer's address (the signer)
- `to`: Contract address

#### Transaction Status Flow

```
pending → sent → confirmed → succeeded
         ↓
         failed (if transaction reverts)
```

Query transaction status:
```bash
curl -X GET "http://localhost:8080/api/v1/relayers/sepolia-example/transactions/{TRANSACTION_ID}" \
  -H "AUTHORIZATION: Bearer YOUR_API_KEY"
```

### Step 6: How the Integration Works

The dapp uses a **proxy pattern** to securely communicate with the OpenZeppelin Relayer:

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Browser   │─────→│  Next.js API     │─────→│   OZ Relayer    │
│             │      │  /api/oz-relay   │      │  :8080          │
│  (Client)   │      │  (Server-side)   │      │                 │
└─────────────┘      └──────────────────┘      └─────────────────┘
                              │
                     Uses API Key ────→  Signs & Sends to Sepolia
```

**Benefits:**
1. **Security**: API key never exposed to browser
2. **CORS**: No cross-origin issues (same-origin to Next.js)
3. **Monitoring**: All requests logged on server
4. **Flexibility**: Easy to switch between relayer and direct transactions

### Step 7: Testing the Integration

#### Test Relayer Connectivity

```bash
curl -X GET http://localhost:8080/api/v1/relayers \
  -H "AUTHORIZATION: Bearer YOUR_API_KEY"
```

#### Start the Dapp

```bash
yarn dev
```

#### Test the Flow

1. **Visit Debug Page**: http://localhost:3000/debug
   - Should show: "OpenZeppelin Relayer (via /api/oz-relay proxy)" in green

2. **Create Identity**: http://localhost:3000
   - Click "Create Identity"

3. **Join Group**: http://localhost:3000/group
   - Click "Join group"
   - Check console for: "✅ OZ Relayer successful!"

4. **Send Feedback**: http://localhost:3000/proofs
   - Click "Send feedback"
   - Enter message
   - Wait for ZK proof generation (~10-30 seconds)
   - Check console for: "✅ OZ Relayer successful!"

5. **Verify on Sepolia**: https://sepolia.etherscan.io/address/YOUR_CONTRACT
   - Look for transactions from your relayer address

### Fallback Mechanism

If the OZ Relayer is unavailable, the dapp automatically falls back to using backend API routes (`/api/join` and `/api/feedback`) which use the `ETHEREUM_PRIVATE_KEY` to sign transactions directly.

**Priority order:**
1. **Primary**: OpenZeppelin Relayer (if configured)
2. **Fallback**: Backend API with direct signing

### Troubleshooting

#### Issue: CORS Errors

If you see:
```
Access to fetch at 'http://localhost:8080' has been blocked by CORS policy
```

**Solution**: The dapp uses an API proxy (`/api/oz-relay`) to avoid CORS. Make sure:
- You're using the proxy (not calling the relayer directly from browser)
- The dev server is running (`yarn dev`)

#### Issue: 401 Unauthorized

**Solution**: 
- Verify `OZ_RELAYER_API_KEY` in `.env` matches the `API_KEY` in the relayer's `.env`
- Restart the dev server after changing environment variables

#### Issue: 400 Bad Request - Missing gasPrice

**Solution**: Add `speed: "fast"` to the request (already implemented in this boilerplate)

#### Issue: Transaction Pending Forever

**Solution**:
- Check if the relayer's signer address has sufficient Sepolia ETH
- View relayer logs: `docker compose logs -f relayer`
- Query transaction status using the API
- Ensure Redis is running: `docker compose ps`

#### Issue: Rate Limit on Infura

**Solution**: The dapp handles this gracefully by using cached user data. For production:
- Upgrade to Infura's paid tier
- Use alternative RPC providers (Alchemy, QuickNode)
- Implement request caching

### Production Deployment

#### Deploy the Relayer with Docker

1. **Host on a secure server** (AWS, GCP, DigitalOcean, etc.)
2. **Use Docker Compose** in production mode:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```
3. **Use HTTPS** with proper SSL certificates (use nginx or Caddy as reverse proxy)
4. **Secure the API key** - rotate regularly and use environment secrets
5. **Monitor relayer balance** - set up alerts for low balance
6. **Configure proper logging** and monitoring:
   ```bash
   docker compose logs --tail=100 -f relayer
   ```
7. **Set up Redis persistence** - Docker Compose handles this automatically with volume mounts

#### Update Environment Variables

For production deployment (e.g., Vercel, Netlify):

```bash
NEXT_PUBLIC_OZ_RELAYER_BASE_URL=https://your-relayer.example.com
NEXT_PUBLIC_OZ_RELAYER_ID=production-relayer
NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID=1  # or 11155111 for Sepolia
OZ_RELAYER_API_KEY=your_production_api_key
```

#### Security Checklist

- ✅ API key is server-side only (not prefixed with `NEXT_PUBLIC_`)
- ✅ Relayer endpoint is HTTPS in production
- ✅ Rate limiting configured on relayer
- ✅ Webhook signing keys are secure
- ✅ Relayer signer has minimum necessary balance
- ✅ Regular monitoring and alerting set up

### Additional Resources

- [OpenZeppelin Relayer Documentation](https://docs.openzeppelin.com/relayer/)
- [OpenZeppelin Relayer GitHub](https://github.com/OpenZeppelin/openzeppelin-relayer)
- [Semaphore Protocol Documentation](https://docs.semaphore.pse.dev/)
- [Deployed Semaphore Contracts](https://docs.semaphore.pse.dev/deployed-contracts)

### Local server

You can start your app locally with:

```bash
yarn dev
```

### Deploy the contract

1. Go to the `apps/contracts` directory and deploy your contract:

```bash
yarn deploy --semaphore <semaphore-address> --network sepolia
```

2. Update the `apps/web-app/.env.production` file with your new contract address and the group id.

3. Copy your contract artifacts from `apps/contracts/artifacts/contracts` folder to `apps/web-app/contract-artifacts` folder.

> [!NOTE]
> Check the Semaphore contract addresses [here](https://docs.semaphore.pse.dev/deployed-contracts).

### Verify the contract

Verify your contract on Etherscan:

```bash
yarn verify <your-contract-address> <semaphore-address> --network sepolia
```

> **Note**  
> Remember to set the Etherscan API Key in your .env file.

### Code formatting

Run [Prettier](https://prettier.io/) to check formatting rules:

```bash
yarn prettier
```

or to automatically format the code:

```bash
yarn prettier:write
```
