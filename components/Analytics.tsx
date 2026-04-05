'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// PostHog Analytics — free tier: 1M events/month
// Sign up at https://us.posthog.com and replace this key
const POSTHOG_KEY = ''; // TODO: Add your PostHog project API key

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    // Load PostHog
    const script = document.createElement('script');
    script.innerHTML = `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing reset isFeatureEnabled getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onFeatureFlags onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('${POSTHOG_KEY}',{api_host:'https://us.i.posthog.com',person_profiles:'anonymous'})`;
    document.head.appendChild(script);
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!POSTHOG_KEY || typeof window === 'undefined' || !(window as any).posthog) return;
    (window as any).posthog.capture('$pageview');
  }, [pathname]);

  return null;
}
