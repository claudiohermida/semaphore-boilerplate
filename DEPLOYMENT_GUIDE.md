# Deployment Guide - Testing OpenZeppelin Relayer Integration

This guide will walk you through the complete process of building and deploying the dapp to test the OpenZeppelin Relayer integration.

## Prerequisites

✅ Node.js and Yarn installed
✅ OpenZeppelin Relayer service running (see OZ Relayer setup below)
✅ Contract deployed to Sepolia (or your target network)
✅ Infura API key (or other RPC provider)

---

## Part 1: Set Up OpenZeppelin Relayer Service

### Option A: If you haven't set up the OZ Relayer yet

1. **Clone the OZ Relayer repository:**
```bash
git clone https://github.com/OpenZeppelin/openzeppelin-relayer
cd openzeppelin-relayer
```

2. **Create configuration:**
```bash
cp .env.example .env
```

3. **Generate a signer keystore:**
```bash
cargo run --example create_key -- \
  --password YourStrongPassword123! \
  --output-dir examples/basic-example/config/keys \
  --filename local-signer.json
```

Update `KEYSTORE_PASSPHRASE` in `.env` with your password.

4. **Generate API Key:**
```bash
# On macOS/Linux:
uuidgen

# Or use cargo:
cargo run --example generate_uuid
```

Copy the generated UUID and update `API_KEY` in `.env`.

5. **Generate Webhook Signing Key:**
```bash
cargo run --example generate_uuid
```

Update `WEBHOOK_SIGNING_KEY` in `.env`.

6. **Configure webhook URL** in `config/config.json`:
   - For testing, use https://webhook.site to get a temporary URL
   - Update `notifications[0].url` field

7. **Start Redis:**
```bash
docker run --name openzeppelin-redis \
  -p 6379:6379 \
  -d redis:latest
```

8. **Run the Relayer:**
```bash
cargo run
```

Or with Docker:
```bash
docker compose up -d
```

9. **Test the Relayer:**
```bash
curl -X GET http://localhost:8080/api/v1/relayers \
  -H "Content-Type: application/json" \
  -H "AUTHORIZATION: Bearer YOUR_API_KEY"
```

Expected: HTTP 200 with relayer list.

### Option B: If you already have OZ Relayer running

✅ Make sure it's accessible at `http://localhost:8080`
✅ Have your API key ready
✅ Know your relayer chain ID

---

## Part 2: Configure Your Semaphore Dapp

### Step 1: Navigate to the web-app directory

```bash
cd /Users/claudiohermida-new/Desktop/WORKSPACE/ZK-CORE_PROGRAM_2025/Semaphore/semaphore-boilerplate-OZ-relayer
```

### Step 2: Install dependencies (if not done already)

```bash
yarn install
```

### Step 3: Create your `.env` file

Create a `.env` file in the **root directory** of the project:

```bash
# Network Configuration
NEXT_PUBLIC_DEFAULT_NETWORK=sepolia

# Infura API Key
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key_here
INFURA_API_KEY=your_infura_api_key_here

# Private key (for Backend API fallback - only if needed)
ETHEREUM_PRIVATE_KEY=your_ethereum_private_key_here

# Contract Addresses (from your deployed contracts)
NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS=0xYourFeedbackContractAddress
NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS=0xYourSemaphoreContractAddress

# Semaphore Group ID
NEXT_PUBLIC_GROUP_ID=1

# OpenZeppelin Relayer Configuration
NEXT_PUBLIC_OZ_RELAYER_ENDPOINT=http://localhost:8080/api/v1/relayers
NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID=11155111
OZ_RELAYER_API_KEY=your_generated_uuid_from_oz_relayer

# Etherscan API Key (optional, for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Important Values to Replace:**

- `your_infura_api_key_here` - Get from https://infura.io
- `0xYourFeedbackContractAddress` - Your deployed Feedback contract
- `0xYourSemaphoreContractAddress` - Semaphore contract address (see [Deployed Contracts](https://docs.semaphore.pse.dev/deployed-contracts))
- `your_generated_uuid_from_oz_relayer` - The API_KEY you set in the OZ Relayer `.env`
- `11155111` - Chain ID (Sepolia=11155111, Mainnet=1)

### Step 4: Verify Contract Artifacts

Make sure your contract artifacts are in place:

```bash
ls apps/web-app/contract-artifacts/
```

You should see `Feedback.json`. If not, copy it from the contracts build:

```bash
cp apps/contracts/artifacts/contracts/Feedback.sol/Feedback.json \
   apps/web-app/contract-artifacts/
