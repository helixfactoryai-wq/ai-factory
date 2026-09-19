import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promptsService } from "@/services/prompts.service";
import type { PromptInsert, PromptUpdate, Prompt } from "@/types/prompt";

export const promptKeys = {
  all: ["prompts"] as const,
  byProject: (id: string) => ["prompts", "project", id] as const,
};

export function usePrompts(projectId: string) {
  return useQuery({
    queryKey: promptKeys.byProject(projectId),
    queryFn: () => promptsService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreatePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: PromptInsert) => promptsService.create(p),
    onSuccess: (data) => qc.invalidateQueries({ queryKey: promptKeys.byProject(data.project_id) }),
  });
}

export function useUpdatePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: PromptUpdate) => promptsService.update(p),
    onSuccess: (data) => qc.invalidateQueries({ queryKey: promptKeys.byProject(data.project_id) }),
  });
}

export function useDuplicatePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Prompt) => promptsService.duplicate(p),
    onSuccess: (data) => qc.invalidateQueries({ queryKey: promptKeys.byProject(data.project_id) }),
  });
}

export function useDeletePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      promptsService.delete(id).then(() => ({ projectId })),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: promptKeys.byProject(vars.projectId) }),
  });
}
