import Post from "@/lib/models/post.model";
import { connect } from "@/lib/mongodb/mongoose";
import { currentUser } from "@clerk/nextjs/server";
export const PUT = async (req) => {
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await connect();
    const data = await req.json();

    // 게시물 조회
    const post = await Post.findById(data.postId);
    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      data.postId,
      {
        $push: {
          comments: {
            comment: data.comment,
            user: data.user,
            name: data.name,
            username: data.username,
            profileImg: data.profileImg,
          },
        },
      },
      { new: true }
    );

    return new Response(JSON.stringify(updatedPost), { status: 200 });
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
};
