import { type NextRequest, NextResponse } from "next/server"

const scores: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, wpm, accuracy, keystrokes, errors, duration } = body

    const score = {
      id: Date.now(),
      user_id,
      wpm,
      accuracy,
      keystrokes,
      errors,
      duration,
      timestamp: new Date().toISOString(),
    }

    scores.push(score)

    return NextResponse.json({ success: true, id: score.id })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ scores })
}
