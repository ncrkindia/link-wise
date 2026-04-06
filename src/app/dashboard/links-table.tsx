'use client';

import { useState } from "react";
import { type Link as LinkType, type Click as ClickType } from "@/lib/definitions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Copy, Edit, MoreHorizontal, Trash2, Lock, Power, Download, 
  Mail, FileText, ShieldCheck, Code, Globe, UserCheck, 
  Activity, Calendar, MapPin, Monitor, ExternalLink, RefreshCw, Layers
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { deleteLink, toggleLinkActive, sendReport, getAnalytics } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function LinksTable({ links }: { links: LinkType[] }) {
  const { toast } = useToast();
  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const [protectedFilter, setProtectedFilter] = useState('all');
  const [createdFilter, setCreatedFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isEmailing, setIsEmailing] = useState(false);

  // Analytics Modal State
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);
  const [analyticsData, setAnalyticsData] = useState<ClickType[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const getFullUrl = (link: LinkType) => {
    return link.isPixel ? `${domain}/p/${link.id}` : `${domain}/s/${link.id}`;
  };

  const handleCopy = (link: LinkType) => {
    const url = getFullUrl(link);
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to clipboard!",
      description: url,
    });
  };

  const handleCopyHtml = (link: LinkType) => {
    const url = getFullUrl(link);
    const html = `<img src="${url}" alt="" width="1" height="1" style="display:none;opacity:0;" />`;
    navigator.clipboard.writeText(html);
    toast({
      title: "HTML Snippet Copied!",
      description: "Paste this into your email HTML.",
    });
  };

  const handleViewAnalytics = async (link: LinkType) => {
    setSelectedLink(link);
    setAnalyticsOpen(true);
    setIsLoadingAnalytics(true);
    setAnalyticsData([]);
    
    try {
      const data = await getAnalytics(link.id);
      setAnalyticsData(data);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to load analytics.',
      });
      setAnalyticsOpen(false);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const filteredLinks = links.filter((link) => {
    if (protectedFilter === 'protected' && !link.hasPassword) return false;
    if (protectedFilter === 'unprotected' && link.hasPassword) return false;

    if (typeFilter === 'pixel' && !link.isPixel) return false;
    if (typeFilter === 'link' && link.isPixel) return false;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (createdFilter !== 'all') {
      const createdDate = new Date(link.createdAt);
      const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
      
      if (createdFilter === 'today' && (createdDate < todayStart)) return false;
      if (createdFilter === '1d' && daysDiff > 1) return false;
      if (createdFilter === '7d' && daysDiff > 7) return false;
      if (createdFilter === '30d' && daysDiff > 30) return false;
    }

    if (expiryFilter !== 'all') {
      const isExpired = link.expiresAt && new Date(link.expiresAt) < now;
      if (expiryFilter === 'active' && isExpired) return false;
      if (expiryFilter === 'expired' && !isExpired) return false;
      
      if (['today', '7d', '30d'].includes(expiryFilter)) {
        if (!link.expiresAt) return false;
        const expiryDate = new Date(link.expiresAt);
        const daysDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
        
        if (expiryFilter === 'today' && (expiryDate < todayStart || expiryDate > new Date(todayStart.getTime() + 86400000))) return false;
        if (expiryFilter === '7d' && (daysDiff < 0 || daysDiff > 7)) return false;
        if (expiryFilter === '30d' && (daysDiff < 0 || daysDiff > 30)) return false;
      }
    }

    return true;
  });

  const handleExportCsv = () => {
    if (filteredLinks.length === 0) return;
    
    let csvContent = "Short ID,Type,Original URL/Campaign,Clicks/Opens,Protected,Status,Created At,Expires At\n";
    filteredLinks.forEach(link => {
      const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
      const status = !link.isActive ? 'Disabled' : (isExpired ? 'Expired' : 'Active');
      const type = link.isPixel ? 'Pixel Tracker' : 'Short Link';
      
      csvContent += `${link.id},${type},"${link.originalUrl}",${link.clicks},${link.hasPassword ? 'Yes' : 'No'},${status},"${new Date(link.createdAt).toISOString()}","${link.expiresAt ? new Date(link.expiresAt).toISOString() : ''}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `linkwise_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Export Complete", description: "Your CSV report has been downloaded." });
  };

  const handleEmailReport = async () => {
    if (!recipientEmail) return;
    if (filteredLinks.length === 0) return;
    setIsEmailing(true);
    setEmailDialogOpen(false);
    
    try {
        const result = await sendReport(recipientEmail, filteredLinks, {
            type: typeFilter,
            protected: protectedFilter,
            created: createdFilter,
            expiry: expiryFilter
        });
        if (result.success) {
            toast({ 
                title: "Report Sent!", 
                description: result.message
            });
        } else {
            toast({ variant: 'destructive', title: "Email Failed", description: result.message });
        }
    } finally {
        setIsEmailing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 bg-muted/20 p-2 rounded-xl border border-primary/5 shadow-inner">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] bg-background border-primary/5 text-xs font-bold uppercase tracking-wider h-10 rounded-lg">
                <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="link">Short Links</SelectItem>
                <SelectItem value="pixel">Pixels</SelectItem>
            </SelectContent>
        </Select>

        <Select value={protectedFilter} onValueChange={setProtectedFilter}>
            <SelectTrigger className="w-[140px] bg-background border-primary/5 text-xs font-bold uppercase tracking-wider h-10 rounded-lg">
                <SelectValue placeholder="Protection" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Protection</SelectItem>
                <SelectItem value="protected">Protected</SelectItem>
                <SelectItem value="unprotected">Unprotected</SelectItem>
            </SelectContent>
        </Select>

        <Select value={createdFilter} onValueChange={setCreatedFilter}>
            <SelectTrigger className="w-[150px] bg-background border-primary/5 text-xs font-bold uppercase tracking-wider h-10 rounded-lg">
                <SelectValue placeholder="Created" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="1d">Past 24h</SelectItem>
                <SelectItem value="7d">Past 7d</SelectItem>
                <SelectItem value="30d">Past 30d</SelectItem>
            </SelectContent>
        </Select>
        
        <Select value={expiryFilter} onValueChange={setExpiryFilter}>
            <SelectTrigger className="w-[140px] bg-background border-primary/5 text-xs font-bold uppercase tracking-wider h-10 rounded-lg">
                <SelectValue placeholder="Expiry" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Expiry</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="expired">Expired Only</SelectItem>
                <SelectItem value="today">Expires Today</SelectItem>
            </SelectContent>
        </Select>

        {(protectedFilter !== 'all' || createdFilter !== 'all' || expiryFilter !== 'all' || typeFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => {
                setProtectedFilter('all');
                setCreatedFilter('all');
                setExpiryFilter('all');
                setTypeFilter('all');
            }} className="text-[10px] uppercase font-black tracking-widest text-primary/60 hover:text-primary transition-colors">Reset</Button>
        )}

        <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={filteredLinks.length === 0} className="rounded-lg h-10 border-primary/5 shadow-sm font-bold text-xs">
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="default" size="sm" onClick={() => setEmailDialogOpen(true)} disabled={filteredLinks.length === 0 || isEmailing} className="rounded-lg h-10 shadow-lg bg-primary text-white font-bold text-xs hover:scale-105 transition-transform">
                <Mail className="mr-2 h-4 w-4" /> Report
            </Button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-3xl border border-primary/10 shadow-2xl bg-card">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-primary/5">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[220px] font-black text-primary/60 uppercase text-[10px] tracking-widest pl-8 py-5">Tracked Asset</TableHead>
              <TableHead className="hidden md:table-cell font-black text-primary/60 uppercase text-[10px] tracking-widest py-5">Target / Campaign</TableHead>
              <TableHead className="hidden sm:table-cell font-black text-primary/60 uppercase text-[10px] tracking-widest text-center py-5">Activity</TableHead>
              <TableHead className="hidden lg:table-cell font-black text-primary/60 uppercase text-[10px] tracking-widest py-5">Status</TableHead>
              <TableHead className="hidden lg:table-cell text-right font-black text-primary/60 uppercase text-[10px] tracking-widest pr-8 py-5">Created</TableHead>
              <TableHead className="text-right pr-8 py-5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks.length > 0 ? filteredLinks.map((link) => (
            <TableRow key={link.id} className="group transition-all hover:bg-primary/5 border-primary/5">
              <TableCell className="py-6 pl-8">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl transition-all shadow-sm",
                        link.isPixel ? "bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                      )}>
                        {link.isPixel ? <ShieldCheck className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col">
                        <a 
                          href={getFullUrl(link)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-black text-base hover:underline truncate transition-colors decoration-primary/30 tracking-tight"
                        >
                          {link.isPixel ? `/p/${link.id}` : `/s/${link.id}`}
                        </a>
                        {link.hasPassword && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase mt-0.5">
                            <Lock className="h-2.5 w-2.5" /> Password Locked
                          </span>
                        )}
                      </div>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                      <Button variant="secondary" size="sm" className="h-7 px-2.5 text-[9px] uppercase font-black tracking-widest rounded-lg bg-white/50 border border-primary/5 hover:bg-white" onClick={() => handleCopy(link)}>
                          <Copy className="h-3 w-3 mr-1.5"/> Copy
                      </Button>
                      <Button variant="secondary" size="sm" className="h-7 px-2.5 text-[9px] uppercase font-black tracking-widest rounded-lg bg-white/50 border border-primary/5 hover:bg-white text-primary" onClick={() => handleViewAnalytics(link)}>
                          <Activity className="h-3 w-3 mr-1.5"/> Analytics
                      </Button>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-[240px] py-6">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-foreground/80 break-all line-clamp-1" title={link.originalUrl}>{link.originalUrl}</span>
                  {link.isPixel ? (
                     <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                       Campaign Tracker
                     </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                       Redirect Link
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-center py-6">
                <div className="flex flex-col items-center group/data cursor-pointer" onClick={() => handleViewAnalytics(link)}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black tracking-tighter transition-transform group-hover/data:scale-110">{link.clicks.toLocaleString()}</span>
                    {link.clicks > 500 && <UserCheck className="h-3.5 w-3.5 text-green-500" />}
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest group-hover/data:text-primary transition-colors">
                    {link.isPixel ? 'Total opens' : 'Total clicks'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell py-6">
                <div className="flex flex-col gap-1.5">
                  {!link.isActive ? (
                    <Badge variant="outline" className="w-fit text-[9px] uppercase font-black px-2.5 py-0.5 border-muted-foreground/20 text-muted-foreground bg-muted/5 shadow-sm">Suspended</Badge>
                  ) : link.expiresAt && new Date(link.expiresAt) < new Date() ? (
                    <Badge variant="destructive" className="w-fit text-[9px] uppercase font-black px-2.5 py-0.5 shadow-md border-none animate-pulse">Terminated</Badge>
                  ) : (
                    <Badge variant="secondary" className={cn(
                      "w-fit text-[9px] uppercase font-black px-2.5 py-0.5 border-none shadow-md",
                      link.isPixel ? "bg-indigo-500 text-white" : "bg-primary text-white"
                    )}>
                      Operational
                    </Badge>
                  )}
                  {link.expiresAt && (
                    <span className="text-[9px] font-bold text-destructive/70 uppercase pl-1">
                      Expires {format(new Date(link.expiresAt), 'MMM dd')}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-right py-6 pr-8">
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs font-black text-foreground/80">{format(new Date(link.createdAt), 'MMM dd, yyyy')}</div>
                  <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">{format(new Date(link.createdAt), 'HH:mm aaa')}</div>
                </div>
              </TableCell>
              <TableCell className="text-right pr-8 py-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-primary/10 hover:text-primary shadow-sm">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 p-2.5 rounded-2xl shadow-2xl border-primary/10 bg-white/95 backdrop-blur-md">
                        <DropdownMenuItem onClick={() => handleViewAnalytics(link)} className="rounded-xl p-3.5 font-black text-[10px] uppercase tracking-widest bg-primary/5 text-primary mb-1">
                            <Activity className="mr-3 h-4 w-4" />
                            Launch Analytics Explorer
                        </DropdownMenuItem>
                        {link.isPixel && (
                          <DropdownMenuItem onClick={() => handleCopyHtml(link)} className="rounded-xl p-3.5 font-bold text-[10px] uppercase tracking-widest">
                              <Code className="mr-3 h-4 w-4 text-indigo-500" />
                              Copy Injection Snippet
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleCopy(link)} className="rounded-xl p-3.5 font-bold text-[10px] uppercase tracking-widest">
                            <Copy className="mr-3 h-4 w-4 text-primary" />
                            Copy Reference Link
                        </DropdownMenuItem>
                        <div className="h-px bg-muted mx-2 my-2" />
                        <DropdownMenuItem onClick={() => toggleLinkActive(link.id)} className="rounded-xl p-3.5 font-bold text-[10px] uppercase tracking-widest">
                            <Power className="mr-3 h-4 w-4" />
                            {link.isActive ? 'Suspend' : 'Activate'} Asset
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl p-3.5 font-black text-[10px] uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => deleteLink(link.id)}>
                            <Trash2 className="mr-3 h-4 w-4" />
                            Purge Permanent
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
                <TableCell colSpan={6} className="text-center h-64 text-muted-foreground border-none">
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-muted/30 p-6 rounded-full">
                        <Layers className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-black text-sm uppercase tracking-widest">No matching datasets</p>
                        <p className="text-xs">Adjust your filters or create a new tracking asset.</p>
                      </div>
                      <Button variant="link" size="sm" onClick={() => {
                          setProtectedFilter('all');
                          setCreatedFilter('all');
                          setExpiryFilter('all');
                          setTypeFilter('all');
                      }} className="text-primary font-black uppercase text-[10px] tracking-widest">Clear All Constraints</Button>
                    </div>
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>

      {/* Analytics Modal */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[2.5rem] border-primary/10 shadow-[0_0_100px_rgba(0,0,0,0.1)] bg-background">
          <DialogHeader className="p-10 pb-6 bg-gradient-to-b from-muted/30 to-background">
            <div className="flex items-center gap-6 mb-6">
               <div className={cn(
                 "p-4 rounded-[1.5rem] shadow-lg transition-transform hover:scale-105",
                 selectedLink?.isPixel ? "bg-indigo-500 text-white" : "bg-primary text-white"
               )}>
                 <Activity className="h-8 w-8" />
               </div>
               <div className="flex flex-col gap-1">
                  <DialogTitle className="text-3xl font-black font-headline tracking-tighter leading-none">
                    Analytics Explorer
                  </DialogTitle>
                  <DialogDescription className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    {selectedLink?.isPixel ? 'Campaign Tracker' : 'Short Link'} 
                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                    ID: <span className="text-foreground">{selectedLink?.id}</span>
                  </DialogDescription>
               </div>
               <div className="ml-auto flex flex-col items-end gap-2">
                 <div className="flex items-center gap-1.5 bg-background border border-primary/10 px-4 py-2 rounded-2xl shadow-sm">
                   <UserCheck className="h-4 w-4 text-primary" />
                   <span className="text-xl font-black tracking-tighter">{analyticsData.length.toLocaleString()}</span>
                   <span className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">{selectedLink?.isPixel ? 'Opens' : 'Accesses'}</span>
                 </div>
               </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-primary/10 shadow-sm">
               <div className="p-2 bg-muted/40 rounded-xl">
                 <Globe className="h-4 w-4 text-muted-foreground" />
               </div>
               <span className="text-xs font-mono font-medium text-muted-foreground truncate max-w-[550px] py-1" title={selectedLink?.originalUrl}>
                 {selectedLink?.originalUrl}
               </span>
               <a href={selectedLink ? getFullUrl(selectedLink) : '#'} target="_blank" className="ml-auto flex items-center gap-2 h-9 px-4 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-primary/5 hover:border-primary">
                 Visit Source <ExternalLink className="h-3 w-3" />
               </a>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-10 py-4 custom-scrollbar">
            {isLoadingAnalytics ? (
              <div className="h-80 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <RefreshCw className="h-12 w-12 text-primary animate-spin" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">Syncing Datasets</p>
                  <p className="text-[10px] text-muted-foreground/60 font-bold italic">Fetching individual access records from edge nodes...</p>
                </div>
              </div>
            ) : analyticsData.length > 0 ? (
              <div className="rounded-[1.5rem] border border-primary/5 overflow-hidden bg-background shadow-lg mb-8">
                <Table>
                  <TableHeader className="bg-muted/30 border-b border-primary/5">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 pl-8">Event Timestamp</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Access Identity (IP)</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-center">Geography</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 pr-8">Device Configuration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.map((click) => {
                       const ua = click.userAgent?.toLowerCase() || '';
                       const isMobile = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone');
                       
                       return (
                        <TableRow key={click.id} className="hover:bg-primary/[0.02] transition-colors border-primary/5">
                          <TableCell className="py-5 pl-8 border-none">
                            <div className="flex flex-col">
                               <div className="text-sm font-black flex items-center gap-2">
                                 <Calendar className="h-3.5 w-3.5 text-primary/50" />
                                 {format(new Date(click.clickedAt), 'MMM dd, HH:mm:ss')}
                               </div>
                               <div className="text-[10px] text-muted-foreground font-black uppercase flex items-center gap-2 mt-1">
                                 <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                 {format(new Date(click.clickedAt), 'yyyy')} Session
                               </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 border-none">
                             <div className="flex items-center gap-2">
                               <div className="text-[11px] font-mono font-bold bg-muted/40 px-3 py-1.5 rounded-lg text-muted-foreground border border-muted/50 shadow-sm">
                                 {click.ipAddress || '0.0.0.0'}
                               </div>
                             </div>
                          </TableCell>
                          <TableCell className="py-5 text-center border-none">
                             {click.countryCode ? (
                               <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 border-emerald-200/50 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                                 <MapPin className="h-2.5 w-2.5 mr-1.5" />
                                 {click.countryCode}
                               </Badge>
                             ) : (
                               <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Global Edge</span>
                             )}
                          </TableCell>
                          <TableCell className="py-5 pr-8 border-none">
                             <div className="flex items-center gap-3 bg-muted/10 p-2 rounded-xl border border-primary/5">
                               {isMobile ? 
                                 <div className="p-1.5 bg-indigo-500/10 text-indigo-600 rounded-lg"><Monitor className="h-3.5 w-3.5 rotate-90" /></div> : 
                                 <div className="p-1.5 bg-primary/10 text-primary rounded-lg"><Monitor className="h-3.5 w-3.5" /></div>
                               }
                               <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[220px]" title={click.userAgent}>
                                 {click.userAgent || 'Anonymous Gateway'}
                               </span>
                             </div>
                          </TableCell>
                        </TableRow>
                       );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center gap-6 text-muted-foreground">
                <div className="p-10 bg-muted/20 rounded-full relative">
                   <Activity className="h-16 w-16 text-muted-foreground/20" />
                   <div className="absolute inset-0 border-4 border-dashed border-muted-foreground/10 animate-[spin_20s_linear_infinite] rounded-full" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="font-black text-lg uppercase tracking-widest text-muted-foreground/50">Dataset Empty</p>
                  <p className="text-xs font-bold text-center text-muted-foreground/60 max-w-[300px] leading-relaxed">
                    Access telemetry has not been recorded yet. Share the tracking asset to start gathering intelligence.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="p-8 bg-muted/10 border-t border-primary/5 flex items-center">
             <div className="flex items-center gap-2 mr-auto text-muted-foreground">
                <ShieldCheck className="h-4 w-4 opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Encryption Enabled • Real-time Data</span>
             </div>
             <Button variant="outline" onClick={() => setAnalyticsOpen(false)} className="rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-[0.2em] border-primary/10 bg-white hover:bg-black hover:text-white transition-all shadow-xl">
               Dismiss Interface
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Email Report Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-10 border-primary/10 shadow-[0_0_100px_rgba(0,0,0,0.1)] bg-background">
          <DialogHeader className="items-center text-center">
            <div className="bg-primary/10 p-5 rounded-[2rem] mb-6 shadow-sm">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black font-headline tracking-tighter leading-none">Intelligence Export</DialogTitle>
            <DialogDescription className="text-sm font-bold uppercase tracking-widest text-muted-foreground pt-3 leading-relaxed">
              Dispatching comprehensive analytics for <span className="text-primary">{filteredLinks.length}</span> datasets.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] pl-1 text-muted-foreground">Target Recipient Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="analyst@slpro.in"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="h-14 rounded-2xl bg-muted/30 border-primary/5 focus:ring-4 focus:ring-primary/10 focus:border-primary/20 text-sm font-bold placeholder:font-medium transition-all"
                onKeyDown={(e) => { if (e.key === 'Enter') handleEmailReport(); }}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleEmailReport} disabled={!recipientEmail || isEmailing} className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 bg-primary text-white hover:scale-[1.02] active:scale-95 transition-all">
              {isEmailing ? (
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
