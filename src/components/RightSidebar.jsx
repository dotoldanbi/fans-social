"use client";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import News from "./News";
import AiSummary from "./AiSummary";

export default function RightSidebar() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/search/${input}`);
  };

  return (
    <>
      <AiSummary />
      <div className="sticky top-0 h-screen">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setInput(e.target.value)}
            className="w-full border bg-gray-100 border-gray-200 rounded-3xl text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
          />
        </form>
        <News />
      </div>
    </>
  );
}
