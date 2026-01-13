import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🧹 CLEANING UP TEST CHAT SESSIONS')
console.log('==================================================')

async function cleanupTestSessions() {
  try {
    // Delete test sessions (keep the one with actual messages for demo)
    const { data: sessions, error: fetchError } = await supabase
      .from('chat_sessions')
      .select('id, subject, created_at')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.log('❌ Error fetching sessions:', fetchError.message)
      return
    }

    console.log(`📋 Found ${sessions.length} sessions`)

    // Keep the most recent session with messages, delete the rest
    const sessionsToDelete = sessions.slice(1) // Keep first (most recent), delete others

    if (sessionsToDelete.length > 0) {
      console.log(`🗑️ Deleting ${sessionsToDelete.length} test sessions...`)
      
      for (const session of sessionsToDelete) {
        // Delete messages first
        const { error: messagesError } = await supabase
          .from('chat_messages')
          .delete()
          .eq('session_id', session.id)

        if (messagesError) {
          console.log(`❌ Error deleting messages for ${session.id}:`, messagesError.message)
        }

        // Delete participants
        const { error: participantsError } = await supabase
          .from('chat_participants')
          .delete()
          .eq('session_id', session.id)

        if (participantsError) {
          console.log(`❌ Error deleting participants for ${session.id}:`, participantsError.message)
        }

        // Delete session
        const { error: sessionError } = await supabase
          .from('chat_sessions')
          .delete()
          .eq('id', session.id)

        if (sessionError) {
          console.log(`❌ Error deleting session ${session.id}:`, sessionError.message)
        } else {
          console.log(`✅ Deleted session: ${session.subject} (${session.id})`)
        }
      }
    }

    // Show remaining sessions
    const { data: remainingSessions } = await supabase
      .from('chat_sessions')
      .select('id, subject, created_at')
      .order('created_at', { ascending: false })

    console.log(`\n📋 Remaining sessions: ${remainingSessions?.length || 0}`)
    remainingSessions?.forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.subject} (${session.id})`)
    })

    console.log('\n==================================================')
    console.log('🎯 CLEANUP COMPLETE')

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

cleanupTestSessions()