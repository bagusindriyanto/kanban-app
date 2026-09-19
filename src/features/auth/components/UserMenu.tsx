import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { EllipsisVerticalIcon, LogOutIcon } from 'lucide-react';
import { toast } from 'sonner';
import UserAvatar from '@/components/shared/UserAvatar';
import { useLogout } from '../api/logout';
import { useFetchCurrentUser } from '@/features/users/api/fetchCurrentUser';
import type { CurrentUser } from '@/features/users/api/query';
import { useIsMobile } from '@/hooks/useMobile';

const UserMenuSkeleton = () => {
  return (
    <>
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="grid flex-1 gap-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-7.5" />
      </div>
    </>
  );
};

const UserMenuContent = ({ currentUser }: { currentUser: CurrentUser }) => {
  return (
    <>
      <UserAvatar profile={currentUser} />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">
          {currentUser.name ?? 'User'}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {currentUser.role?.name ?? '-'}
        </span>
      </div>
    </>
  );
};

const UserMenu = () => {
  const isMobile = useIsMobile();
  const { data: currentUser, isLoading } = useFetchCurrentUser();
  const { mutateAsync: logoutMutate } = useLogout();

  const handleLogout = () => {
    toast.promise(logoutMutate, {
      loading: 'Sedang memproses log out...',
      success: () => {
        return 'Log out berhasil';
      },
      error: (err: Error) => {
        return {
          message: 'Log out gagal',
          description: err?.message || null,
        };
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            {isLoading || currentUser === undefined ? (
              <UserMenuSkeleton />
            ) : (
              <UserMenuContent currentUser={currentUser} />
            )}
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? 'top' : 'right'}
            align="end"
            sideOffset={4}
          >
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              {isLoading || currentUser === undefined ? (
                <UserMenuSkeleton />
              ) : (
                <UserMenuContent currentUser={currentUser} />
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default UserMenu;
