/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        // Used as the "Buy Now" URL button in WhatsApp message templates.
        // Meta rejects wa.me links in template buttons, so we point the button
        // at our own domain and bounce the customer to WhatsApp from here.
        // Handled by Vercel's edge routing layer — no serverless invocation.
        source: '/buy',
        destination: 'https://wa.me/919345639627',
        permanent: false,
      },
    ]
  },
}

export default nextConfig;
