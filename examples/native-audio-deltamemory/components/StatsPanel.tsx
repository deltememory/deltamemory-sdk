/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useMemoryStats, useUserStore } from '@/lib/state';

export default function StatsPanel() {
  const { stats } = useMemoryStats();
  const { currentUser } = useUserStore();

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <span className="stats-title">DeltaMemory</span>
        <span className="stats-user">{currentUser.name}</span>
      </div>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Recall</span>
          <span className="stat-value">
            {stats.lastRecallTime !== null ? `${stats.lastRecallTime}ms` : '—'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ingest</span>
          <span className="stat-value">
            {stats.lastIngestTime !== null ? `${stats.lastIngestTime}ms` : '—'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Recalls</span>
          <span className="stat-value">{stats.totalRecalls}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ingests</span>
          <span className="stat-value">{stats.totalIngests}</span>
        </div>
      </div>
    </div>
  );
}
