import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
const ghostData: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, wmp_progression, text, final_wmp, final_accuracy } = body

    ghostData[user_id] = {
      wmp_progression,
      text,
      final_wmp,
      final_accuracy,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save ghost data" }, { status: 500 })
  }
}
