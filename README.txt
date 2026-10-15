IGUANA SURF QUIZ — MAILCHIMP + NETLIFY

1) In Mailchimp, locate your EXISTING Iguana Surf audience ID under Audience > Settings (names vary by interface).
2) Create a Mailchimp API key. Do not paste it into the HTML or share it in chat.
3) In Netlify, open the EXISTING site iguana-surf-quiz and set environment variables:
   MAILCHIMP_API_KEY = your private Mailchimp API key
   MAILCHIMP_AUDIENCE_ID = ID of your current Iguana Surf audience
   MAILCHIMP_DC = your Mailchimp data center, e.g. us21 (optional if key ends with -us21)
   Ensure variables are available to Functions.
4) IMPORTANT: deploy this as a SOURCE PROJECT with Netlify CLI or a Git repository.
   A manual drag-and-drop upload of HTML or this ZIP may NOT build/deploy Netlify Functions.
   Git route: create a repo containing index.html, netlify.toml, and netlify/functions/subscribe.js;
   link your existing Netlify site to the repo, deploy. No build command required; publish directory '.'
   CLI route: in this folder, run `netlify link` to the EXISTING site and `netlify deploy --prod`.
   Confirm Netlify recognizes the function in the site's Functions dashboard.
5) Test with a NEW email and optional marketing checkbox. Verify the lead appears in the EXISTING audience
   with tag 'Surf Town Quiz - October 2026'. Test an email without checkbox too.

CONSENT:
- New users who check marketing consent: status 'subscribed'.
- New users who do not check it: status 'transactional' (not subscribed to marketing).
- Existing contacts retain their prior subscription status (Mailchimp API status_if_new).
- Existing unsubscribed contacts are not resubscribed just by checking this checkbox.
- Depending on your audience's legal requirements, double opt-in or Mailchimp-hosted signup may be required
  for explicit marketing subscription. Review consent wording, privacy policy, and applicable laws before launch.
- This is an initial integration; no automatic welcome email or quiz-result tracking is configured.

SECURITY:
- The API key is stored only in Netlify environment variables and accessed server-side.
- Consider bot protection/rate limiting before promoting at scale.
