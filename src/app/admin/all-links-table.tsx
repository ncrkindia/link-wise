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
import { MoreHorizontal, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { deleteLink } from "@/lib/actions";

export function AllLinksTable({ links }: { links: LinkType[] }) {
  const domain = typeof window !== 'undefined' ? window.location.origin : '';

  return (
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
          {links.map((link) => (
            <TableRow key={link.id}>
              <TableCell>
                <a href={`${domain}/${link.id}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    /{link.id}
                </a>
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
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteLink(link.id)}>
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
  );
}
