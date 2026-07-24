import type { AccountGroup, AccountGroupNode } from "@/types/domain";

export function flattenAccountGroupTree(nodes: AccountGroupNode[]): AccountGroup[] {
  return nodes.flatMap((node) => [
    {
      id: node.id,
      companyId: node.companyId,
      accountGroupTypeId: node.accountGroupTypeId,
      parentGroupId: node.parentGroupId,
      name: node.name,
      isActive: node.isActive,
    },
    ...flattenAccountGroupTree(node.children),
  ]);
}

export function accountGroupDescendantIds(
  nodes: AccountGroupNode[],
  groupId: string,
): Set<string> {
  const excluded = new Set<string>([groupId]);
  function find(items: AccountGroupNode[]): boolean {
    for (const node of items) {
      if (node.id === groupId) {
        flattenAccountGroupTree(node.children).forEach((group) => excluded.add(group.id));
        return true;
      }
      if (find(node.children)) return true;
    }
    return false;
  }
  find(nodes);
  return excluded;
}

export function filterLoadedAccountGroups(
  groups: AccountGroup[],
  query: string,
): AccountGroup[] {
  const normalized = query.trim().toLowerCase();
  return normalized
    ? groups.filter((group) => group.name.toLowerCase().includes(normalized))
    : groups;
}

export function mergeUniqueAccountGroups(
  current: AccountGroup[],
  incoming: AccountGroup[],
): AccountGroup[] {
  const ids = new Set(current.map((group) => group.id));
  return [...current, ...incoming.filter((group) => !ids.has(group.id))];
}

export async function generateAccountGroupTreeWhenEmpty({
  tree,
  canGenerate,
  markAttempted,
  generate,
  reload,
}: {
  tree: AccountGroupNode[];
  canGenerate: boolean;
  markAttempted: () => void;
  generate: () => Promise<void>;
  reload: () => Promise<AccountGroupNode[]>;
}): Promise<AccountGroupNode[]> {
  if (tree.length || !canGenerate) return tree;
  markAttempted();
  await generate();
  return reload();
}
