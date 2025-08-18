import { connect } from "@/lib/mongodb/mongoose";
import HomePageContent from "@/lib/models/homePageContent.model";

export const POST = async (req) => {
  try {
    await connect();
    const res = await HomePageContent.findOne({
      updatedBy: "inngest",
    });
    console.log(res.title);
    return new Response(JSON.stringify(res), { status: 200 });
  } catch (error) {
    return new Response("Fetch Error", { status: 400 });
  }
};
