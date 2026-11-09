export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      const target =
        "http://manaduitnya.monsterasp.net" +
        url.pathname.replace(/^\/api/, "") +
        url.search;
      return fetch(new Request(target, request));
    }
    return env.ASSETS.fetch(request);
  },
};