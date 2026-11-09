export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/api/, "");
  const target = "http://manaduitnya.runasp.net" + path + url.search;
  return fetch(new Request(target, context.request));
}