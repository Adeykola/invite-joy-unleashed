
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image, 
  Video, 
  Music, 
  FileText, 
  X,
  Download,
  Eye
} from 'lucide-react';
import { useEnhancedWhatsApp } from '@/hooks/useEnhancedWhatsApp';

export const MediaUploadComponent = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { mediaUploads, uploadMedia, isUploadingMedia } = useEnhancedWhatsApp();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    uploadMedia(file);
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Media Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Support for images, videos, audio files, and documents (max 50MB)
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingMedia}
              className="mb-2"
            >
              {isUploadingMedia ? 'Uploading...' : 'Choose Files'}
            </Button>
            <div className="text-xs text-gray-400">
              Supported: JPG, PNG, GIF, MP4, MOV, MP3, WAV, PDF, DOC, DOCX
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
        </CardContent>
      </Card>

      {/* Uploaded Media */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Media ({mediaUploads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {mediaUploads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No media files uploaded yet.
            </p>
          ) : (
            <div className="grid gap-4">
              {mediaUploads.map((media) => (
                <div
                  key={media.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getMediaIcon(media.media_type)}
                    <div>
                      <p className="font-medium">{media.file_name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Badge variant="secondary">
                          {media.media_type}
                        </Badge>
                        <span>{formatFileSize(media.file_size)}</span>
                        <Badge 
                          variant={media.upload_status === 'uploaded' ? 'default' : 'destructive'}
                        >
                          {media.upload_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
