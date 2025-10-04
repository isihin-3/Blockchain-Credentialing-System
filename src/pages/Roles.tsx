import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UserPlus, Building2, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WalletConnection } from "@/components/WalletConnection";
import { useToast } from "@/hooks/use-toast";
import { useBlockchain } from "@/contexts/BlockchainContext";
import blockchainService from "@/lib/blockchain";

export default function Roles() {
  const { toast } = useToast();
  const { isConnected, isAuthorized, userRole } = useBlockchain();
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [showAddInstitute, setShowAddInstitute] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  
  // Form states
  const [instituteForm, setInstituteForm] = useState({ name: "", wallet: "" });
  const [staffForm, setStaffForm] = useState({ name: "", wallet: "" });
  const [templateForm, setTemplateForm] = useState({ name: "", description: "" });

  const [institutions, setInstitutions] = useState([
    {
      id: "1",
      name: "ISM Dhanbad",
      wallet: "0x742d35e2f",
      status: "active",
      certifiers: 12,
      uniqueId: "ISM001",
    },
    {
      id: "2",
      name: "BIT Sindri",
      wallet: "0x893a7c4d",
      status: "active",
      certifiers: 8,
      uniqueId: "BIT001",
    },
  ]);

  const [certifiers, setCertifiers] = useState([
    {
      id: "1",
      name: "Dr. DK Singh",
      wallet: "0x234b9e1a",
      role: "Senior Certifier",
      status: "active",
    },
    {
      id: "2",
      name: "Prof. Ghanshayam",
      wallet: "0x567c2f3b",
      role: "Certifier",
      status: "active",
    },
  ]);

  // Blockchain functions
  const handleAddInstitute = async () => {
    if (!instituteForm.name || !instituteForm.wallet) {
      toast({
        title: "Missing Information",
        description: "Please fill in both institute name and wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await blockchainService.addInstitute(instituteForm.name, instituteForm.wallet);
      
      if (result.success) {
        toast({
          title: "Institute Added Successfully! 🎉",
          description: `${instituteForm.name} has been registered on the blockchain`,
        });
        
        // Add to local state (in real app, you'd refresh from blockchain)
        const existingIds = institutions.map(inst => inst.uniqueId);
        const uniqueId = blockchainService.generateInstituteId(instituteForm.name, existingIds);
        setInstitutions(prev => [...prev, {
          id: (prev.length + 1).toString(),
          name: instituteForm.name,
          wallet: blockchainService.formatAddress(instituteForm.wallet),
          status: "active",
          certifiers: 0,
          uniqueId,
        }]);
        
        setInstituteForm({ name: "", wallet: "" });
        setShowAddInstitute(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Failed to Add Institute",
        description: error.message || "An error occurred while adding the institute",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!staffForm.name || !staffForm.wallet) {
      toast({
        title: "Missing Information",
        description: "Please fill in both staff name and wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await blockchainService.addStaff(staffForm.name, staffForm.wallet);
      
      if (result.success) {
        toast({
          title: "Staff Added Successfully! 🎉",
          description: `${staffForm.name} has been registered as staff`,
        });
        
        // Add to local state
        setCertifiers(prev => [...prev, {
          id: (prev.length + 1).toString(),
          name: staffForm.name,
          wallet: blockchainService.formatAddress(staffForm.wallet),
          role: "Staff Member",
          status: "active",
        }]);
        
        setStaffForm({ name: "", wallet: "" });
        setShowAddStaff(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Failed to Add Staff",
        description: error.message || "An error occurred while adding the staff member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in both template name and description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await blockchainService.createTemplate(templateForm.name, templateForm.description);
      
      if (result.success) {
        toast({
          title: "Template Created Successfully! 🎉",
          description: `${templateForm.name} template has been created`,
        });
        
        setTemplateForm({ name: "", description: "" });
        setShowAddTemplate(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Failed to Create Template",
        description: error.message || "An error occurred while creating the template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeInstitute = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await blockchainService.revokeInstitute(parseInt(id));
      
      if (result.success) {
        toast({
          title: "Institute Revoked",
          description: "Institute access has been revoked",
        });
        
        // Update local state
        setInstitutions(prev => prev.map(inst => 
          inst.id === id ? { ...inst, status: "inactive" } : inst
        ));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Failed to Revoke Institute",
        description: error.message || "An error occurred while revoking the institute",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeStaff = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await blockchainService.revokeStaff(parseInt(id));
      
      if (result.success) {
        toast({
          title: "Staff Revoked",
          description: "Staff access has been revoked",
        });
        
        // Update local state
        setCertifiers(prev => prev.map(cert => 
          cert.id === id ? { ...cert, status: "inactive" } : cert
        ));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Failed to Revoke Staff",
        description: error.message || "An error occurred while revoking the staff member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manager (Admin) only: can manage institutions
  const canManageRoles = isAuthorized && (userRole === 'admin');

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-12 blockchain-grid">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12 space-y-4">
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Manage <span className="text-accent">Roles</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Control access and permissions for institutions and certifiers
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="mb-8">
            <WalletConnection />
          </div>

          <Tabs defaultValue="institutions" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="institutions" className="gap-2">
                <Building2 className="h-4 w-4" />
                Institutions
              </TabsTrigger>
              <TabsTrigger value="certifiers" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Certifiers
              </TabsTrigger>
            </TabsList>

            {/* Institutions Tab */}
            <TabsContent value="institutions">
              <Card className="shadow-card bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-heading text-2xl">Institutions</CardTitle>
                      <CardDescription>Manage registered educational institutions</CardDescription>
                    </div>
                    <Dialog open={showAddInstitute} onOpenChange={setShowAddInstitute}>
                      <DialogTrigger asChild>
                        <Button variant="neon" className="gap-2" disabled={!canManageRoles}>
                          <Plus className="h-4 w-4" />
                          Add Institution
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Institution</DialogTitle>
                          <DialogDescription>
                            Register a new educational institution on the blockchain
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="instituteName">Institution Name</Label>
                            <Input
                              id="instituteName"
                              placeholder="e.g., ISM Dhanbad"
                              value={instituteForm.name}
                              onChange={(e) => setInstituteForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="instituteWallet">Wallet Address</Label>
                            <Input
                              id="instituteWallet"
                              placeholder="0x..."
                              value={instituteForm.wallet}
                              onChange={(e) => setInstituteForm(prev => ({ ...prev, wallet: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowAddInstitute(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleAddInstitute} 
                              disabled={isLoading}
                              className="flex-1"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Adding...
                                </>
                              ) : (
                                'Add Institution'
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-secondary/50">
                        <TableRow>
                          <TableHead>S.No</TableHead>
                          <TableHead>Institute ID</TableHead>
                          <TableHead>Institution Name</TableHead>
                          <TableHead>Wallet Address</TableHead>
                          <TableHead>Certifiers</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {institutions.map((inst, index) => (
                          <TableRow key={inst.id} className="hover:bg-secondary/20">
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-mono text-sm font-bold text-accent">{inst.uniqueId}</TableCell>
                            <TableCell className="font-medium">{inst.name}</TableCell>
                            <TableCell className="font-mono text-sm">{inst.wallet}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-accent/30">
                                {inst.certifiers} active
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={inst.status === "active" ? "default" : "secondary"}
                                className={inst.status === "active" ? "bg-accent/10 text-accent border-accent/20" : ""}
                              >
                                {inst.status === "active" ? (
                                  <ShieldCheck className="h-3 w-3 mr-1" />
                                ) : (
                                  <ShieldOff className="h-3 w-3 mr-1" />
                                )}
                                {inst.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:text-destructive"
                                onClick={() => handleRevokeInstitute(inst.id)}
                                disabled={!canManageRoles || isLoading || inst.status === "inactive"}
                              >
                                {inst.status === "inactive" ? "Revoked" : "Revoke"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Certifiers Tab - hidden for Admin-only scope */}
            {false && (
            <TabsContent value="certifiers">
              <Card className="shadow-card bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-heading text-2xl">Certifiers</CardTitle>
                      <CardDescription>Manage authorized certificate issuers</CardDescription>
                    </div>
                    <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
                      <DialogTrigger asChild>
                        <Button variant="neon" className="gap-2" disabled={!canManageRoles}>
                          <Plus className="h-4 w-4" />
                          Add Staff
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Staff Member</DialogTitle>
                          <DialogDescription>
                            Register a new staff member who can issue certificates
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="staffName">Staff Name</Label>
                            <Input
                              id="staffName"
                              placeholder="e.g., Dr. John Doe"
                              value={staffForm.name}
                              onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="staffWallet">Wallet Address</Label>
                            <Input
                              id="staffWallet"
                              placeholder="0x..."
                              value={staffForm.wallet}
                              onChange={(e) => setStaffForm(prev => ({ ...prev, wallet: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowAddStaff(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleAddStaff} 
                              disabled={isLoading}
                              className="flex-1"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Adding...
                                </>
                              ) : (
                                'Add Staff'
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Input
                      placeholder="Search certifiers by name or wallet address..."
                      className="max-w-md bg-background/50"
                    />
                  </div>
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-secondary/50">
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Wallet Address</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {certifiers.map((cert) => (
                          <TableRow key={cert.id} className="hover:bg-secondary/20">
                            <TableCell className="font-medium">{cert.name}</TableCell>
                            <TableCell className="font-mono text-sm">{cert.wallet}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-accent/30">
                                {cert.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={cert.status === "active" ? "default" : "secondary"}
                                className={cert.status === "active" ? "bg-accent/10 text-accent border-accent/20" : ""}
                              >
                                {cert.status === "active" ? (
                                  <ShieldCheck className="h-3 w-3 mr-1" />
                                ) : (
                                  <ShieldOff className="h-3 w-3 mr-1" />
                                )}
                                {cert.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:text-destructive"
                                onClick={() => handleRevokeStaff(cert.id)}
                                disabled={!canManageRoles || isLoading || cert.status === "inactive"}
                              >
                                {cert.status === "inactive" ? "Revoked" : "Revoke"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Create Template Card - hidden for Admin-only scope */}
              {false && (
              <Card className="shadow-card bg-card/50 backdrop-blur-sm border-accent/20 mt-6">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">Certificate Templates</CardTitle>
                  <CardDescription>Create and manage certificate templates for issuance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={showAddTemplate} onOpenChange={setShowAddTemplate}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full border-accent/30 hover:border-accent gap-2"
                        disabled={!canManageRoles}
                      >
                        <Plus className="h-4 w-4" />
                        Create New Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Certificate Template</DialogTitle>
                        <DialogDescription>
                          Create a new certificate template that can be used for issuing certificates
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="templateName">Template Name</Label>
                          <Input
                            id="templateName"
                            placeholder="e.g., Bachelor of Technology"
                            value={templateForm.name}
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="templateDescription">Description</Label>
                          <Input
                            id="templateDescription"
                            placeholder="Brief description of the certificate"
                            value={templateForm.description}
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setShowAddTemplate(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateTemplate} 
                            disabled={isLoading}
                            className="flex-1"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Creating...
                              </>
                            ) : (
                              'Create Template'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
              )}
            </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
