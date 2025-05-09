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

// Mock document data - would be fetched from an API in a real implementation
const MOCK_DOCUMENTS = [
  {
    id: '1',
    name: 'Passport Scan.pdf',
    type: 'application/pdf',
    size: '2.4 MB',
    uploadedAt: '2025-03-02T14:30:00Z'
  },
  {
    id: '2',
    name: 'Deed Document.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: '1.8 MB',
    uploadedAt: '2025-03-01T10:15:00Z'
  },
  {
    id: '3',
    name: 'Power of Attorney.pdf',
    type: 'application/pdf',
    size: '3.2 MB',
    uploadedAt: '2025-02-28T16:45:00Z'
  }
];

export default function CustomerDocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "CUSTOMER") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setLoading(true);
    
    // This would be replaced with an actual API call in a complete implementation
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new document entries from the files
      const newDocuments = Array.from(files).map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString()
      }));
      
      setDocuments(prev => [...newDocuments, ...prev]);
      toast.success(`${files.length} document${files.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (type.includes('word')) return <FileText className="h-6 w-6 text-blue-500" />;
    if (type.includes('image')) return <File className="h-6 w-6 text-green-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatDate = (dateString) => {
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
                        onChange={handleFileUpload}
                      />
                      <Label htmlFor="document-upload" asChild>
                        <Button disabled={loading}>
                          <Upload className="h-4 w-4 mr-2" />
                          {loading ? 'Uploading...' : 'Upload Files'}
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
                                {getFileIcon(doc.type)}
                                <span className="ml-2 truncate">{doc.name}</span>
                              </div>
                              <div className="col-span-2 text-sm text-gray-500">
                                {doc.size}
                              </div>
                              <div className="col-span-3 text-sm text-gray-500">
                                {formatDate(doc.uploadedAt)}
                              </div>
                              <div className="col-span-1 flex justify-end space-x-2">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteDocument(doc.id)}
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
                    Supported file types: PDF, Word, Images (JPG, PNG)
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