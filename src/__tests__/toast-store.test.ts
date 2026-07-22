import { useToastStore } from "@/store/toast";

describe("toast store", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useToastStore.getState().hide();
  });

  afterEach(() => {
    useToastStore.getState().hide();
    jest.useRealTimers();
  });

  it("shows an error and removes it after seven seconds", () => {
    useToastStore.getState().showError("Project code already exists");
    expect(useToastStore.getState().message).toBe("Project code already exists");
    jest.advanceTimersByTime(6999);
    expect(useToastStore.getState().message).toBe("Project code already exists");
    jest.advanceTimersByTime(1);
    expect(useToastStore.getState().message).toBeNull();
  });

  it("restarts the timeout when a newer error appears", () => {
    useToastStore.getState().showError("First error");
    jest.advanceTimersByTime(5000);
    useToastStore.getState().showError("Second error");
    jest.advanceTimersByTime(3000);
    expect(useToastStore.getState().message).toBe("Second error");
  });
});
