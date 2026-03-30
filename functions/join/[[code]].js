export async function onRequest(context) {
  // Fetch the static join page
  const url = new URL(context.request.url);
  url.pathname = '/join/';
  
  // Get the static HTML
  const response = await context.env.ASSETS.fetch(url);
  
  // Return it with the original URL (so JS can extract the code)
  return new Response(response.body, {
    headers: response.headers,
    status: 200
  });
}
