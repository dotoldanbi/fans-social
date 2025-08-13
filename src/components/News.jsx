"use client";
import React from "react";
import { useState, useEffect } from "react";
export default function News() {
  const [news, setNews] = useState([]);
  const [articleNum, setArticleNum] = useState(5);

  useEffect(() => {
    const fetchNews = async () => {
      const res = await fetch(
        `https://saurav.tech/NewsAPI/top-headlines/category/general/us.json`
      );
      const data = await res.json();
      setNews(data.articles);
    };
    fetchNews();
  }, []);
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h4 className="text-lg font-semibold">Whats' happening</h4>
      <div className="flex-row items-center justify-between px-4 py-2 space-x-1 hover:bg-gray-200 transition duration-200">
        {news.slice(0, articleNum).map((article, idx) => (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:underline"
            key={idx}
          >
            <div key={idx} className="">
              <h6 className="text-lg font-semibold">{article.title}</h6>
              <p className="text-sm">{article.description}</p>
            </div>
            <img
              src={article.urlToImage}
              alt={article.title}
              className="w-full h-32 object-cover rounded-lg mt-2"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
