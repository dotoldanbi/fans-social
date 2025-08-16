import Post from "@/lib/models/post.model"; // Post(게시물) Mongoose 모델
import { connect } from "@/lib/mongodb/mongoose"; // MongoDB 연결 함수

export const POST = async (req) => {
  try {
    await connect();
    const data = await req.json();
    console.log("data:", data);
    // 게시물 ID가 제공되지 않은 경우 에러 처리
    if (!data.postId) {
      return new Response("Post ID is required", { status: 400 });
    }

    // 게시물 조회
    const post = await Post.findById(data.postId);

    // 게시물이 존재하지 않는 경우 에러 처리
    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error) {
    console.log("Error fetching post:", error);
    return new Response("Error fetching post", { status: 500 });
  }
};
