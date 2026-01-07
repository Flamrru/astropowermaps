"use client";

import Script from "next/script";

// Extend window type for Meta Pixel's fbq function
declare global {
  interface Window {
    fbq: (
      action: string,
      eventOrPixelId: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string }  // 4th arg for deduplication
    ) => void;
    _fbq: unknown;
  }
}

const PIXEL_ID = "848967188002206";

export default function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '848967188002206');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Track a Meta Pixel event from any component
 * @param eventName - Standard events: 'Lead', 'Purchase', 'CompleteRegistration', etc.
 * @param params - Optional event parameters (include eventID for deduplication with CAPI)
 */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  console.log(`[Meta Pixel] Attempting to track: ${eventName}`, params);

  if (typeof window !== "undefined" && window.fbq) {
    // Extract eventID if present (for deduplication with server-side CAPI)
    const { eventID, ...eventParams } = params || {};

    if (eventID) {
      // Use 4-argument form for deduplication with CAPI
      console.log(`[Meta Pixel] Firing ${eventName} with eventID: ${eventID}`);
      window.fbq("track", eventName, eventParams, { eventID: eventID as string });
    } else {
      console.log(`[Meta Pixel] Firing ${eventName} (no eventID)`);
      window.fbq("track", eventName, eventParams);
    }
    console.log(`[Meta Pixel] ✓ ${eventName} sent successfully`);
  } else {
    console.warn(`[Meta Pixel] ✗ fbq not available - event not tracked: ${eventName}`);
  }
}
