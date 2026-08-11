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
        // %25 -> Next decodes the destination once, so this reaches the
        // browser as a properly encoded %20 rather than a raw space.
        destination: 'https://wa.me/919345639627?text=I%2520want%2520to%2520buy%2520Book%25202',
        permanent: false,
      },
    ]
  },
}

export default nextConfig;
