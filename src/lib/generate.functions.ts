import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callGateway } from "./generate.server";

const schema = z.object({
  system: z.string().min(1).max(8000),
  user: z.string().min(1).max(8000),
});

export const generateContent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => ({ text: await callGateway(data.system, data.user) }));
