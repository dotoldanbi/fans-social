import React from "react";
import Input from "@/components/Input";
import Feed from "@/components/Feed";
export default async function Home() {
  let data = null;
  try {
    const result = await fetch(process.env.NEXT_PUBLIC_URL + "/api/post/all", {
      method: "POST",
      cache: "no-store",
    });
    data = await result.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <div className="min-h-screen max-w-xl mx-auto border-r border-l">
      <div className="py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="text-lg sm:text-xl font-bold">Home</div>
      </div>
      <Input />
      <Feed posts={data} />
    </div>
  );
}
