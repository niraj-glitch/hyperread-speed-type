import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// GET /api/documents
export function useDocuments() {
  return useQuery({
    queryKey: [api.documents.list.path],
    queryFn: async () => {
      const res = await fetch(api.documents.list.path);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return api.documents.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/documents/:id
export function useDocument(id: number | null) {
  return useQuery({
    queryKey: [api.documents.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.documents.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch document");
      return api.documents.get.responses[200].parse(await res.json());
    },
  });
}

// POST /api/documents/upload
export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(api.documents.upload.path, {
        method: api.documents.upload.method,
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.documents.upload.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to upload document");
      }
      return api.documents.upload.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
      toast({
        title: "Upload complete",
        description: "Document has been processed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// DELETE /api/documents/:id
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.documents.delete.path, { id });
      const res = await fetch(url, { method: api.documents.delete.method });
      if (!res.ok) throw new Error("Failed to delete document");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
      toast({
        title: "Document deleted",
        description: "The document has been removed from your library.",
      });
    },
  });
}

// PATCH /api/documents/:id/progress
export function useUpdateProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, index }: { id: number; index: number }) => {
      const url = buildUrl(api.documents.updateProgress.path, { id });
      const res = await fetch(url, {
        method: api.documents.updateProgress.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentWordIndex: index }),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return api.documents.updateProgress.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Optimistically update the document in the list if needed, or invalidate
      queryClient.invalidateQueries({ queryKey: [api.documents.get.path, data.id] });
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
    },
  });
}
