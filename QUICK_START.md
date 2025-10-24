# Quick Start Checklist

Follow these steps to quickly test your OpenZeppelin Relayer integration:

## ⚙️ Pre-Flight Checklist

- [ ] OpenZeppelin Relayer is running on `http://localhost:8080`
- [ ] You have your OZ Relayer API key
- [ ] Your Feedback contract is deployed to Sepolia
- [ ] You have an Infura API key

---

## 🚀 5-Minute Setup

### Step 1: Create `.env` file in project root

```bash
cd /Users/claudiohermida-new/Desktop/WORKSPACE/ZK-CORE_PROGRAM_2025/Semaphore/semaphore-boilerplate-OZ-relayer

cat > .env << 'EOF'
NEXT_PUBLIC_DEFAULT_NETWORK=sepolia
NEXT_PUBLIC_INFURA_API_KEY=YOUR_INFURA_KEY
INFURA_API_KEY=YOUR_INFURA_KEY
ETHEREUM_PRIVATE_KEY=YOUR_PRIVATE_KEY
NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS=0x3889927F0B5Eb1a02C6E2C20b39a1Bd4EAd76131
NEXT_PUBLIC_GROUP_ID=1
NEXT_PUBLIC_OZ_RELAYER_ENDPOINT=http://localhost:8080/api/v1/relayers
NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID=11155111
OZ_RELAYER_API_KEY=YOUR_OZ_RELAYER_API_KEY
EOF
```

**Replace:**
- `YOUR_INFURA_KEY` - from https://infura.io
- `YOUR_PRIVATE_KEY` - Ethereum private key (for fallback)
- `YOUR_CONTRACT_ADDRESS` - Your deployed Feedback contract
- `YOUR_OZ_RELAYER_API_KEY` - API key from OZ Relayer setup

*Note: The Semaphore address shown is for Sepolia testnet*

### Step 2: Install dependencies

```bash
yarn install
```

### Step 3: Start the development server

```bash
yarn dev
```

### Step 4: Test in browser

Open http://localhost:3000/debug

**Expected result:** "OpenZeppelin Relayer" shown in green

---

## ✅ Testing Workflow

### Test 1: Create Identity
1. Go to http://localhost:3000
2. Click **"Create Identity"**
3. ✅ Identity created and shown on page

### Test 2: Join Group (OZ Relayer)
1. Go to http://localhost:3000/group
2. Open browser DevTools (F12) → Console tab
3. Click **"Join group"**
4. Check console output:
   ```
   === JOIN GROUP DEBUG ===
   OZ Relayer endpoint: http://localhost:8080/api/v1/relayers
   ...
   → Using OpenZeppelin Relayer
   ✅ OZ Relayer successful!
   ```
5. ✅ See confirmation: "You have joined the Feedback group event 🎉"
6. ✅ Your identity appears in the users list

### Test 3: Send Feedback (OZ Relayer)
1. Go to http://localhost:3000/proofs
2. Keep DevTools Console open
3. Click **"Send feedback"**
4. Enter feedback message (e.g., "Testing OZ Relayer!")
5. Wait for ZK proof generation (~10-30 seconds)
6. Check console output:
   ```
   === SEND FEEDBACK DEBUG ===
   ...
   → Using OpenZeppelin Relayer
   Generating ZK proof...
   ✅ Proof generated successfully!
   Sending request to OZ Relayer...
   ✅ OZ Relayer successful!
   ```
7. ✅ See confirmation: "Your feedback has been posted 🎉"
8. ✅ Feedback appears in the feedback list

---

## 🔍 Quick Verification Commands

### Check OZ Relayer is running:
```bash
curl -X GET http://localhost:8080/api/v1/relayers \
  -H "Content-Type: application/json" \
  -H "AUTHORIZATION: Bearer YOUR_API_KEY"
```

### Check environment variables:
```bash
cd apps/web-app
node -e "require('dotenv').config({path:'../../.env'}); console.log('OZ Endpoint:', process.env.NEXT_PUBLIC_OZ_RELAYER_ENDPOINT); console.log('Chain ID:', process.env.NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID); console.log('API Key Set:', !!process.env.OZ_RELAYER_API_KEY)"
```

### View transaction on Sepolia:
```bash
# After joining/sending feedback, check the transaction hash in console, then:
open "https://sepolia.etherscan.io/tx/YOUR_TX_HASH"
```

---

## 🐛 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Debug shows "Backend API" | Check `.env` has all 3 OZ vars, restart server |
| 401 Unauthorized | Verify `OZ_RELAYER_API_KEY` matches OZ Relayer config |
| 404 Not Found | Ensure OZ Relayer is running on port 8080 |
| Can't connect to OZ Relayer | Check `curl` command above works first |
| Transaction not mining | Check OZ Relayer signer has funds on Sepolia |

---

## 📋 Expected Console Output

### Successful Join Group:
```
=== JOIN GROUP DEBUG ===
OZ Relayer endpoint: http://localhost:8080/api/v1/relayers
OZ Relayer chainId: 11155111
OZ Relayer API key exists: true
========================
→ Using OpenZeppelin Relayer
Sending request to OZ Relayer: {chainId: "11155111", to: "0x...", ...}
OZ Relayer response status: 200
OZ Relayer response data: {...}
✅ OZ Relayer successful!
```

### Successful Send Feedback:
```
=== SEND FEEDBACK DEBUG ===
OZ Relayer endpoint: http://localhost:8080/api/v1/relayers
OZ Relayer chainId: 11155111
OZ Relayer API key exists: true
===========================
Creating group from users: 1
Encoded message: 0x...
Generating ZK proof...
✅ Proof generated successfully!
Proof details: {...}
Function parameters: [...]
→ Using OpenZeppelin Relayer
Encoding sendFeedback function call...
Encoded data length: 1234
Sending request to OZ Relayer: {chainId: "11155111", to: "0x...", ...}
OZ Relayer response status: 200
OZ Relayer response data: {...}
✅ OZ Relayer successful!
```

---

## 🎯 Success Criteria

- [x] All code changes applied
- [ ] `.env` file configured
- [ ] OZ Relayer running
- [ ] Debug page shows "OpenZeppelin Relayer" (green)
- [ ] Can create identity
- [ ] Can join group via OZ Relayer
- [ ] Can send feedback via OZ Relayer
- [ ] Transactions confirm on Sepolia
- [ ] No errors in console

---

## 📞 Need Help?

See the full **DEPLOYMENT_GUIDE.md** for detailed troubleshooting and explanations.

**Happy testing! 🎉**

