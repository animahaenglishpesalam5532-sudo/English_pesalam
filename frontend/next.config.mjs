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
        // Encode spaces exactly once. Vercel's routing layer sends the
        // destination through verbatim, so double-encoding here would land in
        // the customer's chat box as literal "%20" text.
        destination: 'https://wa.me/919345639627?text=I%20want%20to%20buy%20Book%202',
        permanent: false,
      },
      {
        // Same idea for the online class enquiry button — different WhatsApp
        // number and a different prefilled message.
        source: '/online-class',
        destination:
          'https://wa.me/916380513228?text=I%20want%20to%20know%20more%20about%20online%20class',
        permanent: false,
      },
    ]
  },
}

export default nextConfig;
