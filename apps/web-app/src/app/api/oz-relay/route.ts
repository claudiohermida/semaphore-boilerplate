import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        // Get OZ Relayer configuration from environment
        const ozRelayerBaseUrl = process.env.NEXT_PUBLIC_OZ_RELAYER_BASE_URL || "http://localhost:8080"
        const ozRelayerApiKey = process.env.OZ_RELAYER_API_KEY
        const ozRelayerId = process.env.NEXT_PUBLIC_OZ_RELAYER_ID || "sepolia-example"

        if (!ozRelayerApiKey) {
            return NextResponse.json(
                { error: "OZ Relayer API key not configured" },
                { status: 500 }
            )
        }

        // Parse the request body
        const body = await req.json()

        // Build the correct endpoint for transactions
        const transactionEndpoint = `${ozRelayerBaseUrl}/api/v1/relayers/${ozRelayerId}/transactions`

        console.log("=== OZ RELAYER PROXY ===")
        console.log("Forwarding request to:", transactionEndpoint)
        console.log("Relayer ID:", ozRelayerId)
        console.log("Request body:", JSON.stringify(body, null, 2))

        // Forward the request to OZ Relayer
        const response = await fetch(transactionEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "AUTHORIZATION": `Bearer ${ozRelayerApiKey}`
            },
            body: JSON.stringify(body)
        })

        const responseData = await response.json()

        console.log("OZ Relayer response status:", response.status)
        console.log("OZ Relayer response data:", JSON.stringify(responseData, null, 2))
        console.log("========================")

        // Return the OZ Relayer response to the client
        return NextResponse.json(responseData, { status: response.status })

    } catch (error: any) {
        console.error("❌ OZ Relayer proxy error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to relay transaction" },
            { status: 500 }
        )
    }
}

