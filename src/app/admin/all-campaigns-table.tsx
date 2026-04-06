'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmailCampaign } from '@/lib/definitions';
import { History, BarChart3, Mail, CheckCircle2, AlertCircle, Clock, MoreVertical, Download, Filter, RefreshCw, Trash2, Play, Pause, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CampaignAnalyticsModal } from '@/components/email-manager/campaign-analytics-modal';
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
} from '@/components/ui/alert-dialog';
import { toggleCampaignActive, deleteCampaign, sendCampaignReport } from '@/lib/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function AllCampaignsTable({ campaigns }: { campaigns: (EmailCampaign & { userEmail: string })[] }) {
  const { toast } = useToast();
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
      toast({ title: "Campaign Deleted", description: "Administrative deletion successful." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Deletion Failed", description: "Administrative override failed." });
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
    let csv = "Campaign ID,Owner,Name,Status,Template,Recipients,Opens,Rate,Launched,Active\n";
    filteredCampaigns.forEach(c => {
      const rate = c.sendsCount ? Math.round(((c.opensCount || 0) / c.sendsCount) * 100) : 0;
      csv += `${c.id},${c.userEmail},"${c.name}",${c.status},"${c.templateName || 'Custom'}",${c.sendsCount || 0},${c.opensCount || 0},${rate}%,"${new Date(c.createdAt).toISOString()}",${c.isActive ? 'Yes' : 'No'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `admin_global_campaigns_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Global Export Complete", description: "Administrative spreadsheet downloaded." });
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
        toast({ title: "Global Report Sent!", description: result.message });
        setIsReportDialogOpen(false);
      } else {
        toast({ variant: "destructive", title: "Report Failed", description: result.message });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Critical system report failure." });
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-headline font-bold">Global Campaigns</h3>
          <p className="text-sm text-muted-foreground">Monitoring all system-wide email marketing batches.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={filteredCampaigns.length === 0} className="h-10 font-bold border-primary/5 bg-white shadow-sm">
                <Download className="mr-2 h-4 w-4" /> Global CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsReportDialogOpen(true)} disabled={filteredCampaigns.length === 0} className="h-10 font-bold border-primary/5 bg-white shadow-sm">
                <Mail className="mr-2 h-4 w-4" /> System Report
            </Button>
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
                <Filter className="mr-1.5 h-3 w-3" /> Clear Constraints
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
                             {!camp.isActive && <Badge variant="outline" className="text-[10px] h-4 bg-amber-50">Inactive</Badge>}
                           </div>
                           <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                 <User className="h-3 w-3" /> Owner: <span className="font-bold text-primary">{camp.userEmail}</span>
                              </p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                 <Mail className="h-3 w-3" /> Template: <span className="font-semibold">{camp.templateName}</span>
                              </p>
                           </div>
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
                                {camp.isActive ? <><Pause className="h-4 w-4" /> Deactivate</> : <><Play className="h-4 w-4" /> Activate</>}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-primary/5" />
                              <DropdownMenuItem 
                                 className="flex items-center gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors font-semibold"
                                 onClick={() => setCampaignToDelete({ id: camp.id, name: camp.name })}
                              >
                                <Trash2 className="h-4 w-4" /> Override Delete
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
             <Filter className="h-8 w-8 text-muted-foreground/30 mb-4" />
             <h4 className="font-black text-sm uppercase tracking-widest text-primary/60">No System Matches</h4>
             <Button variant="link" onClick={() => { setStatusFilter('all'); setTimeFilter('all'); setActiveFilter('all'); }} className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Clear All Constraints
             </Button>
          </div>
        )}
        {campaigns.length === 0 && (
          <div className="py-16 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
             <History className="h-10 w-10 text-muted-foreground/20 mb-4" />
             <h4 className="font-bold font-headline text-lg" >System Idle</h4>
             <p className="text-sm">No campaigns have been launched across the platform yet.</p>
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
               <Trash2 className="h-5 w-5 text-destructive" /> Admin Override?
            </AlertDialogTitle>
            <AlertDialogDescription className="py-2 text-sm">
              You are about to delete <span className="font-bold text-primary">"{campaignToDelete?.name}"</span>. 
              This campaign will be removed from the user's dashboard and the global grid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-10 font-bold border-none bg-muted">Cancel</AlertDialogCancel>
            <AlertDialogAction 
               disabled={isDeleting}
               onClick={(e) => { e.preventDefault(); handleDelete(); }}
               className="h-10 font-bold bg-destructive hover:bg-destructive/90"
            >
               {isDeleting ? 'Overriding...' : 'Confirm Override'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-10 border-primary/10 bg-background shadow-2xl">
          <DialogHeader className="items-center text-center">
            <div className="bg-primary/10 p-5 rounded-[2rem] mb-6 shadow-sm">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black font-headline tracking-tighter">Global Intelligence</DialogTitle>
            <DialogDescription className="text-sm font-bold uppercase tracking-widest text-muted-foreground pt-3 px-4">
              Generating administrative analytics for <span className="text-primary">{filteredCampaigns.length}</span> platform-wide campaigns.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8">
            <Label htmlFor="admin-report-email" className="text-[10px] font-black uppercase tracking-[0.3em] pl-1 text-muted-foreground">Admin Destination</Label>
            <Input
              id="admin-report-email"
              type="email"
              placeholder="admin@slpro.in"
              value={reportEmail}
              onChange={(e) => setReportEmail(e.target.value)}
              className="h-14 rounded-2xl bg-muted/30 border-primary/5 mt-2"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendReport(); }}
            />
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleSendReport} disabled={!reportEmail || isReporting} className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] bg-primary">
              {isReporting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              {isReporting ? 'Generating System Report...' : 'Dispatch Global Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
