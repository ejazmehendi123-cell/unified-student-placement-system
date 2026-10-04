import React, { useState, useEffect } from 'react';
import { recruiterApi } from '../../services/api';
import { InterviewRound } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Building2,
  ExternalLink,
  User,
} from 'lucide-react';

export const RecruiterInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<InterviewRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const res = await recruiterApi.getInterviews();
      if (res.success) {
        setInterviews(res.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Corporate Interview Pipeline</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Confirmed candidate interview slots, live evaluation meetings, and room venues
          </p>
        </div>
        <Badge variant="neutral" size="md">
          {interviews.length} Scheduled Rounds
        </Badge>
      </div>

      {interviews.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-10 h-10 text-charcoal-muted mx-auto mb-2" />
          <h3 className="text-base font-bold text-navy font-heading">No Interviews Scheduled</h3>
          <p className="text-xs text-charcoal-muted mt-1">
            Shortlist candidates from your applicant pool to schedule interview rounds.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {interviews.map((ir) => (
            <Card key={ir.id} className="p-5 border border-[#E5DFD5]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#EAE2D3]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-navy text-white text-[10px] font-bold rounded-sm uppercase tracking-wider">
                      Round {ir.roundNumber}
                    </span>
                    <h3 className="text-base font-bold text-navy font-heading">{ir.roundType}</h3>
                  </div>
                  <p className="text-xs font-semibold text-charcoal-muted mt-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-navy" />
                    Candidate: <strong>{ir.student?.fullName || 'Student'}</strong> ({ir.student?.rollNumber} • {ir.student?.branch} • {ir.student?.cgpa.toFixed(2)} CGPA)
                  </p>
                </div>

                <StatusBadge status={ir.status} />
              </div>

              {/* Slot Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3 bg-paper-dark rounded-sm border border-[#E5DFD5] text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Date</p>
                  <p className="font-semibold text-navy">
                    {new Date(ir.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Time Slot</p>
                  <p className="font-semibold text-navy">
                    {new Date(ir.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-muted">Mode / Location</p>
                  <p className="font-semibold text-navy">
                    {ir.mode === 'ONLINE' ? 'Virtual Video Conference' : ir.venue || 'Campus Hall'}
                  </p>
                </div>
              </div>

              {ir.meetingUrl && (
                <div className="flex items-center justify-between pt-3 border-t border-[#EAE2D3]">
                  <span className="text-xs text-charcoal-muted">Candidate is notified with meeting coordinates</span>
                  <a
                    href={ir.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-sm hover:bg-navy-light shadow-xs"
                  >
                    <Video className="w-4 h-4" /> Start Interview Session →
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
