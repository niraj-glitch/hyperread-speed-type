import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useUploadDocument } from "@/hooks/use-documents";
import { cn } from "@/lib/utils";

export function FileUpload() {
  const { mutate: uploadFile, isPending } = useUploadDocument();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadFile(acceptedFiles[0]);
    }
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'], // Note: backend would need pdf parsing
      'text/markdown': ['.md']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="p-4 border-b border-border bg-card/50">
      <div 
        {...getRootProps()} 
        className={cn(
          "relative flex flex-col items-center justify-center h-24 border border-dashed transition-colors cursor-pointer",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50",
          isPending && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        {isPending ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-5 h-5 text-primary animate-spin mb-2" />
            <span className="text-xs text-muted-foreground">Processing...</span>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center text-primary">
            <Upload className="w-5 h-5 mb-2" />
            <span className="text-xs font-medium">Drop to upload</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-muted-foreground group">
            <div className="p-2 mb-1 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
              <FileText className="w-4 h-4 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs font-medium">Click or Drag .txt file</span>
          </div>
        )}
      </div>
    </div>
  );
}
