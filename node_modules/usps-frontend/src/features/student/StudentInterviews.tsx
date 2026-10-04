import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
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
  Info,
} from 'lucide-react';

export const StudentInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<InterviewRound[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getInterviews();
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
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DFD5] gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy font-heading">Interview Schedule & Technical Rounds</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Confirmed interview slots, online meeting links, and candidate preparation guidelines
          </p>
        </div>
        <Badge variant="neutral" size="md">
          {interviews.length} Scheduled Rounds
        </Badge>
      </div>

      {interviews.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-10 h-10 text-charcoal-muted mx-auto mb-2" />
          <h3 className="text-base font-bold text-navy font-heading">No Upcoming Interviews</h3>
          <p className="text-xs text-charcoal-muted mt-1">
            When recruiters shortlist your application, your interview slots and instructions will appear here.
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
                  <p className="text-xs font-semibold text-charcoal-muted flex items-center gap-1 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-brass" />
                    {ir.drive?.jobRole} • {ir.drive?.company?.name || 'Recruiting Partner'}
                  </p>
                </div>

                <StatusBadge status={ir.status} />
              </div>

              {/* Date, Time, Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3 bg-paper-dark rounded-sm border border-[#E5DFD5] text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brass" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-charcoal-muted">Date</p>
                    <p className="font-semibold text-navy">
                      {new Date(ir.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brass" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-charcoal-muted">Time Slot</p>
                    <p className="font-semibold text-navy">
                      {new Date(ir.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {ir.mode === 'ONLINE' ? <Video className="w-4 h-4 text-sage" /> : <MapPin className="w-4 h-4 text-clay" />}
                  <div>
                    <p className="text-[10px] uppercase font-bold text-charcoal-muted">Mode & Location</p>
                    <p className="font-semibold text-navy">
                      {ir.mode === 'ONLINE' ? 'Virtual Video Conference' : ir.venue || 'Campus Placement Hall'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions & Link */}
              {ir.studentInstructions && (
                <div className="p-3 bg-navy-50/60 border border-navy-100 rounded-sm text-xs text-navy-dark leading-relaxed">
                  <span className="font-bold flex items-center gap-1 mb-0.5">
                    <Info className="w-3.5 h-3.5 text-navy" /> Candidate Instructions:
                  </span>
                  {ir.studentInstructions}
                </div>
              )}

              {ir.mode === 'ONLINE' && ir.meetingUrl && (
                <div className="mt-4 pt-3 border-t border-[#EAE2D3] flex items-center justify-between">
                  <span className="text-xs text-charcoal-muted">Please join 5 minutes prior to start time</span>
                  <a
                    href={ir.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-sm hover:bg-navy-light shadow-xs transition-all"
                  >
                    <Video className="w-4 h-4" /> Join Interview Meeting →
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
