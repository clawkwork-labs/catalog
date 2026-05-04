# Canary
Post-deploy monitoring loop: hit the prod URLs, watch console errors, response codes, Core Web Vitals, and key user paths for a fixed window after a release. Catch regressions while the deploy is still rollback-able.
Use immediately after a deploy lands. Mode: anxious release engineer.

<!-- Adapted from gstack (https://github.com/garrytan/gstack), MIT-licensed. -->

A deploy is not "done" when CI passes; it's done when prod is healthy under real traffic. Watch the bird in the coal mine for a fixed window before you walk away.

Protocol:

1. **Define the window up front** — A canary window has a clock. Default 10 minutes for low-risk changes; 30+ minutes for auth, payments, migrations, anything with a wide blast radius. Write the end time down ("canary window: 10:42 → 10:52") so you don't drift away early.

2. **Pick the watchlist BEFORE the deploy** — Otherwise you'll only check the things that happen to be working:
   - **URLs** — landing page, signed-in dashboard, the path the new feature actually lives on, one critical legacy path you might have broken.
   - **Console errors / unhandled rejections** — open `browser`, navigate, watch the dev console. Zero is the bar; one new error is a signal, not noise.
   - **Response codes** — sample a handful of API endpoints. 5xx rate should be flat or lower than the pre-deploy baseline.
   - **Core Web Vitals** — LCP, INP, CLS on the affected pages. Use Chrome DevTools or the project's RUM if it exists.
   - **A key business event** — a sign-up, a checkout, a message send — at least one round-trip end-to-end as a logged-in user.

3. **Loop the window** — Every 60–120s during the window: refresh the watchlist, take a screenshot if anything looks off. Don't spam-poll; you're watching for trends, not making the system load itself up.

4. **Define rollback triggers explicitly** — Before the window starts, write what would make you roll back:
   - "Any new uncaught console error on the dashboard"
   - "5xx rate >2× baseline for >2 minutes"
   - "LCP regression >500ms on the landing page"

   This is to keep you from negotiating with yourself in the moment ("eh, that error is probably fine"). If a trigger fires, roll back; investigate after the bleed stops.

5. **Capture findings** — Save observations to `/canary/<release-tag-or-feature-slug>.md` even if the run is clean. Include: the window, the watchlist, observations at each tick, the verdict (clean / regression-rolled-back / regression-fixed-forward). A boring canary log is still a useful canary log.

6. **Hand off if your window ends but a slow burn remains** — If you see something subtle (gradual memory creep, slow latency drift), don't declare victory just because the timer expired. Either extend the window or hand off to the next on-call with a written note pointing at the metric to watch.

The point of a canary is not to *prevent* regressions — that's QA's job. It's to *catch them in the rollback window* so a recovery is cheap. Prioritize speed-of-detection over thoroughness; a regression caught at minute 4 is worth ten regressions caught the next morning.
