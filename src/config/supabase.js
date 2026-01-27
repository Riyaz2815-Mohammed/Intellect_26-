import { createClient } from '@supabase/supabase-js'

// Get from Supabase Dashboard → Settings → API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Only create client if URL is provided (allows testing without Supabase)
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// Helper functions for common operations

export const supabaseHelpers = {
    // Team Authentication
    async loginTeam(teamId, accessCode) {
        if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }

        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .eq('team_id', teamId)
            .eq('access_code', accessCode)
            .eq('is_active', true)
            .single()

        return { data, error }
    },

    // Get Team State
    async getTeamState(teamId) {
        if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }

        const { data, error } = await supabase
            .from('teams')
            .select('current_round, current_stage, total_score')
            .eq('team_id', teamId)
            .single()

        return { data, error }
    },

    // Submit Answer
    async submitAnswer(teamId, round, stage, answer, isCorrect, points, errorMessage) {
        const { error } = await supabase
            .from('submissions')
            .insert({
                team_id: teamId,
                round,
                stage,
                submitted_answer: answer,
                is_correct: isCorrect,
                points_awarded: points || 0,
                error_message: errorMessage
            })

        return { error }
    },

    // Update Team Progress
    async updateTeamProgress(teamId, newScore, newStage) {
        const { error } = await supabase
            .from('teams')
            .update({
                total_score: newScore,
                current_stage: newStage
            })
            .eq('team_id', teamId)

        return { error }
    },

    // Mark Stage Complete
    async markStageComplete(teamId, round, stage) {
        const { error } = await supabase
            .from('team_progress')
            .upsert({
                team_id: teamId,
                round,
                stage,
                status: 'completed',
                completed_at: new Date().toISOString()
            })

        return { error }
    },

    // Get Physical Code
    async getPhysicalCode(teamId, round) {
        const { data, error } = await supabase
            .from('physical_codes')
            .select('code')
            .eq('team_id', teamId)
            .eq('round', round)
            .eq('is_used', false)
            .single()

        return { data, error }
    },

    // Validate Physical Code
    async validatePhysicalCode(teamId, round, code) {
        const { data, error } = await supabase
            .from('physical_codes')
            .select('*')
            .eq('team_id', teamId)
            .eq('round', round)
            .eq('code', code)
            .eq('is_used', false)
            .single()

        if (error || !data) {
            return { valid: false, error }
        }

        // Mark as used
        await supabase
            .from('physical_codes')
            .update({ is_used: true, used_at: new Date().toISOString() })
            .eq('id', data.id)

        return { valid: true }
    },

    // Get Leaderboard
    async getLeaderboard() {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .limit(20)

        return { data, error }
    },

    // Send Advantage Email (calls Edge Function)
    async sendAdvantageEmail(teamId) {
        const { data, error } = await supabase.functions.invoke('send-advantage-email', {
            body: { teamId }
        })

        return { data, error }
    },

    // Real-time Leaderboard Subscription
    subscribeToLeaderboard(callback) {
        const channel = supabase
            .channel('leaderboard-updates')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'teams'
            }, (payload) => {
                callback(payload)
            })
            .subscribe()

        return channel
    },

    // Admin: Get All Teams
    async getAllTeams() {
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .order('total_score', { ascending: false })

        return { data, error }
    },

    // Admin: Override Team State
    async adminOverrideTeam(teamId, round, stage, score) {
        const { error } = await supabase
            .from('teams')
            .update({
                current_round: round,
                current_stage: stage,
                total_score: score
            })
            .eq('team_id', teamId)

        return { error }
    }
}
