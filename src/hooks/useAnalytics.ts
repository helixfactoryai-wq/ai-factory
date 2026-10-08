import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";

export function useProjectAnalytics() {
  return useQuery({
    queryKey: ["analytics", "projects"],
    queryFn: () => analyticsService.getProjectAnalytics(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOverallStats() {
  return useQuery({
    queryKey: ["analytics", "overall"],
    queryFn: () => analyticsService.getOverallStats(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAuditTrends() {
  return useQuery({
    queryKey: ["analytics", "trends"],
    queryFn: () => analyticsService.getAuditTrends(),
    staleTime: 1000 * 60 * 5,
  });
}
