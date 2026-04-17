/**
 * Utility to map backend technical error messages to frontend i18n keys
 */

export const mapBackendErrorToKey = (errorMsg: string): string | null => {
  if (!errorMsg) return null;

  // 1. Check for Duplicate Entry (SQL Constraint Errors)
  if (errorMsg.includes('Duplicate entry')) {
    // Specifically check for Email
    if (errorMsg.includes('email') || errorMsg.includes('UKq0uja26qgu1atulenwup9rxyr')) {
      return 'api.errors.duplicate_email';
    }
    // Specifically check for Phone (common pattern, even if key not known yet)
    if (errorMsg.toLowerCase().includes('phone')) {
      return 'api.errors.duplicate_phone';
    }
    
    return 'api.errors.duplicate_generic';
  }

  // 2. Check for other specific backend messages if needed
  // Example: if (errorMsg.includes('Bad credentials')) return 'api.errors.bad_credentials';

  return null;
};
