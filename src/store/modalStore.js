import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
const useModalStore = create(
  immer((set) => ({
    isOpen: false,
    postId: null, // 현재 모달에서 작업 중인 포스트 ID (선택적)
    openModal: (postId) =>
      set((state) => {
        state.isOpen = true;
        state.postId = postId;
      }),
    closeModal: () =>
      set((state) => {
        state.isOpen = false;
        state.postId = null;
      }),
  }))
);

export default useModalStore;
