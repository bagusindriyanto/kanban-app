import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ALL_USER,
  useFilterStore,
  type SelectedUserId,
} from '@/stores/filterStore';
import { useFetchUsers } from '../api/fetchUsers';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/shared/UserAvatar';

const FilterUsers = ({ className }: { className?: string }) => {
  const { data: users } = useFetchUsers();

  const selectedUserId = useFilterStore((state) => state.selectedUserId);
  const setSelectedUserId = useFilterStore((state) => state.setSelectedUserId);

  const selectedUserLabel =
    selectedUserId === ALL_USER
      ? 'Semua PIC'
      : (users?.find((user) => user.user_id === selectedUserId)?.name ??
        'Semua PIC');

  return (
    <Select
      value={selectedUserId}
      onValueChange={(val) => setSelectedUserId(val as SelectedUserId)}
    >
      <SelectTrigger className={cn('w-40', className)} size="sm">
        <SelectValue placeholder="Pilih PIC">{selectedUserLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectLabel>PIC</SelectLabel>
          <SelectItem value={ALL_USER}>Semua PIC</SelectItem>
          {users?.map((user) => (
            <SelectItem value={user.user_id} key={user.user_id}>
              <div className="flex items-center gap-2">
                <UserAvatar size="sm" profile={user} />
                <span>{user.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default FilterUsers;
