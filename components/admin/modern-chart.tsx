"use client"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ChartData {
  name: string
  value: number
}

interface ModernChartProps {
  title?: string
  data: ChartData[]
  type: "bar" | "area"
  color: string
  className?: string
  height?: number
}

export default function ModernChart({ title, data, type, color, className = "", height = 300 }: ModernChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-sm" style={{ color }}>
            <span className="font-medium">تعداد:</span> {payload[0].value.toLocaleString("fa-IR")}
          </p>
        </div>
      )
    }
    return null
  }

  const ChartComponent = type === "area" ? AreaChart : BarChart

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={(value) => value.toLocaleString("fa-IR")}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(128, 128, 128, 0.1)" }} />
          {type === "area" ? (
            <>
              <defs>
                <linearGradient id={`colorGradient-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#colorGradient-${color.replace("#", "")})`}
              />
            </>
          ) : (
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}
