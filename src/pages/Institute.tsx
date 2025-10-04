import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WalletConnection } from "@/components/WalletConnection";
import { useToast } from "@/hooks/use-toast";
import { useBlockchain } from "@/contexts/BlockchainContext";
import blockchainService from "@/lib/blockchain";
import { Loader2, UserPlus, UserCheck, FilePlus2 } from "lucide-react";

export default function Institute() {
  const { toast } = useToast();
  const { isAuthorized, userRole, address } = useBlockchain();
  const [isLoading, setIsLoading] = useState(false);

  const [staffForm, setStaffForm] = useState({ name: "", wallet: "", designation: "" });
  const [learnerForm, setLearnerForm] = useState({ wallet: "", aadhar: "" });
  const [templateForm, setTemplateForm] = useState({ name: "", description: "" });

  const [staffList, setStaffList] = useState<Array<{ id: number; name: string; wallet: string; designation: string; timestamp: number }>>([]);
  const [learnersList, setLearnersList] = useState<Array<{ id: number; wallet: string; aadhar: string; timestamp: number }>>([]);
  const [templatesList, setTemplatesList] = useState<Array<{ id: number; name: string; timestamp: number }>>([]);
  const [instituteId, setInstituteId] = useState<number | null>(null);

  const ensureInstitute = () => {
    if (!isAuthorized || userRole !== 'institute') {
      toast({ title: "Unauthorized", description: "Only institute wallets can access this page", variant: "destructive" });
      return false;
    }
    return true;
  };

  const refreshLists = async () => {
    try {
      const instituteWallet = address || (window as any).ethereum?.selectedAddress;
      if (!instituteWallet) return;
      const instituteIdNum = await blockchainService.getInstituteIdByWallet(instituteWallet);
      if (!instituteIdNum) return;
      
      // Set actual blockchain institute ID
      setInstituteId(instituteIdNum);
      
      const [staff, learners, templates] = await Promise.all([
        blockchainService.fetchStaffAddedByInstitute(instituteIdNum),
        blockchainService.fetchLearnersByInstitute(instituteIdNum),
        blockchainService.fetchTemplatesByInstitute(instituteIdNum)
      ]);
      
      // Use actual blockchain IDs directly
      setStaffList(staff.map((s, index) => ({
        ...s,
        designation: `Staff ${index + 1}`
      })));
      
      setLearnersList(learners.map((l, index) => {
        return {
          ...l,
          aadhar: "***HASHED***" // Aadhar is hashed for privacy
        };
      }));
      
      setTemplatesList(templates);
    } catch (e) {
      console.error('Error refreshing lists:', e);
    }
  };

  useEffect(() => { refreshLists(); }, [address]);

  const onAddStaff = async () => {
    if (!ensureInstitute()) return;
    if (!staffForm.name || !staffForm.wallet || !staffForm.designation) {
      toast({ title: "Missing Info", description: "Enter staff name, wallet, and designation" , variant: "destructive"});
      return;
    }
    setIsLoading(true);
    try {
      const res = await blockchainService.addStaff(staffForm.name, staffForm.wallet);
      if (!res.success) throw new Error(res.error);
      
      toast({ title: "Staff Added", description: `${staffForm.name} authorized successfully` });
      setStaffForm({ name: "", wallet: "", designation: "" });
      await refreshLists();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message || 'Add staff failed', variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const onAddLearner = async () => {
    if (!ensureInstitute()) return;
    if (!learnerForm.wallet || !learnerForm.aadhar) {
      toast({ title: "Missing Info", description: "Enter wallet address and Aadhar ID", variant: "destructive"});
      return;
    }
    
    // Validate wallet
    try {
      // This will throw if invalid
      ethers.utils.getAddress(learnerForm.wallet);
    } catch (_) {
      toast({ title: "Invalid Wallet", description: "Please enter a valid wallet address" , variant: "destructive"});
      return;
    }
    
    // Validate Aadhar (basic validation - 12 digits)
    if (!/^\d{12}$/.test(learnerForm.aadhar)) {
      toast({ title: "Invalid Aadhar", description: "Please enter a valid 12-digit Aadhar ID" , variant: "destructive"});
      return;
    }
    
    setIsLoading(true);
    try {
      // Hash the Aadhar before storing on blockchain for privacy
      const aadharHash = blockchainService.createHash(learnerForm.aadhar);
      const res = await blockchainService.registerLearner(learnerForm.wallet, aadharHash);
      if (!res.success) throw new Error(res.error);
      
      toast({ title: "Learner Registered", description: `Learner registered successfully (Aadhar hashed for privacy)` });
      setLearnerForm({ wallet: "", aadhar: "" });
      await refreshLists();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message || 'Register learner failed', variant: "destructive" });
    } finally { 
      setIsLoading(false); 
    }
  };

  const onAddTemplate = async () => {
    if (!ensureInstitute()) return;
    if (!templateForm.name || !templateForm.description) {
      toast({ title: "Missing Info", description: "Enter template name and description" , variant: "destructive"});
      return;
    }
    setIsLoading(true);
    try {
      const res = await blockchainService.createTemplate(templateForm.name, templateForm.description);
      if (!res.success) throw new Error(res.error);
      
      toast({ title: "Template Created", description: `${templateForm.name} created successfully` });
      setTemplateForm({ name: "", description: "" });
      await refreshLists();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message || 'Create template failed', variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12 blockchain-grid">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8 space-y-4">
            <h1 className="font-heading text-4xl md:text-5xl font-bold">Institute</h1>
            <p className="text-xl text-muted-foreground">Manage staff, learners, and templates</p>
          </div>

          <div className="mb-8">
            <WalletConnection />
          </div>

          <Card className="shadow-card bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Institute Panel</CardTitle>
              <CardDescription>Actions available to approved institutes</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="staff" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="staff" className="gap-2"><UserPlus className="h-4 w-4" /> Add Staff</TabsTrigger>
                  <TabsTrigger value="learner" className="gap-2"><UserCheck className="h-4 w-4" /> Add Learner</TabsTrigger>
                  <TabsTrigger value="template" className="gap-2"><FilePlus2 className="h-4 w-4" /> Add Template</TabsTrigger>
                </TabsList>

                <TabsContent value="staff" className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="staffName">Staff Name</Label>
                      <Input id="staffName" placeholder="e.g., Dr. John Doe" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffWallet">Staff Wallet Address</Label>
                      <Input id="staffWallet" placeholder="0x..." value={staffForm.wallet} onChange={(e) => setStaffForm({ ...staffForm, wallet: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staffDesignation">Designation</Label>
                      <Input id="staffDesignation" placeholder="e.g., Professor" value={staffForm.designation} onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={onAddStaff} disabled={isLoading} className="gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Add Staff
                  </Button>

                  {/* List of Staff */}
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="text-left p-3">S.No</th>
                          <th className="text-left p-3">Staff ID</th>
                          <th className="text-left p-3">Name</th>
                          <th className="text-left p-3">Designation</th>
                          <th className="text-left p-3">Wallet</th>
                          <th className="text-left p-3">Date & Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList.map((s, index) => (
                          <tr key={s.id} className="border-t border-border/30">
                            <td className="p-3 font-medium">{index + 1}</td>
                            <td className="p-3 font-mono font-bold text-accent">{s.id}</td>
                            <td className="p-3">{s.name}</td>
                            <td className="p-3">{s.designation}</td>
                            <td className="p-3 font-mono break-all">{s.wallet}</td>
                            <td className="p-3 whitespace-nowrap">{new Date(s.timestamp * 1000).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="learner" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="learnerWallet">Learner Wallet Address</Label>
                      <Input id="learnerWallet" placeholder="0x..." value={learnerForm.wallet} onChange={(e) => setLearnerForm({ ...learnerForm, wallet: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="learnerAadhar">Aadhar ID</Label>
                      <Input id="learnerAadhar" placeholder="12-digit Aadhar number" value={learnerForm.aadhar} onChange={(e) => setLearnerForm({ ...learnerForm, aadhar: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={onAddLearner} disabled={isLoading} className="gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Register Learner
                  </Button>
                  
                  <div className="flex items-start gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold mt-0.5">
                      🔒
                    </div>
                    <div>
                      <h4 className="font-semibold text-accent text-sm">Privacy Protection</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Aadhar ID will be hashed using Keccak-256 algorithm before storing on the blockchain for privacy protection.
                      </p>
                    </div>
                  </div>

                  {/* List of Learners */}
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="text-left p-3">S.No</th>
                          <th className="text-left p-3">Learner ID</th>
                          <th className="text-left p-3">Wallet</th>
                          <th className="text-left p-3">Date & Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {learnersList.map((l, index) => (
                          <tr key={l.id} className="border-t border-border/30">
                            <td className="p-3 font-medium">{index + 1}</td>
                            <td className="p-3 font-mono font-bold text-accent">{l.id}</td>
                            <td className="p-3 font-mono break-all">{l.wallet}</td>
                            <td className="p-3 whitespace-nowrap">{new Date(l.timestamp * 1000).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="template" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input id="templateName" placeholder="e.g., Certified Welder" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="templateDesc">Description</Label>
                      <Input id="templateDesc" placeholder="Template description" value={templateForm.description} onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={onAddTemplate} disabled={isLoading} className="gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Create Template
                  </Button>

                  {/* List of Templates */}
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="text-left p-3">S.No</th>
                          <th className="text-left p-3">Template ID</th>
                          <th className="text-left p-3">Name</th>
                          <th className="text-left p-3">Date & Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {templatesList.map((t, index) => (
                          <tr key={t.id} className="border-t border-border/30">
                            <td className="p-3 font-medium">{index + 1}</td>
                            <td className="p-3 font-mono font-bold text-accent">{t.id}</td>
                            <td className="p-3">{t.name}</td>
                            <td className="p-3 whitespace-nowrap">{new Date(t.timestamp * 1000).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}