import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
const ghostData: Record<string, any> = {}

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId
    const data = ghostData[userId]

    if (data) {
      return NextResponse.json({
        wmpProgression: data.wmp_progression,
        text: data.text,
        final_wmp: data.final_wmp,
        final_accuracy: data.final_accuracy,
      })
    } else {
      return NextResponse.json({ error: "No ghost data found" }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ghost data" }, { status: 500 })
  }
}
