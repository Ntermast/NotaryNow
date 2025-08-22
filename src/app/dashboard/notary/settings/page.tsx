// src/app/dashboard/notary/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { BellIcon, SettingsIcon, LogOut, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { FileUpload } from "@/components/ui/file-upload";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function NotarySettings() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [certificationDialog, setCertificationDialog] = useState({ open: false, certification: null });
    const [uploadingCert, setUploadingCert] = useState(false);
    const [selectedFile, setSelectedFile] = useState("");
    const [issueDate, setIssueDate] = useState("");

    // Handle tab from query params
    useEffect(() => {
        if (tabParam && ['profile', 'services', 'certifications', 'schedule'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    useEffect(() => {
        // Redirect if not authenticated or not a notary
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated" && session.user.role !== "NOTARY") {
            router.push(`/dashboard/${session.user.role.toLowerCase()}`);
        }
    }, [status, session, router]);

    useEffect(() => {
        async function fetchNotaryProfile() {
            if (status === "authenticated") {
                try {
                    // Fetch profile data
                    const profileResponse = await fetch("/api/notaries/profile");
                    if (!profileResponse.ok) throw new Error("Failed to fetch profile");
                    const profileData = await profileResponse.json();
                    setProfile(profileData);

                    // Fetch services
                    const servicesResponse = await fetch("/api/services");
                    if (!servicesResponse.ok) throw new Error("Failed to fetch services");
                    const servicesData = await servicesResponse.json();
                    setServices(servicesData);

                    // Fetch certifications
                    const certificationsResponse = await fetch("/api/certifications");
                    if (!certificationsResponse.ok) throw new Error("Failed to fetch certifications");
                    const certificationsData = await certificationsResponse.json();
                    setCertifications(certificationsData);

                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    setLoading(false);
                }
            }
        }

        fetchNotaryProfile();
    }, [status]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch("/api/notary/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    address: (profile as any)?.address,
                    city: (profile as any)?.city,
                    state: (profile as any)?.state,
                    zip: (profile as any)?.zip,
                    hourlyRate: (profile as any)?.hourlyRate,
                    bio: (profile as any)?.bio,
                }),
            });

            if (!response.ok) throw new Error("Failed to update profile");

            toast.success("Your profile has been successfully updated");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("There was an error updating your profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleServiceToggle = async (serviceId: string, isChecked: boolean) => {
        try {
            const method = isChecked ? "POST" : "DELETE";

            const response = await fetch(`/api/notary/services/${serviceId}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error(`Failed to ${isChecked ? 'add' : 'remove'} service`);

            // Update the UI
            setProfile((prev: any) => ({
                ...prev,
                notaryServices: isChecked
                    ? [...(prev?.notaryServices || []), { serviceId }]
                    : prev?.notaryServices?.filter((s: any) => s.serviceId !== serviceId)
            }));

            toast.success(`The service has been ${isChecked ? 'added to' : 'removed from'} your profile`);
        } catch (error) {
            console.error("Error toggling service:", error);
            toast.error(`Failed to ${isChecked ? 'add' : 'remove'} the service`);
        }
    };

    function openCertificationDialog(certification: any) {
        const existingCert = (profile as any)?.certifications?.find((c: any) => c.certificationId === certification.id);
        setCertificationDialog({
            open: true,
            certification: {
                ...certification,
                existing: existingCert,
                documentUrl: existingCert?.documentUrl || "",
                dateObtained: existingCert?.dateObtained || ""
            }
        });
        setSelectedFile(existingCert?.documentUrl || "");
        setIssueDate(existingCert?.dateObtained ? new Date(existingCert.dateObtained).toISOString().split('T')[0] : "");
    }

    async function handleCertificationSubmit() {
        if (!certificationDialog.certification || !selectedFile || !issueDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        setUploadingCert(true);
        try {
            const method = (certificationDialog.certification as any)?.existing ? 'PATCH' : 'POST';
            const url = (certificationDialog.certification as any)?.existing
                ? `/api/notaries/certifications/${(certificationDialog.certification as any).existing.id}`
                : '/api/notaries/certifications';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    certificationId: (certificationDialog.certification as any)?.id,
                    documentUrl: selectedFile,
                    dateObtained: issueDate
                }),
            });

            if (response.ok) {
                const updatedCert = await response.json();

                // Update the profile state
                setProfile((prev: any) => {
                    const updatedCertifications = prev?.certifications || [];
                    const existingIndex = updatedCertifications.findIndex((c: any) => c.certificationId === (certificationDialog.certification as any)?.id);

                    if (existingIndex >= 0) {
                        updatedCertifications[existingIndex] = updatedCert;
                    } else {
                        updatedCertifications.push(updatedCert);
                    }

                    return {
                        ...prev,
                        certifications: updatedCertifications
                    };
                });

                toast.success("Certification saved successfully");
                setCertificationDialog({ open: false, certification: null });
                setSelectedFile("");
                setIssueDate("");
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to save certification");
            }
        } catch (error) {
            console.error('Error saving certification:', error);
            toast.error("Failed to save certification");
        } finally {
            setUploadingCert(false);
        }
    }

    function handleFileUpload(fileUrl: string) {
        setSelectedFile(fileUrl);
    }

    if (status === "loading" || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (status === "authenticated" && session.user.role === "NOTARY" && profile) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar
                    userRole="notary"
                    userName={session.user.name}
                    userEmail={session.user.email}
                />

                <div className="md:pl-64 flex flex-col flex-1">
                    {/* Top navbar */}
                    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
                        <div className="flex flex-1 justify-between px-4 md:px-6">
                            <div className="flex items-center">
                                <h1 className="text-xl font-semibold">Account Settings</h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm">
                                    <BellIcon className="h-4 w-4 mr-2" />
                                    Notifications
                                </Button>
                                <Button variant="outline" size="icon">
                                    <SettingsIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Settings content */}
                    <main className="flex-1 pb-8">
                        <div className="mt-8 px-4 sm:px-6 lg:px-8">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="mb-6">
                                    <TabsTrigger value="profile">Profile</TabsTrigger>
                                    <TabsTrigger value="services">Services</TabsTrigger>
                                    <TabsTrigger value="certifications">Certifications</TabsTrigger>
                                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                                </TabsList>

                                <TabsContent value="profile">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Profile Information</CardTitle>
                                            <CardDescription>
                                                Update your profile information and address
                                            </CardDescription>
                                        </CardHeader>
                                        <form onSubmit={handleProfileUpdate}>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="address">Address</Label>
                                                        <Input
                                                            id="address"
                                                            value={(profile as any)?.address || ''}
                                                            onChange={(e) =>
                                                                setProfile({ ...(profile as any), address: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="city">City</Label>
                                                        <Input
                                                            id="city"
                                                            value={(profile as any)?.city || ''}
                                                            onChange={(e) =>
                                                                setProfile({ ...(profile as any), city: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="state">State</Label>
                                                        <Input
                                                            id="state"
                                                            value={(profile as any)?.state || ''}
                                                            onChange={(e) =>
                                                                setProfile({ ...(profile as any), state: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="zip">ZIP Code</Label>
                                                        <Input
                                                            id="zip"
                                                            value={(profile as any)?.zip || ''}
                                                            onChange={(e) =>
                                                                setProfile({ ...(profile as any), zip: e.target.value })
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                                                    <Input
                                                        id="hourlyRate"
                                                        type="number"
                                                        value={(profile as any)?.hourlyRate || ''}
                                                        onChange={(e) =>
                                                            setProfile({
                                                                ...(profile as any),
                                                                hourlyRate: parseFloat(e.target.value),
                                                            })
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="bio">Bio</Label>
                                                    <Textarea
                                                        id="bio"
                                                        value={(profile as any)?.bio || ""}
                                                        onChange={(e) =>
                                                            setProfile({ ...(profile as any), bio: e.target.value })
                                                        }
                                                        rows={4}
                                                        placeholder="Tell customers about your experience and expertise"
                                                    />
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button type="submit" disabled={isSaving}>
                                                    {isSaving ? "Saving..." : "Save Changes"}
                                                </Button>
                                            </CardFooter>
                                        </form>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="services">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Services Offered</CardTitle>
                                            <CardDescription>
                                                Select the services you provide to customers
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {services.map((service) => (
                                                    <div key={service.id} className="flex items-start space-x-3">
                                                        <Checkbox
                                                            id={`service-${service.id}`}
                                                            checked={profile.notaryServices.some(
                                                                (s) => s.serviceId === service.id
                                                            )}
                                                            onCheckedChange={(checked) =>
                                                                handleServiceToggle(service.id, checked === true)
                                                            }
                                                        />
                                                        <div className="grid gap-1.5">
                                                            <Label
                                                                htmlFor={`service-${service.id}`}
                                                                className="font-medium"
                                                            >
                                                                {service.name} - ${service.basePrice}
                                                            </Label>
                                                            <p className="text-sm text-gray-500">
                                                                {service.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="certifications">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Certifications & Licenses</CardTitle>
                                            <CardDescription>
                                                Manage your professional certifications
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {certifications.map((cert) => (
                                                    <div key={cert.id} className="border rounded-lg p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="font-medium">{cert.name}</h3>
                                                                <p className="text-sm text-gray-500">
                                                                    {cert.description}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => openCertificationDialog(cert)}
                                                                >
                                                                    {profile.certifications.some(
                                                                        (c) => c.certificationId === cert.id
                                                                    )
                                                                        ? "Update"
                                                                        : "Add"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {profile.certifications.some(
                                                            (c) => c.certificationId === cert.id
                                                        ) && (
                                                                <div className="mt-3 pt-3 border-t">
                                                                    <p className="text-sm">
                                                                        <span className="font-medium">
                                                                            Issued on:{" "}
                                                                        </span>
                                                                        {new Date(
                                                                            profile.certifications.find(
                                                                                (c) => c.certificationId === cert.id
                                                                            ).dateObtained
                                                                        ).toLocaleDateString()}
                                                                    </p>
                                                                    {profile.certifications.find(
                                                                        (c) => c.certificationId === cert.id
                                                                    ).documentUrl && (
                                                                            <p className="text-sm mt-1">
                                                                                <a
                                                                                    href={profile.certifications.find(
                                                                                        (c) => c.certificationId === cert.id
                                                                                    ).documentUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-primary hover:underline flex items-center gap-1"
                                                                                >
                                                                                    <FileText className="h-3 w-3" />
                                                                                    View Document
                                                                                </a>
                                                                            </p>
                                                                        )}
                                                                </div>
                                                            )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button 
                                                variant="outline"
                                                onClick={() => setCertificationDialog({ open: true, certification: null })}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload New Certification
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="schedule">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Availability Schedule</CardTitle>
                                            <CardDescription>
                                                Set your working hours and availability
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {/* Days of the week */}
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                    <div key={day} className="border rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center space-x-3">
                                                                <Checkbox id={`available-${day.toLowerCase()}`} />
                                                                <Label htmlFor={`available-${day.toLowerCase()}`} className="font-medium">
                                                                    {day}
                                                                </Label>
                                                            </div>
                                                            <div>
                                                                <Button variant="outline" size="sm">
                                                                    Add Time Slot
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Time slots - In a real app, these would be dynamically rendered based on stored schedule */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="flex space-x-3 items-center border rounded p-2">
                                                                <div className="flex-1">
                                                                    <span className="text-sm font-medium">9:00 AM - 12:00 PM</span>
                                                                </div>
                                                                <Button variant="ghost" size="sm" className="text-red-500 h-8 w-8 p-0">
                                                                    ×
                                                                </Button>
                                                            </div>
                                                            <div className="flex space-x-3 items-center border rounded p-2">
                                                                <div className="flex-1">
                                                                    <span className="text-sm font-medium">1:00 PM - 5:00 PM</span>
                                                                </div>
                                                                <Button variant="ghost" size="sm" className="text-red-500 h-8 w-8 p-0">
                                                                    ×
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button type="button">Save Schedule</Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>

                                {/* Account Actions */}
                                <div className="mt-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Account Actions</CardTitle>
                                            <CardDescription>
                                                Manage your account settings
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button variant="destructive" onClick={handleLogout}>
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Sign Out
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </Tabs>
                        </div>
                    </main>
                </div>

                {/* Certification Dialog */}
                <Dialog open={certificationDialog.open} onOpenChange={(open) =>
                    setCertificationDialog({ open, certification: open ? certificationDialog.certification : null })
                }>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>
                                {(certificationDialog.certification as any)?.existing ? 'Update' : 'Add'} Certification
                            </DialogTitle>
                            <DialogDescription>
                                {(certificationDialog.certification as any)?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="issue-date">Issue Date</Label>
                                <Input
                                    id="issue-date"
                                    type="date"
                                    value={issueDate}
                                    onChange={(e) => setIssueDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <FileUpload
                                    onFileUpload={handleFileUpload}
                                    certificationId={(certificationDialog.certification as any)?.id || ""}
                                    currentFile={selectedFile}
                                    disabled={uploadingCert}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setCertificationDialog({ open: false, certification: null })}
                                disabled={uploadingCert}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCertificationSubmit}
                                disabled={uploadingCert || !selectedFile || !issueDate}
                            >
                                {uploadingCert ? 'Saving...' : 'Save Certification'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return null;
}
