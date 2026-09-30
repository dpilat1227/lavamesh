import UsersClient from '@/app/users/UsersClient';
import { demoUserRecords, demoNodeCounts, demoNodesByUser } from '@/lib/demoData';

export default function DemoUsersPage() {
  return (
    <UsersClient
      users={demoUserRecords}
      nodeCounts={demoNodeCounts}
      nodesByUser={demoNodesByUser}
      readOnly
    />
  );
}
