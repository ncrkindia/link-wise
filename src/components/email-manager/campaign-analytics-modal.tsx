'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getCampaignSends } from '@/lib/data-email';
import { CampaignSend } from '@/lib/definitions';
import { Loader2, Mail, MapPin, MousePointer2, Calendar } from 'lucide-react';

export function CampaignAnalyticsModal({ campaignId, campaignName, isOpen, onClose }: { 
  campaignId: string, 
  campaignName: string,
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [sends, setSends] = useState<CampaignSend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/campaign-analytics/${campaignId}`)
        .then(res => res.json())
        .then(data => {
            setSends(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }
  }, [isOpen, campaignId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-primary/5 border-b border-primary/10">
          <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <MousePointer2 className="h-5 w-5 text-primary" />
             </div>
             {campaignName}
          </DialogTitle>
          <DialogDescription>
             Detailed drill-down of recipient engagement and open events.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto p-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm font-bold text-muted-foreground">Fetching telemetry data...</p>
             </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-primary/5">
                  <TableHead className="font-bold">Recipient</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Last Opened</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sends.map((send) => (
                  <TableRow key={send.id} className="group border-primary/5 hover:bg-primary/5 transition-colors">
                    <TableCell className="font-medium flex items-center gap-2">
                       <div className="p-1.5 bg-muted rounded group-hover:bg-white transition-colors">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                       </div>
                       {send.recipient}
                    </TableCell>
                    <TableCell>
                       <Badge variant={send.openedAt ? 'default' : 'secondary'} className={`text-[10px] h-5 ${send.openedAt ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}`}>
                          {send.openedAt ? 'OPENED' : 'SENT'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground italic">
                       {send.openedAt ? (
                          <span className="flex items-center gap-1.5 not-italic font-semibold text-foreground">
                             <Calendar className="h-3 w-3 text-primary" />
                             {new Date(send.openedAt).toLocaleString()}
                          </span>
                       ) : 'Never'}
                    </TableCell>
                    <TableCell>
                       {send.countryCode ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                             <MapPin className="h-3.5 w-3.5 text-primary" />
                             {send.countryCode}
                          </div>
                       ) : (
                          <span className="text-[10px] text-muted-foreground/30">N/A</span>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
                {sends.length === 0 && (
                   <TableRow>
                      <TableCell colSpan={4} className="text-center py-24 text-muted-foreground italic">
                         No send records found for this campaign.
                      </TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
