'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingData {
  // Profile Information
  address: string;
  city: string;
  state: string;
  zip: string;
  hourlyRate: number;
  bio: string;
  notaryType: 'PUBLIC' | 'PRIVATE';
  // Services
  selectedServices: string[];
  // Certifications
  certifications: Array<{
    certificationId: string;
    dateObtained: string;
    documentUrl?: string;
  }>;
  // Additional info
  experience: string;
  languages: string[];
}

function NotaryOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [availableCertifications, setAvailableCertifications] = useState([]);
  const [uploadingCertifications, setUploadingCertifications] = useState<Record<string, boolean>>({});
  const [certificationUploadErrors, setCertificationUploadErrors] = useState<Record<string, string | null>>({});
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    address: '',
    city: '',
    state: '',
    zip: '',
    hourlyRate: 50000, // Default rate in RWF
    bio: '',
    notaryType: 'PRIVATE',
    selectedServices: [],
    certifications: [],
    experience: '',
    languages: ['English']
  });

  const totalSteps = 4;

  useEffect(() => {
    const step = searchParams.get('step');
    if (step) {
      setCurrentStep(parseInt(step));
    }
  }, [searchParams]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/notary/onboarding");
    }
  }, [status, router]);

  // Fetch services and certifications
  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesResponse, certificationsResponse] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/certifications')
        ]);

        if (servicesResponse.ok) {
          const services = await servicesResponse.json();
          setAvailableServices(services);
        }

        if (certificationsResponse.ok) {
          const certifications = await certificationsResponse.json();
          setAvailableCertifications(certifications);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const updateOnboardingData = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const handleCertificationAdd = (certId: string) => {
    const existing = onboardingData.certifications.find(c => c.certificationId === certId);
    if (!existing) {
      setOnboardingData(prev => ({
        ...prev,
        certifications: [...prev.certifications, {
          certificationId: certId,
          dateObtained: '',
          documentUrl: ''
        }]
      }));
      setUploadingCertifications(prev => ({ ...prev, [certId]: false }));
      setCertificationUploadErrors(prev => ({ ...prev, [certId]: null }));
    }
  };

  const handleCertificationUpdate = (certId: string, field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.certificationId === certId
          ? { ...cert, [field]: value }
          : cert
      )
    }));
  };

  const handleCertificationDocumentUpload = async (certId: string, file: File) => {
    if (!file) return;

    setUploadingCertifications(prev => ({ ...prev, [certId]: true }));
    setCertificationUploadErrors(prev => ({ ...prev, [certId]: null }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("certificationId", certId);

      const response = await fetch("/api/upload/certifications", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload document");
      }

      const data = await response.json();
      handleCertificationUpdate(certId, "documentUrl", data.fileUrl);
      toast.success("Document uploaded successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload document";
      setCertificationUploadErrors(prev => ({ ...prev, [certId]: message }));
      toast.error(message);
    } finally {
      setUploadingCertifications(prev => ({ ...prev, [certId]: false }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      router.push(`/notary/onboarding?step=${currentStep + 1}`);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      router.push(`/notary/onboarding?step=${currentStep - 1}`);
    }
  };

  const handleSubmitOnboarding = async () => {
    setLoading(true);
    try {
      // Update notary profile
      const profileResponse = await fetch('/api/notaries/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: onboardingData.address,
          city: onboardingData.city,
          state: onboardingData.state,
          zip: onboardingData.zip,
          hourlyRate: onboardingData.hourlyRate,
          bio: onboardingData.bio,
          notaryType: onboardingData.notaryType,
        }),
      });

      if (!profileResponse.ok) throw new Error('Failed to update profile');

      // Add services
      for (const serviceId of onboardingData.selectedServices) {
        const response = await fetch(`/api/notaries/services/${serviceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok && response.status !== 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to assign service');
        }
      }

      // Add certifications
      for (const cert of onboardingData.certifications) {
        const response = await fetch(`/api/notaries/certifications/${cert.certificationId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dateObtained: cert.dateObtained ? new Date(cert.dateObtained).toISOString() : null,
            documentUrl: cert.documentUrl || undefined
          }),
        });

        if (!response.ok && response.status !== 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to attach certification');
        }
      }

      toast.success('Profile submitted for review! You will be notified once approved.');
      router.push('/auth/signin?message=onboarding-complete');
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast.error('Failed to submit profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Notary Profile</h1>
          <p className="text-gray-600">Fill out all required information for admin approval</p>
          <div className="mt-4">
            <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">Step {currentStep} of {totalSteps}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Services Offered"}
              {currentStep === 3 && "Certifications"}
              {currentStep === 4 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your location and experience"}
              {currentStep === 2 && "Select the services you can provide"}
              {currentStep === 3 && "Add your professional certifications"}
              {currentStep === 4 && "Review your information before submitting"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={onboardingData.city}
                      onChange={(e) => updateOnboardingData('city', e.target.value)}
                      placeholder="Kigali"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Province/State *</Label>
                    <Input
                      id="state"
                      value={onboardingData.state}
                      onChange={(e) => updateOnboardingData('state', e.target.value)}
                      placeholder="Kigali City"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notaryType">Notary Type *</Label>
                  <Select
                    value={onboardingData.notaryType}
                    onValueChange={(value: 'PUBLIC' | 'PRIVATE') =>
                      updateOnboardingData('notaryType', value)
                    }
                  >
                    <SelectTrigger id="notaryType" className="mt-1">
                      <SelectValue placeholder="Select notary type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public Notary</SelectItem>
                      <SelectItem value="PRIVATE">Private Notary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    value={onboardingData.address}
                    onChange={(e) => updateOnboardingData('address', e.target.value)}
                    placeholder="KG 15 Ave, Kimihurura"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="zip">Postal Code</Label>
                  <Input
                    id="zip"
                    value={onboardingData.zip}
                    onChange={(e) => updateOnboardingData('zip', e.target.value)}
                    placeholder="00000"
                  />
                </div>

                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (RWF) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={onboardingData.hourlyRate}
                    onChange={(e) => updateOnboardingData('hourlyRate', parseFloat(e.target.value))}
                    placeholder="50000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    value={onboardingData.bio}
                    onChange={(e) => updateOnboardingData('bio', e.target.value)}
                    placeholder="Tell potential clients about your experience, specializations, and approach to notary services..."
                    className="h-32"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Services */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select all services you can provide. Each request will be reviewed and approved by
                  an administrator before it becomes visible to customers.
                </p>
                <div className="grid gap-3">
                  {availableServices.map((service: any) => (
                    <div key={service.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={service.id}
                        checked={onboardingData.selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={service.id} className="font-medium">{service.name}</Label>
                        <p className="text-sm text-gray-500">{service.description}</p>
                        <p className="text-sm font-medium">Base Price: {service.basePrice.toLocaleString()} RWF</p>
                      </div>
                    </div>
                  ))}
                </div>
                {onboardingData.selectedServices.length === 0 && (
                  <p className="text-sm text-red-600">Please select at least one service.</p>
                )}
              </div>
            )}

            {/* Step 3: Certifications */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Add your professional certifications:</p>
                <div className="space-y-3">
                  {availableCertifications.map((cert: any) => (
                    <div key={cert.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{cert.name}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCertificationAdd(cert.id)}
                          disabled={onboardingData.certifications.some(c => c.certificationId === cert.id)}
                        >
                          {onboardingData.certifications.some(c => c.certificationId === cert.id) ? 'Added' : 'Add'}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{cert.description}</p>

                      {onboardingData.certifications.some(c => c.certificationId === cert.id) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <Label className="text-sm">Date Obtained</Label>
                          <Input
                            type="date"
                            value={onboardingData.certifications.find(c => c.certificationId === cert.id)?.dateObtained || ''}
                            onChange={(e) => handleCertificationUpdate(cert.id, 'dateObtained', e.target.value)}
                            className="mt-1"
                          />
                          <Label className="text-sm mt-4 block">Upload Supporting Document</Label>
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleCertificationDocumentUpload(cert.id, file);
                              }
                            }}
                            className="mt-1"
                            disabled={uploadingCertifications[cert.id]}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Accepted formats: PDF, JPG, PNG. Max size 5MB.
                          </p>
                          {uploadingCertifications[cert.id] && (
                            <p className="text-xs text-blue-600 mt-1">Uploading...</p>
                          )}
                          {certificationUploadErrors[cert.id] && (
                            <p className="text-xs text-red-600 mt-1">
                              {certificationUploadErrors[cert.id]}
                            </p>
                          )}
                          {onboardingData.certifications.find(c => c.certificationId === cert.id)?.documentUrl && !uploadingCertifications[cert.id] && (
                            <p className="text-xs text-green-600 mt-1">
                              Document uploaded successfully.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {onboardingData.certifications.length === 0 && (
                  <p className="text-sm text-amber-600">Consider adding certifications to strengthen your profile.</p>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Important Information</h4>
                  <p className="text-sm text-blue-700">
                    After submitting your profile, it will be reviewed by our admin team. You will receive an email notification once your account is approved and you can start accepting appointments.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Profile Information</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <p><strong>Location:</strong> {onboardingData.address}, {onboardingData.city}, {onboardingData.state}</p>
                      <p><strong>Hourly Rate:</strong> {onboardingData.hourlyRate.toLocaleString()} RWF</p>
                      <p><strong>Bio:</strong> {onboardingData.bio}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Services ({onboardingData.selectedServices.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.selectedServices.map(serviceId => {
                        const service = availableServices.find((s: any) => s.id === serviceId);
                        return service ? (
                          <Badge key={serviceId} variant="secondary">{(service as any).name}</Badge>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Certifications ({onboardingData.certifications.length})</h4>
                    <div className="space-y-2">
                      {onboardingData.certifications.map(cert => {
                        const certification = availableCertifications.find((c: any) => c.id === cert.certificationId);
                        return certification ? (
                          <div key={cert.certificationId} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{(certification as any).name}</span>
                            {cert.dateObtained && (
                              <span className="text-gray-500">
                                ({new Date(cert.dateObtained).toLocaleDateString()})
                              </span>
                            )}
                            {cert.documentUrl && (
                              <Badge variant="outline" className="text-xs">
                                Document uploaded
                              </Badge>
                            )}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!onboardingData.city || !onboardingData.state || !onboardingData.address || !onboardingData.bio)) ||
                    (currentStep === 2 && onboardingData.selectedServices.length === 0)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmitOnboarding}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NotaryOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <NotaryOnboardingContent />
    </Suspense>
  );
}
