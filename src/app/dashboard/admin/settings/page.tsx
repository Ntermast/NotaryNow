// src/app/dashboard/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Bell, 
  FileText, 
  Database,
  AlertTriangle,
  Save,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { toast } from "sonner";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  autoApproveNotaries: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  timezone: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  newUserRegistration: boolean;
  appointmentUpdates: boolean;
  systemAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: "NotaryAvailability",
    siteDescription: "Professional notary services platform",
    contactEmail: "contact@notarynow.com",
    supportEmail: "support@notarynow.com",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    autoApproveNotaries: false,
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "jpg", "jpeg", "png"],
    sessionTimeout: 1440,
    timezone: "America/New_York"
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    newUserRegistration: true,
    appointmentUpdates: true,
    systemAlerts: true,
    weeklyReports: true,
    monthlyReports: false
  });

  const [services, setServices] = useState([
    { id: "1", name: "Deed Notarization", basePrice: 25.00, description: "Real estate document notarization" },
    { id: "2", name: "Power of Attorney", basePrice: 30.00, description: "Legal power of attorney documents" },
    { id: "3", name: "Mortgage Signing", basePrice: 150.00, description: "Mortgage and loan document signing" }
  ]);

  const [newService, setNewService] = useState({ name: "", basePrice: 0, description: "" });
  const [editingService, setEditingService] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      // In a real app, these would be fetched from APIs
      setLoading(false);
    }
  }, [status]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("General settings saved successfully");
    } catch (error) {
      toast.error("Failed to save general settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.basePrice || !newService.description) {
      toast.error("Please fill in all service fields");
      return;
    }

    try {
      // Simulate API call
      const serviceData = {
        id: Date.now().toString(),
        ...newService
      };
      setServices([...services, serviceData]);
      setNewService({ name: "", basePrice: 0, description: "" });
      toast.success("Service added successfully");
    } catch (error) {
      toast.error("Failed to add service");
    }
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    try {
      setServices(services.map(s => 
        s.id === editingService.id ? editingService : s
      ));
      setEditingService(null);
      toast.success("Service updated successfully");
    } catch (error) {
      toast.error("Failed to update service");
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      setServices(services.filter(s => s.id !== serviceId));
      toast.success("Service deleted successfully");
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "ADMIN") {
    return (
      <>
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">System Settings</h1>
              </div>
            </div>
          </div>

          <main className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="general">
                  <Settings className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="services">
                  <FileText className="h-4 w-4 mr-2" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="system">
                  <Database className="h-4 w-4 mr-2" />
                  System
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Manage basic site configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                          id="siteName"
                          value={systemSettings.siteName}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            siteName: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={systemSettings.timezone}
                          onValueChange={(value) => setSystemSettings({
                            ...systemSettings,
                            timezone: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        value={systemSettings.siteDescription}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          siteDescription: e.target.value
                        })}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={systemSettings.contactEmail}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            contactEmail: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supportEmail">Support Email</Label>
                        <Input
                          id="supportEmail"
                          type="email"
                          value={systemSettings.supportEmail}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            supportEmail: e.target.value
                          })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveGeneral} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Security & Access</CardTitle>
                    <CardDescription>Configure security settings and user access</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow User Registration</Label>
                        <p className="text-sm text-gray-500">Enable new users to register accounts</p>
                      </div>
                      <Switch
                        checked={systemSettings.allowRegistration}
                        onCheckedChange={(checked) => setSystemSettings({
                          ...systemSettings,
                          allowRegistration: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Email Verification</Label>
                        <p className="text-sm text-gray-500">Users must verify their email address</p>
                      </div>
                      <Switch
                        checked={systemSettings.requireEmailVerification}
                        onCheckedChange={(checked) => setSystemSettings({
                          ...systemSettings,
                          requireEmailVerification: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-approve Notaries</Label>
                        <p className="text-sm text-gray-500">Automatically approve new notary applications</p>
                      </div>
                      <Switch
                        checked={systemSettings.autoApproveNotaries}
                        onCheckedChange={(checked) => setSystemSettings({
                          ...systemSettings,
                          autoApproveNotaries: checked
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={systemSettings.sessionTimeout}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          sessionTimeout: parseInt(e.target.value) || 1440
                        })}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveGeneral} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Security Settings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Configure system-wide notification settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">Enable system email notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>New User Registration</Label>
                        <p className="text-sm text-gray-500">Notify when new users register</p>
                      </div>
                      <Switch
                        checked={notificationSettings.newUserRegistration}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          newUserRegistration: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Appointment Updates</Label>
                        <p className="text-sm text-gray-500">Notify on appointment status changes</p>
                      </div>
                      <Switch
                        checked={notificationSettings.appointmentUpdates}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          appointmentUpdates: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Alerts</Label>
                        <p className="text-sm text-gray-500">Critical system notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.systemAlerts}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          systemAlerts: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weekly Reports</Label>
                        <p className="text-sm text-gray-500">Send weekly summary reports</p>
                      </div>
                      <Switch
                        checked={notificationSettings.weeklyReports}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          weeklyReports: checked
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Monthly Reports</Label>
                        <p className="text-sm text-gray-500">Send monthly analytics reports</p>
                      </div>
                      <Switch
                        checked={notificationSettings.monthlyReports}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          monthlyReports: checked
                        })}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveNotifications} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Notification Settings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Management</CardTitle>
                    <CardDescription>Manage available notary services and pricing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add New Service */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-medium mb-4">Add New Service</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Input
                          placeholder="Service name"
                          value={newService.name}
                          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        />
                        <Input
                          type="number"
                          placeholder="Base price"
                          value={newService.basePrice || ""}
                          onChange={(e) => setNewService({ ...newService, basePrice: parseFloat(e.target.value) || 0 })}
                        />
                        <Button onClick={handleAddService}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Service description"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        rows={2}
                      />
                    </div>

                    {/* Existing Services */}
                    <div className="space-y-3">
                      {services.map((service) => (
                        <div key={service.id} className="border rounded-lg p-4">
                          {editingService?.id === service.id ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                  value={editingService.name}
                                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                />
                                <Input
                                  type="number"
                                  value={editingService.basePrice}
                                  onChange={(e) => setEditingService({ ...editingService, basePrice: parseFloat(e.target.value) })}
                                />
                              </div>
                              <Textarea
                                value={editingService.description}
                                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleUpdateService}>
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingService(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">{service.name}</h3>
                                  <Badge variant="secondary">${service.basePrice.toFixed(2)}</Badge>
                                </div>
                                <p className="text-sm text-gray-600">{service.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingService(service)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteService(service.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                    <CardDescription>Advanced system settings and maintenance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Maintenance Mode
                        </Label>
                        <p className="text-sm text-gray-500">Temporarily disable site access for maintenance</p>
                      </div>
                      <Switch
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) => setSystemSettings({
                          ...systemSettings,
                          maintenanceMode: checked
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        value={systemSettings.maxFileSize}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          maxFileSize: parseInt(e.target.value) || 10
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Allowed File Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {systemSettings.allowedFileTypes.map((type, index) => (
                          <Badge key={index} variant="secondary">
                            {type.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Contact developer to modify allowed file types</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-medium text-gray-900">System Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Version</Label>
                          <p className="text-sm text-gray-600">v1.0.0</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Database</Label>
                          <p className="text-sm text-gray-600">SQLite</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Last Backup</Label>
                          <p className="text-sm text-gray-600">2024-01-15 03:00 AM</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Uptime</Label>
                          <p className="text-sm text-gray-600">15 days, 8 hours</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveGeneral} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save System Settings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
      </>
    );
  }

  return null;
}