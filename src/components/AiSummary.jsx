"use client";
import React, { useEffect, useState } from "react";
import moment from "moment";

export default function AiSummary() {
  const [homePageContent, sethomePageContent] = useState(false);

  useEffect(() => {
    const fetchAiSummary = async () => {
      const results = await fetch(process.env.NEXT_PUBLIC_URL + "/api/ai/get", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        cache: "no-store",
      });
      if (!results.ok) {
        throw new Error("Failed to fetch data");
      }
      const text = await results.json();
      sethomePageContent(text);
      console.log(homePageContent);
    };
    fetchAiSummary();
  }, []);

  return (
    <div>
      {homePageContent && (
        <>
          <div className="font-mono font-bold ">
            <span>AI Summary (by Google Gemini)</span>
            <br />
            <span className="font-light">
              {moment(homePageContent.createdAt).fromNow()}
            </span>
          </div>
          <div className="my-2">
            <h3 className="text-2xl text-center font-semibold">
              {homePageContent.title}
            </h3>
            <span
              className="text-center"
              dangerouslySetInnerHTML={{ __html: homePageContent.description }}
            />
          </div>
        </>
      )}
    </div>
  );
}
