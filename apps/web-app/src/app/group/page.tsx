"use client"
import Stepper from "@/components/Stepper"
import { useLogContext } from "@/context/LogContext"
import { useSemaphoreContext } from "@/context/SemaphoreContext"
import IconRefreshLine from "@/icons/IconRefreshLine"
import { Box, Button, Divider, Heading, HStack, Link, Text, useBoolean, VStack } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo } from "react"
import Feedback from "../../../contract-artifacts/Feedback.json"
import { ethers } from "ethers"
import useSemaphoreIdentity from "@/hooks/useSemaphoreIdentity"

export default function GroupsPage() {
    const router = useRouter()
    const { setLog } = useLogContext()
    const { _users, refreshUsers, addUser } = useSemaphoreContext()
    const [_loading, setLoading] = useBoolean()
    const { _identity } = useSemaphoreIdentity()

    useEffect(() => {
        if (_users.length > 0) {
            setLog(`${_users.length} user${_users.length > 1 ? "s" : ""} retrieved from the group 🤙🏽`)
        }
    }, [_users, setLog])

    const users = useMemo(() => [..._users].reverse(), [_users])

    const joinGroup = useCallback(async () => {
        if (!_identity) {
            return
        }

        setLoading.on()
        setLog(`Joining the Feedback group...`)

        // DEBUG: Check which path will be taken
        console.log("=== JOIN GROUP DEBUG ===")
        console.log("OZ Relayer endpoint:", process.env.NEXT_PUBLIC_OZ_RELAYER_ENDPOINT)
        console.log("OZ Relayer chainId:", process.env.NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID)
        console.log("Using API proxy: /api/oz-relay")
        console.log("========================")

        let joinedGroup: boolean = false

        if (
            process.env.NEXT_PUBLIC_OZ_RELAYER_ENDPOINT &&
            process.env.NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID
        ) {
            console.log("→ Using OpenZeppelin Relayer (via API proxy)")
            const iface = new ethers.Interface(Feedback.abi)
            const request = {
                to: process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS,
                data: iface.encodeFunctionData("joinGroup", [_identity.commitment.toString()]),
                value: "0",
                gasLimit: 500000,
                speed: "fast"
            }
            console.log("Sending request to OZ Relayer:", request)
            const response = await fetch("/api/oz-relay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            })

            const responseData = await response.json()
            console.log("OZ Relayer response status:", response.status)
            console.log("OZ Relayer response data:", responseData)

            if (response.status === 429) {
                console.error("❌ Rate limit hit! Error:", responseData)
                setLog("⏳ Rate limit exceeded. Retrying in 10 seconds...")

                // Auto-retry after 10 seconds
                await new Promise(resolve => setTimeout(resolve, 10000))
                setLog("Retrying transaction...")

                // Retry the request
                const retryResponse = await fetch("/api/oz-relay", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(request)
                })
                const retryData = await retryResponse.json()
                console.log("Retry response:", retryResponse.status, retryData)

                if (retryResponse.status === 200 || retryResponse.ok) {
                    console.log("✅ OZ Relayer successful on retry!")
                    joinedGroup = true
                } else {
                    setLog(`Retry failed: ${retryData.message || "Please try again later"}`)
                }
            } else if (response.status === 200 || response.ok) {
                console.log("✅ OZ Relayer successful!")
                joinedGroup = true
            } else {
                console.error("❌ OZ Relayer failed:", response.status, responseData)
                setLog(`Error: ${responseData.message || "Transaction failed"}`)
            }
        } else {
            console.log("→ Using Backend API (/api/join)")
            const response = await fetch("api/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identityCommitment: _identity.commitment.toString()
                })
            })

            if (response.status === 200) {
                joinedGroup = true
            }
        }

        if (joinedGroup) {
            addUser(_identity.commitment.toString())

            setLog(`You have joined the Feedback group event 🎉 Share your feedback anonymously!`)
        } else {
            setLog("Some error occurred, please try again!")
        }

        setLoading.off()
    }, [_identity, addUser, setLoading, setLog])

    const userHasJoined = useMemo(
        () => _identity !== undefined && _users.includes(_identity.commitment.toString()),
        [_identity, _users]
    )

    return (
        <>
            <Heading as="h2" size="xl">
                Groups
            </Heading>

            <Text pt="2" fontSize="md">
                <Link href="https://docs.semaphore.pse.dev/guides/groups" isExternal>
                    Semaphore groups
                </Link>{" "}
                are{" "}
                <Link href="https://zkkit.pse.dev/modules/_zk_kit_lean_imt.html" isExternal>
                    Lean incremental Merkle trees
                </Link>{" "}
                in which each leaf contains an identity commitment for a user. Groups can be abstracted to represent
                events, polls, or organizations.
            </Text>

            <Divider pt="5" borderColor="gray.500" />

            <HStack py="5" justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    Group users ({_users.length})
                </Text>
                <Button leftIcon={<IconRefreshLine />} variant="link" color="text.300" onClick={refreshUsers} size="lg">
                    Refresh
                </Button>
            </HStack>

            {_users.length > 0 && (
                <VStack spacing="3" pb="3" align="left" maxHeight="300px" overflowY="scroll">
                    {users.map((user, i) => (
                        <HStack key={i} pb="3" borderBottomWidth={i < _users.length - 1 ? 1 : 0} whiteSpace="nowrap">
                            <Text textOverflow="ellipsis" overflow="hidden">
                                {_identity?.commitment.toString() === user ? <b>{user}</b> : user}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            )}

            <Box pb="5">
                <Button
                    w="full"
                    colorScheme="primary"
                    isDisabled={_loading || !_identity || userHasJoined}
                    onClick={joinGroup}
                >
                    Join group
                </Button>
            </Box>

            <Divider pt="3" borderColor="gray.500" />

            <Stepper
                step={2}
                onPrevClick={() => router.push("/")}
                onNextClick={userHasJoined ? () => router.push("/proofs") : undefined}
            />
        </>
    )
}
