import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SettingsResponse } from "@shared/routes";
import { type InsertSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return api.settings.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<InsertSettings>) => {
      const res = await fetch(api.settings.update.path, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update settings");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onMutate: async (newSettings) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [api.settings.get.path] });
      const previousSettings = queryClient.getQueryData<SettingsResponse>([api.settings.get.path]);
      
      if (previousSettings) {
        queryClient.setQueryData<SettingsResponse>([api.settings.get.path], {
          ...previousSettings,
          ...newSettings,
        });
      }
      return { previousSettings };
    },
    onError: (_err, _newSettings, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData([api.settings.get.path], context.previousSettings);
      }
      toast({
        title: "Update failed",
        description: "Could not save settings changes.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
    },
  });
}
