"use client";

import { useUser } from "@clerk/nextjs"; // Clerk 인증 훅: 현재 로그인한 사용자 정보 가져오기
import { useRouter } from "next/navigation"; // Next.js 라우터 훅: 페이지 새로고침 등 네비게이션 처리

// FollowButton 컴포넌트
// - 특정 프로필 페이지에서 팔로우/언팔로우 버튼을 렌더링
// - 로그인된 사용자(user)가 다른 유저(userFromProfilePage)를 팔로우/언팔로우 할 수 있음
export default function FollowButton({ user: userFromProfilePage }) {
  const router = useRouter();
  const { user } = useUser(); // 현재 로그인한 사용자 정보 가져오기

  // 팔로우/언팔로우 처리 핸들러
  const handleFollow = async () => {
    try {
      // API 요청: 현재 로그인한 사용자가 userFromProfilePage를 팔로우/언팔로우
      const res = await fetch("/api/user/follow", {
        method: "POST",
        body: JSON.stringify({
          userProfileId: userFromProfilePage._id, // 팔로우 당할 사용자
          userWhofollowsId: user.publicMetadata.userMongoId, // 팔로우 하는 사용자
        }),
      });

      // 성공하면 페이지를 새로고침하여 상태 반영
      if (res.status === 200) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to follow user", error);
    }
  };

  return (
    <button
      onClick={handleFollow}
      // 버튼 스타일
      className="bg-blue-500 text-white px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
      // 로그인 안 했거나 자기 자신 프로필일 경우 비활성화
      disabled={
        !user || user.publicMetadata.userMongoId === userFromProfilePage._id
      }
    >
      {/* 로그인된 사용자가 이미 해당 프로필 유저를 팔로우 중이면 "Unfollow", 아니면 "Follow" 표시 */}
      {user &&
      userFromProfilePage.followers.includes(user.publicMetadata.userMongoId)
        ? "Unfollow"
        : "Follow"}
    </button>
  );
}
