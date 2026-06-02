'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminNav } from '@/components/AdminNav';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  Search,
  AlertCircle,
  ExternalLink,
  User,
  Phone,
  Mail,
  Building2,
  CreditCard,
} from 'lucide-react';
import { showError, showSuccess } from '@/lib/errors';

interface LandlordApplication {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  businessName: string | null;
  kraPin: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  nationalIdUrl: string | null;
  titleDeedUrl: string | null;
  managementAgreementUrl: string | null;
  complianceCertUrl: string | null;
  safetyCertUrl: string | null;
  taxComplianceUrl: string | null;
  bankProofUrl: string | null;
  leaseTemplateUrl: string | null;
  status: 'pending' | 'under_review' | 'approved' | 'denied';
  reviewNotes: string | null;
  denialReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Eye },
  approved: { label: 'Approved', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
  denied: { label: 'Denied', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: XCircle },
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<LandlordApplication[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedApp, setSelectedApp] = useState<LandlordApplication | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'deny' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      
      const response = await fetch(`/api/admin/applications?${params}`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleReview = async () => {
    if (!selectedApp || !reviewAction) return;
    
    if (reviewAction === 'deny' && !denialReason.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          action: reviewAction,
          reviewNotes: reviewNotes.trim() || null,
          denialReason: reviewAction === 'deny' ? denialReason.trim() : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to review application');
      }

      // Refresh the list
      await fetchApplications();
      
      showSuccess(`Application ${reviewAction === 'approve' ? 'approved' : 'denied'} successfully`);
      
      // Close dialog and reset
      setShowReviewDialog(false);
      setSelectedApp(null);
      setReviewAction(null);
      setReviewNotes('');
      setDenialReason('');
    } catch (error) {
      console.error('Error reviewing application:', error);
      showError('Failed to process application');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.fullName.toLowerCase().includes(query) ||
      app.email.toLowerCase().includes(query) ||
      app.phoneNumber.includes(query)
    );
  });

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="ml-0 lg:ml-64 py-6 lg:py-10 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl lg:text-4xl font-serif font-black text-white">
                Landlord Applications
              </h1>
              <p className="text-gray-400 mt-1 lg:mt-2 text-sm lg:text-base">
                Review and manage landlord verification requests
              </p>
            </div>
            {pendingCount > 0 && (
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 self-start sm:self-auto">
                {pendingCount} Pending Review
              </Badge>
            )}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassmorphicCard className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </GlassmorphicCard>
          </motion.div>

          {/* Applications List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <GlassmorphicCard className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Applications Found</h3>
                <p className="text-muted-foreground">
                  {statusFilter !== 'all' 
                    ? `No ${statusFilter} applications at the moment.`
                    : 'There are no landlord applications yet.'}
                </p>
              </GlassmorphicCard>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app, index) => {
                  const statusConfig = STATUS_CONFIG[app.status];
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlassmorphicCard className="p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Applicant Info */}
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-white text-lg truncate">{app.fullName}</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1 truncate">
                                  <Mail className="h-3 w-3 shrink-0" />
                                  {app.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 shrink-0" />
                                  {app.phoneNumber}
                                </span>
                              </div>
                              {app.businessName && (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <Building2 className="h-3 w-3" />
                                  {app.businessName}
                                </span>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Applied: {new Date(app.createdAt).toLocaleDateString('en-KE', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Status & Actions */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                            <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedApp(app)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {(app.status === 'pending' || app.status === 'under_review') && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setReviewAction('approve');
                                      setShowReviewDialog(true);
                                    }}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setReviewAction('deny');
                                      setShowReviewDialog(true);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Deny
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </GlassmorphicCard>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* View Application Dialog */}
      <Dialog open={!!selectedApp && !showReviewDialog} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Application Details
                  <Badge variant="outline" className={STATUS_CONFIG[selectedApp.status].color}>
                    {STATUS_CONFIG[selectedApp.status].label}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Submitted on {new Date(selectedApp.createdAt).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" /> Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Full Name</span>
                      <p className="font-medium">{selectedApp.fullName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email</span>
                      <p className="font-medium">{selectedApp.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone</span>
                      <p className="font-medium">{selectedApp.phoneNumber}</p>
                    </div>
                    {selectedApp.businessName && (
                      <div>
                        <span className="text-muted-foreground">Business Name</span>
                        <p className="font-medium">{selectedApp.businessName}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Financial Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">KRA PIN</span>
                      <p className="font-medium">{selectedApp.kraPin || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bank</span>
                      <p className="font-medium">{selectedApp.bankName || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Account Number</span>
                      <p className="font-medium">{selectedApp.bankAccountNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Account Name</span>
                      <p className="font-medium">{selectedApp.bankAccountName || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Uploaded Documents
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { label: 'National ID', url: selectedApp.nationalIdUrl },
                      { label: 'Title Deed', url: selectedApp.titleDeedUrl },
                      { label: 'Tax Compliance', url: selectedApp.taxComplianceUrl },
                      { label: 'Bank Proof', url: selectedApp.bankProofUrl },
                      { label: 'Management Agreement', url: selectedApp.managementAgreementUrl },
                      { label: 'Compliance Cert', url: selectedApp.complianceCertUrl },
                      { label: 'Safety Cert', url: selectedApp.safetyCertUrl },
                      { label: 'Lease Template', url: selectedApp.leaseTemplateUrl },
                    ].map(doc => (
                      <div
                        key={doc.label}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          doc.url ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-border bg-muted/30'
                        }`}
                      >
                        <span className="text-sm">{doc.label}</span>
                        {doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-sm"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not uploaded</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Info (if reviewed) */}
                {selectedApp.reviewedAt && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-semibold">Review Information</h4>
                    <div className="text-sm space-y-2">
                      <p>
                        <span className="text-muted-foreground">Reviewed:</span>{' '}
                        {new Date(selectedApp.reviewedAt).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {selectedApp.reviewNotes && (
                        <p>
                          <span className="text-muted-foreground">Notes:</span>{' '}
                          {selectedApp.reviewNotes}
                        </p>
                      )}
                      {selectedApp.denialReason && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2">
                          <span className="text-red-400 font-medium">Denial Reason:</span>
                          <p className="mt-1">{selectedApp.denialReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {(selectedApp.status === 'pending' || selectedApp.status === 'under_review') && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setReviewAction('deny');
                        setShowReviewDialog(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Deny Application
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        setReviewAction('approve');
                        setShowReviewDialog(true);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve Application
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Confirmation Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Application' : 'Deny Application'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? `This will grant ${selectedApp?.fullName} landlord access to the platform.`
                : `This will deny ${selectedApp?.fullName}'s application. They will be notified via email.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Review Notes (Optional)</label>
              <Textarea
                placeholder="Add any internal notes about this decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={2}
              />
            </div>

            {reviewAction === 'deny' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Denial Reason <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="Explain why the application is being denied. This will be sent to the applicant."
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  rows={3}
                  className={!denialReason.trim() ? 'border-destructive' : ''}
                />
                {!denialReason.trim() && (
                  <p className="text-xs text-destructive">Denial reason is required</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={submitting || (reviewAction === 'deny' && !denialReason.trim())}
              className={reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              variant={reviewAction === 'deny' ? 'destructive' : 'default'}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Processing...
                </>
              ) : reviewAction === 'approve' ? (
                'Confirm Approval'
              ) : (
                'Confirm Denial'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
