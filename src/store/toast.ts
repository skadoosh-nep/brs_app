import { create } from "zustand";

type ToastState = {
  message: string | null;
  sequence: number;
  showError: (message: string) => void;
  hide: () => void;
};

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  sequence: 0,
  showError: (message) => {
    if (dismissTimer) clearTimeout(dismissTimer);
    set((state) => ({ message, sequence: state.sequence + 1 }));
    dismissTimer = setTimeout(() => {
      set({ message: null });
      dismissTimer = null;
    }, 7000);
  },
  hide: () => {
    if (dismissTimer) clearTimeout(dismissTimer);
    dismissTimer = null;
    set({ message: null });
  },
}));
