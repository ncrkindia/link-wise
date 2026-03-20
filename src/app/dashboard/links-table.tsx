/**
 * @file app/dashboard/links-table.tsx
 * @description Interactive links management table for the authenticated dashboard.
 *
 * This is a Client Component (`'use client'`) that manages all link-related UI:
 *
 * **Filtering** (client-side, instant):
 *  - Protection status (All / Protected / Unprotected)
 *  - Created date range (All Time / Today / Past 24h / 7d / 30d / 1 Year)
 *  - Expiry status (All / Active / Expired / Expires Today / in 7d / 30d)
 *
 * **Export Tools** (act on currently filtered links):
 *  - Export CSV — Generates and downloads a `.csv` file in the browser.
 *  - Export PDF — Opens a print-formatted brand-matched window for PDF save.
 *  - Email Report — Opens a dialog to enter a recipient address, then calls
 *    the `sendReport` Server Action which dispatches an SMTP email.
 *
 * **Per-Link Actions** (via dropdown):
 *  - Copy short URL to clipboard.
 *  - Enable / Disable link (`toggleLinkActive` server action).
 *  - Delete link (`deleteLink` server action).
 *
 * Props:
 *  - `links: LinkType[]` — Pre-fetched array of the user's links from the server.
 */
'use client';
import { useState } from "react";

import { type Link as LinkType } from "@/lib/definitions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Copy, Edit, MoreHorizontal, Trash2, Lock, Power, Download, Mail, FileText } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { deleteLink, toggleLinkActive, sendReport } from "@/lib/actions";

