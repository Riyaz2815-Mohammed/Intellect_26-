// Email Service for sending Round 4 advantage codes
// This uses a simple API endpoint to send emails

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const EmailService = {
    /**
     * Send Round 4 advantage code to team email
     * @param {string} teamId - Team ID
     * @param {string} teamEmail - Team email address
     * @param {string} teamName - Team name
     * @returns {Promise<{success: boolean, code?: string, error?: string}>}
     */
    async sendAdvantageCode(teamId, teamEmail, teamName) {
        try {
            // Generate code
            const code = `INT26-R4-${Math.floor(1000 + Math.random() * 9000)}`;

            // For demo/testing: just log and return code
            console.log('📧 EMAIL SENT TO:', teamEmail);
            console.log('🔐 ADVANTAGE CODE:', code);
            console.log('👥 TEAM:', teamName, `(${teamId})`);

            // Store code in localStorage for validation
            localStorage.setItem(`ROUND4_CODE_${teamId}`, code);

            // In production, call backend API:
            /*
            const response = await fetch(`${API_URL}/api/send-advantage-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId,
                    teamEmail,
                    teamName,
                    code
                })
            });
            
            const data = await response.json();
            return data;
            */

            // For now, simulate success
            return {
                success: true,
                code: code,
                message: `Code sent to ${teamEmail}`
            };

        } catch (error) {
            console.error('Email send error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Validate Round 4 code
     * @param {string} teamId - Team ID
     * @param {string} inputCode - Code entered by team
     * @returns {boolean}
     */
    validateCode(teamId, inputCode) {
        const storedCode = localStorage.getItem(`ROUND4_CODE_${teamId}`);
        return storedCode && storedCode.toUpperCase() === inputCode.toUpperCase();
    },

    /**
     * Get code for testing (admin only)
     * @param {string} teamId - Team ID
     * @returns {string|null}
     */
    getCodeForTesting(teamId) {
        return localStorage.getItem(`ROUND4_CODE_${teamId}`);
    },

    /**
     * Send Round 3 Flash Code (Completion Trophy)
     */
    async sendFlashCode(teamId, teamEmail, teamName) {
        try {
            const code = `CRPT-COMPLETE-${Math.floor(1000 + Math.random() * 9000)}`;
            console.log('📧 [FLASH ROUND] EMAIL SENT TO:', teamEmail);
            console.log('🏆 COMPLETION CODE:', code);
            return { success: true, code: code };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }
};
