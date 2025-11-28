import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Link, MousePointerClick } from "lucide-react";

type StatProps = {
  analytics: {
    totalUsers: number;
    totalLinks: number;
    totalClicks: number;
  };
};

export function Stats({ analytics }: StatProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalUsers}</div>
          <p className="text-xs text-muted-foreground">registered users</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Links</CardTitle>
          <Link className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalLinks.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">links generated</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">tracked on all links</p>
        </CardContent>
      </Card>
    </div>
  );
}
