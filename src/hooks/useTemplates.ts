import { useQuery } from "@tanstack/react-query";
import { templatesService } from "@/services/templates.service";

export const templateKeys = {
  all: ["templates"] as const,
  lists: () => [...templateKeys.all, "list"] as const,
  detail: (id: string) => [...templateKeys.all, "detail", id] as const,
};

export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: () => templatesService.getAll(),
    staleTime: 1000 * 60 * 10,
  });
}
