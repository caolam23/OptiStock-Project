import axiosClient from './axiosClient';

const tenantApi = {
  /**
   * Create a new tenant with onboarding data (industry templates, locations, member invitations)
   */
  onboardTenant: (payload) => {
    // Đã xóa /api ở đầu
    return axiosClient.post('/v1/onboarding/tenant', payload);
  },

  /**
   * Get available industries for onboarding
   */
  getIndustries: () => {
    // Đã xóa /api ở đầu
    return axiosClient.get('/v1/onboarding/industries');
  },

  /**
   * Get industry template by code
   */
  getIndustryTemplate: (industryCode) => {
    // Đã xóa /api ở đầu
    return axiosClient.get(`/v1/onboarding/industries/${industryCode}/template`);
  },

  /**
   * Validate tenant name availability
   */
  validateTenantName: (tenantName) => {
    // Đã xóa /api ở đầu
    return axiosClient.post('/v1/onboarding/validate-tenant-name', { tenantName });
  },

  /**
   * Resend invitation email to a member
   */
  resendInvitation: (invitationId) => {
    // Đã xóa /api ở đầu
    return axiosClient.post(`/v1/onboarding/invitations/${invitationId}/resend`);
  },

  /**
   * Get onboarding status for a tenant
   */
  getOnboardingStatus: (tenantCode) => {
    // Đã xóa /api ở đầu
    return axiosClient.get(`/v1/onboarding/tenants/${tenantCode}/status`);
  }
};

export default tenantApi;