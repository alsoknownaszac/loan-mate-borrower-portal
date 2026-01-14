import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if any organizations exist
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)

    if (error) {
      console.error("Error checking organizations:", error)
      return NextResponse.json({ setupComplete: false })
    }

    // If organizations exist, setup is complete
    const setupComplete = organizations && organizations.length > 0

    return NextResponse.json({ setupComplete })
  } catch (error) {
    console.error("Setup check error:", error)
    return NextResponse.json({ setupComplete: false })
  }
}
