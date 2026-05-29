-- CreateTable
CREATE TABLE "landlord_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "nationalIdUrl" TEXT,
    "titleDeedUrl" TEXT,
    "managementAgreementUrl" TEXT,
    "complianceCertUrl" TEXT,
    "safetyCertUrl" TEXT,
    "taxComplianceUrl" TEXT,
    "bankProofUrl" TEXT,
    "leaseTemplateUrl" TEXT,
    "businessName" TEXT,
    "kraPin" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewNotes" TEXT,
    "denialReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landlord_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "landlord_applications_userId_key" ON "landlord_applications"("userId");

