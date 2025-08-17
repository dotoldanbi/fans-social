import { inngest } from "./client";
// Inngest 클라이언트를 불러옴 (Inngest SDK 초기화 파일에서 가져옴)

export const helloWorld = inngest.createFunction(
  { id: "hello-world" }, // 함수의 고유 ID (Inngest 대시보드에서 식별 가능)
  { event: "test/hello.world" }, // 어떤 이벤트가 발생했을 때 실행할지 정의 (이벤트 트리거)
  async ({ event, step }) => {
    // 실제 실행 로직 (핸들러)
    // step.sleep: 워크플로우 단계 중 일정 시간 대기 (여기서는 1초 대기)
    await step.sleep("wait-a-moment", "1s");

    // 함수 실행 결과 반환 (이벤트에 담긴 email 데이터를 사용)
    return { message: `Hello ${event.data.email}!` };
  }
);
