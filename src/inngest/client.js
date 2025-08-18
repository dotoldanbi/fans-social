import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "fans-social",
  name: "fans-social",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
    openRouter: {
      apikey: process.env.OPEN_ROUTER_API_KEY,
    },
  },
});
