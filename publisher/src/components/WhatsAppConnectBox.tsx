"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { connectWhatsAppBusinessApp } from "@/app/inbox/actions";
import { isFacebookOrigin, parseSignupEvent, type SignupEvent } from "@/lib/domain/whatsappSignup";

// Meta's Embedded Signup on the WhatsApp Business app route ("coexistence"): the number keeps working on the phone
// and its chats also reach the Inbox. Meta's script is loaded only when an owner opens this box.
// If Meta changes how the route is chosen, this is the one place to update (publisher/SETUP.md step 10).
const SIGNUP_EXTRAS = { setup: {}, featureType: "whatsapp_business_app_onboarding", sessionInfoVersion: "3" };
const SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";

interface FbLoginResponse { authResponse?: { code?: string } | null }
interface FbSdk {
  init: (o: { appId: string; autoLogAppEvents: boolean; xfbml: boolean; version: string }) => void;
  login: (cb: (r: FbLoginResponse) => void, o: object) => void;
}
declare global { interface Window { FB?: FbSdk; fbAsyncInit?: () => void } }

function loadSdk(appId: string, version: string): Promise<FbSdk> {
  if (window.FB) return Promise.resolve(window.FB);
  return new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB!.init({ appId, autoLogAppEvents: true, xfbml: false, version });
      resolve(window.FB!);
    };
    const s = document.createElement("script");
    s.src = SDK_SRC;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.onerror = () => reject(new Error("sdk"));
    document.body.appendChild(s);
  });
}

const HISTORY_NOTE = {
  requested: "Old chats (up to about 6 months) will appear over the next few minutes.",
  already: "Old chats were already requested earlier.",
  failed: "Meta didn't send the old chats, but new messages will arrive.",
} as const;

export function WhatsAppConnectBox({ appId, configId, version }: { appId: string; configId: string; version: string }) {
  const router = useRouter();
  const [sdk, setSdk] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const session = useRef<SignupEvent | null>(null);
  const ready = !!appId && !!configId;

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!isFacebookOrigin(e.origin)) return;
      const ev = parseSignupEvent(e.data);
      if (!ev) return;
      session.current = ev;
      if (ev.kind === "cancel") setMsg({ ok: false, text: `Not connected. ${ev.message}` });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const open = () => {
    if (!ready || sdk !== "idle") return;
    setSdk("loading");
    loadSdk(appId, version).then(() => setSdk("ready"), () => setSdk("failed"));
  };

  // Meta's window posts which account it connected just before handing over the code; wait for it briefly
  // (the code itself lives only 30 seconds).
  const finish = async (code: string) => {
    for (let i = 0; i < 15 && !session.current; i++) await new Promise((r) => setTimeout(r, 100));
    const ev = session.current;
    if (ev?.kind === "wrong_route") {
      setMsg({ ok: false, text: "Not connected: that route would move the number off the phone app. Start again and choose your existing WhatsApp Business app." });
      return;
    }
    start(async () => {
      const r = await connectWhatsAppBusinessApp({
        code, wabaId: ev?.kind === "finish" ? ev.wabaId : null, phoneNumberId: ev?.kind === "finish" ? ev.phoneNumberId : null,
      });
      setMsg(r.ok ? { ok: true, text: `Connected: WhatsApp ${r.data.number}. ${HISTORY_NOTE[r.data.history]}` } : { ok: false, text: r.error.message });
      if (r.ok) router.refresh();
    });
  };

  const connect = () => {
    setMsg(null);
    session.current = null;
    // Called straight from the click so the browser allows Meta's pop-up. The SDK refuses an async callback.
    window.FB?.login((res) => {
      const code = res?.authResponse?.code;
      if (code) void finish(code);
      else if (session.current?.kind !== "cancel") setMsg({ ok: false, text: "Not connected: the window was closed before the end." });
    }, { config_id: configId, response_type: "code", override_default_response_type: true, extras: SIGNUP_EXTRAS });
  };

  return (
    <details className="card mt-6 text-sm" onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) open(); }}>
      <summary className="cursor-pointer select-none rounded-xl px-4 py-3 font-medium hover:text-fg">Connect a WhatsApp Business app number</summary>
      <div className="space-y-3 border-t border-line p-4">
        <p className="text-muted">
          For a number that runs on the WhatsApp Business app on a phone. It keeps working there; its chats also come here,
          including what you send from the phone. Keep the phone nearby: Meta shows a QR code to scan in the app.
        </p>
        <p className="text-muted">
          On the phone afterwards: broadcast lists become read-only, disappearing and view-once messages are switched off,
          and WhatsApp on Windows is unlinked. Open the app at least every 14 days or the connection stops.
        </p>
        {!ready ? (
          <p className="text-muted">Not set up yet: META_WA_SIGNUP_CONFIG_ID is missing on the server (publisher/SETUP.md step 10).</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary" onClick={connect} disabled={sdk !== "ready" || pending}>
              {pending ? "Connecting…" : sdk === "loading" ? "Loading Meta…" : "Connect with Meta"}
            </button>
            {sdk === "failed" && <span role="alert" className="text-danger">Couldn&apos;t load Meta&apos;s sign-in. Check the connection and reload.</span>}
          </div>
        )}
        {msg && <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "text-accent" : "text-danger"}>{msg.text}</p>}
      </div>
    </details>
  );
}
