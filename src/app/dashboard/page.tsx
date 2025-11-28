import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardAnalytics, getUserLinks } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Link as LinkIcon, MousePointerClick } from "lucide-react";
import { LinksTable } from "./links-table";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const analytics = await getDashboardAnalytics(session.id);
    const links = await getUserLinks(session.id);

    return (
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="space-y-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-headline font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {session.id}. Here's an overview of your links.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Links</CardTitle>
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalLinks}</div>
                        <p className="text-xs text-muted-foreground">links created</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">across all links</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Performing Link</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">/{analytics.topLink?.id || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.topLink?.clicks.toLocaleString() || 0} clicks
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Links</CardTitle>
                </CardHeader>
                <CardContent>
                    <LinksTable links={links} />
                </CardContent>
            </Card>
        </div>
    );
}
