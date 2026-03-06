const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ==================== Auth Helpers ====================

/**
 * Get the stored auth token
 */
function getToken() {
  return localStorage.getItem('wasteseg-token');
}

/**
 * Get auth headers for API requests
 */
function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Register a new user
 */
export async function registerUser(name, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details?.[0]?.message || data.message || data.error || 'Registration failed');
    }
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please check your connection or make sure the backend is running.');
    }
    throw error;
  }
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details?.[0]?.message || data.message || data.error || 'Login failed');
    }
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please check your connection or make sure the backend is running.');
    }
    throw error;
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.user;
}

// ==================== Core API Functions ====================

/**
 * Analyze a waste image using the backend API
 * Now sends as FormData with file upload
 * @param {string} base64Image - Base64 encoded image with data URI
 * @returns {Promise<Object>} Classification result
 */
export async function analyzeWaste(base64Image) {
  try {
    // Convert Base64 to Blob for FormData upload
    const formData = new FormData();

    if (base64Image.startsWith('data:')) {
      const response = await fetch(base64Image);
      const blob = await response.blob();
      formData.append('image', blob, 'scan.jpg');
    } else {
      // If it's already a file/blob
      formData.append('image', base64Image);
    }

    const apiResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(), // no Content-Type — browser sets multipart boundary
      body: formData,
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Server error: ${apiResponse.status}`);
    }

    return await apiResponse.json();
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please make sure the backend is running.');
    }
    throw error;
  }
}

/**
 * Get all waste categories
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
 * Get the user ID from the stored auth user
 * Falls back to legacy localStorage ID for backward compatibility
 */
export function getUserId() {
  // Try to get from auth user first
  try {
    const savedUser = localStorage.getItem('wasteseg-user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user._id || user.id;
    }
  } catch { }

  // Fallback to legacy userId
  const USERID_KEY = 'wastewise-userId';
  let userId = localStorage.getItem(USERID_KEY);
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem(USERID_KEY, userId);
  }
  return userId;
}

// ==================== Scan API Functions ====================

/**
 * Save a scan result to the database
 */
export async function saveScanToDb(scanData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(scanData)
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
 */
export async function fetchScanHistory(limit = 50) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scans?limit=${limit}`, {
      headers: getAuthHeaders()
    });

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
 */
export async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`, {
      headers: getAuthHeaders()
    });

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
 */
export async function deleteScanFromDb(scanId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scans/${scanId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting scan:', error);
    return false;
  }
}

// ==================== Leaderboard API Functions ====================

/**
 * Fetch leaderboard data
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
 */
export async function fetchUserRank() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/rank`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rank');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return { rank: null, totalUsers: 0 };
  }
}

// ==================== Challenges API Functions ====================

/**
 * Fetch daily challenges with user progress
 */
export async function fetchChallenges() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/challenges/progress`, {
      headers: getAuthHeaders()
    });

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
 */
export async function updateChallengeProgress(category) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/challenges/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ category })
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
 */
export async function claimChallengeReward(challengeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/challenges/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ challengeId })
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
