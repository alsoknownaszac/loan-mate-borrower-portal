import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://twenkuyewmgwvqyxurpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI'
)

async function clearChatData() {
  console.log('🧹 Clearing all chat data from database...\n')

  try {
    // Step 1: Get current data counts
    console.log('📊 Current data counts:')
    
    const { count: messagesCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
    
    const { count: participantsCount } = await supabase
      .from('chat_participants')
      .select('*', { count: 'exact', head: true })
    
    const { count: sessionsCount } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })

    console.log(`   Messages: ${messagesCount || 0}`)
    console.log(`   Participants: ${participantsCount || 0}`)
    console.log(`   Sessions: ${sessionsCount || 0}`)

    if ((messagesCount || 0) === 0 && (participantsCount || 0) === 0 && (sessionsCount || 0) === 0) {
      console.log('\n✅ No chat data found. Database is already clean!')
      return
    }

    console.log('\n🗑️  Clearing data in order (messages → participants → sessions)...')

    // Step 2: Clear chat_messages (has foreign key to sessions)
    console.log('\n1️⃣ Clearing chat messages...')
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (messagesError) {
      console.error('❌ Error clearing messages:', messagesError)
      return
    }
    console.log('✅ Chat messages cleared')

    // Step 3: Clear chat_participants (has foreign key to sessions)
    console.log('\n2️⃣ Clearing chat participants...')
    const { error: participantsError } = await supabase
      .from('chat_participants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (participantsError) {
      console.error('❌ Error clearing participants:', participantsError)
      return
    }
    console.log('✅ Chat participants cleared')

    // Step 4: Clear chat_sessions (parent table)
    console.log('\n3️⃣ Clearing chat sessions...')
    const { error: sessionsError } = await supabase
      .from('chat_sessions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (sessionsError) {
      console.error('❌ Error clearing sessions:', sessionsError)
      return
    }
    console.log('✅ Chat sessions cleared')

    // Step 5: Verify cleanup
    console.log('\n🔍 Verifying cleanup...')
    
    const { count: finalMessagesCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
    
    const { count: finalParticipantsCount } = await supabase
      .from('chat_participants')
      .select('*', { count: 'exact', head: true })
    
    const { count: finalSessionsCount } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })

    console.log('📊 Final counts:')
    console.log(`   Messages: ${finalMessagesCount || 0}`)
    console.log(`   Participants: ${finalParticipantsCount || 0}`)
    console.log(`   Sessions: ${finalSessionsCount || 0}`)

    if ((finalMessagesCount || 0) === 0 && (finalParticipantsCount || 0) === 0 && (finalSessionsCount || 0) === 0) {
      console.log('\n🎉 All chat data successfully cleared!')
      console.log('\n✅ Summary:')
      console.log(`   - Removed ${messagesCount || 0} messages`)
      console.log(`   - Removed ${participantsCount || 0} participants`)
      console.log(`   - Removed ${sessionsCount || 0} sessions`)
      console.log('   - Chat tables are now empty and ready for fresh data')
      console.log('   - Table structure preserved (no tables were dropped)')
    } else {
      console.log('\n⚠️  Some data may still remain. Please check manually.')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

clearChatData().catch(console.error)