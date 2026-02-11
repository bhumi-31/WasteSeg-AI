const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://wasteseg-api.onrender.com';

/**
 * Analyze a waste image using the backend API
 * @param {string} base64Image - Base64 encoded image with data URI
 * @returns {Promise<Object>} Classification result
 */
export async function analyzeWaste(base64Image) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running.');
    }
    throw error;
  }
}

/**
 * Get all waste categories
 * @returns {Promise<Object>} Categories information
 */
export async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server.');
    }
    throw error;
  }
}

/**
 * Check if the backend server is healthy
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get or create a user ID (stored in localStorage)
 * The userId is critical for data persistence - it links to MongoDB data
 * @returns {string} User ID
 */
export function getUserId() {
  const USERID_KEY = 'wastewise-userId';
  let userId = localStorage.getItem(USERID_KEY);
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem(USERID_KEY, userId);
    console.log('[Auth] New user created:', userId);
  }
  return userId;
}

/**
 * Restore user data by setting a specific userId
 * Use this to restore data if the user knows their old userId
 * @param {string} userId - The userId to restore
 */
export function setUserId(userId) {
  if (userId && userId.startsWith('user_')) {
    localStorage.setItem('wastewise-userId', userId);
    // Clear local cache so fresh data is fetched
    localStorage.removeItem('wasteseg-history');
    localStorage.removeItem('wasteseg-stats');
    localStorage.removeItem('wasteseg-badges');
    console.log('[Auth] User restored:', userId);
    return true;
  }
  return false;
}

/**
 * Save a scan result to the database
 * @param {Object} scanData - Scan data to save
 * @returns {Promise<Object>} Saved scan with updated stats
 */
export async function saveScanToDb(scanData) {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/api/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...scanData })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save scan');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving scan to DB:', error);
    throw error;
  }
}

/**
 * Fetch scan history from the database
 * @param {number} limit - Max number of scans to fetch
 * @returns {Promise<Array>} Array of scans
 */
export async function fetchScanHistory(limit = 50) {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/api/scans/${userId}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }
    
    const data = await response.json();
    return data.scans || [];
  } catch (error) {
    console.error('Error fetching history from DB:', error);
    return [];
  }
}

/**
 * Fetch user stats from the database
 * @returns {Promise<Object>} User stats
 */
export async function fetchStats() {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/api/stats/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats from DB:', error);
    return null;
  }
}

/**
 * Delete a scan from the database
 * @param {string} scanId - ID of the scan to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteScanFromDb(scanId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scans/${scanId}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting scan:', error);
    return false;
  }
}

/**
 * Fetch leaderboard data
 * @param {number} limit - Max number of users to fetch
 * @returns {Promise<Array>} Array of leaderboard entries
 */
export async function fetchLeaderboard(limit = 20) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    
    const data = await response.json();
    return data.leaderboard || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Fetch user's rank on leaderboard
 * @returns {Promise<Object>} User's rank info
 */
export async function fetchUserRank() {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/rank/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch rank');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return { rank: null, totalUsers: 0 };
  }
}

/**
 * Fetch daily challenges with user progress
 * @returns {Promise<Array>} Array of challenges with progress
 */
export async function fetchChallenges() {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/api/challenges/progress/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch challenges');
    }
    
    const data = await response.json();
    return data.challenges || [];
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }
}

/**
 * Update challenge progress after a scan
 * @param {string} category - Category of the scanned item
 * @returns {Promise<Object>} Updated challenge progress
 */
export async function updateChallengeProgress(category) {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/api/challenges/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, category })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update challenge progress');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return { challenges: [], newlyCompleted: [] };
  }
}

/**
 * Claim reward for a completed challenge
 * @param {string} challengeId - ID of the challenge
 * @returns {Promise<Object>} Claim result with points awarded
 */
export async function claimChallengeReward(challengeId) {
  try {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/api/challenges/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, challengeId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to claim reward');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error claiming reward:', error);
    throw error;
  }
}
