/**
 * www.ghostaviator.com -> https://ghostaviator.com, permanently, path and query kept.
 *
 * On Vercel www redirected to the apex. On Cloudflare it was attached to the
 * main Worker, where Static Assets answered first, so www served a full second
 * copy of the site. This Worker owns www and does nothing else.
 */
const APEX = "ghostaviator.com";

export default {
  fetch(req: Request): Response {
    const url = new URL(req.url);
    url.protocol = "https:";
    url.host = APEX;
    return Response.redirect(url.toString(), 301);
  },
};
