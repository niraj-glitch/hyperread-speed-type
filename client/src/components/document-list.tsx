import { useDocuments, useDeleteDocument } from "@/hooks/use-documents";
import { format } from "date-fns";
import { FileText, Trash2, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DocumentListProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function DocumentList({ selectedId, onSelect }: DocumentListProps) {
  const { data: documents, isLoading } = useDocuments();
  const { mutate: deleteDoc } = useDeleteDocument();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading library...
      </div>
    );
  }

  if (!documents?.length) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-border m-4">
        <p className="text-sm text-muted-foreground">No documents found.</p>
        <p className="text-xs text-muted-foreground mt-1">Upload a file to start reading.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          onClick={() => onSelect(doc.id)}
          className={cn(
            "group flex items-start justify-between p-3 cursor-pointer transition-colors border border-transparent hover:border-border/50 hover:bg-secondary/30",
            selectedId === doc.id ? "bg-secondary border-l-2 border-l-primary" : "text-muted-foreground"
          )}
        >
          <div className="flex-1 min-w-0 pr-3">
            <h3 className={cn(
              "font-medium text-sm truncate",
              selectedId === doc.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {doc.title}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground/60">
              <span className="flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                {Math.ceil(doc.wordCount / 300)} min
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {format(new Date(doc.createdAt), 'MMM d')}
              </span>
              {doc.currentWordIndex > 0 && (
                <span className="text-primary/70">
                  {Math.round((doc.currentWordIndex / doc.wordCount) * 100)}%
                </span>
              )}
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border rounded-none">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete "{doc.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-none border-border">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteDoc(doc.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}
