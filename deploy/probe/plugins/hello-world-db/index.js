import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

export default definePluginEntry({
  id: "hello-world-db",
  name: "Hello World DB Probe",
  description: "Verifies OpenClaw plugin SDK custom tool registration.",
  register(api) {
    api.logger?.info?.("[hello-world-db] registering ping tool");
    api.registerTool({
      name: "ping",
      label: "Ping",
      description: "Returns pong plus the arguments it received. Used to verify the plugin runtime.",
      parameters: {
        type: "object",
        properties: {
          note: { type: "string", description: "Optional note to echo back." },
          actingUserId: { type: "string", description: "Optional user id to echo back (attribution probe)." }
        },
        required: []
      },
      async execute(id, params) {
        const rest = [];
        for (let i = 2; i < arguments.length; i++) rest.push(typeof arguments[i]);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  ok: true,
                  pong: true,
                  toolCallId: id,
                  receivedParams: params ?? null,
                  executeArity: arguments.length,
                  extraArgTypes: rest,
                  pid: process.pid
                },
                null,
                2
              )
            }
          ]
        };
      }
    });
  }
});