```

---

## Part 3: Build and Start the Dapp

### Option A: Development Mode (Recommended for Testing)

1. **Start the development server:**

```bash
cd apps/web-app
yarn dev
```

Or from the root:

```bash
yarn dev
```

2. **Open your browser:**

Navigate to: http://localhost:3000

### Option B: Production Build

1. **Build the application:**

```bash
cd apps/web-app
yarn build
```

2. **Start the production server:**

```bash
yarn start
```

---

## Part 4: Test the Integration

### 1. Check Debug Page

Visit: http://localhost:3000/debug

**What to verify:**
- ✅ Active Relay Method shows "OpenZeppelin Relayer" (green)
- ✅ `NEXT_PUBLIC_OZ_RELAYER_ENDPOINT` is set
- ✅ `NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID` is set
- ✅ `OZ_RELAYER_API_KEY` shows "✅ Set"
- ✅ Contract addresses are correct

### 2. Test Identity Creation

Visit: http://localhost:3000

**Steps:**
1. Click "Create Identity" button
2. Identity should be created and stored in browser
3. Check console for any errors

### 3. Test Joining Group (via OZ Relayer)

Visit: http://localhost:3000/group

**Steps:**
1. Click "Join group" button
2. Check browser console for debug output:
   ```
   === JOIN GROUP DEBUG ===
   OZ Relayer endpoint: http://localhost:8080/api/v1/relayers
   OZ Relayer chainId: 11155111
   OZ Relayer API key exists: true
   ========================
   → Using OpenZeppelin Relayer
   Sending request to OZ Relayer: {...}
   OZ Relayer response status: 200
   ✅ OZ Relayer successful!
   ```
3. Wait for confirmation message
4. Your identity should appear in the users list

**What to check in OZ Relayer logs:**
- Transaction received
- Transaction queued
- Transaction sent to network
- Transaction mined

### 4. Test Sending Feedback (via OZ Relayer)

Visit: http://localhost:3000/proofs

**Steps:**
1. Click "Send feedback" button
2. Enter your feedback message in the prompt
3. Wait for ZK proof generation (this takes ~10-30 seconds)
4. Check console for:
   ```
   === SEND FEEDBACK DEBUG ===
   OZ Relayer endpoint: http://localhost:8080/api/v1/relayers
   ...
   → Using OpenZeppelin Relayer
   Generating ZK proof...
   ✅ Proof generated successfully!
   Encoding sendFeedback function call...
   Sending request to OZ Relayer: {...}
   OZ Relayer response status: 200
   ✅ OZ Relayer successful!
   ```
5. Your feedback should appear in the feedback list

---

## Part 5: Troubleshooting

### Issue: "Backend API" showing instead of "OpenZeppelin Relayer"

**Solution:**
- Check that all three OZ Relayer env vars are set
- Verify `OZ_RELAYER_API_KEY` is in `.env` (not `.env.local`)
- Restart the dev server after changing `.env`

### Issue: HTTP 401 Unauthorized

**Solution:**
- Verify your `OZ_RELAYER_API_KEY` matches the `API_KEY` in the OZ Relayer `.env`
- Check the Authorization header format: `Bearer YOUR_API_KEY`

### Issue: HTTP 404 Not Found

**Solution:**
- Verify OZ Relayer is running on port 8080
- Check the endpoint URL: `http://localhost:8080/api/v1/relayers`
- Test with curl command first

### Issue: HTTP 500 Internal Server Error

**Solution:**
- Check OZ Relayer logs for errors
- Verify the signer has funds on the target network
- Check that the relayer is configured for the correct chain ID

### Issue: Transaction not being mined

**Solution:**
- Check OZ Relayer logs for transaction hash
- Verify signer wallet has enough ETH for gas
- Check network status (Sepolia might be congested)
- View transaction on Etherscan: https://sepolia.etherscan.io/tx/TX_HASH

### Issue: "Rate limit exceeded" (HTTP 429)

**Solution:**
- The app will auto-retry after 10 seconds
- If persistent, check OZ Relayer rate limiting configuration

---

## Part 6: Monitoring

### Browser Console

Open DevTools (F12) and check Console tab for:
- Debug messages with relay method being used
- Request/response details
- Any error messages

### OZ Relayer Logs

Monitor the OZ Relayer terminal for:
```
[INFO] Transaction received
[INFO] Transaction queued
[INFO] Transaction sent: 0xTXHASH
[INFO] Transaction mined: 0xTXHASH
```

### Network Explorer

Monitor transactions on Etherscan:
- Sepolia: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

---

## Part 7: Fallback Testing (Backend API)

To test that the Backend API fallback works:

1. **Stop the OZ Relayer service**

2. **Comment out OZ Relayer variables** in `.env`:
```bash
# NEXT_PUBLIC_OZ_RELAYER_ENDPOINT=http://localhost:8080/api/v1/relayers
# NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID=11155111
# OZ_RELAYER_API_KEY=your_api_key
```

3. **Restart the dapp:**
```bash
yarn dev
```

4. **Check debug page** - should show "Backend API (/api/join, /api/feedback)"

5. **Test joining group** - should use `/api/join` endpoint

---

## Success Criteria

✅ Debug page shows "OpenZeppelin Relayer" in green
✅ Can create Semaphore identity
✅ Can join group via OZ Relayer (transaction confirms on-chain)
✅ Can send feedback via OZ Relayer (ZK proof validates, transaction confirms)
✅ Feedback appears in the UI
✅ OZ Relayer logs show successful transaction processing
✅ Transactions visible on Etherscan

---

## Next Steps

Once everything is working locally:

1. **Deploy OZ Relayer to production** (behind secure backend/firewall)
2. **Update environment variables** for production
3. **Deploy dapp to Vercel/Netlify** with production env vars
4. **Test end-to-end** on production environment
5. **Monitor relayer performance** and transaction success rates

---

## Useful Commands Reference

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Test OZ Relayer
curl -X GET http://localhost:8080/api/v1/relayers \
  -H "Content-Type: application/json" \
  -H "AUTHORIZATION: Bearer YOUR_API_KEY"

# View Redis (if needed)
docker exec -it openzeppelin-redis redis-cli

# View OZ Relayer logs
docker logs -f openzeppelin-relayer
```

---

## Additional Resources

- [OpenZeppelin Relayer Docs](https://docs.openzeppelin.com/relayer/quickstart)
- [Semaphore Docs](https://docs.semaphore.pse.dev/)
- [Deployed Semaphore Contracts](https://docs.semaphore.pse.dev/deployed-contracts)
- [OZ Relayer GitHub](https://github.com/OpenZeppelin/openzeppelin-relayer)

---

**Good luck with your testing! 🚀**

