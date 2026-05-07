// refervo.com/get
//
// Smart download link. Detects User-Agent and redirects to the appropriate
// app store. This is the canonical "download the app" URL — every CTA on the
// site, every share landing, every email points here. The underlying store
// URLs can change without touching templates.
//
//   iOS    → App Store (id6759116716)
//   Android → Google Play (com.refervo.app)
//   Desktop → App Store (Apple ecosystem skews higher revenue per user; we
//             can A/B this later or render a chooser page if it matters)
//
// Query strings on the inbound /get?... URL are dropped on redirect — the
// stores don't accept them and they'd just confuse attribution. If we ever
// want UTM-style attribution, wire it through link_opens before the redirect.

const APP_STORE_URL    = 'https://apps.apple.com/app/id6759116716';
const PLAY_STORE_URL   = 'https://play.google.com/store/apps/details?id=com.refervo.app';

export async function onRequest(context) {
  const { request } = context;
  const ua = request.headers.get('user-agent') || '';

  // Order matters — iPad reports as Mac on iPadOS 13+ if user has "Request
  // Desktop Site" on, but the default UA still contains 'iPad'. Check Apple
  // mobile patterns first.
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  let target;
  if (isAndroid) {
    target = PLAY_STORE_URL;
  } else if (isIos) {
    target = APP_STORE_URL;
  } else {
    // Desktop / unknown → default to App Store. ReferVo's iOS install base
    // is the larger of the two today; this is the safer default if the UA
    // is genuinely ambiguous.
    target = APP_STORE_URL;
  }

  return Response.redirect(target, 302);
}
