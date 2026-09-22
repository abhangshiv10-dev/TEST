import React from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/date';
import { TrendingUp, CheckCircle, Clock, Calendar, CheckSquare, Layers } from 'lucide-react';

export const ConstructionProgress = () => {
  const { currentProject, summary, stages } = useProject();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Construction Progress & Milestone Timeline"
        subtitle="Visual roadmap of home completion percentage, stages passed, and upcoming phases"
      />

      {/* Hero Progress Banner */}
      <div className="glass-card p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-primary-950 text-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
              Overall Completion Status
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {summary.overallProgressPct}%
              </span>
              <span className="text-sm font-semibold text-slate-300">
                Completed
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              {summary.completedStagesCount} of {summary.totalStagesCount} stages finished • Target completion: {formatDate(currentProject?.expected_end_date || '2026-11-30')}
            </p>
          </div>

          <div className="w-full sm:w-72 bg-white/10 p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Milestone Progress:</span>
              <span className="text-primary-300">{summary.overallProgressPct}%</span>
            </div>
            <ProgressBar percentage={summary.overallProgressPct} height="h-3" variant="primary" />
          </div>
        </div>
      </div>

      {/* Stage Timeline / Milestone Step View */}
      <div className="glass-card p-6 sm:p-8">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <span>Stage-by-Stage Construction Roadmap</span>
        </h3>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 sm:ml-6 space-y-8 pb-4">
          {stages.map((stg) => {
            const isCompleted = stg.status === 'Completed';
            const isInProgress = stg.status === 'In Progress';

            return (
              <div key={stg.id} className="relative pl-6 sm:pl-8 group">
                {/* Node Bullet */}
                <div 
                  className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center font-bold text-xs shadow-sm transition-transform ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : isInProgress 
                        ? 'bg-primary-600 text-white animate-pulse' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : stg.order_index}
                </div>

                {/* Stage Box Content */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {stg.order_index}. {stg.name}
                      </h4>
                      <StatusBadge status={stg.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                      {stg.description || 'Structural construction milestone.'}
                    </p>
                    {stg.notes && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        Note: {stg.notes}
                      </p>
                    )}
                  </div>

                  <div className="w-full sm:w-48 shrink-0">
                    <div className="flex justify-between text-xs mb-1 font-semibold text-slate-600 dark:text-slate-300">
                      <span>Completion:</span>
                      <span>{stg.progress_percentage || 0}%</span>
                    </div>
                    <ProgressBar 
                      percentage={stg.progress_percentage} 
                      height="h-2"
                      variant={isCompleted ? 'success' : 'primary'}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
