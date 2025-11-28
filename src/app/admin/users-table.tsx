'use client';
import { type User } from "@/lib/definitions";
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
import { Ban, MoreHorizontal, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { toggleUserBlock } from "@/lib/actions";

export function UsersTable({ users }: { users: User[] }) {

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Email</TableHead>
            <TableHead className="hidden sm:table-cell">Links</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="hidden lg:table-cell">Joined Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-medium">{user.id}</div>
                {user.isAdmin && <Badge variant="destructive" className="mt-1">Admin</Badge>}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{user.links?.length || 0}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant={user.isBlocked ? "outline" : "default"}>
                  {user.isBlocked ? 'Blocked' : 'Active'}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={user.isAdmin}>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleUserBlock(user.id)} disabled={user.isAdmin}>
                            {user.isBlocked ? <UserCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                            <span>{user.isBlocked ? 'Unblock' : 'Block'}</span>
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
