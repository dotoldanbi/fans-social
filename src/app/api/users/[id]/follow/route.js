import User from "@/lib/models/post.model"; // User 모델
import { connect } from "@/lib/mongodb/mongoose";
import { currentUser } from "@clerk/nextjs/server"; // Clerk 현재 사용자

// 팔로우 / 언팔로우 토글 API
export const PUT = async (req, { params }) => {
  try {
    await connect();

    const clerkUser = await currentUser(); // 현재 로그인된 Clerk 유저
    const { id: userProfileId } = params; // URL 경로에서 팔로우 대상 ID 추출
    const data = await req.json(); // 요청 바디
    const userWhoFollowsId = data.userWhoFollowsId; // 팔로우 주체 ID

    // 인증된 사용자 검증
    if (
      !clerkUser ||
      clerkUser.publicMetadata.userMongoId !== userWhoFollowsId
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 팔로우 주체, 팔로우 대상 MongoDB에서 조회
    const userWhoFollows = await User.findById(userWhoFollowsId);
    if (!userWhoFollows) {
      return new Response("User who follows not found in the db", {
        status: 404,
      });
    }

    const userToFollow = await User.findById(userProfileId);
    if (!userToFollow) {
      return new Response("User to follow not found in the db", {
        status: 404,
      });
    }

    // 자기 자신 팔로우 방지
    if (userWhoFollows._id.toString() === userToFollow._id.toString()) {
      return new Response("You cannot follow yourself", { status: 400 });
    }

    // 팔로우 여부 확인
    const isFollowing = userWhoFollows.following.includes(userToFollow._id);

    if (isFollowing) {
      // 이미 팔로우 중이면 언팔로우 처리
      userWhoFollows.following = userWhoFollows.following.filter(
        (id) => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== userWhoFollows._id.toString()
      );
    } else {
      // 팔로우 중이 아니면 팔로우 추가
      userWhoFollows.following.push(userToFollow._id);
      userToFollow.followers.push(userWhoFollows._id);
    }

    // DB에 저장
    await userWhoFollows.save();
    await userToFollow.save();

    return new Response(
      JSON.stringify({
        message: isFollowing
          ? "Unfollowed successfully"
          : "Followed successfully",
        user: userWhoFollows,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response("Failed to follow/unfollow user", { status: 500 });
  }
};
