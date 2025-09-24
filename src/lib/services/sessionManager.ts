import { authService } from '../api/services/auth';
import type { User } from '../api/services/auth';

export interface SessionData {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  deviceId: string;
  deviceName: string;
  isRememberMe: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface SessionConfig {
  autoRefresh: boolean;
  refreshThreshold: number; // seconds before expiry to refresh
  maxRetries: number;
  retryDelay: number; // milliseconds
  sessionTimeout: number; // minutes of inactivity
  rememberMeDuration: number; // days
}

class SessionManager {
  private sessionData: SessionData | null = null;
  private refreshPromise: Promise<TokenPair> | null = null;
  private refreshTimer: number | null = null;
  private sessionTimer: number | null = null;
  private lastActivity: number = Date.now();
  private isRefreshing: boolean = false;
  private retryCount: number = 0;

  private config: SessionConfig = {
    autoRefresh: false, // Disabled - tokens refresh only on-demand via axios interceptor
    refreshThreshold: 300, // 5 minutes before expiry
    maxRetries: 3,
    retryDelay: 1000,
    sessionTimeout: 0, // Disabled - using automatic token refresh instead of activity timeout
    rememberMeDuration: 30, // 30 days
  };

  private listeners: Array<(session: SessionData | null) => void> = [];

  constructor() {
    this.initializeFromStorage();
    this.setupActivityTracking();
    this.setupVisibilityChangeHandler();
  }

