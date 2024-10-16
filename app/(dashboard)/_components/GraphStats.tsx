"use client";

import { GetCategoriesStatsResponseType } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
import { UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface Props {
  from: Date;
  to: Date;
  userSettings: UserSettings;
}

function GraphStats({ from, to, userSettings }: Props) {
  const statsQuery = useQuery<GetCategoriesStatsResponseType>({
    queryKey: ["overview", "stats", "categories", from, to],
    queryFn: () =>
      fetch(`/api/stats/categories?from=${from}&to=${to}`).then((res) =>
        res.json()
      ),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <IncomeChart
          formatter={formatter}
          type="income"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <ExpensesCharts formatter={formatter} data={statsQuery.data || []} />
      </SkeletonWrapper>
    </div>
  );
}

export default GraphStats;

// INCOME AND EXPENSES PIE CHART
function IncomeChart({
  formatter,
  type,
  data,
}: {
  formatter: Intl.NumberFormat;
  type: TransactionType;
  data: GetCategoriesStatsResponseType;
}) {
  // Filtramos los datos por tipo (income o expense)
  const filteredData = data?.filter((el) => el.type === type);

  // Convertimos los datos filtrados en el formato requerido por Recharts
  const pieData = filteredData.map((item) => ({
    name: item.category,
    value: item._sum.amount || 0,
  }));

  const COLORS =
    type === "income"
      ? ["#00C49F", "#0088FE", "#FFBB28", "#FF8042"]
      : ["#FF0000", "#FF6347", "#FF4500", "#CD5C5C"];

  return (
    <Card className=" w-full">
      <CardHeader>
        <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
          {type === "income" ? "Ingresos" : "Gastos"}
        </CardTitle>
      </CardHeader>
      <div className="flex items-center justify-between gap-2">
        {pieData.length === 0 && (
          <div className="flex h-60 w-full flex-col items-center justify-center">
            No hay datos para el periodo seleccionado.
            <p className="text-sm text-muted-foreground">
              Selecciona otro rango de fechas diferent para{" "}
              {type === "income" ? "Ingresos" : "Gastos"}
            </p>
          </div>
        )}

        {pieData.length > 0 && (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={70}
                paddingAngle={10}
                fill="#fff"
                dataKey="value"
                label={false}
                // label={({ name, value }) =>
                //   `${name}: ${formatter.format(value)}`
                // }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                  formatter={(value) => formatter.format(Number(value))}
                  contentStyle={{
                    borderRadius: "0.375rem",
                    backgroundColor: "background",
                  }}
                  labelStyle={{ color: "blue" }} 
                  itemStyle={{ color: "#03a73dee" }}
                />
              <Legend layout="vertical" align="left" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

// GRAFICO DE GASTOS DOS VARIANTES
function ExpensesCharts({
  formatter,
  data,
}: {
  formatter: Intl.NumberFormat;
  data: GetCategoriesStatsResponseType;
}) {
  // Filtramos los datos solo para 'expenses'
  const expensesData = data?.filter((el) => el.type === "expense");

  // Mapeamos los datos para ambos gráficos
  const chartData = expensesData.map((item) => ({
    name: item.category,
    value: item._sum.amount || 0,
  }));

  const limitedChartData = chartData.slice(0, 6);

  const COLORES = [
    "#0062FF",
    "#12C6FF",
    "#FF647F",
    "#FF9354",
    "#b8ff54",
    "#ce4ae5",
    "#dd8fc4",
    "#0fef7b",
  ];

  const RADIAN = Math.PI / 180;
  // Función para renderizar las etiquetas personalizadas
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    // Calcula la posición del label
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {/* Muestra el porcentaje como etiqueta */}
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <Card className=" w-full">
        <CardHeader>
          <CardTitle className="text-muted-foreground">
            Gastos - Gráfico de Torta
          </CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between gap-2">
          {limitedChartData.length === 0 && (
            <div className="flex h-60 w-full flex-col items-center justify-center">
              No hay datos de gastos para el periodo seleccionado.
            </div>
          )}

          {limitedChartData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  paddingAngle={1}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  data={limitedChartData.map((item, index) => ({
                    ...item,
                    fill: COLORES[index % COLORES.length],
                  }))}
                >
                  {limitedChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORES[index % COLORES.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatter.format(Number(value))}
                  contentStyle={{
                    borderRadius: "0.375rem",
                    backgroundColor: "background",
                  }}
                  labelStyle={{ color: "blue" }} 
                  itemStyle={{ color: "#FF4500" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-muted-foreground">
            Gastos - Gráfico Radar
          </CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between gap-2">
          {limitedChartData.length === 0 && (
            <div className="flex h-60 w-full flex-col items-center justify-center">
              No hay datos de gastos para el periodo seleccionado.
            </div>
          )}

          {limitedChartData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={limitedChartData}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar
                  name="Gastos"
                  dataKey="value"
                  stroke="#FF4500"
                  fill="#FF4500"
                  fillOpacity={0.6}
                />
                <Tooltip
                  formatter={(value) => formatter.format(Number(value))}
                  contentStyle={{
                    borderRadius: "0.375rem",
                    backgroundColor: "background",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
