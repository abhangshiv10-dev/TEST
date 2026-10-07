import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { formatINR } from '../../utils/marathiCurrency';

// Recharts is ~300KB. This file is lazy-loaded from the Dashboard so the
// numbers/cards render first and the charts stream in right after.

export function MonthlyBarChart({ monthlyExpenseData }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={monthlyExpenseData} 
        margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
      >
        <defs>
          <linearGradient id="monthBarActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id="monthBarStandard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#4338ca" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 11, fill: '#64748b' }} 
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val) => val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`}
        />
        <Tooltip 
          cursor={{ fill: '#f8fafc' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                  <div className="font-bold text-slate-200">{data.fullLabel}</div>
                  <div className="text-emerald-400 font-extrabold text-sm">{formatINR(data.amount)}</div>
                  <div className="text-slate-400 text-[10px]">{data.count} व्यवहार</div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar 
          dataKey="amount" 
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        >
          {monthlyExpenseData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isCurrent ? 'url(#monthBarActive)' : 'url(#monthBarStandard)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut({ categoryPieData, selectedCategoryName, handleCategoryClick }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={categoryPieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={70}
          paddingAngle={2}
          onClick={(data) => handleCategoryClick(data?.name)}
          style={{ cursor: 'pointer' }}
        >
          {categoryPieData.map((entry, index) => (
            <Cell
              key={`pie-cell-${index}`}
              fill={entry.color}
              opacity={selectedCategoryName === 'all' || selectedCategoryName === entry.name ? 1 : 0.35}
              style={{ cursor: 'pointer', outline: 'none' }}
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-slate-900 text-white p-2 rounded-xl shadow-xl text-xs space-y-0.5">
                  <div className="font-bold">{data.name}</div>
                  <div className="text-emerald-400 font-bold">{formatINR(data.value)}</div>
                  <div className="text-slate-400 text-[10px]">{data.percentage}% वाटा</div>
                </div>
              );
            }
            return null;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
