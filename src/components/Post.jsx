import Link from "next/link"; // Next.js 라우팅용 Link 컴포넌트
import { HiDotsHorizontal } from "react-icons/hi"; // 점 3개(...) 아이콘
import moment from "moment"; // 날짜/시간 포맷 라이브러리
import Icons from "./Icons"; // 게시물 하단 아이콘 모음 컴포넌트

export default function Post({ post }) {
  return (
    <div className="flex p-3 border-b border-gray-200 w-full hover:bg-gray-50">
      {/* 프로필 이미지 & 유저 페이지 링크 */}
      <Link href={`/users/${post?.username}`}>
        <img
          src={post?.profileImg}
          alt="user-img"
          className="h-11 w-11 rounded-full mr-4"
        />
      </Link>

      {/* 게시물 본문 영역 */}
      <div className="flex-1">
        {/* 상단: 작성자 정보 + 옵션 아이콘 */}
        <div className="flex items-center justify-between">
          {/* 작성자 이름, 아이디, 작성 시간 */}
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <h4 className="font-bold text-xs truncate max-w-32">
              {post?.name}
            </h4>
            <span className="text-xs truncate max-w-32">@{post?.username}</span>
            {/* 이름과 시간 사이의 구분 점 */}
            <span className="text-xl text-gray-500">·</span>
            <span className="text-xs text-gray-500 flex-1 truncate max-w-32">
              {moment(post?.createdAt).fromNow()} {/* 예: "3분 전" */}
            </span>
          </div>
          <HiDotsHorizontal className="text-sm" /> {/* 우측 옵션 아이콘 */}
        </div>

        {/* 게시물 텍스트 (본문) */}
        <Link href={`/posts/${post?._id}`}>
          <p className="text-gray-800 text-sm my-3 w-full">{post?.text}</p>
        </Link>

        {/* 게시물 이미지 */}
        <Link href={`/posts/${post?._id}`}>
          <img src={post?.image} className="rounded-2xl mr-2" />
        </Link>

        {/* 좋아요, 댓글 등 아이콘 영역 */}
        <Icons post={post} id={post._id} />
      </div>
    </div>
  );
}

/**
 * TailwindCSS 클래스 정리
 *
 * 공통 레이아웃 & 패딩/마진:
 * - flex : Flexbox 레이아웃
 * - p-3 : padding 0.75rem
 * - mr-4 : margin-right 1rem
 * - mr-2 : margin-right 0.5rem
 * - my-3 : margin-top/bottom 0.75rem
 * - space-x-1 : 자식 요소 간 수평 간격 0.25rem
 * - w-full : 가로 전체 차지
 * - flex-1 : 남은 공간 차지
 *
 * 테두리 & 배경:
 * - border-b : 아래쪽 테두리
 * - border-gray-200 : 회색 테두리 색
 * - hover:bg-gray-50 : hover 시 연한 회색 배경
 * - rounded-full : 완전 원형
 * - rounded-2xl : 큰 모서리 둥글기
 *
 * 텍스트 스타일:
 * - font-bold : 굵은 글씨
 * - text-xs : 아주 작은 글씨
 * - text-sm : 작은 글씨
 * - text-xl : 큰 글씨
 * - text-gray-500 : 회색 텍스트
 * - text-gray-800 : 짙은 회색 텍스트
 *
 * 레이아웃 보조:
 * - items-center : 세로 중앙 정렬
 * - justify-between : 좌우 공간 분배
 * - whitespace-nowrap : 줄바꿈 방지
 * - truncate : 말줄임(...)
 * - max-w-32 : 최대 너비 제한
 */
