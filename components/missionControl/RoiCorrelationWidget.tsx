import React from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Link2, TrendingUp } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import ChartContainer from '../ChartContainer';

interface RoiCorrelationWidgetProps {
  data: { day: string; visibility: number; clicks: number }[];
  isGscConnected?: boolean;
}

const RoiCorrelationWidget: React.FC<RoiCorrelationWidgetProps> = ({
  data,
  isGscConnected = false,
}) => {
  const safeData = data?.length > 0 ? data : [{ day: 'Now', visibility: 72, clicks: 500 }];

  return (
    <div className="bg-card border border-border rounded-[32px] p-8 shadow-soft relative overflow-hidden">
      <div className="absolute top-0 left-0 p-32 bg-emerald-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
            <Link2 size={20} className="text-emerald-400" />
            ROI Correlation
            <InfoTooltip content="Compares your Visibility Index trend against organic clicks from Google Search Console. Rising visibility alongside clicks suggests your AI optimizations are driving real traffic." />
          </h3>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Visibility score vs. organic clicks over the selected period
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <span className="text-muted-foreground">Visibility</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-500/70" />
            <span className="text-muted-foreground">Organic Clicks</span>
          </div>
          {!isGscConnected && (
            <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px]">
              Simulated clicks
            </span>
          )}
        </div>
      </div>

      <ChartContainer height={260} className="relative z-10">
        {({ width, height }) => (
          <ComposedChart
            width={width}
            height={height}
            data={safeData}
            margin={{ top: 10, right: 16, left: 4, bottom: 4 }}
          >
            <defs>
              <linearGradient id="roiVisibilityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="rgba(255,255,255,0.4)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={8}
              fontWeight="bold"
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              yAxisId="visibility"
              stroke="rgba(167, 139, 250, 0.6)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickCount={5}
              fontWeight="bold"
              width={40}
            />
            <YAxis
              yAxisId="clicks"
              orientation="right"
              stroke="rgba(16, 185, 129, 0.6)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              fontWeight="bold"
              width={48}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#09090b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              }}
              itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
              labelStyle={{
                fontSize: '10px',
                color: '#a1a1aa',
                marginBottom: '4px',
                textTransform: 'uppercase',
                fontWeight: '900',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', paddingTop: '8px' }}
              iconType="circle"
            />
            <Area
              yAxisId="visibility"
              type="monotone"
              dataKey="visibility"
              name="Visibility Index"
              stroke="#8b5cf6"
              strokeWidth={3}
              fill="url(#roiVisibilityGradient)"
              animationDuration={800}
            />
            <Bar
              yAxisId="clicks"
              dataKey="clicks"
              name="Organic Clicks"
              fill="#10b981"
              fillOpacity={0.6}
              radius={[4, 4, 0, 0]}
              barSize={Math.max(8, Math.min(24, Math.floor(width / safeData.length) - 4))}
              animationDuration={800}
            />
          </ComposedChart>
        )}
      </ChartContainer>

      <div className="relative z-10 mt-4 flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
        <TrendingUp size={12} className="text-emerald-500" />
        {isGscConnected
          ? 'Live GSC click data paired with your latest visibility scans.'
          : 'Connect Google Search Console in Connections to plot real organic click data.'}
      </div>
    </div>
  );
};

export default RoiCorrelationWidget;
