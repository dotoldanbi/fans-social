import User from "@/lib/models/user.model"; // User 모델 가져오기 (MongoDB 컬렉션)
import { connect } from "@/lib/mongodb/mongoose";

import { currentUser } from "@clerk/nextjs/server"; // Clerk에서 현재 로그인한 사용자 가져오기

// POST 메소드 (팔로우/언팔로우 처리 API)
export const POST = async (req) => {
  try {
    await connect(); // MongoDB 연결

    const user = await currentUser(); // 현재 로그인한 Clerk 사용자 정보 가져오기
    const data = await req.json(); // 요청 본문(JSON) 파싱

    // 요청에서 팔로우 대상과 팔로우를 시도하는 사용자 ID 분리
    const userProfileId = data.userProfileId; // 팔로우하려는 대상 유저 ID
    const userWhoFollowsId = data.userWhofollowsId; // 팔로우하는 주체 유저 ID

    // Clerk 인증된 사용자와 요청한 팔로우 주체 ID가 다르면 권한 없음
    if (!user || user.publicMetadata.userMongoId !== userWhoFollowsId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 팔로우를 시도하는 사용자 MongoDB 조회
    const userWhoFollowsFromMongoDB = await User.findById(userWhoFollowsId);
    if (!userWhoFollowsFromMongoDB) {
      return new Response("User who follows not found in the db", {
        status: 404,
      });
    }

    // 팔로우 대상 사용자 MongoDB 조회
    const userProfileIdFromMongoDB = await User.findById(userProfileId);
    if (!userProfileIdFromMongoDB) {
      return new Response("User to follow not found in the db", {
        status: 404,
      });
    }

    // 자기 자신을 팔로우하려는 경우 방지
    if (
      userWhoFollowsFromMongoDB._id.toString() ===
      userProfileIdFromMongoDB._id.toString()
    ) {
      return new Response("You cannot follow yourself", { status: 400 });
    }

    // 이미 팔로우 중인지 확인
    const isFollowing = userWhoFollowsFromMongoDB.following.find(
      (item) => item.toString() === userProfileIdFromMongoDB._id.toString()
    );

    if (isFollowing) {
      // 이미 팔로우 중이라면 언팔로우 처리
      userWhoFollowsFromMongoDB.following =
        userWhoFollowsFromMongoDB.following.filter(
          (item) => item.toString() !== userProfileIdFromMongoDB._id.toString()
        );

      userProfileIdFromMongoDB.followers =
        userProfileIdFromMongoDB.followers.filter(
          (item) => item.toString() !== userWhoFollowsFromMongoDB._id.toString()
        );
    } else {
      // 팔로우 중이 아니라면 팔로우 추가
      userWhoFollowsFromMongoDB.following.push(userProfileIdFromMongoDB._id);
      userProfileIdFromMongoDB.followers.push(userWhoFollowsFromMongoDB._id);
    }

    // 변경사항 저장
    await userWhoFollowsFromMongoDB.save();
    await userProfileIdFromMongoDB.save();

    // 갱신된 팔로우한 사용자 정보를 반환
    return new Response(JSON.stringify(userWhoFollowsFromMongoDB), {
      status: 200,
    });
  } catch (err) {
    // 예외 처리
    console.error(err);
    return new Response("Failed to follow/unfollow user", { status: 500 });
  }
};
