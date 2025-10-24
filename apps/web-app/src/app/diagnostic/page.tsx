"use client"

import { Box, Button, Code, Heading, Text, VStack } from "@chakra-ui/react"
import { useState } from "react"
import Feedback from "../../../contract-artifacts/Feedback.json"
import { ethers } from "ethers"

export default function DiagnosticPage() {
    const [output, setOutput] = useState<string[]>([])

    const log = (message: string) => {
        console.log(message)
        setOutput(prev => [...prev, message])
    }

    const runDiagnostics = async () => {
        setOutput([])
        log("🔍 Starting Diagnostics...")
        log("")

        try {
            // Check environment
            log("📋 Environment Variables:")
            log(`- Contract: ${process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS}`)
            log(`- Semaphore: ${process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS}`)
            log(`- Network: ${process.env.NEXT_PUBLIC_DEFAULT_NETWORK}`)
            log(`- Infura: ${process.env.NEXT_PUBLIC_INFURA_API_KEY ? "✅ Set" : "❌ Missing"}`)
            log("")

            // Setup provider
            log("🔗 Connecting to network...")
            const network = process.env.NEXT_PUBLIC_DEFAULT_NETWORK
            const infuraKey = process.env.NEXT_PUBLIC_INFURA_API_KEY

            if (!infuraKey) {
                log("❌ No Infura API key found")
                return
            }

            const provider = network === "localhost"
                ? new ethers.JsonRpcProvider("http://127.0.0.1:8545")
                : new ethers.InfuraProvider(network, infuraKey)

            log("✅ Connected to provider")
            log("")

            // Check contract
            const contractAddress = process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS
            if (!contractAddress) {
                log("❌ No contract address found")
                return
            }

            log("📝 Checking Contract State...")
            const contract = new ethers.Contract(contractAddress, Feedback.abi, provider)

            // Get group info
            try {
                // Try to get group depth and root
                log("Calling getGroup()...")
                const groupData = await contract.getGroup()
                log(`✅ Group Depth: ${groupData[0].toString()}`)
                log(`✅ Group Root: ${groupData[1].toString()}`)
                log("")
            } catch (error: any) {
                log(`❌ Error getting group: ${error.message}`)
                log("")
            }

            // Get events
            log("📜 Checking Recent Events...")
            try {
                const filter = contract.filters.MemberAdded()
                const events = await contract.queryFilter(filter, -10000)
                log(`✅ Found ${events.length} MemberAdded events`)

                if (events.length > 0) {
                    log("\nRecent members:")
                    events.slice(-5).forEach((event, i) => {
                        log(`  ${i + 1}. Identity: ${event.args?.[2]?.toString() || "N/A"}`)
                    })
                }
                log("")
            } catch (error: any) {
                log(`⚠️ Could not fetch events: ${error.message}`)
                log("")
            }

            // Check feedback events
            try {
                const feedbackFilter = contract.filters.FeedbackSent()
                const feedbackEvents = await contract.queryFilter(feedbackFilter, -10000)
                log(`✅ Found ${feedbackEvents.length} FeedbackSent events`)

                if (feedbackEvents.length > 0) {
                    log("\nRecent feedback:")
                    feedbackEvents.slice(-5).forEach((event, i) => {
                        log(`  ${i + 1}. Feedback: ${event.args?.[0]?.toString() || "N/A"}`)
                    })
                }
                log("")
            } catch (error: any) {
                log(`⚠️ Could not fetch feedback events: ${error.message}`)
                log("")
            }

            // Check Semaphore contract
            log("🔍 Checking Semaphore Contract...")
            const semaphoreAddress = process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS
            if (semaphoreAddress) {
                const semaphoreContract = new ethers.Contract(
                    semaphoreAddress,
                    [
                        "function getMerkleTreeDepth(uint256 groupId) view returns (uint256)",
                        "function getMerkleTreeRoot(uint256 groupId) view returns (uint256)",
                        "function getMerkleTreeSize(uint256 groupId) view returns (uint256)"
                    ],
                    provider
                )

                const groupId = process.env.NEXT_PUBLIC_GROUP_ID || "1"

                try {
                    const depth = await semaphoreContract.getMerkleTreeDepth(groupId)
                    const root = await semaphoreContract.getMerkleTreeRoot(groupId)
                    const size = await semaphoreContract.getMerkleTreeSize(groupId)

                    log(`✅ Semaphore Group ${groupId}:`)
                    log(`   - Depth: ${depth.toString()}`)
                    log(`   - Root: ${root.toString()}`)
                    log(`   - Size: ${size.toString()} members`)
                    log("")
                } catch (error: any) {
                    log(`⚠️ Could not query Semaphore: ${error.message}`)
                    log("")
                }
            }

            log("✅ Diagnostics Complete!")

        } catch (error: any) {
            log("")
            log(`❌ Error: ${error.message}`)
            log("")
            log("Stack trace:")
            log(error.stack || "No stack trace available")
        }
    }

    return (
        <Box p={8}>
            <Heading mb={6}>Contract Diagnostics</Heading>

            <Text mb={4}>
                This page helps diagnose issues with the Feedback contract and OZ Relayer integration.
            </Text>

            <Button colorScheme="blue" onClick={runDiagnostics} mb={6}>
                Run Diagnostics
            </Button>

            <VStack align="start" spacing={2} maxW="100%" overflowX="auto">
                {output.map((line, i) => (
                    <Code key={i} p={2} w="full" fontSize="sm" whiteSpace="pre-wrap" wordBreak="break-all">
                        {line}
                    </Code>
                ))}
            </VStack>
        </Box>
    )
}

