// src/app/dashboard/secretary/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LogOut, Bell, Shield, User, Save } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  appointmentReminders: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
}

export default function SecretarySettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: ""
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    appointmentReminders: true,
    systemUpdates: true,
    marketingEmails: false
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "SECRETARY") {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session.user) {
      setProfile({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: session.user.phone || ""
      });
    }
  }, [status, session]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (setting: keyof NotificationSettings, value: boolean) => {
    try {
      setNotifications(prev => ({ ...prev, [setting]: value }));
      
      const response = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [setting]: value,
        }),
      });

      if (response.ok) {
        toast.success("Notification settings updated");
      } else {
        toast.error("Failed to update notification settings");
        // Revert the change on error
        setNotifications(prev => ({ ...prev, [setting]: !value }));
      }
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error("Failed to update notification settings");
      setNotifications(prev => ({ ...prev, [setting]: !value }));
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "SECRETARY") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          userRole="secretary"
          userName={session.user.name}
          userEmail={session.user.email}
        />

        <div className="md:pl-64 flex flex-col flex-1">
          {/* Header */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <div className="flex flex-1 justify-between px-4 md:px-6">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Account Settings</h1>
              </div>
            </div>
          </div>

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and contact details
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleProfileUpdate}>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profile.email}
                              disabled
                              className="bg-muted"
                            />
                            <p className="text-sm text-muted-foreground">
                              Email cannot be changed. Contact support if needed.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              placeholder="(555) 123-4567"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Input
                              value="Secretary"
                              disabled
                              className="bg-muted"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit" disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </CardContent>
                    </form>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Manage how you receive notifications and updates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications via email
                            </p>
                          </div>
                          <Switch
                            checked={notifications.emailNotifications}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate("emailNotifications", checked)
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Appointment Reminders</Label>
                            <p className="text-sm text-muted-foreground">
                              Get reminders about upcoming appointments
                            </p>
                          </div>
                          <Switch
                            checked={notifications.appointmentReminders}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate("appointmentReminders", checked)
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>System Updates</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications about system updates and maintenance
                            </p>
                          </div>
                          <Switch
                            checked={notifications.systemUpdates}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate("systemUpdates", checked)
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Marketing Emails</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive promotional emails and feature updates
                            </p>
                          </div>
                          <Switch
                            checked={notifications.marketingEmails}
                            onCheckedChange={(checked) => 
                              handleNotificationUpdate("marketingEmails", checked)
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Password & Security</CardTitle>
                        <CardDescription>
                          Manage your account security settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Change Password</Label>
                          <Button variant="outline" className="w-full md:w-auto">
                            Update Password
                          </Button>
                          <p className="text-sm text-muted-foreground">
                            You will be redirected to change your password securely
                          </p>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label>Account Security</Label>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>✓ Email verified</p>
                            <p>✓ Strong password requirements enabled</p>
                            <p>✓ Account access monitored</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

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
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}