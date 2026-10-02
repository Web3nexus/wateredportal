import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { AuditLog } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  ShieldCheck,
  Filter,
  Eye,
  FileText,
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Log for inspection
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = (page = 1) => {
    setIsLoading(true);
    adminService
      .getAuditLogs(actionFilter || undefined, page)
      .then((res) => {
        setLogs(res.logs.data);
        setCurrentPage(res.logs.current_page);
        setLastPage(res.logs.last_page);
        setTotalLogs(res.logs.total);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadLogs(1);
  }, [actionFilter]);

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('approve') || action.includes('create') || action.includes('login')) return 'success';
    if (action.includes('reject') || action.includes('suspend') || action.includes('delete')) return 'danger';
    if (action.includes('status') || action.includes('update')) return 'warning';
    return 'neutral';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/80 gap-4">
        <div>
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            System Integrity & Security
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Security & Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Log of administrative actions, application decisions, category changes, and authentication events
          </p>
        </div>

        <div className="font-mono text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
          Recorded Actions: <span className="text-blue-600 font-semibold">{totalLogs}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filter Action Type:</span>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
        >
          <option value="">All Actions</option>
          <option value="application_approved">Application Approved</option>
          <option value="application_rejected">Application Rejected</option>
          <option value="application_contact_required">Application Information Requested</option>
          <option value="member_category_reassigned">Category Reassigned</option>
          <option value="member_status_changed">Member Status Changed</option>
          <option value="broadcast_sent">Broadcast Message Dispatched</option>
          <option value="admin_securegate_login">Admin Secure Gate Login</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records match the filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action?.replace(/_/g, ' ')?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {log.user?.name || 'System Operator'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {log.user?.email || 'automated-pipeline'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {log.target_type ? (
                        <span>
                          {log.target_type.split('\\').pop()} #{log.target_id}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600 mr-1" />
                        <span>Inspect</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {currentPage} of {lastPage}
            </span>
            <div className="space-x-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => loadLogs(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= lastPage}
                onClick={() => loadLogs(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={`Audit Event: ${selectedLog.action}`}
          description={`Timestamp: ${new Date(selectedLog.created_at).toLocaleString()}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Operator</span>
                <span className="font-semibold text-slate-900">{selectedLog.user?.name || 'System Operator'}</span>
                <span className="text-slate-500 font-mono block text-[11px]">{selectedLog.user?.email || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">IP Address</span>
                <span className="font-mono text-slate-900 text-xs block">{selectedLog.ip_address || '127.0.0.1'}</span>
                <span className="text-slate-400 text-[10px] block">Security Origin</span>
              </div>
            </div>

            <div>
              <span className="text-slate-700 font-semibold block mb-1.5">Event Payload & Metadata</span>
              <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-56">
                {JSON.stringify(selectedLog.metadata, null, 2) || '{}'}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
