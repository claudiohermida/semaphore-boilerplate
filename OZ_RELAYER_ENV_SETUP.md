# OpenZeppelin Relayer Environment Configuration

This document describes the environment variables needed for the OpenZeppelin Relayer integration.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Network Configuration
NEXT_PUBLIC_DEFAULT_NETWORK=sepolia

# Infura API Key (for accessing Ethereum networks)
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key_here
INFURA_API_KEY=your_infura_api_key_here

# Private key for backend API fallback (when not using relayer)
ETHEREUM_PRIVATE_KEY=your_ethereum_private_key_here

# Contract Addresses
NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS=your_feedback_contract_address_here
NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS=your_semaphore_contract_address_here

# Semaphore Group ID
NEXT_PUBLIC_GROUP_ID=your_group_id_here

# OpenZeppelin Relayer Configuration
# Base URL for the OZ Relayer (defaults to http://localhost:8080 if not set)
NEXT_PUBLIC_OZ_RELAYER_BASE_URL=http://localhost:8080

# Your relayer ID (get this from: curl http://localhost:8080/api/v1/relayers)
# Defaults to "sepolia-example" if not set
NEXT_PUBLIC_OZ_RELAYER_ID=sepolia-example

# Chain ID for the target network (e.g., 11155111 for Sepolia)
NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID=11155111

# API Key for OpenZeppelin Relayer authentication (Bearer token)
# This is a server-side only variable and should NOT be exposed to the client
OZ_RELAYER_API_KEY=your_oz_relayer_api_key_here

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Variable Descriptions

### OpenZeppelin Relayer Variables

- **NEXT_PUBLIC_OZ_RELAYER_BASE_URL**: The base URL for the OpenZeppelin Relayer
  - Example: `http://localhost:8080`
  - Defaults to `http://localhost:8080` if not set
  - This is a public variable (prefixed with `NEXT_PUBLIC_`)

- **NEXT_PUBLIC_OZ_RELAYER_ID**: Your relayer ID from the OZ Relayer configuration
  - Example: `sepolia-example`
  - To find your ID, run: `curl -X GET http://localhost:8080/api/v1/relayers -H "AUTHORIZATION: Bearer YOUR_API_KEY"`
  - Defaults to `sepolia-example` if not set
  - This is a public variable

- **NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID**: The chain ID of the target blockchain network
  - Example: `11155111` (Sepolia testnet)
  - Example: `1` (Ethereum mainnet)
  - This is a public variable

- **OZ_RELAYER_API_KEY**: Your OpenZeppelin Relayer API key for authentication
  - This is used as a Bearer token in the Authorization header
  - Format: `Bearer YOUR_API_KEY`
  - **IMPORTANT**: This is a server-side only variable and should NEVER be exposed to the client

## Relay Priority

The application will use relayers in the following priority order:

1. **OpenZeppelin Relayer** (if all OZ_RELAYER variables are configured)
   - Uses Bearer token authentication
   - Sends transactions to the configured OZ Relayer endpoint
   
2. **Backend API Fallback** (if OZ Relayer is not configured)
   - Uses `/api/join` for joining groups
   - Uses `/api/feedback` for sending feedback
   - Requires `ETHEREUM_PRIVATE_KEY` to be set

## Request Format

The OpenZeppelin Relayer expects requests to the transactions endpoint:

**Endpoint:** `POST /api/v1/relayers/{RELAYER_ID}/transactions`

**Request body:**
```json
{
  "to": "0xContractAddress",
  "data": "0xencodedFunctionData",
  "value": "0",
  "gasLimit": 500000
}
```

Note: The `chainId` is NOT included in the request body - the relayer already knows what network it's configured for.

## Authorization Header

All requests to the OpenZeppelin Relayer include the following header:

```
AUTHORIZATION: Bearer YOUR_API_KEY
```

## Testing

To verify your configuration, visit the debug page at `/debug` in your application. It will show:
- Which relay method is active
- Status of all environment variables
- Color-coded indicators (green for configured, red for missing)

