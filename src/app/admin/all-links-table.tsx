'use client';
import { type Link as LinkType } from "@/lib/definitions";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Trash2, Download } from "lucide-react";
import { format, subDays, subHours, isAfter } from "date-fns";
import { deleteLink } from "@/lib/actions";
import { useTransition, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function AllLinksTable({ links }: { links: LinkType[] }) {
  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const [isPending, startTransition] = useTransition();

  const [timeFilter, setTimeFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [protectedFilter, setProtectedFilter] = useState("all");

  const uniqueUsers = useMemo(() => {
    const users = new Set<string>();
    links.forEach(l => { if (l.userId) users.add(l.userId) });
    return Array.from(users);
  }, [links]);

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      // Time Filter
      if (timeFilter !== "all") {
        const linkDate = new Date(link.createdAt);
        const now = new Date();
        if (timeFilter === "24h" && !isAfter(linkDate, subHours(now, 24))) return false;
        if (timeFilter === "7d" && !isAfter(linkDate, subDays(now, 7))) return false;
        if (timeFilter === "30d" && !isAfter(linkDate, subDays(now, 30))) return false;
      }

      // User Filter
      if (userFilter !== "all") {
        if (userFilter === "anonymous" && link.userId !== null) return false;
        if (userFilter !== "anonymous" && link.userId !== userFilter) return false;
      }

      // Protected Filter
      if (protectedFilter !== "all") {
        if (protectedFilter === "protected" && !link.hasPassword) return false;
        if (protectedFilter === "public" && link.hasPassword) return false;
      }

      return true;
    });
  }, [links, timeFilter, userFilter, protectedFilter]);

  const exportCSV = () => {
    const headers = ["ID", "Original URL", "Owner", "Clicks", "Protected", "Status", "Created At"];
    const rows = filteredLinks.map(link => [
      link.id,
      link.originalUrl,
      link.userId || "Anonymous",
      link.clicks,
      link.hasPassword ? "Yes" : "No",
      link.isDeleted ? "Deleted" : "Active",
      new Date(link.createdAt).toISOString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(item => `"${item}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", encodedUri);
    downloadAnchorNode.setAttribute("download", "manage_links.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["ID", "Original URL", "Owner", "Clicks", "Status", "Created At"]],
      body: filteredLinks.map(link => [
        link.id,
        link.originalUrl.length > 30 ? link.originalUrl.substring(0, 30) + '...' : link.originalUrl,
        link.userId || "Anonymous",
        link.clicks,
        link.isDeleted ? "Deleted" : "Active",
        format(new Date(link.createdAt), 'MMM dd, yyyy')
      ]),
    });
    doc.save("manage_links.pdf");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="User Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="anonymous">Anonymous</SelectItem>
              {uniqueUsers.map(u => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={protectedFilter} onValueChange={setProtectedFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Protection Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="protected">Password Protected</SelectItem>
              <SelectItem value="public">Public Links</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Short Link</TableHead>
              <TableHead className="hidden lg:table-cell">Original URL</TableHead>
              <TableHead className="hidden sm:table-cell">Owner</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No links found for the selected filters.
                </TableCell>
              </TableRow>
            ) : filteredLinks.map((link) => (
              <TableRow key={link.id} className={link.isDeleted ? "opacity-60 bg-muted/50" : ""}>
                <TableCell>
                  <div className="flex items-center gap-2">
                      <a href={`${domain}/${link.id}`} target="_blank" rel="noopener noreferrer" className={`font-medium text-primary hover:underline ${link.isDeleted ? 'pointer-events-none text-muted-foreground' : ''}`}>
                          /{link.id}
                      </a>
                      {link.isDeleted && <Badge variant="outline" className="text-xs">Deleted</Badge>}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-xs truncate">
                  {link.originalUrl}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {link.userId ? <span className="font-mono text-xs">{link.userId}</span> : <Badge variant="secondary">Anonymous</Badge>}
                </TableCell>
                <TableCell>{link.clicks.toLocaleString()}</TableCell>
                <TableCell className="hidden lg:table-cell">{format(new Date(link.createdAt), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={link.isDeleted || isPending}>
                              <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => startTransition(() => { deleteLink(link.id) })} disabled={link.isDeleted || isPending}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
