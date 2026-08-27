import Medusa from '@medusajs/js-sdk'
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || "https://happyhangs-backend.onrender.com";
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || "pk_f9ab30f558dac8d6afdd2503c258e085b1c30997a70c6b4e0eafb74e2adf4111";

export const medusaClient = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableKey: PUBLISHABLE_KEY,
  debug: import.meta.env.DEV,
})

/**
 * Custom fetch wrapper for Medusa Storefront API requests
 */
export async function medusaFetch({ endpoint, method = 'GET', body, headers = {} }) {
  const url = `${MEDUSA_BACKEND_URL}/store${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(PUBLISHABLE_KEY && { 'x-publishable-api-key': PUBLISHABLE_KEY }),
    ...headers,
  };

  const response = await fetch(url, {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Medusa API error: ${response.status}`);
  }

  return response.json();
}


