"use client"

import { Box, Heading, Text, VStack, Code } from "@chakra-ui/react"

export default function DebugPage() {
    const envVars = {
        "NEXT_PUBLIC_DEFAULT_NETWORK": process.env.NEXT_PUBLIC_DEFAULT_NETWORK,
        "NEXT_PUBLIC_INFURA_API_KEY": process.env.NEXT_PUBLIC_INFURA_API_KEY ? "✅ Set" : "❌ Missing",
        "NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS": process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS,
        "NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS": process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS,
        "NEXT_PUBLIC_GROUP_ID": process.env.NEXT_PUBLIC_GROUP_ID,
        "NEXT_PUBLIC_OZ_RELAYER_BASE_URL": process.env.NEXT_PUBLIC_OZ_RELAYER_BASE_URL || "http://localhost:8080 (default)",
        "NEXT_PUBLIC_OZ_RELAYER_ID": process.env.NEXT_PUBLIC_OZ_RELAYER_ID || "sepolia-example (default)",
        "NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID": process.env.NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID || "11155111",
        "OZ_RELAYER_API_KEY": "✅ Server-side only (check .env)"
    }

    const ozRelayerConfigComplete =
        !!process.env.NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID

    const whichRelay = ozRelayerConfigComplete
        ? "OpenZeppelin Relayer (via /api/oz-relay proxy)"
        : "Backend API (/api/join, /api/feedback)"

    return (
        <Box p={8}>
            <Heading mb={6}>Environment Variables Debug</Heading>

            <VStack align="start" spacing={4} mb={8}>
                <Text fontSize="xl" fontWeight="bold" color={ozRelayerConfigComplete ? "green.500" : "yellow.500"}>
                    Active Relay Method: {whichRelay}
                </Text>
            </VStack>

            <VStack align="start" spacing={3}>
                {Object.entries(envVars).map(([key, value]) => (
                    <Box key={key} p={3} bg="gray.100" borderRadius="md" w="full">
                        <Text fontWeight="bold" fontSize="sm" color="gray.600">{key}</Text>
                        <Code fontSize="md" colorScheme={value?.includes("❌") ? "red" : "green"}>
                            {value || "undefined"}
                        </Code>
                    </Box>
                ))}
            </VStack>
        </Box>
    )
}

