// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================================
// HARASSMENT REPORT API CALLS
// ============================================================

async function submitHarassmentReport(reportData) {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit report');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error submitting report:', error);
    return { success: false, error: error.message };
  }
}

async function getReports() {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch reports');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { success: false, error: error.message };
  }
}

async function getReportById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch report');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching report:', error);
    return { success: false, error: error.message };
  }
}

async function updateReportStatus(id, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update report');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating report:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// CONTACT MESSAGE API CALLS
// ============================================================

async function submitContactMessage(messageData) {
  try {
    const response = await fetch(`${API_BASE_URL}/contact-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error submitting message:', error);
    return { success: false, error: error.message };
  }
}

async function getContactMessages() {
  try {
    const response = await fetch(`${API_BASE_URL}/contact-messages`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch messages');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, error: error.message };
  }
}

async function markMessageAsRead(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/contact-messages/${id}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update message');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating message:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// SUPPORT RESOURCES API CALLS
// ============================================================

async function getSupportResources() {
  try {
    const response = await fetch(`${API_BASE_URL}/support-resources`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch resources');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { success: false, error: error.message };
  }
}

async function getResourcesByCategory(category) {
  try {
    const response = await fetch(`${API_BASE_URL}/support-resources/category/${category}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch resources');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// STATISTICS API CALLS
// ============================================================

async function getStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch statistics');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// HEALTH CHECK
// ============================================================

async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Backend health check failed:', error);
    return { success: false, error: error.message };
  }
}
