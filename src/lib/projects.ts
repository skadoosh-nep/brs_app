import type { Project } from "@/types/domain";

export function filterLoadedProjects(projects: Project[], query: string): Project[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return projects;
  return projects.filter((project) =>
    [project.name, project.projectCode, project.location ?? ""]
      .some((value) => value.toLowerCase().includes(normalized)),
  );
}

export function mergeUniqueProjects(current: Project[], incoming: Project[]): Project[] {
  const ids = new Set(current.map((project) => project.id));
  return [...current, ...incoming.filter((project) => !ids.has(project.id))];
}

export function hasAnotherProjectPage({
  loadedCount,
  receivedCount,
  pageSize,
  total,
}: {
  loadedCount: number;
  receivedCount: number;
  pageSize: number;
  total?: number;
}): boolean {
  return total !== undefined ? loadedCount < total : receivedCount === pageSize;
}
