"use client"

import { Box, Heading, Text, VStack, Code } from "@chakra-ui/react"

export default function DebugPage() {
    const envVars = {
        "NEXT_PUBLIC_DEFAULT_NETWORK": process.env.NEXT_PUBLIC_DEFAULT_NETWORK,
        "NEXT_PUBLIC_INFURA_API_KEY": process.env.NEXT_PUBLIC_INFURA_API_KEY ? "✅ Set" : "❌ Missing",
        "NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS": process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS,
        "NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS": process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS,
        "NEXT_PUBLIC_GROUP_ID": process.env.NEXT_PUBLIC_GROUP_ID,
        "NEXT_PUBLIC_OPENZEPPELIN_AUTOTASK_WEBHOOK": process.env.NEXT_PUBLIC_OPENZEPPELIN_AUTOTASK_WEBHOOK || "❌ Not set",
        "NEXT_PUBLIC_GELATO_RELAYER_ENDPOINT": process.env.NEXT_PUBLIC_GELATO_RELAYER_ENDPOINT || "❌ Missing",
        "NEXT_PUBLIC_GELATO_RELAYER_CHAIN_ID": process.env.NEXT_PUBLIC_GELATO_RELAYER_CHAIN_ID || "❌ Missing",
        "NEXT_PUBLIC_GELATO_RELAYER_API_KEY": process.env.NEXT_PUBLIC_GELATO_RELAYER_API_KEY ? "✅ Set" : "❌ Missing"
    }

    const gelatoConfigComplete =
        !!process.env.NEXT_PUBLIC_GELATO_RELAYER_ENDPOINT &&
        !!process.env.NEXT_PUBLIC_GELATO_RELAYER_CHAIN_ID &&
        !!process.env.NEXT_PUBLIC_GELATO_RELAYER_API_KEY

    const whichRelay = process.env.NEXT_PUBLIC_OPENZEPPELIN_AUTOTASK_WEBHOOK
        ? "OpenZeppelin Autotask"
        : gelatoConfigComplete
            ? "Gelato Relay"
            : "Backend API (/api/join, /api/feedback)"

    return (
        <Box p={8}>
            <Heading mb={6}>Environment Variables Debug</Heading>

            <VStack align="start" spacing={4} mb={8}>
                <Text fontSize="xl" fontWeight="bold" color={gelatoConfigComplete ? "green.500" : "yellow.500"}>
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


