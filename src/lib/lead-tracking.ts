/**
 * Tells Google Tag Manager that a visitor has become a lead. The owner asked for conversion
 * tracking on 2026-11-21, once the GA4 tag and the Meta pixel were live in the container
 * (docs/architecture.md, "Analytics: Google Tag Manager").
 *
 * The contact page has no thank-you page to watch for: the inquiry form confirms in its own card
 * (src/lib/inquiry-form.ts) and a booking stays inside Calendly's frame (src/lib/booking-embed.ts),
 * so the URL never changes when a lead happens. This push is the signal instead: one entry on
 * `dataLayer`, `{ event: 'generate_lead', lead_source }`, named after GA4's recommended event
 * (https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead).
 * The container listens for it with a Custom Event trigger and sends the GA4 event and Meta's
 * `Lead` event; which tags fire, and on which hostnames, is the container's configuration, not
 * this file's. Only the source travels: never the visitor's name, address, number, message, or
 * anything from the booking.
 *
 * `dataLayer` is created by the snippet in BaseLayout's head. When that script was blocked the
 * array is made here instead, and the push waits in it for nothing, harmlessly.
 */

/** Where the lead came from: the inquiry form, or a discovery call booked in Calendly. */
export type LeadSource = 'inquiry_form' | 'discovery_call';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function trackLead(source: LeadSource): void {
  (window.dataLayer ??= []).push({ event: 'generate_lead', lead_source: source });
}
