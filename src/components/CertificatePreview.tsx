import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Award } from "lucide-react";

interface CertificatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: {
    learnerId: string;
    learnerName?: string;
    marks: string;
    templateId: string;
    templateName?: string;
    templateDescription?: string;
    instituteName?: string;
    issueDate: string;
    expiryDate: string;
    certificateId?: string;
  };
}

export function CertificatePreview({ isOpen, onClose, certificateData }: CertificatePreviewProps) {
  const {
    learnerId,
    learnerName,
    marks,
    templateId,
    templateName,
    templateDescription,
    instituteName,
    issueDate,
    expiryDate,
    certificateId
  } = certificateData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-accent" />
              <span>Certificate Preview</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Certificate Header */}
          <div className="text-center border-b border-border/50 pb-6">
            <h2 className="font-heading text-2xl font-bold text-accent">
              Digital Certificate
            </h2>
            <p className="text-muted-foreground mt-1">
              Verified on Blockchain
            </p>
          </div>

          {/* Certificate ID Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {certificateId || `Cert ID: Not Generated Yet`}
            </Badge>
          </div>

          {/* Institute Info */}
          <div className="text-center">
            <h3 className="font-heading text-xl font-bold mb-2">
              {instituteName || "Institute Name"}
            </h3>
            <p className="text-muted-foreground">Official Institution</p>
          </div>

          {/* Course Information */}
          <div className="bg-card/50 rounded-lg p-6 space-y-4">
            <h4 className="font-heading text-lg font-semibold border-b border-border/30 pb-2">
              Course Information
            </h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-bold text-accent text-lg">
                  {templateName || `Template ${templateId}`}
                </h5>
                {templateDescription && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {templateDescription}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Learner Details */}
          <div className="bg-card/50 rounded-lg p-6 space-y-4">
            <h4 className="font-heading text-lg font-semibold border-b border-border/30 pb-2">
              Learner Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Learner ID</label>
                <p className="font-medium">{learnerId}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Learner Name</label>
                <p className="font-medium">{learnerName || "Pending Update"}</p>
              </div>
            </div>
          </div>

          {/* Assessment Results */}
          <div className="bg-card/50 rounded-lg p-6 space-y-4">
            <h4 className="font-heading text-lg font-semibold border-b border-border/30 pb-2">
              Assessment Results
            </h4>
            <div>
              <label className="text-sm text-muted-foreground">Marks/Score</label>
              <p className="font-bold text-accent text-xl">{marks}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {marks === "🔒 ***HASHED***" 
                  ? "Marks and Aadhar are cryptographically hashed for security" 
                  : "* Marks and Aadhar will be hashed during certificate issuance"
                }
              </p>
            </div>
          </div>

          {/* Validity Information */}
          <div className="bg-card/50 rounded-lg p-6 space-y-4">
            <h4 className="font-heading text-lg font-semibold border-b border-border/30 pb-2">
              Validity Period
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Issue Date</label>
                <p className="font-medium">{issueDate || "Not Set"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Expiry Date</label>
                <p className="font-medium">{expiryDate === "lifetime" || !expiryDate ? "Lifetime" : expiryDate}</p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <p className="text-sm text-accent font-medium">
              🔒 Security Notice: Marks and Aadhar number will be cryptographically hashed and stored on the blockchain for verification while maintaining privacy of sensitive data.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border/50">
          <div className="text-center text-xs text-muted-foreground">
            <p>This is a preview. Certificate details will be finalized upon blockchain issuance.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
