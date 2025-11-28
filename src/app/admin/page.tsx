import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminAnalytics, getAllUsers, getAllLinks } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stats } from "./stats";
import { AnalyticsChart } from "./analytics-chart";
import { UsersTable } from "./users-table";
import { AllLinksTable } from "./all-links-table";

export default async function AdminPage() {
    const session = await getSession();
    if (!session?.isAdmin) {
        redirect('/dashboard');
    }

    const analytics = await getAdminAnalytics();
    const users = await getAllUsers();
    const links = await getAllLinks();

    return (
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="space-y-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-headline font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Full application overview and management tools.</p>
            </div>
            
            <Stats analytics={analytics} />

            <Tabs defaultValue="analytics" className="mt-8">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="users">Manage Users</TabsTrigger>
                    <TabsTrigger value="links">Manage Links</TabsTrigger>
                </TabsList>
                <TabsContent value="analytics" className="mt-4">
                    <AnalyticsChart data={analytics.linkActivity} />
                </TabsContent>
                <TabsContent value="users" className="mt-4">
                    <UsersTable users={users} />
                </TabsContent>
                <TabsContent value="links" className="mt-4">
                    <AllLinksTable links={links} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
