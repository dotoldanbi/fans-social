import Post from "@/lib/models/post.model";
import { connect } from "@/lib/mongodb/mongoose";
import { currentUser } from "@clerk/nextjs/server";
export const PUT = async (req) => {
  try {
    const user = await currentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }
    await connect();
    const data = await req.json();

    const post = await Post.findByIdAndDelete(data.postId);
    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error) {
    console.log("Error updating post:", error);
    return new Response("Error updating post", { status: 500 });
  }
};
