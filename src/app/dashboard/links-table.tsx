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
import { Copy, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { deleteLink } from "@/lib/actions";

export function LinksTable({ links }: { links: LinkType[] }) {
  const { toast } = useToast();
  const domain = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopy = (shortId: string) => {
    const url = `${domain}/${shortId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to clipboard!",
      description: url,
    });
  };

  return (
    <div className="w-full overflow-x-auto">
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
          {links.length > 0 ? links.map((link) => (
            <TableRow key={link.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                    <a href={`${domain}/${link.id}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    /{link.id}
                    </a>
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
                <Badge variant={link.expiresAt && new Date(link.expiresAt) < new Date() ? "destructive" : "secondary"}>
                  {link.expiresAt && new Date(link.expiresAt) < new Date() ? 'Expired' : 'Active'}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">{format(new Date(link.createdAt), 'MMM dd, yyyy')}</TableCell>
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
  );
}
