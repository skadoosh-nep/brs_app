import {
  accountGroupDescendantIds,
  filterLoadedAccountGroups,
  flattenAccountGroupTree,
  generateAccountGroupTreeWhenEmpty,
  mergeUniqueAccountGroups,
} from "@/lib/account-groups";
import type { AccountGroup, AccountGroupNode } from "@/types/domain";

const node = (
  id: string,
  children: AccountGroupNode[] = [],
  parentGroupId: string | null = null,
): AccountGroupNode => ({
  id,
  companyId: "c1",
  accountGroupTypeId: "t1",
  parentGroupId,
  name: `Group ${id}`,
  isActive: true,
  children,
});

describe("account-group helpers", () => {
  const tree = [node("root", [node("child", [node("grand", [], "child")], "root")])];

  it("flattens trees and excludes self and descendants from parent choices", () => {
    expect(flattenAccountGroupTree(tree).map((group) => group.id))
      .toEqual(["root", "child", "grand"]);
    expect([...accountGroupDescendantIds(tree, "child")].sort())
      .toEqual(["child", "grand"]);
  });

  it("searches loaded names and deduplicates pages", () => {
    const groups = flattenAccountGroupTree(tree);
    expect(filterLoadedAccountGroups(groups, "child").map((group) => group.id))
      .toEqual(["child"]);
    expect(mergeUniqueAccountGroups(groups, [groups[0], node("new") as AccountGroup]))
      .toHaveLength(4);
  });

  it("generates and reloads only for an eligible empty tree", async () => {
    const markAttempted = jest.fn();
    const generate = jest.fn().mockResolvedValue(undefined);
    const reload = jest.fn().mockResolvedValue(tree);
    await expect(generateAccountGroupTreeWhenEmpty({
      tree: [],
      canGenerate: true,
      markAttempted,
      generate,
      reload,
    })).resolves.toEqual(tree);
    expect(markAttempted).toHaveBeenCalledTimes(1);
    expect(generate).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);

    await generateAccountGroupTreeWhenEmpty({
      tree,
      canGenerate: true,
      markAttempted,
      generate,
      reload,
    });
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("marks the attempt before surfacing generation failure", async () => {
    const markAttempted = jest.fn();
    await expect(generateAccountGroupTreeWhenEmpty({
      tree: [],
      canGenerate: true,
      markAttempted,
      generate: async () => {
        throw new Error("generation failed");
      },
      reload: async () => tree,
    })).rejects.toThrow("generation failed");
    expect(markAttempted).toHaveBeenCalledTimes(1);
  });
});
