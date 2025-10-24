"use client"

import Stepper from "@/components/Stepper"
import { useLogContext } from "@/context/LogContext"
import { useSemaphoreContext } from "@/context/SemaphoreContext"
import IconRefreshLine from "@/icons/IconRefreshLine"
import { Box, Button, Divider, Heading, HStack, Link, Text, useBoolean, VStack } from "@chakra-ui/react"
import { generateProof, Group } from "@semaphore-protocol/core"
import { encodeBytes32String, ethers } from "ethers"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo } from "react"
import Feedback from "../../../contract-artifacts/Feedback.json"
import useSemaphoreIdentity from "@/hooks/useSemaphoreIdentity"

export default function ProofsPage() {
    const router = useRouter()
    const { setLog } = useLogContext()
    const { _users, _feedback, refreshFeedback, addFeedback, refreshUsers } = useSemaphoreContext()
    const [_loading, setLoading] = useBoolean()
    const { _identity } = useSemaphoreIdentity()

    useEffect(() => {
        if (_feedback.length > 0) {
            setLog(`${_feedback.length} feedback retrieved from the group 🤙🏽`)
        }
    }, [_feedback, setLog])

    const feedback = useMemo(() => [..._feedback].reverse(), [_feedback])

    const sendFeedback = useCallback(async () => {
        if (!_identity) {
            return
        }

        const feedback = prompt("Please enter your feedback:")

        if (feedback && _users) {
            setLoading.on()

            setLog(`Posting your anonymous feedback...`)

            // DEBUG: Check which path will be taken
            console.log("=== SEND FEEDBACK DEBUG ===")
            console.log("OZ Relayer endpoint:", process.env.NEXT_PUBLIC_OZ_RELAYER_ENDPOINT)
            console.log("OZ Relayer chainId:", process.env.NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID)
            console.log("Using API proxy: /api/oz-relay")
            console.log("===========================")

            try {
                // Try to refresh users list, but use cached if refresh fails (e.g., rate limit)
                console.log("🔄 Attempting to refresh user list from on-chain...")
                let usersForProof = _users
                
                try {
                    const freshUsers = await refreshUsers()
                    if (freshUsers.length > 0) {
                        usersForProof = freshUsers
                        console.log("✅ User list refreshed - got", freshUsers.length, "members")
                    } else {
                        console.log("⚠️ Refresh returned empty, using cached list with", _users.length, "members")
                    }
                } catch (refreshError: any) {
                    console.log("⚠️ Could not refresh user list (rate limit?), using cached list with", _users.length, "members")
                    console.log("Refresh error:", refreshError.message)
                }
                
                if (usersForProof.length === 0) {
                    throw new Error("No users found in group. Please go to Groups page and click Refresh.")
                }
                
                console.log("Creating group from users:", usersForProof.length)
                const group = new Group(usersForProof)

                const message = encodeBytes32String(feedback)
                console.log("Encoded message:", message)

                console.log("Generating ZK proof...")
                const { points, merkleTreeDepth, merkleTreeRoot, nullifier } = await generateProof(
                    _identity,
                    group,
                    message,
                    process.env.NEXT_PUBLIC_GROUP_ID as string
                )
                console.log("✅ Proof generated successfully!")
                console.log("Proof details:", {
                    merkleTreeDepth,
                    merkleTreeRoot: merkleTreeRoot.toString(),
                    nullifier: nullifier.toString(),
                    message: message.toString(),
                    pointsLength: points.length
                })

                let feedbackSent: boolean = false
                const params = [merkleTreeDepth, merkleTreeRoot, nullifier, message, points]
                console.log("Function parameters:", params)
                if (
                    process.env.NEXT_PUBLIC_OZ_RELAYER_ENDPOINT &&
                    process.env.NEXT_PUBLIC_OZ_RELAYER_CHAIN_ID
                ) {
                    console.log("→ Using OpenZeppelin Relayer (via API proxy)")
                    const iface = new ethers.Interface(Feedback.abi)

                    console.log("Encoding sendFeedback function call...")
                    const encodedData = iface.encodeFunctionData("sendFeedback", params)
                    console.log("Encoded data length:", encodedData.length)

                    const request = {
                        to: process.env.NEXT_PUBLIC_FEEDBACK_CONTRACT_ADDRESS,
                        data: encodedData,
                        value: "0",
                        gasLimit: 500000,
                        speed: "fast"
                    }
                    console.log("Sending request to OZ Relayer:", {
                        to: request.to,
                        dataLength: request.data.length,
                        value: request.value,
                        gasLimit: request.gasLimit,
                        speed: request.speed
                    })
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
                            feedbackSent = true
                        } else {
                            setLog(`Retry failed: ${retryData.message || "Please try again later"}`)
                        }
                    } else if (response.status === 200 || response.ok) {
                        console.log("✅ OZ Relayer successful!")
                        feedbackSent = true
                    } else {
                        console.error("❌ OZ Relayer failed:", response.status, responseData)
                        setLog(`Error: ${responseData.message || "Transaction failed"}`)
                    }
                } else {
                    console.log("→ Using Backend API (/api/feedback)")
                    const response = await fetch("api/feedback", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            feedback: message,
                            merkleTreeDepth,
                            merkleTreeRoot,
                            nullifier,
                            points
                        })
                    })

                    if (response.status === 200) {
                        feedbackSent = true
                    }
                }

                if (feedbackSent) {
                    addFeedback(feedback)

                    setLog(`Your feedback has been posted 🎉`)
                } else {
                    setLog("Some error occurred, please try again!")
                }
            } catch (error: any) {
                console.error("❌ SendFeedback error:", error)
                console.error("Error details:", {
                    message: error?.message,
                    stack: error?.stack,
                    name: error?.name
                })

                setLog(`Error: ${error?.message || "Some error occurred, please try again!"}`)
            } finally {
                setLoading.off()
            }
        }
    }, [_identity, _users, addFeedback, setLoading, setLog, refreshUsers])

    return (
        <>
            <Heading as="h2" size="xl">
                Proofs
            </Heading>

            <Text pt="2" fontSize="md">
                Semaphore members can anonymously{" "}
                <Link href="https://docs.semaphore.pse.dev/guides/proofs" isExternal>
                    prove
                </Link>{" "}
                that they are part of a group and send their anonymous messages. Messages could be votes, leaks,
                reviews, or feedback.
            </Text>

            <Divider pt="5" borderColor="gray.500" />

            <HStack py="5" justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    Feedback ({_feedback.length})
                </Text>
                <Button
                    leftIcon={<IconRefreshLine />}
                    variant="link"
                    color="text.300"
                    onClick={refreshFeedback}
                    size="lg"
                >
                    Refresh
                </Button>
            </HStack>

            {_feedback.length > 0 && (
                <VStack spacing="3" pb="3" align="left" maxHeight="300px" overflowY="scroll">
                    {feedback.map((f, i) => (
                        <HStack key={i} pb="3" borderBottomWidth={i < _feedback.length - 1 ? 1 : 0}>
                            <Text>{f}</Text>
                        </HStack>
                    ))}
                </VStack>
            )}

            <Box pb="5">
                <Button w="full" colorScheme="primary" isDisabled={_loading} onClick={sendFeedback}>
                    Send feedback
                </Button>
            </Box>

            <Divider pt="3" borderColor="gray" />

            <Stepper step={3} onPrevClick={() => router.push("/group")} />
        </>
    )
}
