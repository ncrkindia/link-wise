'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmailCampaign, EmailTemplate, EmailAccount } from '@/lib/definitions';
import { Rocket, History, BarChart3, Mail, CheckCircle2, AlertCircle, Clock, MoreVertical, Plus } from 'lucide-react';
import { CampaignWizard } from './campaign-wizard';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CampaignAnalyticsModal } from './campaign-analytics-modal';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { toggleCampaignActive, deleteCampaign, sendCampaignReport } from '@/lib/actions';
import { Trash2, Play, Pause, Download, RefreshCw, Filter, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function CampaignList({ campaigns, templates, accounts }: { 
  campaigns: EmailCampaign[], 
  templates: EmailTemplate[], 
  accounts: EmailAccount[] 
}) {
  const { toast } = useToast();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<{ id: string, name: string } | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter State
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  // Reporting State
  const [reportEmail, setReportEmail] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!campaignToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCampaign(campaignToDelete.id);
      setCampaignToDelete(null);
      toast({ title: "Campaign Deleted", description: "The campaign has been removed from your dashboard." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Deletion Failed", description: "Could not remove the campaign." });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCampaigns = campaigns.filter(camp => {
    if (statusFilter !== 'all' && camp.status !== statusFilter) return false;
    if (activeFilter === 'active' && !camp.isActive) return false;
    if (activeFilter === 'inactive' && camp.isActive) return false;

    if (timeFilter !== 'all') {
      const campDate = new Date(camp.createdAt);
      const now = new Date();
      const diffDays = (now.getTime() - campDate.getTime()) / (1000 * 3600 * 24);
      
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (timeFilter === 'today' && campDate < todayStart) return false;
      if (timeFilter === '1d' && diffDays > 1) return false;
      if (timeFilter === '7d' && diffDays > 7) return false;
      if (timeFilter === '30d' && diffDays > 30) return false;
    }

    return true;
  });

  const handleExportCsv = () => {
    if (filteredCampaigns.length === 0) return;
    
    let csv = "Campaign ID,Name,Status,Template,Recipients,Opens,Open Rate,Launched,Active\n";
    filteredCampaigns.forEach(c => {
      const rate = c.sendsCount ? Math.round(((c.opensCount || 0) / c.sendsCount) * 100) : 0;
      csv += `${c.id},"${c.name}",${c.status},"${c.templateName || 'Custom'}",${c.sendsCount || 0},${c.opensCount || 0},${rate}%,"${new Date(c.createdAt).toISOString()}",${c.isActive ? 'Yes' : 'No'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `campaign_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Export Complete", description: "CSV analytics has been downloaded." });
  };

  const handleSendReport = async () => {
    if (!reportEmail || filteredCampaigns.length === 0) return;
    setIsReporting(true);
    try {
      const result = await sendCampaignReport(reportEmail, filteredCampaigns, {
        status: statusFilter,
        active: activeFilter,
        period: timeFilter
      });
      if (result.success) {
        toast({ title: "Report Sent!", description: result.message });
        setIsReportDialogOpen(false);
      } else {
        toast({ variant: "destructive", title: "Report Failed", description: result.message });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-headline font-bold">Your Campaigns</h3>
          <p className="text-sm text-muted-foreground">Monitor and launch your email marketing efforts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={filteredCampaigns.length === 0} className="h-10 font-bold border-primary/5 bg-white shadow-sm">
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsReportDialogOpen(true)} disabled={filteredCampaigns.length === 0} className="h-10 font-bold border-primary/5 bg-white shadow-sm">
                <Mail className="mr-2 h-4 w-4" /> Send Report
            </Button>
            <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsWizardOpen(true)} className="h-10 font-bold bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  <Rocket className="mr-2 h-4 w-4" /> Launch Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl border-none shadow-2xl p-6">
                <CampaignWizard templates={templates} accounts={accounts} onComplete={() => setIsWizardOpen(false)} />
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-muted/20 p-2 rounded-xl border border-primary/5 shadow-inner">
         <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-background border-primary/5 text-[10px] font-black uppercase tracking-wider h-10 rounded-lg">
                <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="SENDING">Sending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
         </Select>

         <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-[140px] bg-background border-primary/5 text-[10px] font-black uppercase tracking-wider h-10 rounded-lg">
                <SelectValue placeholder="Activity" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Any Activity</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
         </Select>

         <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[150px] bg-background border-primary/5 text-[10px] font-black uppercase tracking-wider h-10 rounded-lg">
                <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today Only</SelectItem>
                <SelectItem value="1d">Past 24 Hours</SelectItem>
                <SelectItem value="7d">Past 7 Days</SelectItem>
                <SelectItem value="30d">Past 30 Days</SelectItem>
            </SelectContent>
         </Select>

         {(statusFilter !== 'all' || activeFilter !== 'all' || timeFilter !== 'all') && (
             <Button variant="ghost" size="sm" onClick={() => {
                setStatusFilter('all');
                setActiveFilter('all');
                setTimeFilter('all');
             }} className="text-[10px] uppercase font-black tracking-widest text-primary/60 hover:text-primary transition-colors">
                <Filter className="mr-1.5 h-3 w-3" /> Reset Grid
             </Button>
         )}
      </div>

      <div className="space-y-4">
        {filteredCampaigns.map((camp) => (
          <Card key={camp.id} className={`group overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 ${!camp.isActive ? 'grayscale-[0.5] opacity-80' : ''}`}>
            <CardContent className="p-0">
               <div className="flex flex-col md:flex-row md:items-center">
                  <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-dashed border-primary/10">
                     <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${camp.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : (camp.status === 'FAILED' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary')}`}>
                           {camp.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5" /> : (camp.status === 'FAILED' ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />)}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-2">
                             <h4 className="font-bold font-headline">{camp.name}</h4>
                             {!camp.isActive && (
                               <Badge variant="outline" className="text-[10px] h-4 border-amber-200 bg-amber-50 text-amber-700 font-bold px-1.5 uppercase tracking-tighter">
                                 Inactive
                               </Badge>
                             )}
                           </div>
                           <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" /> Using template: <span className="font-semibold">{camp.templateName}</span>
                           </p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                           <p className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-tighter">Status</p>
                           <Badge variant={camp.status === 'COMPLETED' ? 'default' : (camp.status === 'FAILED' ? 'destructive' : 'secondary')} className="text-[10px] h-5">
                              {camp.status}
                           </Badge>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-tighter">Recipients</p>
                           <p className="text-xs font-bold">{camp.sendsCount || 0}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-tighter">Open Rate</p>
                           <p className="text-xs font-bold text-emerald-500">
                              {camp.sendsCount ? Math.round(((camp.opensCount || 0) / camp.sendsCount) * 100) : 0}%
                           </p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-tighter">Launched</p>
                           <p className="text-xs font-bold text-muted-foreground">{new Date(camp.createdAt).toLocaleDateString()}</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-6 md:w-1/3 bg-muted/20 flex items-center justify-between md:justify-center gap-4">
                     <div className="text-center">
                        <div className="text-2xl font-bold font-headline">{camp.opensCount || 0}</div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none mt-1">Unique Opens</p>
                     </div>
                     <div className="flex gap-2">
                        <Button 
                           variant="outline" 
                           size="sm" 
                           className="h-9 font-bold bg-white shadow-sm hover:scale-105 transition-transform"
                           onClick={() => setSelectedCampaign({ id: camp.id, name: camp.name })}
                        >
                           <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                        </Button>

                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white transition-colors">
                                 <MoreVertical className="h-4 w-4" />
                              </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-48 p-1 border-primary/10 shadow-xl">
                              <DropdownMenuItem 
                                className="flex items-center gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors"
                                onClick={() => toggleCampaignActive(camp.id)}
                              >
                                {camp.isActive ? (
                                  <><Pause className="h-4 w-4" /> Deactivate</>
                                ) : (
                                  <><Play className="h-4 w-4" /> Activate</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-primary/5" />
                              <DropdownMenuItem 
                                className="flex items-center gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors font-semibold"
                                onClick={() => setCampaignToDelete({ id: camp.id, name: camp.name })}
                              >
                                <Trash2 className="h-4 w-4" /> Delete Campaign
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
        {filteredCampaigns.length === 0 && campaigns.length > 0 && (
          <div className="py-20 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
             <div className="p-5 bg-white rounded-full mb-4 shadow-sm">
                <Filter className="h-8 w-8 text-muted-foreground/30" />
             </div>
             <h4 className="font-black text-sm uppercase tracking-widest text-primary/60">No Matching Campaigns</h4>
             <p className="text-xs mt-1">Adjust your filters to see more results.</p>
             <Button variant="link" onClick={() => { setStatusFilter('all'); setTimeFilter('all'); setActiveFilter('all'); }} className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Clear All Constraints
             </Button>
          </div>
        )}
        {campaigns.length === 0 && (
          <div className="py-16 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
             <div className="p-4 bg-secondary rounded-full mb-4">
                <History className="h-10 w-10 text-muted-foreground/20" />
             </div>
             <h4 className="font-bold font-headline text-lg">No campaign history.</h4>
             <p className="text-sm">Ready to spread the word? Launch your first campaign today!</p>
             <Button onClick={() => setIsWizardOpen(true)} className="mt-6 h-10 font-bold">
                <Plus className="mr-2 h-4 w-4" /> Start First Campaign
             </Button>
          </div>
        )}
      </div>

      <CampaignAnalyticsModal 
        isOpen={!!selectedCampaign} 
        campaignId={selectedCampaign?.id || ''} 
        campaignName={selectedCampaign?.name || ''}
        onClose={() => setSelectedCampaign(null)} 
      />

      <AlertDialog open={!!campaignToDelete} onOpenChange={(open) => !open && setCampaignToDelete(null)}>
        <AlertDialogContent className="max-w-[400px] border-none shadow-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-headline font-bold flex items-center gap-2">
               <Trash2 className="h-5 w-5 text-destructive" /> Delete Campaign?
            </AlertDialogTitle>
            <AlertDialogDescription className="py-2 text-sm">
              Are you sure you want to delete <span className="font-bold text-primary">"{campaignToDelete?.name}"</span>? 
              This action will hide the campaign from your dashboard. Tracking data is preserved in history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-10 font-bold border-none bg-muted hover:bg-muted/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
               disabled={isDeleting}
               onClick={(e) => {
                 e.preventDefault();
                 handleDelete();
               }}
               className="h-10 font-bold bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20"
            >
               {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Campaign Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-10 border-primary/10 shadow-[0_0_100px_rgba(0,0,0,0.1)] bg-background">
          <DialogHeader className="items-center text-center">
            <div className="bg-primary/10 p-5 rounded-[2rem] mb-6 shadow-sm">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black font-headline tracking-tighter leading-none">Intelligence Report</DialogTitle>
            <DialogDescription className="text-sm font-bold uppercase tracking-widest text-muted-foreground pt-3 leading-relaxed">
              Dispatching comprehensive analytics for <span className="text-primary">{filteredCampaigns.length}</span> campaign datasets.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-email" className="text-[10px] font-black uppercase tracking-[0.3em] pl-1 text-muted-foreground">Target Recipient Address</Label>
              <Input
                id="report-email"
                type="email"
                placeholder="marketing@slpro.in"
                value={reportEmail}
                onChange={(e) => setReportEmail(e.target.value)}
                className="h-14 rounded-2xl bg-muted/30 border-primary/5 focus:ring-4 focus:ring-primary/10 focus:border-primary/20 text-sm font-bold transition-all"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendReport(); }}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleSendReport} disabled={!reportEmail || isReporting} className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 bg-primary text-white hover:scale-[1.02] active:scale-95 transition-all">
              {isReporting ? (
                <span className="flex items-center gap-3">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating Intelligence...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  Dispatch Report Now
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
