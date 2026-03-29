import { toast } from 'sonner';

/**
 * Global notification helper using sonner toast
 */

export const showSuccess = (message, description = '') => {
  toast.success(message);
  if (description) console.log(description);
};

export const showError = (message, description = '') => {
  toast.error(message);
  if (description) console.error(description);
};

export const showWarning = (message, description = '') => {
  toast.warning(message);
  if (description) console.warn(description);
};

export const showInfo = (message, description = '') => {
  toast.info(message);
  if (description) console.info(description);
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  let errorMessage = defaultMessage;

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (status === 401) {
      errorMessage = 'Session expired. Please login again.';
    } else if (status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      errorMessage = 'Resource not found.';
    } else if (status === 409) {
      errorMessage = data?.detail || 'Conflict: Resource already exists or is in use.';
    } else if (status === 422) {
      errorMessage = 'Invalid data provided.';
    } else if (status === 429) {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else {
      errorMessage = data?.detail || data?.message || error.message || defaultMessage;
    }
  } else if (error.request) {
    // Request made but no response
    errorMessage = 'Network error. Please check your connection.';
  } else {
    // Error in request setup
    errorMessage = error.message || defaultMessage;
  }

  console.error('API Error:', error);
  showError('Error', errorMessage);
  return errorMessage;
};
