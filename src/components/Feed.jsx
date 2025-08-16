import React from "react";
import Post from "./Post";

export default function Feed({ posts }) {
  return (
    <div>
      {posts && posts.length > 0 ? (
        posts.map((post) => <Post key={post._id} post={post} />)
      ) : (
        <p className="text-gray-600">No posts available</p>
      )}
    </div>
  );
}
