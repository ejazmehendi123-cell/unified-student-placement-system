import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Download,
} from 'lucide-react';

export const TPOSISSync: React.FC = () => {
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);

  const loadSample = async () => {
    try {
      const res = await adminApi.getSampleSIS();
      if (res.success) {
        setSampleData(res.data || []);
        setJsonInput(JSON.stringify(res.data, null, 2));
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadSample();
  }, []);

  const handleSync = async () => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      let parsed = [];
      if (jsonInput.trim()) {
        parsed = JSON.parse(jsonInput);
      }
      const res = await adminApi.syncSIS(parsed);
      if (res.success) {
        setSyncResult(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Invalid JSON format or sync error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Mock SIS Synchronization Engine</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Synchronize student academic records, GPA metrics, and backlog counts from University SIS
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          isLoading={isLoading}
          onClick={handleSync}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Execute Batch Sync
        </Button>
      </div>

      {/* Advisory Banner */}
      <Alert type="info" title="SIS Integration Adapter Notice">
        This is a high-fidelity mock SIS integration adapter for institutional staging. It simulates live batch syncing from registrar databases without requiring external network dependencies.
      </Alert>

      {/* Results Matrix if sync has executed */}
      {syncResult && (
        <Card className="p-5 border-l-4 border-l-sage">
          <h3 className="text-sm font-bold text-navy font-heading mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-sage" /> Synchronization Summary Report
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
            <div className="p-3 bg-paper-dark rounded-sm border border-[#E5DFD5]">
              <p className="text-[10px] uppercase font-bold text-charcoal-muted">Processed</p>
              <p className="text-xl font-bold text-navy mt-0.5">{syncResult.totalProcessed}</p>
            </div>
            <div className="p-3 bg-sage-50 rounded-sm border border-sage/30">
              <p className="text-[10px] uppercase font-bold text-sage-dark">New Records Imported</p>
              <p className="text-xl font-bold text-sage-dark mt-0.5">{syncResult.importedCount}</p>
            </div>
            <div className="p-3 bg-navy-50 rounded-sm border border-navy-100">
              <p className="text-[10px] uppercase font-bold text-navy">Academics Updated</p>
              <p className="text-xl font-bold text-navy mt-0.5">{syncResult.updatedCount}</p>
            </div>
            <div className="p-3 bg-paper-dark rounded-sm border border-[#E5DFD5]">
              <p className="text-[10px] uppercase font-bold text-charcoal-muted">Skipped / Unchanged</p>
              <p className="text-xl font-bold text-charcoal mt-0.5">{syncResult.skippedCount}</p>
            </div>
          </div>

          {syncResult.errors && syncResult.errors.length > 0 && (
            <div className="p-3 bg-clay-50 border border-clay/30 rounded-sm text-xs text-clay-dark">
              <p className="font-bold mb-1">Validation Errors ({syncResult.errors.length}):</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {syncResult.errors.map((e: any, idx: number) => (
                  <li key={idx}>
                    Roll No: <strong>{e.rollNumber}</strong> — {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* JSON Batch Editor & Sample Preview */}
      <Card className="p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAE2D3]">
          <div>
            <h3 className="text-sm font-bold text-navy font-heading flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-brass" /> Batch SIS Payload Configuration (JSON / CSV schema)
            </h3>
            <p className="text-[11px] text-charcoal-muted">
              Edit the batch payload below or click Execute Sync to process the records into the database.
            </p>
          </div>

          <Button size="sm" variant="outline" onClick={loadSample}>
            Reset Sample Data
          </Button>
        </div>

        <textarea
          rows={12}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full font-mono text-[11px] p-3 bg-paper-dark border border-[#D8D3C8] rounded-sm text-charcoal leading-relaxed focus:ring-1 focus:ring-navy"
        />

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-charcoal-muted font-medium">
            Format: Array of student objects with rollNumber, name, email, branch, cgpa, backlogCount
          </span>

          <Button size="sm" variant="primary" isLoading={isLoading} onClick={handleSync}>
            Run Sync Process Now
          </Button>
        </div>
      </Card>
    </div>
  );
};
