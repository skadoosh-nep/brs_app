import {
  filterLoadedProjects,
  hasAnotherProjectPage,
  mergeUniqueProjects,
} from "@/lib/projects";
import type { Project } from "@/types/domain";

function project(id: string, name = "Bridge", code = "PRJ-1", location = "Kathmandu"): Project {
  return {
    id,
    companyId: "c1",
    projectStatusId: "s1",
    projectCode: code,
    name,
    clientId: null,
    location,
    contractAmount: "100.00",
    startDate: null,
    endDate: null,
    description: null,
  };
}

describe("project list helpers", () => {
  it("filters loaded projects by name, code, and location", () => {
    const items = [
      project("p1", "Bridge", "PRJ-1", "Kathmandu"),
      project("p2", "Hospital", "MED-2", "Pokhara"),
    ];
    expect(filterLoadedProjects(items, "hospital")).toEqual([items[1]]);
    expect(filterLoadedProjects(items, "prj-1")).toEqual([items[0]]);
    expect(filterLoadedProjects(items, "pokhara")).toEqual([items[1]]);
  });

  it("deduplicates projects while appending pages", () => {
    expect(mergeUniqueProjects([project("p1")], [project("p1"), project("p2")]))
      .toHaveLength(2);
  });

  it("stops pagination from totals or a short page", () => {
    expect(hasAnotherProjectPage({ loadedCount: 20, receivedCount: 20, pageSize: 20, total: 21 }))
      .toBe(true);
    expect(hasAnotherProjectPage({ loadedCount: 21, receivedCount: 1, pageSize: 20, total: 21 }))
      .toBe(false);
    expect(hasAnotherProjectPage({ loadedCount: 15, receivedCount: 15, pageSize: 20 }))
      .toBe(false);
  });
});
