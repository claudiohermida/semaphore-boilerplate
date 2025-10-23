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

| The repository is divided into two components: [web app](./apps/web-app) and [contracts](./apps/contracts). The app allows users to create their own Semaphore identity, join a group and then send their feedback anonymously (currently on Sepolia). This boilerplate now supports **gasless transactions** via Gelato Relay! |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

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

2. Update the `apps/web-app/.env` file with your new contract address and the group id.

3. **(Optional)** If you modified the smart contract, copy your contract artifacts from `apps/contracts/artifacts/contracts/Feedback.json` to `apps/web-app/contract-artifacts/Feedback.json`. This is only necessary if the contract ABI has changed.

> [!NOTE]
> Check the Semaphore contract addresses [here](https://docs.semaphore.pse.dev/deployed-contracts).

### Verify the contract

Verify your contract on Etherscan:

```bash
yarn verify <your-contract-address> <semaphore-address> --network sepolia
```

> **Note**  
> Remember to set the Etherscan API Key in your .env file.

## 🚀 Gelato Relayer Integration

This boilerplate now supports **gasless transactions** using [Gelato Relay](https://www.gelato.network/relay), allowing users to join groups and send feedback without needing ETH for gas fees.

**Why use a relayer?** Beyond eliminating gas costs, relayers provide an additional layer of anonymity. Since the relayer sponsors and submits transactions on behalf of users, there is no on-chain record linking the user's address to the transaction, further strengthening the privacy guarantees of the Semaphore protocol.

### Prerequisites

1. **Gelato Account**: Sign up at [Gelato Network](https://app.gelato.network/)
2. **1Balance Account**: Set up a [1Balance account](https://app.gelato.network/1balance) to sponsor transactions
3. **API Key**: Create a Relay API key from your Gelato dashboard

### Setup Instructions

#### Step 1: Set up your Gelato relayer instance

1. Go to [Gelato Network Dashboard](https://app.gelato.network/)
2. Navigate to **Relay** section
3. Create a new API key (or use existing one)
4. Configure your API key settings:
    - Enable the relayer to process transactions
    - Whitelist your contract addresses (both `FEEDBACK_CONTRACT_ADDRESS` and `SEMAPHORE_CONTRACT_ADDRESS`)
    - Set rate limits and spending caps as needed
5. Fund your 1Balance account with USDC or other supported tokens on your desired network

> **IMPORTANT: Your relayer must be properly configured to process transactions.** In the Gelato dashboard, ensure you:
>
> -   Enable the API key for the specific chain (e.g., Sepolia)
> -   Whitelist the contract addresses your application will interact with
> -   Configure security settings to prevent unauthorized use
>
> Without proper configuration, your relay requests will fail. For detailed setup instructions, see the [Gelato Relay Quick Start Guide](https://docs.gelato.network/web3-services/relay/quick-start) and [Security Considerations](https://docs.gelato.network/web3-services/relay/security-considerations).

#### Step 2: Configure Environment Variables

Create or update your `apps/web-app/.env.local` (or `.env.development` for development) file with the following Gelato-specific variables:

```bash
# Required for Gelato Relay
NEXT_PUBLIC_GELATO_RELAYER_ENDPOINT=https://api.gelato.digital/relays/v2/sponsored-call
NEXT_PUBLIC_GELATO_RELAYER_CHAIN_ID=11155111
NEXT_PUBLIC_GELATO_RELAYER_API_KEY=your_gelato_api_key_here

# Semaphore Configuration (from your contract deployment)
NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_GROUP_ID=your_group_id

# Network Configuration
NEXT_PUBLIC_DEFAULT_NETWORK=sepolia
NEXT_PUBLIC_INFURA_API_KEY=your_infura_project_id
```

**Chain IDs:**

-   Sepolia: `11155111`
-   Arbitrum Sepolia: `421614`
-   Other networks: Check [Chainlist](https://chainlist.org/)

#### Step 3: Important Next.js Configuration

When configuring Gelato Relay, **DO NOT** uncomment or add `output: "export"` in `apps/web-app/next.config.mjs` (line 20).

The line should remain **commented out**:

```javascript
} // ,
///   output: "export"
```

Static export mode (`output: "export"`) is incompatible with API routes and server-side features that Gelato Relay may use.

### Testing Your Gelato Integration

#### Using the Debug Page

Navigate to `/debug` in your application to check your Gelato configuration:

```
http://localhost:3000/debug
```

This page displays:

-   ✅ All environment variables status
-   Active relay method being used (Gelato Relay vs Backend API vs OpenZeppelin)
-   Configuration completeness check

#### Console Monitoring

The application includes comprehensive console logging for debugging:

**Join Group Flow:**

```javascript
=== JOIN GROUP DEBUG ===
OpenZeppelin webhook: undefined
Gelato endpoint: https://api.gelato.digital/relays/v2/sponsored-call
Gelato chainId: 11155111
Gelato API key exists: true
========================
→ Using Gelato Relay
Sending request to Gelato: {...}
Gelato response status: 201
✅ Gelato relay successful!
```

**Send Feedback Flow:**

```javascript
=== SEND FEEDBACK DEBUG ===
OpenZeppelin webhook: undefined
Gelato endpoint: https://api.gelato.digital/relays/v2/sponsored-call
Gelato chainId: 11155111
Gelato API key exists: true
===========================
→ Using Gelato Relay
Creating group from users: 3
Encoded message: 0x...
Generating ZK proof...
✅ Proof generated successfully!
Encoding sendFeedback function call...
Sending request to Gelato
Gelato response status: 201
✅ Gelato relay successful!
```

### Relay Method Priority

The application automatically selects the relay method in this order:

1. **OpenZeppelin Autotask** (if `NEXT_PUBLIC_OPENZEPPELIN_AUTOTASK_WEBHOOK` is set)
2. **Gelato Relay** (if all three Gelato env vars are set)
3. **Backend API** (fallback to `/api/join` and `/api/feedback`)

### Rate Limiting

Gelato Relay has rate limits. The application includes automatic retry logic:

-   **Rate limit hit (429)**: Automatically retries after 10 seconds
-   **Console warnings**: Check console for rate limit messages
-   **User feedback**: UI displays "⏳ Rate limit exceeded. Retrying in 10 seconds..."

### Troubleshooting

#### Transaction Fails

-   Check your 1Balance has sufficient funds
-   Verify the chain ID matches your network
-   Ensure the API key has correct permissions
-   **Verify relayer configuration**: Confirm that your API key is enabled and contract addresses are whitelisted in the Gelato dashboard
-   Check that the correct chain is enabled for your API key

#### Rate Limits

-   Wait for automatic retry (10 seconds)
-   Check your Gelato plan limits in the dashboard
-   Consider upgrading your Gelato plan for higher limits

#### Wrong Network

-   Verify `NEXT_PUBLIC_GELATO_RELAYER_CHAIN_ID` matches your deployment network
-   Check that your contract addresses are correct for the network

#### Debug Page Shows Red X's

-   Ensure all three Gelato environment variables are set
-   Restart your development server after changing `.env` files
-   Check for typos in variable names (must be exact)

### Monitoring Transactions

1. **Gelato Dashboard**: View transaction status at [Gelato Network](https://app.gelato.network/)
2. **Browser Console**: Detailed logs for each transaction attempt
3. **Application Logs**: User-friendly messages in the UI
4. **Debug Page**: Real-time configuration status at `/debug`

### Cost Management

-   Gelato charges in USDC (or other tokens) from your 1Balance
-   Monitor your balance in the Gelato dashboard
-   Set up balance alerts to avoid service interruption
-   Typical transaction costs: $0.01-$0.50 depending on network congestion

## 📂 Project Structure

```
semaphore-boilerplate/
├── apps/
│   ├── contracts/          # Smart contracts (Hardhat)
│   │   ├── contracts/
│   │   │   └── Feedback.sol
│   │   ├── tasks/
│   │   └── test/
│   └── web-app/           # Next.js frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── group/        # Join group page
│       │   │   ├── proofs/       # Send feedback page
│       │   │   ├── debug/        # Debug configuration page
│       │   │   └── api/          # Backend API routes
│       │   ├── context/
│       │   │   └── SemaphoreContext.tsx  # Semaphore state management
│       │   └── hooks/
│       └── contract-artifacts/   # Contract ABIs
```

### Code formatting

Run [Prettier](https://prettier.io/) to check formatting rules:

```bash
yarn prettier
```

or to automatically format the code:

```bash
yarn prettier:write
```

## 🔗 Useful Links

-   [Semaphore Documentation](https://docs.semaphore.pse.dev/)
-   [Gelato Network](https://www.gelato.network/)
-   [Gelato Relay Documentation](https://docs.gelato.network/web3-services/relay)
-   [Semaphore Deployed Contracts](https://docs.semaphore.pse.dev/deployed-contracts)
-   [Example Applications](https://docs.semaphore.pse.dev/examples)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
