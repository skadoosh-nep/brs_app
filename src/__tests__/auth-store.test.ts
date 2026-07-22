import { useAuthStore } from "@/store/auth";

describe("auth store", () => {
  beforeEach(() => useAuthStore.getState().clearSession());

  it("keeps and replaces an access token in memory", () => {
    useAuthStore.getState().setSession({ accessToken: "first", tokenType: "Bearer" });
    expect(useAuthStore.getState()).toMatchObject({ accessToken: "first", status: "authenticated" });
    useAuthStore.getState().setSession({ accessToken: "refreshed", tokenType: "Bearer" });
    expect(useAuthStore.getState().accessToken).toBe("refreshed");
  });

  it("clears the complete session", () => {
    useAuthStore.getState().setSession({ accessToken: "secret", tokenType: "Bearer" });
    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState()).toMatchObject({ accessToken: null, tokenType: "Bearer", status: "anonymous" });
  });
});