  /**
   * Initialize session from localStorage
   */
  private initializeFromStorage(): void {
    try {
      const stored = localStorage.getItem('session_data');
      if (stored) {
        const sessionData = JSON.parse(stored);
        
        // Check if session is still valid
        if (sessionData.expiresAt > Date.now()) {
          this.sessionData = sessionData;
          this.notifyListeners();
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Failed to initialize session from storage:', error);
      this.clearSession();
    }
  }

  /**
   * Set up activity tracking for session timeout
   */
  private setupActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
      this.resetSessionTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
  }

  /**
   * Set up visibility change handler
   */
  private setupVisibilityChangeHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.sessionData) {
        // Check if session is still valid when tab becomes visible
        this.validateSession();
      }
    });
  }

  /**
   * Validate current session
   */
  private async validateSession(): Promise<boolean> {
    if (!this.sessionData) return false;

    try {
      // Check if access token is still valid
      if (this.sessionData.expiresAt > Date.now()) {
        return true;
      }

      // Try to refresh the token
      await this.refreshAccessToken();
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Create a new session
   */
  async createSession(
    user: User,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    deviceInfo?: { deviceId: string; deviceName: string; isRememberMe?: boolean }
  ): Promise<void> {
    const now = Date.now();
    const expiresAt = now + (expiresIn * 1000);

    this.sessionData = {
      user,
      accessToken,
      refreshToken,
      expiresAt,
      deviceId: deviceInfo?.deviceId || this.generateDeviceId(),
      deviceName: deviceInfo?.deviceName || this.getDeviceName(),
      isRememberMe: deviceInfo?.isRememberMe || false,
    };

    this.saveToStorage();
    this.resetSessionTimer();
    this.notifyListeners();
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<TokenPair> {
    if (!this.sessionData) {
      throw new Error('No active session');
    }

    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      this.retryCount = 0;
      return result;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      throw error;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<TokenPair> {
    if (!this.sessionData) {
      throw new Error('No active session');
    }

    try {
      const response = await authService.refreshToken(this.sessionData.refreshToken);
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, expiresIn = 900, tokenType = 'Bearer' } = response.data;
        
        // Update session data with both new tokens
        this.sessionData.accessToken = accessToken;
        this.sessionData.refreshToken = refreshToken;
        this.sessionData.expiresAt = Date.now() + (expiresIn * 1000);
        
        this.saveToStorage();
        this.notifyListeners();
        
        return {
          accessToken,
          refreshToken,
          expiresIn,
          tokenType
        };
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Retry logic
      if (this.retryCount < this.config.maxRetries) {
        this.retryCount++;
        await this.delay(this.config.retryDelay * this.retryCount);
        return this.performTokenRefresh();
      }
      
      // Max retries reached, clear session
      this.clearSession();
      throw error;
    }
  }

  // scheduleRefresh method removed - auto-refresh is now handled by axios interceptor

  /**
   * Reset session timeout timer (disabled when sessionTimeout is 0)
   */
  private resetSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    // Skip setting timer if sessionTimeout is disabled (0) or no session data
    if (!this.sessionData || this.config.sessionTimeout === 0) return;

    this.sessionTimer = window.setTimeout(() => {
      console.log('Session timeout due to inactivity');
      this.clearSession();
    }, this.config.sessionTimeout * 60 * 1000);
  }

  /**
   * Get current session data
   */
  getSession(): SessionData | null {
    return this.sessionData;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.sessionData?.accessToken || null;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.sessionData?.refreshToken || null;
  }

  /**
   * Check if session is active
   */
  isSessionActive(): boolean {
    return this.sessionData !== null && this.sessionData.expiresAt > Date.now();
  }

  /**
   * Check if refresh token is available and potentially valid
   */
  hasValidRefreshToken(): boolean {
    return this.sessionData !== null && !!this.sessionData.refreshToken;
  }

  /**
   * Check if session is about to expire
   */
  isSessionExpiringSoon(): boolean {
    if (!this.sessionData) return false;
    const timeUntilExpiry = this.sessionData.expiresAt - Date.now();
    return timeUntilExpiry <= (this.config.refreshThreshold * 1000);
  }

  /**
   * Clear current session
   */
  async clearSession(): Promise<void> {
    if (this.sessionData?.refreshToken) {
      try {
        await authService.revokeToken(this.sessionData.refreshToken);
      } catch (error) {
        console.warn('Failed to revoke refresh token:', error);
      }
    }

    this.sessionData = null;
    this.clearTimers();
    this.clearStorage();
    this.notifyListeners();
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(): Promise<void> {
    try {
      await authService.revokeAllTokens();
    } catch (error) {
      console.warn('Failed to revoke all tokens:', error);
    }

    this.sessionData = null;
    this.clearTimers();
    this.clearStorage();
    this.notifyListeners();
  }

  /**
   * Update session configuration
   */
  updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.sessionData) {
      this.resetSessionTimer();
    }
  }

  /**
   * Add session change listener
   */
  addListener(listener: (session: SessionData | null) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of session changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.sessionData);
      } catch (error) {
        console.error('Session listener error:', error);
      }
    });
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.sessionTimer) {
      window.clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Save session to localStorage
   */
  private saveToStorage(): void {
    if (this.sessionData) {
      try {
        localStorage.setItem('session_data', JSON.stringify(this.sessionData));
      } catch (error) {
        console.error('Failed to save session to storage:', error);
      }
    }
  }

  /**
   * Clear session from localStorage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem('session_data');
      localStorage.removeItem('auth_token'); // Legacy token
    } catch (error) {
      console.error('Failed to clear session from storage:', error);
    }
  }

  /**
   * Generate device ID
   */
  private generateDeviceId(): string {
    const stored = localStorage.getItem('device_id');
    if (stored) return stored;

    const deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('device_id', deviceId);
    return deviceId;
  }

  /**
   * Get device name
   */
  private getDeviceName(): string {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    if (userAgent.includes('Mobile')) {
      return 'Mobile Device';
    } else if (userAgent.includes('Tablet')) {
      return 'Tablet';
    } else if (platform.includes('Mac')) {
      return 'Mac Computer';
    } else if (platform.includes('Win')) {
      return 'Windows Computer';
    } else if (platform.includes('Linux')) {
      return 'Linux Computer';
    } else {
      return 'Unknown Device';
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    if (!this.sessionData) {
      return {
        isActive: false,
        timeUntilExpiry: 0,
        timeSinceLastActivity: 0,
        deviceInfo: null,
      };
    }

    const now = Date.now();
    return {
      isActive: this.isSessionActive(),
      timeUntilExpiry: Math.max(0, this.sessionData.expiresAt - now),
      timeSinceLastActivity: now - this.lastActivity,
      deviceInfo: {
        deviceId: this.sessionData.deviceId,
        deviceName: this.sessionData.deviceName,
        isRememberMe: this.sessionData.isRememberMe,
      },
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
export default sessionManager;
