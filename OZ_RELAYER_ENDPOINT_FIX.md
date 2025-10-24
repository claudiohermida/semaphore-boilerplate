# OpenZeppelin Relayer Endpoint Fix ✅

## 🔍 The Problem

**Wrong Endpoint Error:**
```
Json deserialize error: unknown field `chainId`, expected one of `id`, `name`, `network`, ...
```

We were using the wrong endpoint:
- ❌ **Used:** `/api/v1/relayers` (for managing relayer configs)
- ✅ **Need:** `/api/v1/relayers/{RELAYER_ID}/transactions` (for sending transactions)

---

## 🛠️ The Fix

### Updated Files

1. **`/api/oz-relay/route.ts`** - API proxy now uses correct endpoint
2. **`group/page.tsx`** - Removed `chainId` from request
3. **`proofs/page.tsx`** - Removed `chainId` from request
4. **`debug/page.tsx`** - Shows relayer ID configuration

### New Request Format

**Before (Wrong):**
```json
{
  "chainId": "11155111",
  "to": "0x...",
  "data": "0x...",
  "gasLimit": "500000"
}
```

**After (Correct):**
```json
{
  "to": "0x...",
  "data": "0x...",
  "value": "0",
  "gasLimit": 500000
}
```

### Endpoint Structure

```
POST http://localhost:8080/api/v1/relayers/sepolia-example/transactions
```

Components:
- **Base URL:** `http://localhost:8080`
- **Path:** `/api/v1/relayers/{RELAYER_ID}/transactions`
- **Relayer ID:** `sepolia-example` (from your config)

---

## 🔧 Environment Variables

### Required Updates

Add to your `.env` file:

```bash
# OpenZeppelin Relayer Configuration
NEXT_PUBLIC_OZ_RELAYER_BASE_URL=http://localhost:8080
NEXT_PUBLIC_OZ_RELAYER_ID=sepolia-example
NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID=11155111
OZ_RELAYER_API_KEY=d75e66d1-7e34-43ef-8f0d-d927beeab3ae
```

### Variable Descriptions

- **`NEXT_PUBLIC_OZ_RELAYER_BASE_URL`**: Base URL of your OZ Relayer (defaults to `http://localhost:8080`)
- **`NEXT_PUBLIC_OZ_RELAYER_ID`**: Your relayer ID (defaults to `sepolia-example`)
- **`NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID`**: Chain ID for Sepolia (11155111)
- **`OZ_RELAYER_API_KEY`**: Your API key (server-side only)

---

## 🧪 Testing the Fix

### Step 1: Update Environment

Make sure your `.env` has the updated variables above.

### Step 2: Restart Dev Server

```bash
# Press Ctrl+C to stop
yarn dev
```

### Step 3: Test Transaction

1. **Hard refresh browser:** `Cmd+Shift+R`
2. **Go to:** http://localhost:3000/proofs
3. **Click:** "Send feedback"
4. **Enter message:** "Testing correct endpoint!"
5. **Watch console for:**

```
→ Using OpenZeppelin Relayer (via API proxy)
Sending request to OZ Relayer: {
  to: "0x3f0072B0B0812bb033340D43d093D07c9DFb8188",
  dataLength: 778,
  value: "0",
  gasLimit: 500000
}
```

### Step 4: Check Server Terminal

Your Next.js server should show:

```
=== OZ RELAYER PROXY ===
Forwarding request to: http://localhost:8080/api/v1/relayers/sepolia-example/transactions
Relayer ID: sepolia-example
Request body: {
  "to": "0x3f0072B0B0812bb033340D43d093D07c9DFb8188",
  "data": "0x...",
  "value": "0",
  "gasLimit": 500000
}
OZ Relayer response status: 200 (or 201)
OZ Relayer response data: {...}
========================
```

### Step 5: Check OZ Relayer Terminal

Should show:
```
[INFO] Transaction received
[INFO] Transaction queued: 0x...
[INFO] Transaction sent: 0xTRANSACTION_HASH
[INFO] Transaction mined: 0xTRANSACTION_HASH
```

---

## ✅ Expected Results

### Browser Console

```
✅ Proof generated successfully!
→ Using OpenZeppelin Relayer (via API proxy)
Sending request to OZ Relayer: {...}
OZ Relayer response status: 200
✅ OZ Relayer successful!
✅ Your feedback has been posted 🎉
```

### On Sepolia Etherscan

```bash
open "https://sepolia.etherscan.io/address/0x3f0072B0B0812bb033340D43d093D07c9DFb8188"
```

Look for `sendFeedback` transaction from `0x70f1d86da2a4ea90b79b8cd6e3fcb6860d7b4278` (your relayer address).

---

## 🔍 Debugging

### If you get 404 Error

**Check:**
- Is OZ Relayer running?
- Is the relayer ID correct? Run:
  ```bash
  curl -X GET http://localhost:8080/api/v1/relayers \
    -H "AUTHORIZATION: Bearer YOUR_API_KEY"
  ```

### If you get 401 Unauthorized

**Check:**
- Is `OZ_RELAYER_API_KEY` in `.env` correct?
- Did you restart the dev server after updating `.env`?

### If you get 500 Error

**Check server and OZ Relayer logs** for detailed error message.

---

## 📊 Your Relayer Info

From the GET request, here's your configuration:

```json
{
  "id": "sepolia-example",
  "name": "Sepolia Example",
  "network": "sepolia",
  "network_type": "evm",
  "paused": false,
  "address": "0x70f1d86da2a4ea90b79b8cd6e3fcb6860d7b4278",
  "policies": {
    "min_balance": 0,
    "gas_limit_estimation": true
  }
}
```

**Your relayer address:** `0x70f1d86da2a4ea90b79b8cd6e3fcb6860d7b4278`

This is the address that will sign and send transactions on Sepolia!

---

## 🎉 Summary

**Fixed:**
- ✅ Using correct transactions endpoint
- ✅ Removed invalid `chainId` field
- ✅ Added `value` field (set to "0")
- ✅ Changed `gasLimit` to number instead of string
- ✅ Configured relayer ID in proxy

**Ready to test!** 🚀

Restart your dev server and try sending feedback again!

