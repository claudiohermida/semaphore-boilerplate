"use client"

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { SemaphoreEthers } from "@semaphore-protocol/data"
import { decodeBytes32String, toBeHex } from "ethers"

export type SemaphoreContextType = {
    _users: string[]
    _feedback: string[]
    refreshUsers: () => Promise<void>
    addUser: (user: string) => void
    refreshFeedback: () => Promise<void>
    addFeedback: (feedback: string) => void
}

const SemaphoreContext = createContext<SemaphoreContextType | null>(null)

interface ProviderProps {
    children: ReactNode
}

const ethereumNetwork =
    process.env.NEXT_PUBLIC_DEFAULT_NETWORK === "localhost"
        ? "http://127.0.0.1:8545"
        : process.env.NEXT_PUBLIC_DEFAULT_NETWORK

export const SemaphoreContextProvider: React.FC<ProviderProps> = ({ children }) => {
    const [_users, setUsers] = useState<any[]>([])
    const [_feedback, setFeedback] = useState<string[]>([])

    const refreshUsers = useCallback(async (): Promise<void> => {
        try {
            console.log("=== FETCHING GROUP MEMBERS ===")
            console.log("Network:", ethereumNetwork)
            console.log("Semaphore contract:", process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS)
            console.log("Infura project ID:", process.env.NEXT_PUBLIC_INFURA_API_KEY ? "✅ Set" : "❌ Missing")
            console.log("Group ID:", process.env.NEXT_PUBLIC_GROUP_ID)

            const semaphore = new SemaphoreEthers(ethereumNetwork, {
                address: process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS,
                projectId: process.env.NEXT_PUBLIC_INFURA_API_KEY
            })

            const members = await semaphore.getGroupMembers(process.env.NEXT_PUBLIC_GROUP_ID as string)

            setUsers(members.map((member) => member.toString()))
            console.log(`✅ Fetched ${members.length} group members`)
        } catch (error: any) {
            console.error("❌ Error fetching group members:", error)
            if (error?.status === 429 || error?.message?.includes("429")) {
                console.error("Rate limit hit on Infura/RPC provider")
            }
        }
    }, [])

    const addUser = useCallback(
        (user: any) => {
            setUsers([..._users, user])
        },
        [_users]
    )

    const refreshFeedback = useCallback(async (): Promise<void> => {
        try {
            console.log("Fetching feedback proofs...")
            const semaphore = new SemaphoreEthers(ethereumNetwork, {
                address: process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS,
                projectId: process.env.NEXT_PUBLIC_INFURA_API_KEY
            })

            const proofs = await semaphore.getGroupValidatedProofs(process.env.NEXT_PUBLIC_GROUP_ID as string)

            setFeedback(proofs.map(({ message }: any) => decodeBytes32String(toBeHex(message, 32))))
            console.log(`✅ Fetched ${proofs.length} feedback proofs`)
        } catch (error: any) {
            console.error("❌ Error fetching feedback:", error)
            if (error?.status === 429 || error?.message?.includes("429")) {
                console.error("Rate limit hit on Infura/RPC provider")
            }
        }
    }, [])

    const addFeedback = useCallback(
        (feedback: string) => {
            setFeedback([..._feedback, feedback])
        },
        [_feedback]
    )

    useEffect(() => {
        // Stagger requests to avoid rate limits
        refreshUsers()
        setTimeout(() => refreshFeedback(), 1000) // Wait 1 second between calls
    }, [refreshFeedback, refreshUsers])

    return (
        <SemaphoreContext.Provider
            value={{
                _users,
                _feedback,
                refreshUsers,
                addUser,
                refreshFeedback,
                addFeedback
            }}
        >
            {children}
        </SemaphoreContext.Provider>
    )
}

export const useSemaphoreContext = () => {
    const context = useContext(SemaphoreContext)
    if (context === null) {
        throw new Error("SemaphoreContext must be used within a SemaphoreContextProvider")
    }
    return context
}
