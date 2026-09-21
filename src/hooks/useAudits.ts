import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditsService, type AuditInsert } from "@/services/audits.service";

export const auditKeys = {
  all: ["audits"] as const,
  byProject: (id: string) => ["audits", "project", id] as const,
};

export function useAudits(projectId: string) {
  return useQuery({
    queryKey: auditKeys.byProject(projectId),
    queryFn: () => auditsService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: AuditInsert) => auditsService.create(p),
    onSuccess: (data) => qc.invalidateQueries({ queryKey: auditKeys.byProject(data.project_id) }),
  });
}

export function useDeleteAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      auditsService.delete(id).then(() => ({ projectId })),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: auditKeys.byProject(vars.projectId) }),
  });
}
