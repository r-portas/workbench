# TODO

> List of things to do

- [ ] Revisit moving `web/` into `apps/` (e.g. `apps/docs`) now that `apps/` exists
- [ ] Skip CI builds and Vercel deploys for packages that didn't change
  - Use a `changes` job with `dorny/paths-filter` (and a dynamic matrix for apps/templates) so
    `build-web` / `build-apps` / `build-templates` only run when their paths (or `bun.lock` / root
    `package.json`) change; keep root `fmt:check` always-on, and treat `content/**` as part of `web`
  - For Vercel (currently only `web`), set an Ignored Build Step that skips when the diff doesn't
    touch `web/**`, `content/**`, `bun.lock`, or root `package.json` — same idea per project if/when
    apps get their own Vercel projects
