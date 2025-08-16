import React from "react";
import Comment from "./Comment";
export default function Comments({ comments }) {
  const sortedComments = comments.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const commentsList = sortedComments.map((comment) => (
    <Comment comment={comment} id={comment._id} key={comment._id} />
  ));

  return <div>{commentsList}</div>;
}
