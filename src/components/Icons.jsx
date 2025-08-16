"use client";

import {
  HiOutlineChat,
  HiOutlineHeart,
  HiOutlineTrash,
  HiHeart,
} from "react-icons/hi"; // 히어로아이콘(Outline & Solid)
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs"; // 사용자 인증
import { useRouter } from "next/navigation"; // 클라이언트 라우팅
import useModalStore from "@/store/modalStore"; // 모달 상태 관리
import CommentModal from "./CommentModal";

export default function Icons({ post, id }) {
  const [isLiked, setIsLiked] = useState(false); // 현재 사용자가 좋아요 눌렀는지 여부
  const [likes, setLikes] = useState(post.likes || []); // 좋아요한 유저 ID 배열
  const { isOpen, openModal, closeModal } = useModalStore();
  const { user } = useUser(); // 현재 로그인 유저
  const router = useRouter();

  // 좋아요/좋아요 취소 요청
  const likePost = async () => {
    if (!user) {
      // 로그인 안 되어 있으면 로그인 페이지로
      return router.push("/sign-in");
    }

    const like = await fetch("/api/post/like", {
      method: "PUT", // 좋아요 상태 토글
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId: post._id, // 좋아요 대상 게시물 ID
      }),
    });

    // 서버 응답이 있고 현재 좋아요 상태였다면 -> 좋아요 취소
    if (like && isLiked) {
      setLikes(
        likes.filter((like) => like !== user.publicMetadata.userMongoId)
      );
    }
    // 서버 응답이 있고 현재 좋아요 상태가 아니었다면 -> 좋아요 추가
    if (like && !isLiked) {
      setLikes([...likes, user.publicMetadata.userMongoId]);
    }
  };

  const deletePost = async () => {
    if (!user) {
      // 로그인 안 되어 있으면 로그인 페이지로
      return router.push("/sign-in");
    }
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    const res = await fetch("/api/post/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId: post._id,
      }),
    });

    if (res.ok) {
      //   router.push("/");
      location.reload();
    } else {
      console.log("Error deleting post");
    }
  };

  // likes나 user가 변할 때 현재 유저가 좋아요 눌렀는지 확인
  useEffect(() => {
    if (user && likes?.includes(user.publicMetadata.userMongoId)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [likes, user]);

  return (
    <div className="flex justify-start gap-5 p-2 text-gray-500">
      <div className="flex items-center">
        {/* 댓글 아이콘 */}
        <HiOutlineChat
          onClick={() => openModal(post._id)}
          className="h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-sky-500 hover:bg-sky-100"
        />
        {post.comments.length > 0 && (
          <span className="text-xs">{post.comments.length}</span>
        )}
      </div>
      <CommentModal />
      <div className="flex items-center gap-2">
        {/* 좋아요 아이콘 (눌렀는지 여부에 따라 변경) */}
        {isLiked ? (
          <HiHeart
            onClick={likePost}
            className="h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 text-red-500 bg-red-100"
          />
        ) : (
          <HiOutlineHeart
            onClick={likePost}
            className="h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100"
          />
        )}

        {/* 좋아요 수 표시 */}
        {likes.length > 0 && (
          <span className={`text-xs ${isLiked ? "text-red-500" : ""}`}>
            {likes.length} likes
          </span>
        )}
      </div>
      {/* 삭제 아이콘 */}
      {user && user?.publicMetadata.userMongoId === post?.user && (
        <HiOutlineTrash
          onClick={deletePost}
          className="h-8 w-8 cursor-pointer rounded-full transition duration-500 ease-in-out p-2 hover:text-red-500 hover:bg-red-100"
        />
      )}
    </div>
  );
}

/**
 * TailwindCSS 클래스 정리
 *
 * 공통 레이아웃 & 배치:
 * - flex : Flexbox 레이아웃
 * - justify-start : 왼쪽 정렬
 * - gap-5 : 아이콘 사이 간격 1.25rem
 * - p-2 : padding 0.5rem
 *
 * 색상 & 텍스트:
 * - text-gray-500 : 기본 아이콘 색상
 * - hover:text-sky-500 : 호버 시 파란색
 * - hover:text-red-500 : 호버 시 빨간색
 * - text-red-500 : 좋아요 상태일 때 빨간색
 *
 * 배경:
 * - hover:bg-sky-100 : 호버 시 연한 파란 배경
 * - hover:bg-red-100 : 호버 시 연한 빨간 배경
 * - bg-red-100 : 좋아요 상태일 때 연한 빨간 배경
 *
 * 크기 & 모양:
 * - h-8 w-8 : 2rem 크기 아이콘
 * - rounded-full : 완전 원형
 * - p-2 : 내부 여백
 *
 * 애니메이션:
 * - transition : 전환 효과 활성화
 * - duration-500 : 0.5초 전환 시간
 * - ease-in-out : 부드러운 가속/감속
 */
