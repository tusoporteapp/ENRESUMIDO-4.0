export async function onRequest(context) {
  return new Response(JSON.stringify({ hello: "world", time: Date.now() }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