export function LinksTable({ links }: { links: LinkType[] }) {
  const { toast } = useToast();
  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const [protectedFilter, setProtectedFilter] = useState('all');
  const [createdFilter, setCreatedFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  const handleCopy = (shortId: string) => {
    const url = `${domain}/s/${shortId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to clipboard!",
      description: url,
    });
  };

  const filteredLinks = links.filter((link) => {
    if (protectedFilter === 'protected' && !link.hasPassword) return false;
    if (protectedFilter === 'unprotected' && link.hasPassword) return false;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (createdFilter !== 'all') {
      const createdDate = new Date(link.createdAt);
      const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
      
      if (createdFilter === 'today' && createdDate < todayStart) return false;
      if (createdFilter === '1d' && daysDiff > 1) return false;
      if (createdFilter === '7d' && daysDiff > 7) return false;
      if (createdFilter === '30d' && daysDiff > 30) return false;
      if (createdFilter === '1y' && daysDiff > 365) return false;
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
    
    let csvContent = "Short ID,Original URL,Clicks,Protected,Status,Created At,Expires At\n";
    filteredLinks.forEach(link => {
      const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
      const status = !link.isActive ? 'Disabled' : (isExpired ? 'Expired' : 'Active');
      
      csvContent += `${link.id},"${link.originalUrl}",${link.clicks},${link.hasPassword ? 'Yes' : 'No'},${status},"${new Date(link.createdAt).toISOString()}","${link.expiresAt ? new Date(link.expiresAt).toISOString() : ''}"\n`;
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

  const handleExportPdf = () => {
    if (filteredLinks.length === 0) return;

    const rows = filteredLinks.map(link => {
      const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
      const status = !link.isActive ? 'Disabled' : (isExpired ? 'Expired' : 'Active');
      const statusColor = status === 'Active' ? '#16a34a' : status === 'Expired' ? '#dc2626' : '#6b7280';
      const statusBg = status === 'Active' ? '#f0fdf4' : status === 'Expired' ? '#fef2f2' : '#f9fafb';
      return `
        <tr>
          <td>${link.id}</td>
          <td class="url-cell" title="${link.originalUrl}">${link.originalUrl}</td>
          <td>${link.clicks}</td>
          <td>${link.hasPassword ? '🔒 Yes' : 'No'}</td>
          <td><span class="badge" style="color:${statusColor};background:${statusBg}">${status}</span></td>
          <td>${new Date(link.createdAt).toLocaleDateString()}</td>
          <td>${link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : '—'}</td>
        </tr>`;
    }).join('');

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Link-Wise Report — ${new Date().toLocaleDateString()}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #0f172a; }
            .header { text-align: center; margin-bottom: 36px; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; }
            .header h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; color: #0f172a; }
            .header p { color: #64748b; font-size: 14px; margin-top: 6px; }
            .meta { display: flex; gap: 24px; margin-bottom: 20px; font-size: 13px; color: #475569; }
            .meta span b { color: #0f172a; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { background: #f8fafc; padding: 10px 12px; text-align: left; font-weight: 600; color: #334155; border-bottom: 2px solid #e2e8f0; }
            td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #374151; vertical-align: top; }
            tr:last-child td { border-bottom: none; }
            tr:nth-child(even) { background: #f8fafc; }
            .url-cell { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #6b7280; }
            .badge { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 500; }
            .footer { margin-top: 36px; border-top: 2px solid #e2e8f0; padding: 24px 0 8px; display: flex; justify-content: space-between; align-items: flex-start; }
            .footer-brand h2 { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #0f172a; }
            .footer-brand p { font-size: 12px; color: #6366f1; font-weight: 500; margin-top: 4px; letter-spacing: 0.04em; }
            .footer-right { text-align: right; font-size: 12px; color: #94a3b8; line-height: 1.8; }
            .footer-right a { color: #94a3b8; text-decoration: none; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Link-Wise</h1>
            <p>Analytics &amp; Link Report</p>
          </div>
          <div class="meta">
            <span>Date: <b>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</b></span>
            <span>Total Links: <b>${filteredLinks.length}</b></span>
            <span>Total Clicks: <b>${filteredLinks.reduce((s, l) => s + l.clicks, 0)}</b></span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Short ID</th><th>Original URL</th><th>Clicks</th><th>Protected</th><th>Status</th><th>Created</th><th>Expires</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">
            <div class="footer-brand">
              <h2>Link-Wise</h2>
              <p>Part of the SL Pro Ecosystem</p>
            </div>
            <div class="footer-right">
              <a href="mailto:linkwise@slpro.in">✉ linkwise@slpro.in</a><br/>
              &copy; ${new Date().getFullYear()} LinkWise. All rights reserved.<br/>
              <span style="color:#cbd5e1">Generated: ${new Date().toISOString()}</span>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 300);
  };
  
  const [isEmailing, setIsEmailing] = useState(false);
  const handleEmailReport = async () => {
    if (!recipientEmail) return;
    if (filteredLinks.length === 0) return;
    setIsEmailing(true);
    setEmailDialogOpen(false);
    
    try {
        const result = await sendReport(recipientEmail, filteredLinks);
        if (result.success) {
            toast({ 
                title: "Report Sent!", 
                description: result.message + (result.previewUrl ? ' Check server logs for the Ethereal email preview URL.' : '') 
            });
        } else {
            toast({ variant: 'destructive', title: "Email Failed", description: result.message });
        }
    } finally {
        setIsEmailing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={protectedFilter} onValueChange={setProtectedFilter}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Protection" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Protection</SelectItem>
                <SelectItem value="protected">Protected</SelectItem>
                <SelectItem value="unprotected">Unprotected</SelectItem>
            </SelectContent>
        </Select>

        <Select value={createdFilter} onValueChange={setCreatedFilter}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Created Date" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="1d">Past 24 Hours</SelectItem>
                <SelectItem value="7d">Past 7 Days</SelectItem>
                <SelectItem value="30d">Past 30 Days</SelectItem>
                <SelectItem value="1y">Past Year</SelectItem>
            </SelectContent>
        </Select>

        <Select value={expiryFilter} onValueChange={setExpiryFilter}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Expiry Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Expiry</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="today">Expires Today</SelectItem>
                <SelectItem value="7d">Expires in 7 Days</SelectItem>
                <SelectItem value="30d">Expires in 30 Days</SelectItem>
            </SelectContent>
        </Select>
        
        {(protectedFilter !== 'all' || createdFilter !== 'all' || expiryFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => {
                setProtectedFilter('all');
                setCreatedFilter('all');
                setExpiryFilter('all');
            }}>Clear Filters</Button>
        )}
        <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={filteredLinks.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={filteredLinks.length === 0}>
                <FileText className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEmailDialogOpen(true)} disabled={filteredLinks.length === 0 || isEmailing}>
                <Mail className="mr-2 h-4 w-4" /> {isEmailing ? 'Emailing...' : 'Email Report'}
            </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Short Link</TableHead>
              <TableHead className="hidden md:table-cell">Original URL</TableHead>
              <TableHead className="hidden sm:table-cell">Clicks</TableHead>
              <TableHead className="hidden lg:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks.length > 0 ? filteredLinks.map((link) => (
            <TableRow key={link.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                    <a href={`${domain}/s/${link.id}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    /s/{link.id}
                    </a>
                    {link.hasPassword && <span title="Password Protected"><Lock className="h-3.5 w-3.5 text-muted-foreground ml-1" /></span>}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(link.id)}>
                        <Copy className="h-3.5 w-3.5"/>
                    </Button>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-xs truncate">
                {link.originalUrl}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{link.clicks.toLocaleString()}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {!link.isActive ? (
                  <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                ) : link.expiresAt && new Date(link.expiresAt) < new Date() ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <Badge variant="secondary">Active</Badge>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div>{format(new Date(link.createdAt), 'MMM dd, yyyy')}</div>
                {link.expiresAt && (
                   <div className="text-xs text-muted-foreground mt-1" title="Expiration Date">
                     Exp: {format(new Date(link.expiresAt), 'MMM dd, yyyy')}
                   </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleLinkActive(link.id)}>
                            <Power className="mr-2 h-4 w-4" />
                            {link.isActive ? 'Disable' : 'Enable'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteLink(link.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                    No links yet. Create your first one!
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Email Report</DialogTitle>
            <DialogDescription>
              Enter the email address to send the report of your {filteredLinks.length} filtered link(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleEmailReport(); }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEmailReport} disabled={!recipientEmail || isEmailing}>
              <Mail className="mr-2 h-4 w-4" />
              {isEmailing ? 'Sending...' : 'Send Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
