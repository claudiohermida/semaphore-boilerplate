# SendFeedback Debugging Guide

## Issue: SendFeedback Transaction Not Working

### Symptoms
- ✅ JoinGroup works fine
- ❌ SendFeedback completes proof generation but transaction has no effect

### Root Causes (in order of likelihood)

1. **Transaction reverts on-chain** (most likely)
   - ZK proof is invalid
   - Wrong group state (merkle root mismatch)
   - Nullifier already used
   - Gas estimation failure

2. **Parameter encoding issue**
   - Wrong types or order
   - Points array not properly formatted

3. **OZ Relayer doesn't process transaction**
   - Gas limit too low
   - Transaction stuck in queue

---

## Debugging Checklist

### 1. Verify Transaction on Etherscan

After attempting sendFeedback, check if a transaction was sent:

1. Look in browser console for OZ Relayer response
2. Get transaction hash (if any)
3. Check on Sepolia: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

**Look for:**
- Transaction with method "sendFeedback"
- Status: Success ✅ or Failed ❌
- Revert reason (if failed)

---

### 2. Check Group State Mismatch

**Common Issue:** The group state in the browser doesn't match the on-chain state.

**Why this happens:**
- Multiple users joined after you loaded the page
- You're using cached/old user list
- Merkle tree root in proof doesn't match contract

**Fix:**
1. Click **"Refresh"** button on the groups page BEFORE sending feedback
2. Verify user count matches what's on-chain
3. Try sending feedback again

---

### 3. Verify Proof Parameters

In browser console, look for the "Function parameters" log:

```javascript
Function parameters: [
  merkleTreeDepth,    // Should be 16 or 20
  merkleTreeRoot,     // BigInt
  nullifier,          // BigInt
  message,            // bytes32 string (0x...)
  points              // Array of 8 BigInts
]
```

**Check:**
- merkleTreeDepth: Should be a number (16 or 20)
- merkleTreeRoot: Should be a very large number
- nullifier: Should be a very large number
- message: Should start with "0x"
- points: Should be an array with 8 elements

---

### 4. Compare with JoinGroup Request

Both should have similar structure but different data:

**JoinGroup (working):**
```json
{
  "chainId": "11155111",
  "to": "0xYourContract",
  "data": "0xShortEncodedData",
  "gasLimit": "500000"
}
```

**SendFeedback (not working):**
```json
{
  "chainId": "11155111",
  "to": "0xYourContract",
  "data": "0xVeryLongEncodedData",
  "gasLimit": "500000"
}
```

**Key difference:** SendFeedback data should be MUCH longer (includes ZK proof with 8 points).

---

### 5. Check Gas Limit

SendFeedback requires more gas than JoinGroup because of proof verification.

**Current setting:** 500000 gas

**Potential issue:** This might not be enough.

**To test:** Try increasing gas limit in the code temporarily.

---

### 6. Enable Verbose Logging

Add this to your browser console BEFORE clicking "Send feedback":

```javascript
// Enable verbose Semaphore logging
localStorage.setItem('debug', 'semaphore:*');
```

Then try again and share the full console output.

---

## Quick Test: Verify Contract State

Let me create a test script to check your contract state:

1. Open browser console
2. Navigate to: http://localhost:3000/group
3. Paste and run:

```javascript
// Check contract state
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract(
  process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS,
  [
    "function getGroup() view returns (uint256, uint256)",
    "event MemberAdded(uint256 indexed groupId, uint256 index, uint256 identityCommitment, uint256 root)"
  ],
  provider
);

// Get current group state
const [depth, root] = await contract.getGroup();
console.log("On-chain Group State:");
console.log("- Depth:", depth.toString());
console.log("- Root:", root.toString());
```

---

## Common Fixes

### Fix 1: Refresh Group State
```
1. Go to /group page
2. Click "Refresh" button
3. Wait for user list to update
4. Go to /proofs page
5. Try sending feedback again
```

### Fix 2: Increase Gas Limit

Edit `apps/web-app/src/app/proofs/page.tsx`:

```typescript
// Line ~91, change:
const request = {
    chainId: process.env.NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID,
    to: process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS,
    data: encodedData,
    gasLimit: "1000000"  // ← Increase from 500000 to 1000000
}
```

### Fix 3: Check Nullifier Not Used

The nullifier is unique per (identity + message + group).

If you already sent feedback with the SAME message before, the nullifier will be the same and transaction will revert.

**Try:** Send feedback with a DIFFERENT message.

---

## Need More Help?

Share these outputs:

1. **Full browser console output** when sending feedback
2. **OZ Relayer logs** during the sendFeedback attempt
3. **Transaction hash** (if any) from Etherscan
4. **Contract address** so I can check on-chain state

---

## Most Likely Solution

Based on similar Gelato issue, the problem is probably:

**❌ Group state mismatch**
- Browser has old user list
- Proof uses old merkle root
- Contract has newer merkle root
- Transaction reverts with "InvalidProof" error

**✅ Solution:**
1. Always click "Refresh" on /group page first
2. Then go to /proofs page
3. Send feedback

