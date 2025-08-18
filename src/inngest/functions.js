import { NextResponse } from "next/server";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import HomePageContent from "../lib/models/homePageContent.model";
import { connect } from "../lib/mongodb/mongoose";

// TMDB와 Gemini API 키를 환경 변수에서 불러옴
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * 간단한 "Hello World" 예제 Inngest 함수
 */
export const helloWorld = inngest.createFunction(
  { id: "hello-world" }, // 고유 ID (Inngest 대시보드에서 추적 가능)
  { event: "test/hello.world" }, // 특정 이벤트가 발생했을 때 트리거됨
  async ({ event, step }) => {
    // step 1: 1초 대기
    await step.sleep("wait-a-moment", "1s");

    // step 2: 결과 반환
    return { message: `Hello ${event.data.email}!` };
  }
);

/**
 * 매주 일요일 0시마다 실행되는 함수
 * TMDB에서 인기 있는 TV 프로그램을 가져와 Gemini로 분석 → DB에 저장
 */
export const generateHomePageContent = inngest.createFunction(
  { name: "generate/homePageContent" },
  { cron: "0 0 * * 0" }, // 매주 일요일 0시마다 실행 (CRON 표현식)
  async ({ event, step }) => {
    /**
     * STEP 1: TMDB에서 Top Rated TV 프로그램 가져오기
     */
    const topratedMoviesResult = await step.run(
      "fetch-toprate-movies",
      async () => {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );

        // 응답이 실패했을 경우 에러 발생
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        // TMDB API 응답 데이터 중 results만 추출
        const data = await res.json();
        return data.results;
      }
    );

    /**
     * STEP 2: Gemini에게 분석 요청할 프롬프트 생성
     */
    const prompt = `Analyze these movies: ${JSON.stringify(
      topratedMoviesResult
    )} and provide a title and description in ONLY the following JSON format without any additional notes or explanations (add a link for each movie with this address '/movie/{movieId}' with html format like this: <a class="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent hover:underline" href='/movie/{movieId}'>Movie Title</a>):
    {
      "title": "exciting title about new trending movies",
      "description": "exciting description about new trending movies"
    }
    
    IMPORTANT: Return ONLY the JSON. No additional text, notes.
    Include at least 150 characters for description.
    Include at least 50 characters for title.
  `;

    /**
     * STEP 3: Google Gemini API를 호출하여 콘텐츠 생성
     */
    const googleGeminiResults = await step.ai.wrap(
      "gemini",
      async (p) => {
        return await model.generateContent(p);
      },
      prompt
    );

    // Gemini가 반환한 텍스트 추출
    const text =
      googleGeminiResults.response.candidates[0].content.parts[0].text || "";

    // ```json 같은 코드 블록 마크다운 제거
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    // 문자열을 JSON으로 변환
    const homePageContentFromGoogleGemini = JSON.parse(cleanedText);

    /**
     * STEP 4: MongoDB에 분석 결과 저장 (upsert 방식)
     */
    const createOrUpdateHomePageContent = async (title, description) => {
      try {
        await connect(); // DB 연결
        const SavedHomePageContent = await HomePageContent.findOneAndUpdate(
          { updatedBy: "inngest" }, // 조건: inngest가 업데이트한 문서
          {
            $set: {
              title,
              description,
              updatedBy: "inngest",
            },
          },
          { new: true, upsert: true } // 없으면 새로 생성
        );
        return SavedHomePageContent;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to create or update home page content");
      }
    };

    // step.run을 통해 DB 업데이트 단계 실행
    await step.run("Create or update home page content", async () => {
      await createOrUpdateHomePageContent(
        homePageContentFromGoogleGemini.title,
        homePageContentFromGoogleGemini.description
      );
    });
  }
);
