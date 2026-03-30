import { useEffect, useRef, useCallback } from "react";

const SITE_KEY = import.meta.env.VITE_CAPTCHA_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
const PROVIDER = import.meta.env.VITE_CAPTCHA_PROVIDER || "turnstile"; // "recaptcha" | "turnstile"

let scriptLoaded = false;

function loadScript() {
  if (scriptLoaded || !SITE_KEY) return;
  scriptLoaded = true;

  const script = document.createElement("script");
  if (PROVIDER === "turnstile") {
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
  } else {
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
  }
  document.head.appendChild(script);
}

export default function Captcha({ onToken }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  const handleToken = useCallback(
    (token) => {
      onToken(token || "");
    },
    [onToken],
  );

  useEffect(() => {
    if (!SITE_KEY) return;
    loadScript();

    const interval = setInterval(() => {
      if (PROVIDER === "turnstile" && window.turnstile && containerRef.current && widgetIdRef.current === null) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: handleToken,
          "expired-callback": () => handleToken(""),
        });
        clearInterval(interval);
      } else if (PROVIDER === "recaptcha" && window.grecaptcha?.render && containerRef.current && widgetIdRef.current === null) {
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: handleToken,
          "expired-callback": () => handleToken(""),
        });
        clearInterval(interval);
      }
    }, 200);

    return () => {
      clearInterval(interval);
      if (PROVIDER === "turnstile" && window.turnstile && widgetIdRef.current !== null) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
      widgetIdRef.current = null;
    };
  }, [handleToken]);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} className="my-3" />;
}

export { SITE_KEY as CAPTCHA_ENABLED };
