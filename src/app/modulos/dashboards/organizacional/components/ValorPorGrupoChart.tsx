"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

interface BarChartDataPoint {
  name: string;
  value: number;
}

interface ValorPorGrupoChartProps {
  data: BarChartDataPoint[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg text-sm">
        <p className="font-semibold text-gray-700">{label}</p>
        <p className={payload[0].value >= 0 ? "text-green-600" : "text-red-600"}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const MAX_LABEL_LENGTH = 17;
const truncateText = (text: string): string =>
  text.length <= MAX_LABEL_LENGTH ? text : text.substring(0, MAX_LABEL_LENGTH - 3) + '...';

const CustomTick = (props: any) => {
  const { x, y, payload } = props;
  const original = payload.value as string;
  const display = truncateText(original);
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#737373"
        fontSize={10}
        transform="rotate(-45)"
      >
        {original.length > MAX_LABEL_LENGTH && <title>{original}</title>}
        {display}
      </text>
    </g>
  );
};

const CustomizedLabel: React.FC<any> = ({ x, y, width, value }) => {
  const display = formatCurrency(value);
  const labelY = value >= 0 ? y - 5 : y + 15;
  return (
    <text
      x={x + width / 2}
      y={labelY}
      fill="#374151"
      textAnchor="middle"
      fontSize="8px"
      fontWeight="bold"
    >
      {display}
    </text>
  );
};

const ValorPorGrupoChart: React.FC<ValorPorGrupoChartProps> = ({ data }) => {
  const yAxisTicks = [-600000, -500000, -400000, -300000, -200000, -100000, 0, 100000];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 30, 
          right: 0,
          left: 10,
          bottom: 70, 
        }}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={{ stroke: "#a3a3a3" }}
          tick={<CustomTick />}
          interval={0}
          height={60}
        />
        <YAxis
          tickLine={false}
          axisLine={{ stroke: "#a3a3a3" }}
          tickFormatter={(value) =>
            new Intl.NumberFormat("pt-BR", {
              notation: "compact",
              compactDisplay: "short",
            }).format(value)
          }
          tick={{ fontSize: 10, fill: "#737373" }}
          domain={[-600000, 100000]}
          ticks={yAxisTicks}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          <LabelList dataKey="value" content={<CustomizedLabel />} />
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.value >= 0 ? "#10b981" : "#ef4444"} 
              opacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ValorPorGrupoChart;
