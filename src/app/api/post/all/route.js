import Post from "@/lib/models/post.model";
import { connect } from "@/lib/mongodb/mongoose";

export const POST = async (req) => {
  await connect();

  const posts = await Post.find({}).sort({ createdAt: -1 });
  return new Response(JSON.stringify(posts), { status: 200 });
};
