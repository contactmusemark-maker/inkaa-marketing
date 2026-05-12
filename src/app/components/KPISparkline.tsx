'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface KPISparklineProps {
  data: number[];
  trend: 'positive' | 'negative';
}

export default function KPISparkline({ data, trend }: KPISparklineProps) {
  const chartData = data.map((v, i) => ({ i, v }));
  const color = trend === 'positive' ? 'var(--primary)' : 'var(--negative)';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
