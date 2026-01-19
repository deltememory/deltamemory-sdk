/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useUserStore } from '@/lib/state';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';

export default function Header() {
  const { users, currentUser, setCurrentUser } = useUserStore();
  const { connected } = useLiveAPIContext();

  return (
    <header>
      <div className="header-left">
        <h1>Customer Support Agent</h1>
        <p>Voice AI with persistent memory powered by DeltaMemory</p>
      </div>
      <div className="header-right">
        <select
          className="user-select"
          value={currentUser.id}
          onChange={(e) => {
            const user = users.find(u => u.id === e.target.value);
            if (user) setCurrentUser(user);
          }}
          disabled={connected}
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}