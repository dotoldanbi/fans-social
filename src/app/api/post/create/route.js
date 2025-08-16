import Post from "@/lib/models/post.model";
import { connect } from "@/lib/mongodb/mongoose";
import { currentUser } from "@clerk/nextjs/server";

export const POST = async (req) => {
  const user = await currentUser();
  try {
    await connect();
    const data = await req.json();
    console.log("Creating post:", data);
    if (!user || user.publicMetadata.userMongoId !== data.userMongoId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const newPost = await Post.create({
      user: data.userMongoId,
      name: data.name,
      username: data.username,
      text: data.text,
      profileImg: data.profileImg,
      image: data.image,
    });
    await newPost.save();
    return new Response("Post created", { status: 201 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};
