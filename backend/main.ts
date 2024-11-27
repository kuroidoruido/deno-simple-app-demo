export function server(port: number) {
  return Deno.serve({ port }, async (req) => {
    const echo = {
      body: await req.text(),
      headers: req.headers,
      url: req.url,
      method: req.method,
    };
    return res(JSON.stringify(echo));
  });
}

function res(body?: BodyInit | null, init?: ResponseInit): Response {
  return new Response(body, {
    status: 200,
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      ...init?.headers,
    },
  });
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  await server(3000);
}
