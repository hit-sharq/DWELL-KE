'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { showError, showSuccess } from '@/lib/errors';
import Link from 'next/link';

interface DocumentUpload {
  file: File | null;
  url: string | null;
  uploading: boolean;
  error: string | null;
}

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  kraPin: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

const REQUIRED_DOCUMENTS = [
  { key: 'nationalId', label: 'National ID or Passport', description: 'Government-issued identification document' },
  { key: 'titleDeed', label: 'Title Deed / Leasehold Certificate', description: 'Proof of property ownership' },
  { key: 'taxCompliance', label: 'Tax Compliance Certificate', description: 'Valid KRA tax compliance certificate' },
  { key: 'bankProof', label: 'Bank Account Proof', description: 'Bank statement or cancelled cheque' },
] as const;

const OPTIONAL_DOCUMENTS = [
  { key: 'managementAgreement', label: 'Property Management Agreement', description: 'If listed by an agent/agency' },
  { key: 'complianceCert', label: 'Local Authority Compliance', description: 'Zoning or building permits' },
  { key: 'safetyCert', label: 'Safety & Utility Certificates', description: 'Fire, electrical, or gas safety' },
  { key: 'leaseTemplate', label: 'Standard Lease Agreement', description: 'Your lease agreement template' },
] as const;

type DocumentKey = typeof REQUIRED_DOCUMENTS[number]['key'] | typeof OPTIONAL_DOCUMENTS[number]['key'];

