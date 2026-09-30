import KeysClient from '@/app/keys/KeysClient';
import { demoKeys, demoUsers } from '@/lib/demoData';

export default function DemoKeysPage() {
  return <KeysClient keys={demoKeys} users={demoUsers} readOnly />;
}
