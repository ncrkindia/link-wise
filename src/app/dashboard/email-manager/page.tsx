/**
 * @file app/dashboard/email-manager/page.tsx
 * @description Main dashboard for the Email Campaign Manager.
 */
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEmailAccounts, getEmailTemplates, getEmailCampaigns } from "@/lib/data-email";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Layout, ListChecks, Server, Plus } from "lucide-react";
import { AccountList } from "@/components/email-manager/account-list";
import { TemplateList } from "@/components/email-manager/template-list";
import { CampaignList } from "@/components/email-manager/campaign-list";

export const metadata = {
    title: `Email Campaign Manager - ${process.env.NEXT_PUBLIC_APP_NAME}`,
    description: 'Manage SMTP accounts, email templates, and launch tracked campaigns.',
};

export default async function EmailManagerPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    // Fetch data in parallel
    const [accounts, templates, campaigns] = await Promise.all([
        getEmailAccounts(session.id),
        getEmailTemplates(session.id),
        getEmailCampaigns(session.id)
    ]);

    return (
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-headline font-bold">Email Campaigns</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        Compose, send, and track email blasts with unique tracking pixels.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Card className="bg-primary/5 border-primary/10 px-4 py-2 shadow-sm">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Accounts</div>
                        <div className="text-xl font-bold font-headline">{accounts.length}</div>
                    </Card>
                    <Card className="bg-primary/5 border-primary/10 px-4 py-2 shadow-sm">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Sent</div>
                        <div className="text-xl font-bold font-headline">
                            {campaigns.reduce((acc, curr) => acc + (curr.sendsCount || 0), 0).toLocaleString()}
                        </div>
                    </Card>
                </div>
            </div>

            <Tabs defaultValue="campaigns" className="w-full">
                <TabsList className="grid w-full grid-cols-3 sm:max-w-[500px] mb-8 bg-muted/50 p-1">
                    <TabsTrigger value="campaigns" className="flex items-center gap-2">
                        <ListChecks className="h-4 w-4" /> Campaigns
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <Layout className="h-4 w-4" /> Templates
                    </TabsTrigger>
                    <TabsTrigger value="accounts" className="flex items-center gap-2">
                        <Server className="h-4 w-4" /> Accounts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="campaigns" className="mt-0 border-none p-0 outline-none">
                    <CampaignList campaigns={campaigns} templates={templates} accounts={accounts} />
                </TabsContent>

                <TabsContent value="templates" className="mt-0 border-none p-0 outline-none">
                    <TemplateList templates={templates} />
                </TabsContent>

                <TabsContent value="accounts" className="mt-0 border-none p-0 outline-none">
                    <AccountList accounts={accounts} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
