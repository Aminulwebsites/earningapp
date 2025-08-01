import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onUploadSuccess?: () => void;
}

export default function ProfilePhotoUpload({ currentPhoto, onUploadSuccess }: ProfilePhotoUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (photoData: string) => {
      const response = await fetch("/api/user/photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
        },
        body: JSON.stringify({ photo: photoData }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
      });
      
      // Invalidate user data to refresh photo everywhere
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      
      // Update localStorage user data
      const savedUser = localStorage.getItem("user");
      if (savedUser && preview) {
        const user = JSON.parse(savedUser);
        user.profilePhoto = preview;
        localStorage.setItem("user", JSON.stringify(user));
      }
      
      setIsOpen(false);
      setPreview(null);
      setSelectedFile(null);
      onUploadSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
      console.error("Photo upload error:", error);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!preview) return;
    uploadMutation.mutate(preview);
  };

  const handleRemovePreview = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-white shadow-md hover:bg-gray-50"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Photo Preview */}
          <div className="flex justify-center">
            <div className="relative">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  <Button
                    onClick={handleRemovePreview}
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 rounded-full h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt="Current profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={uploadMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Photo
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Supports JPG, PNG, GIF up to 5MB
            </p>
          </div>

          {/* Upload Button */}
          {preview && (
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Photo"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}