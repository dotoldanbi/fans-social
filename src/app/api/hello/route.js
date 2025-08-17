import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export const dynamic = "force-dynamic";

export async function GET() {
  inngest.send({
    name: "test/hello.world",
    data: {
      email: "aaa@on.net",
    },
  });
  return NextResponse.json({ message: "EVENT SENT!" });
}
