import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "@/services/projects.service";
import type { ProjectInsert, ProjectUpdate } from "@/types";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
  recent: (n?: number) => [...projectKeys.all, "recent", n] as const,
};

export function useProjects() {
  return useQuery({ queryKey: projectKeys.lists(), queryFn: () => projectsService.getAll() });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsService.getById(id),
    enabled: !!id,
  });
}

export function useRecentProjects(limit = 5) {
  return useQuery({ queryKey: projectKeys.recent(limit), queryFn: () => projectsService.getRecent(limit) });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: ProjectInsert) => projectsService.create(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: ProjectUpdate) => projectsService.update(p),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.setQueryData(projectKeys.detail(updated.id), updated);
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
}
