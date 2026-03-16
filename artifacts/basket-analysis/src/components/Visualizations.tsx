import { 
  ScatterChart as RechartsScatter, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import type { AssociationRule, ItemFrequency } from "@workspace/api-client-react";

interface RulesScatterPlotProps {
  data: AssociationRule[];
}

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel p-4 rounded-xl max-w-xs shadow-2xl border-white/20">
        <p className="font-display font-semibold text-sm mb-2 text-foreground break-words">
          {data.antecedent.join(", ")} <span className="text-primary">→</span> {data.consequent.join(", ")}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-muted-foreground">Support:</div>
          <div className="text-right font-medium">{(data.support * 100).toFixed(2)}%</div>
          
          <div className="text-muted-foreground">Confidence:</div>
          <div className="text-right font-medium">{(data.confidence * 100).toFixed(2)}%</div>
          
          <div className="text-muted-foreground">Lift:</div>
          <div className="text-right font-medium text-accent">{data.lift.toFixed(2)}</div>
        </div>
      </div>
    );
  }
  return null;
};

export function RulesScatterPlot({ data }: RulesScatterPlotProps) {
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatter margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            dataKey="support" 
            name="Support" 
            tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <YAxis 
            type="number" 
            dataKey="confidence" 
            name="Confidence" 
            tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <ZAxis type="number" dataKey="lift" range={[40, 400]} name="Lift" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
          <Scatter data={data} fill="hsl(var(--primary))" fillOpacity={0.6} stroke="hsl(var(--primary))" strokeWidth={1} />
        </RechartsScatter>
      </ResponsiveContainer>
    </div>
  );
}

interface ItemFreqBarChartProps {
  data: ItemFrequency[];
}

export function ItemFreqBarChart({ data }: ItemFreqBarChartProps) {
  if (!data || data.length === 0) return <EmptyState />;
  
  // Sort by count descending and take top 10
  const top10 = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top10} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="item" 
            stroke="hsl(var(--foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={100}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--background))' }}
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
            itemStyle={{ color: 'hsl(var(--accent))' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {top10.map((_, index) => (
              <Cell key={`cell-${index}`} fill={`hsl(var(--accent) / ${1 - (index * 0.05)})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full h-[350px] flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-background/20">
      <p className="text-muted-foreground text-sm">Not enough data to visualize</p>
    </div>
  );
}
