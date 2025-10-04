import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Search, CheckCircle2, XCircle, Upload, Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import blockchainService from "@/lib/blockchain";

export default function Verify() {
  const { toast } = useToast();
  const [certificateId, setCertificateId] = useState("");
  const [marks, setMarks] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleVerify = async (idOverride?: string) => {
    const idValue = (idOverride ?? certificateId).trim();
    if (!idValue) {
      toast({
        title: "Certificate ID Required",
        description: "Please enter a certificate ID to verify",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, treat existence on-chain as verification success
      const cert = await blockchainService.getCertificateData(parseInt(idValue, 10));
      if (cert.exists) {
        setVerificationResult({
          status: cert.revoked ? "revoked" : "authentic",
          certificateId: idValue,
          learnerId: String(cert.learnerId ?? ''),
          templateId: String(cert.templateId ?? ''),
          staffId: String(cert.staffId ?? ''),
          instituteId: String(cert.instituteId ?? ''),
          issuedAt: cert.issuedAt && cert.issuedAt > 0 ? new Date(cert.issuedAt * 1000).toLocaleDateString() : 'Unknown',
          validUntil: !cert.validUntil || cert.validUntil === 0 ? 'Lifetime' : new Date((cert.validUntil as number) * 1000).toLocaleDateString(),
          dataHash: cert.dataHash,
          grade: marks || "Not provided",
        });
        toast({
          title: cert.revoked ? "Certificate Revoked" : "Certificate Verified! ✅",
          description: cert.revoked ? "This certificate has been revoked" : "Certificate exists on-chain",
          variant: cert.revoked ? "destructive" : "default",
        });
        return;
      }

      // Fallback to strict verification function when existence check fails
      const idHash = blockchainService.createHash(idValue);
      const detailsHash = marks ? blockchainService.createHash(marks) : blockchainService.createHash("");
      const result = await blockchainService.verifyCertificate(parseInt(idValue), idHash, detailsHash);
      if (result.success && result.isValid && result.certificateData) {
        const certData = result.certificateData;
        setVerificationResult({
          status: certData.revoked ? "revoked" : "authentic",
          certificateId: idValue,
          learnerId: certData.learnerId.toString(),
          templateId: certData.templateId.toString(),
          staffId: certData.staffId.toString(),
          instituteId: certData.instituteId.toString(),
          issuedAt: new Date(certData.issuedAt.toNumber() * 1000).toLocaleDateString(),
          validUntil: certData.validUntil.toNumber() === 0 ? "Lifetime" : new Date(certData.validUntil.toNumber() * 1000).toLocaleDateString(),
          dataHash: certData.dataHash,
          grade: marks || "Not provided",
        });
        toast({ title: "Certificate Verified! ✅", description: "Certificate is authentic and valid" });
      } else {
        setVerificationResult({ status: "invalid", certificateId: idValue, error: "Certificate not found or verification failed" });
        toast({ title: "Verification Failed", description: "Certificate could not be verified or does not exist", variant: "destructive" });
      }
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      setVerificationResult({
        status: "error",
        certificateId: idValue,
        error: error.message || "An error occurred during verification"
      });

      toast({
        title: "Verification Error",
        description: error.message || "An error occurred while verifying the certificate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scannerId = 'qr-scanner';
      if (!scannerRef.current) return;
      const el = document.createElement('div');
      el.id = scannerId;
      el.className = 'w-full max-w-sm aspect-square rounded-lg overflow-hidden';
      scannerRef.current.innerHTML = '';
      scannerRef.current.appendChild(el);
      setIsScanning(true);
      const html5QrCode = new Html5Qrcode(scannerId);
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText: string) => {
          // Stop scanning on success
          html5QrCode.stop().then(() => setIsScanning(false)).catch(() => setIsScanning(false));
          // Expect link like /verify?certId=123
          try {
            const url = new URL(decodedText, window.location.origin);
            const id = url.searchParams.get('certId') || decodedText;
            setCertificateId(id);
            handleVerify(id);
            // Also open backend link if full URL
            if (/^https?:/i.test(decodedText)) {
              window.open(decodedText, '_blank');
            }
          } catch (_) {
            setCertificateId(decodedText);
            handleVerify(decodedText);
          }
        },
        () => {}
      );
    } catch (e: any) {
      setIsScanning(false);
      toast({ title: 'Camera Error', description: e?.message || 'Unable to start camera', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-12 blockchain-grid">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 space-y-4">
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Verify <span className="text-accent">Certificate</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Instantly verify the authenticity of any certificate
            </p>
          </div>

          <Card className="shadow-card bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Certificate Verification</CardTitle>
              <CardDescription>
                Choose your preferred verification method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="scan" className="gap-2">
                    <QrCode className="h-4 w-4" />
                    Scan QR Code
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-2">
                    <Search className="h-4 w-4" />
                    Manual Verify
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="scan" className="space-y-6">
                  <div className="flex flex-col items-center gap-6 py-6">
                    {!isScanning && (
                      <div className="w-64 h-64 border-4 border-dashed border-accent/50 rounded-2xl flex items-center justify-center bg-accent/5">
                        <QrCode className="h-32 w-32 text-accent/60" />
                      </div>
                    )}
                    <div ref={scannerRef} className="w-full flex items-center justify-center" />
                    <Button variant="neon" size="lg" onClick={handleQRScan} disabled={isScanning}>
                      {isScanning ? 'Scanning...' : 'Start QR Scan'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="certId">Certificate ID</Label>
                      <Input
                        id="certId"
                        placeholder="Enter certificate ID (e.g., CERT-2024-001234)"
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marks">Marks/Grade</Label>
                      <Input
                        id="marks"
                        placeholder="Enter marks or grade"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                      onClick={handleVerify}
                      disabled={isLoading || !certificateId}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Verifying on Blockchain...
                        </>
                      ) : (
                        'Verify Certificate'
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Verification Result */}
              {verificationResult && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="border-t border-border/50 pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-heading text-xl font-semibold">Verification Result</h3>
                      <Badge 
                        variant={verificationResult.status === "authentic" ? "default" : "destructive"}
                        className={verificationResult.status === "authentic" ? "bg-accent text-accent-foreground" : ""}
                      >
                        {verificationResult.status === "authentic" ? (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {verificationResult.status === "authentic" ? "Authentic" : 
                         verificationResult.status === "revoked" ? "Revoked" :
                         verificationResult.status === "invalid" ? "Invalid" : "Error"}
                      </Badge>
                    </div>

                    <Card className="bg-background/50 border-accent/20">
                      <CardContent className="p-6 space-y-4">
                        {verificationResult.status === "authentic" || verificationResult.status === "revoked" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground">Certificate ID</Label>
                              <p className="font-semibold font-mono text-sm">{verificationResult.certificateId}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Learner ID</Label>
                              <p className="font-semibold">{verificationResult.learnerId}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Template ID</Label>
                              <p className="font-semibold">{verificationResult.templateId}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Staff ID</Label>
                              <p className="font-semibold">{verificationResult.staffId}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Institute ID</Label>
                              <p className="font-semibold">{verificationResult.instituteId}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Issue Date</Label>
                              <p className="font-semibold">{verificationResult.issuedAt}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Valid Until</Label>
                              <p className="font-semibold">{verificationResult.validUntil}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Grade/Marks</Label>
                              <p className="font-semibold text-accent">{verificationResult.grade}</p>
                            </div>
                            <div className="md:col-span-2">
                              <Label className="text-muted-foreground">Data Hash</Label>
                              <p className="font-mono text-xs break-all">{verificationResult.dataHash}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                            <h3 className="font-heading text-xl font-bold mb-2">Verification Failed</h3>
                            <p className="text-muted-foreground">
                              {verificationResult.error || "Certificate could not be verified"}
                            </p>
                          </div>
                        )}

                        <div className="pt-4 border-t border-border/50">
                          <Button variant="outline" className="w-full gap-2 border-accent/30 hover:border-accent">
                            <Upload className="h-4 w-4" />
                            Verify Marksheet Hash
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