export default function BecomeLandlordPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    kraPin: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
  });

  const [documents, setDocuments] = useState<Record<DocumentKey, DocumentUpload>>({
    nationalId: { file: null, url: null, uploading: false, error: null },
    titleDeed: { file: null, url: null, uploading: false, error: null },
    taxCompliance: { file: null, url: null, uploading: false, error: null },
    bankProof: { file: null, url: null, uploading: false, error: null },
    managementAgreement: { file: null, url: null, uploading: false, error: null },
    complianceCert: { file: null, url: null, uploading: false, error: null },
    safetyCert: { file: null, url: null, uploading: false, error: null },
    leaseTemplate: { file: null, url: null, uploading: false, error: null },
  });

  // Pre-fill user data when loaded
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadDocument = useCallback(async (key: DocumentKey, file: File) => {
    setDocuments(prev => ({
      ...prev,
      [key]: { ...prev[key], file, uploading: true, error: null },
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', key);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { url } = await response.json();

      setDocuments(prev => ({
        ...prev,
        [key]: { file, url, uploading: false, error: null },
      }));
    } catch (error) {
      showError(error);
      setDocuments(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          uploading: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        },
      }));
    }
  }, []);

  const handleFileChange = (key: DocumentKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setDocuments(prev => ({
          ...prev,
          [key]: { ...prev[key], error: 'File size must be less than 10MB' },
        }));
        return;
      }
      uploadDocument(key, file);
    }
  };

  const validateStep1 = () => {
    return formData.fullName && formData.email && formData.phoneNumber;
  };

  const validateStep2 = () => {
    return REQUIRED_DOCUMENTS.every(doc => documents[doc.key].url);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/landlord/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          nationalIdUrl: documents.nationalId.url,
          titleDeedUrl: documents.titleDeed.url,
          taxComplianceUrl: documents.taxCompliance.url,
          bankProofUrl: documents.bankProof.url,
          managementAgreementUrl: documents.managementAgreement.url,
          complianceCertUrl: documents.complianceCert.url,
          safetyCertUrl: documents.safetyCert.url,
          leaseTemplateUrl: documents.leaseTemplate.url,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit application');
      }

      showSuccess('Application submitted successfully! We will review your documents within 48-72 hours.');
      setSubmitSuccess(true);
    } catch (error) {
      showError(error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full glass">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>You need to be signed in to apply as a landlord</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sign-in">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-lg w-full glass-elevated">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl">Application Submitted!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your landlord application has been received. Our team will review your documents and get back to you within 48-72 hours via email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What happens next?</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Our team will verify your submitted documents</li>
                  <li>You will receive an email with the decision</li>
                  <li>If approved, you can access the Landlord Portal</li>
                  <li>If denied, you can reapply with corrected documents</li>
                </ul>
              </AlertDescription>
            </Alert>
            <Link href="/">
              <Button className="w-full" variant="outline">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-semibold">DWELL-KE</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
            <span className="text-sm text-muted-foreground">
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Required Documents'}
              {step === 3 && 'Review & Submit'}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Personal & Business Information</CardTitle>
              <CardDescription>
                Provide your details for verification purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="As per your ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name (Optional)</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="If registering as a business"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-medium mb-4">Tax & Banking Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="kraPin">KRA PIN *</Label>
                    <Input
                      id="kraPin"
                      name="kraPin"
                      value={formData.kraPin}
                      onChange={handleInputChange}
                      placeholder="A000000000X"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="e.g. Equity Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Account Number *</Label>
                    <Input
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleInputChange}
                      placeholder="Your bank account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountName">Account Name *</Label>
                    <Input
                      id="bankAccountName"
                      name="bankAccountName"
                      value={formData.bankAccountName}
                      onChange={handleInputChange}
                      placeholder="Name on bank account"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!validateStep1()}
                >
                  Continue to Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Document Uploads */}
        {step === 2 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Document Verification</CardTitle>
              <CardDescription>
                Upload the required documents for KYC verification. Accepted formats: PDF, JPG, PNG (max 10MB each)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Required Documents */}
              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <span className="text-destructive">*</span> Required Documents
                </h3>
                <div className="grid gap-4">
                  {REQUIRED_DOCUMENTS.map(doc => (
                    <DocumentUploadCard
                      key={doc.key}
                      docKey={doc.key}
                      label={doc.label}
                      description={doc.description}
                      document={documents[doc.key]}
                      onFileChange={handleFileChange(doc.key)}
                      required
                    />
                  ))}
                </div>
              </div>

              {/* Optional Documents */}
              <div className="border-t border-border pt-6">
                <h3 className="font-medium mb-4">Optional Documents</h3>
                <div className="grid gap-4">
                  {OPTIONAL_DOCUMENTS.map(doc => (
                    <DocumentUploadCard
                      key={doc.key}
                      docKey={doc.key}
                      label={doc.label}
                      description={doc.description}
                      document={documents[doc.key]}
                      onFileChange={handleFileChange(doc.key)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!validateStep2()}
                >
                  Review Application
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Review Your Application</CardTitle>
              <CardDescription>
                Please verify all information is correct before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Submission Failed</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* Personal Info Summary */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <h3 className="font-medium">Personal Information</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name</span>
                    <span>{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span>{formData.phoneNumber}</span>
                  </div>
                  {formData.businessName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business</span>
                      <span>{formData.businessName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KRA PIN</span>
                    <span>{formData.kraPin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank</span>
                    <span>{formData.bankName}</span>
                  </div>
                </div>
              </div>

              {/* Documents Summary */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <h3 className="font-medium">Uploaded Documents</h3>
                <div className="grid gap-2 text-sm">
                  {[...REQUIRED_DOCUMENTS, ...OPTIONAL_DOCUMENTS].map(doc => {
                    const docData = documents[doc.key];
                    if (!docData.url) return null;
                    return (
                      <div key={doc.key} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{doc.label}</span>
                        <span className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="h-3 w-3" />
                          Uploaded
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Terms */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Notice</AlertTitle>
                <AlertDescription className="text-sm">
                  By submitting this application, you confirm that all information provided is accurate and that you have the legal right to list properties on DWELL-KE. False information may result in account termination.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

// Document Upload Card Component
function DocumentUploadCard({
  docKey,
  label,
  description,
  document,
  onFileChange,
  required,
}: {
  docKey: string;
  label: string;
  description: string;
  document: DocumentUpload;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
          </h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {document.url && (
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        )}
      </div>

      {document.error && (
        <p className="text-sm text-destructive">{document.error}</p>
      )}

      <div className="flex items-center gap-3">
        <label
          htmlFor={docKey}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-3 
            border border-dashed border-border rounded-lg cursor-pointer
            hover:border-primary hover:bg-primary/5 transition-colors
            ${document.uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          {document.uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : document.url ? (
            <>
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm truncate max-w-[200px]">
                {document.file?.name || 'Document uploaded'}
              </span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span className="text-sm">Click to upload</span>
            </>
          )}
          <input
            id={docKey}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onFileChange}
            disabled={document.uploading}
          />
        </label>
      </div>
    </div>
  );
}
