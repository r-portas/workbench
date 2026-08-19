import { createServerFn } from "@tanstack/react-start";

import { listTemplates } from "./templates.server";

export const listTemplatesFn = createServerFn().handler(async () => {
  return await listTemplates("../templates");
});
