'use client';
import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { launchCampaign } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EmailTemplate, EmailAccount } from '@/lib/definitions';
import { Rocket, Users, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export function CampaignWizard({ templates, accounts, onComplete }: { 
  templates: EmailTemplate[], 
  accounts: EmailAccount[], 
  onComplete: () => void 
}) {
  const [step, setStep] = useState(1);
  const [state, action] = useFormState(launchCampaign, { message: '', success: false });
  const { toast } = useToast();

  const [campaignData, setCampaignData] = useState({
    name: '',
    templateId: '',
    accountId: '',
    recipients: ''
  });

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Campaign Launched!', description: state.message });
      onComplete();
    } else if (state.message) {
      toast({ title: 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, toast, onComplete]);

  const selectTemplate = templates.find(t => t.id === campaignData.templateId);
  const selectAccount = accounts.find(a => a.id === campaignData.accountId);
  const recipientCount = campaignData.recipients.split(/[\s,;]+/).filter(e => e.includes('@')).length;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 font-headline">
              <Rocket className="h-5 w-5 text-primary" />
              Launch New Campaign
            </CardTitle>
            <CardDescription>Follow the steps to prepare and send your tracked email campaign.</CardDescription>
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold font-headline">
            Step {step} of 4
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form action={action} className="space-y-8">
           {/* Step 1: Template selection */}
           {step === 1 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <Label htmlFor="name">Internal Campaign Name</Label>
                 <Input 
                   name="name" 
                   value={campaignData.name} 
                   onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                   placeholder="Spring Newsletter Launch" 
                   required 
                   className="h-11"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="templateId">Select Template</Label>
                 <Select 
                    name="templateId" 
                    value={campaignData.templateId} 
                    onValueChange={(val) => setCampaignData({...campaignData, templateId: val})}
                    required
                 >
                   <SelectTrigger className="h-11">
                     <SelectValue placeholder="Which message are you sending?" />
                   </SelectTrigger>
                   <SelectContent>
                     {templates.map(t => (
                       <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </div>
           )}

           {/* Step 2: Account Selection */}
           {step === 2 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <Label htmlFor="accountId">Select Sender Account</Label>
                 <Select 
                    name="accountId" 
                    value={campaignData.accountId} 
                    onValueChange={(val) => setCampaignData({...campaignData, accountId: val})}
                    required
                 >
                   <SelectTrigger className="h-11">
                     <SelectValue placeholder="Choose an SMTP account" />
                   </SelectTrigger>
                   <SelectContent>
                     {accounts.map(a => (
                       <SelectItem key={a.id} value={a.id}>{a.username} ({a.provider})</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </div>
           )}

           {/* Step 3: Recipients */}
           {step === 3 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <Label htmlFor="recipients">Recipient List</Label>
                 <Textarea 
                   name="recipients" 
                   value={campaignData.recipients} 
                   onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCampaignData({...campaignData, recipients: e.target.value})}
                   placeholder="user1@example.com, user2@example.com (one per line or comma separated)" 
                   className="min-h-[200px] leading-relaxed"
                   required
                 />
                 <p className="text-xs text-muted-foreground flex items-center gap-1.5 py-2 px-3 bg-secondary rounded-md">
                   <Users className="h-3.5 w-3.5" />
                   {recipientCount} valid emails detected.
                 </p>
               </div>
             </div>
           )}

           {/* Step 4: Summary & Launch */}
           {step === 4 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Card className="bg-muted/50 border-none shadow-none">
                   <CardContent className="p-4 space-y-1">
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Campaign Info</p>
                     <p className="font-bold text-sm">{campaignData.name || 'Unnamed Campaign'}</p>
                     <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {selectTemplate?.name || 'No template'}
                     </p>
                   </CardContent>
                 </Card>
                 <Card className="bg-muted/50 border-none shadow-none">
                   <CardContent className="p-4 space-y-1">
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Sender Account</p>
                     <p className="font-bold text-sm">{selectAccount?.username || 'No account'}</p>
                     <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {selectAccount?.provider} SMTP
                     </p>
                   </CardContent>
                 </Card>
               </div>
               
               <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/20 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                     <p className="font-headline font-bold text-sm">Ready to send to {recipientCount} recipients!</p>
                     <p className="text-[11px] text-muted-foreground">Unique tracking pixels will be generated and auto-inserted for every recipient.</p>
                   </div>
                 </div>
               </div>

               {/* Hidden inputs to capture step data */}
               <input type="hidden" name="name" value={campaignData.name} />
               <input type="hidden" name="templateId" value={campaignData.templateId} />
               <input type="hidden" name="accountId" value={campaignData.accountId} />
               <input type="hidden" name="recipients" value={campaignData.recipients} />
             </div>
           )}

           <div className="flex justify-between pt-4 border-t border-dashed">
             <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(s => s - 1)} 
                disabled={step === 1}
                className="h-11 px-6 font-bold"
             >
               <ArrowLeft className="mr-2 h-4 w-4" /> Back
             </Button>

             {step < 4 ? (
               <Button 
                 type="button" 
                 onClick={() => setStep(s => s + 1)}
                 disabled={(step === 1 && (!campaignData.name || !campaignData.templateId)) || (step === 2 && !campaignData.accountId) || (step === 3 && recipientCount === 0)}
                 className="h-11 px-8 font-bold"
               >
                 Next Step <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
             ) : (
               <Button type="submit" className="h-11 px-10 font-bold shadow-lg shadow-primary/20 animate-pulse hover:animate-none">
                 <Rocket className="mr-2 h-4 w-4 rotate-12" />
                 Launch Campaign Now
               </Button>
             )}
           </div>
        </form>
      </CardContent>
    </Card>
  );
}
