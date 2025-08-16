import Post from "@/lib/models/post.model"; // Post(게시물) Mongoose 모델
import { connect } from "@/lib/mongodb/mongoose"; // MongoDB 연결 함수
import { currentUser } from "@clerk/nextjs/server"; // Clerk 인증에서 현재 로그인 사용자 정보 가져오기

// PUT 메서드: 특정 게시물에 '좋아요' 토글 기능
export const PUT = async (req) => {
  // 현재 로그인한 사용자 정보 가져오기
  const user = await currentUser();

  try {
    // MongoDB 연결
    await connect();

    // 요청 바디(JSON) 파싱
    const data = await req.json();

    // 로그인 상태가 아니면 401 Unauthorized 응답
    if (!user) {
      return { status: 401, body: "Unauthorized" };
    }

    // 요청된 postId로 게시물 찾기
    const post = await Post.findById(data.postId);

    // 이미 해당 사용자가 likes 배열에 포함되어 있는 경우 → 좋아요 취소
    if (post.likes.includes(user.publicMetadata.userMongoId)) {
      const updatePost = await Post.findByIdAndUpdate(
        data.postId,
        {
          // $pull → 배열에서 해당 값 제거
          $pull: { likes: user.publicMetadata.userMongoId },
        },
        { new: true } // 수정 후의 문서를 반환
      );

      // 응답: JSON 형태로 수정된 게시물 반환
      return new Response(JSON.stringify(updatePost), { status: 200 });
    }
    // 좋아요를 누르지 않은 경우 → 좋아요 추가
    else {
      const updatePost = await Post.findByIdAndUpdate(
        data.postId,
        {
          // $addToSet → 중복 없이 배열에 값 추가
          $addToSet: { likes: user.publicMetadata.userMongoId },
        },
        { new: true }
      );

      return new Response(JSON.stringify(updatePost), { status: 200 });
    }
  } catch (error) {
    // 서버/DB 에러 처리
    console.log("Error liking post:", error);
    return new Response("Error liking post", { status: 500 });
  }
};
