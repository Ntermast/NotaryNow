'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sidebar } from '@/components/layout/sidebar';
import { BellIcon, Upload, FileText, File, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  appointmentId?: string;
  appointment?: {
    id: string;
    scheduledTime: string;
    service: {
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export default function CustomerDocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "CUSTOMER") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  // Fetch documents when authenticated
  useEffect(() => {
    async function fetchDocuments() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/documents");
          if (response.ok) {
            const data = await response.json();
            setDocuments(data);
          } else {
            toast.error("Failed to load documents");
          }
        } catch (error) {
          console.error("Error fetching documents:", error);
          toast.error("Failed to load documents");
        } finally {
          setLoading(false);
        }
      }
    }

    fetchDocuments();
  }, [status]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Upload file first
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("/api/upload/documents", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const uploadedFile = await uploadResponse.json();

        // Create document record
        const documentResponse = await fetch("/api/documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: uploadedFile.fileName,
            originalName: uploadedFile.originalName,
            fileSize: uploadedFile.fileSize,
            fileType: uploadedFile.fileType,
            fileUrl: uploadedFile.fileUrl,
          }),
        });

        if (!documentResponse.ok) {
          const errorData = await documentResponse.json();
          throw new Error(errorData.error || "Failed to save document");
        }

        const newDocument = await documentResponse.json();
        setDocuments(prev => [newDocument, ...prev]);
      }
      
      toast.success(`${files.length} document${files.length > 1 ? 's' : ''} uploaded successfully`);
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete document");
      }
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete document');
    }
  };

  const handleViewDocument = (document: Document) => {
    window.open(document.fileUrl, '_blank');
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (type.includes('word')) return <FileText className="h-6 w-6 text-blue-500" />;
    if (type.includes('image')) return <File className="h-6 w-6 text-green-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "CUSTOMER") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          userRole="customer" 
          userName={session.user.name} 
          userEmail={session.user.email} 
        />

        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top navbar */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">My Documents</h1>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <BellIcon className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </div>
            </div>
          </div>

          {/* Documents content */}
          <main className="flex-1 pb-8">
            <div className="mt-8 px-4 sm:px-6 lg:px-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Upload Documents</CardTitle>
                      <CardDescription>
                        Upload your documents to share with notaries during appointments
                      </CardDescription>
                    </div>
                    <div>
                      <Input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                      />
                      <Label htmlFor="document-upload" asChild>
                        <Button disabled={uploading}>
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Upload Files'}
                        </Button>
                      </Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 text-sm font-medium grid grid-cols-12 gap-4">
                          <div className="col-span-6">Name</div>
                          <div className="col-span-2">Size</div>
                          <div className="col-span-3">Uploaded</div>
                          <div className="col-span-1 text-right">Actions</div>
                        </div>
                        <div className="divide-y">
                          {documents.map((doc) => (
                            <div key={doc.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center">
                              <div className="col-span-6 flex items-center">
                                {getFileIcon(doc.fileType)}
                                <div className="ml-2 min-w-0">
                                  <span className="truncate block font-medium">{doc.originalName}</span>
                                  {doc.appointment && (
                                    <span className="text-xs text-gray-500">
                                      For: {doc.appointment.service.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="col-span-2 text-sm text-gray-500">
                                {formatFileSize(doc.fileSize)}
                              </div>
                              <div className="col-span-3 text-sm text-gray-500">
                                {formatDate(doc.createdAt)}
                              </div>
                              <div className="col-span-1 flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleViewDocument(doc)}
                                  title="View document"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  title="Delete document"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">No documents uploaded yet</p>
                        <p className="text-gray-500 mt-1">Upload documents that you want to share with notaries</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500">
                    Supported file types: PDF, Images (JPG, PNG). Maximum file size: 10MB
                  </p>
                </CardFooter>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}