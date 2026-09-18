/**
 * @file googleAuth.js
 * Google Identity Services (GIS) Client Integration for HealthGuard AI
 */

let isScriptLoading = false;
let scriptLoadPromise = null;

function loadGoogleGsiScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window unavailable'));
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google);

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    // Check if script element already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google SDK.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve(window.google);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services SDK. Please check your network connection.'));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Triggers the Google OAuth popup account selector.
 */
export async function triggerGoogleSignIn({ clientId, onSuccess, onError }) {
  const effectiveClientId =
    clientId ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '159291729588-m8kj341c0i9bk3oqikl3vf6b1lam1llf.apps.googleusercontent.com';

  if (!effectiveClientId) {
    onError?.('Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID in your .env file.');
    return;
  }

  try {
    await loadGoogleGsiScript();

    if (!window.google?.accounts?.oauth2) {
      throw new Error('Google OAuth2 SDK could not be initialized.');
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: effectiveClientId,
      scope: 'email profile openid',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          onError?.(tokenResponse.error_description || tokenResponse.error || 'Google authentication was cancelled.');
          return;
        }

        if (!tokenResponse.access_token) {
          onError?.('No access token returned from Google.');
          return;
        }

        try {
          // Fetch user profile info from Google API
          const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch Google profile: ${response.statusText}`);
          }

          const userInfo = await response.json();
          if (!userInfo.email) {
            throw new Error('Google did not provide a valid email address.');
          }

          onSuccess?.({
            token: tokenResponse.access_token,
            email: userInfo.email,
            name: userInfo.name || userInfo.email.split('@')[0],
            picture: userInfo.picture,
            google_id: userInfo.sub,
          });
        } catch (fetchErr) {
          console.error('[GoogleAuth] Error retrieving profile:', fetchErr);
          onError?.(fetchErr.message || 'Failed to retrieve Google profile data.');
        }
      },
      error_callback: (nonOAuthError) => {
        console.warn('[GoogleAuth] Non-OAuth error:', nonOAuthError);
        onError?.(nonOAuthError?.message || 'Google Sign-In popup was closed or encountered an error.');
      },
    });

    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err) {
    console.error('[GoogleAuth] Error:', err);
    onError?.(err.message || 'Could not initiate Google authentication.');
  }
}
