import mongoose from "mongoose";

// Post(게시물) 스키마 정의
const postSchema = new mongoose.Schema(
  {
    // 게시물 내용 (필수)
    text: { type: String, required: true },

    // 게시물 이미지 URL (필수)
    image: { type: String, required: true },

    // 게시물 작성자 (User 컬렉션의 ObjectId 참조, 필수)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 작성자의 이름 (문자열, 필수)
    name: { type: String, required: true },

    // 작성자의 유저네임 (문자열, 필수)
    username: { type: String, required: true },

    // 작성자의 프로필 이미지 URL (문자열, 필수)
    profileImg: { type: String, required: true },

    // 좋아요를 누른 사용자 목록
    // ObjectId 배열이며 User 컬렉션 참조, 기본값은 빈 배열
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    // 댓글 배열
    comments: {
      type: [
        {
          // 댓글 내용
          comment: String,

          // 댓글 작성자 (User 참조, 필수)
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },

          // 댓글 작성자 이름
          name: String,

          // 댓글 작성자 유저네임
          username: String,

          // 댓글 작성자 프로필 이미지 URL
          profileImg: String,

          // 댓글 작성 시각 (기본값: 현재 시간)
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [], // 기본은 댓글 없음
    },
  },
  {
    // createdAt, updatedAt 자동 생성
    timestamps: true,
  }
);

// 이미 등록된 모델이 있으면 재사용, 없으면 새로 생성
const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;
