import { match, P } from "ts-pattern";

const ROOM_FILE_PREFIX = "chat__room__";

export function server(port: number) {
  return Deno.serve({ port }, (req) => {
    const request = req as Request & { uri: URL };
    request.uri = new URL(req.url);
    return match(request)
      .with({ method: "POST", uri: { pathname: "/api/rooms" } }, createRoom)
      .with({
        method: "POST",
        uri: {
          pathname: P.when((p) =>
            p.match(/^\/api\/rooms\/\w+\/messages/) != null
          ),
        },
      }, publishMessage)
      .otherwise(() => res("", { status: 404 }));
  });
}

async function createRoom(req: Request): Promise<Response> {
  let label: string;
  try {
    const body = await req.json();
    if (body?.label == undefined || !body.label.match(/^[a-zA-Z0-9 ]+$/)) {
      throw new Error("Invalid label");
    }
    label = body.label;
  } catch (err) {
    console.error(err);
    return res("Invalid payload", { status: 400 });
  }
  const roomFile = await Deno.makeTempFile({ prefix: ROOM_FILE_PREFIX });
  const [, roomId] = roomFile.split(ROOM_FILE_PREFIX);
  Deno.writeTextFile(roomFile, JSON.stringify({ label, messages: [] }));
  return res(JSON.stringify({ id: roomId, label }), { status: 201 });
}

async function publishMessage(req: Request): Promise<Response> {
  const message = await req.json();
  const [roomId] = req.url.match(/\/api\/rooms\/(\w+)\/messages/)!;
  const roomFile = Deno.read;
  Deno.writeTextFile(roomFile, JSON.stringify({ label, messages: [] }));
  Deno.writeTextFile(roomFile, JSON.stringify({ label, messages: [] }));
  return res(JSON.stringify({ id: roomId, label }), { status: 201 });
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
