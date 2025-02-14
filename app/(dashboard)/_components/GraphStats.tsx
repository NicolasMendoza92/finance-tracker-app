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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
          type="expense"
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
  const chartData = filteredData.map((item) => ({
    name: item.category,
    value: item._sum.amount || 0,
  }));

  return (
    <Card className=" w-full">
      <CardHeader>
        <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
          {type === "income" ? "Ingresos" : "Gastos"}
        </CardTitle>
      </CardHeader>
      <div className="flex items-center justify-between gap-2">
        {chartData.length === 0 && (
          <div className="flex h-60 w-full flex-col items-center justify-center">
            No hay datos para el periodo seleccionado.
            <p className="text-sm text-muted-foreground">
              Selecciona otro rango de fechas diferent para{" "}
              {type === "income" ? "Ingresos" : "Gastos"}
            </p>
          </div>
        )}

        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              width={500}
              height={300}
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatter.format(Number(value))}
                contentStyle={{
                  borderRadius: "0.375rem",
                  backgroundColor: "background",
                }}
                labelStyle={{ color: "blue" }}
                itemStyle={{ color: "#03a73dee" }}
              />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
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
      <g>
        <rect
          x={x - 20} // Ajusta el ancho del rectángulo
          y={y - 10} // Ajusta la altura del rectángulo
          width={40} // Ancho del rectángulo
          height={20} // Altura del rectángulo
          fill="white"
          rx={5} // Bordes redondeados (opcional)
          ry={5}
        />
        <text
          x={x}
          y={y}
          fill="black"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {/* Muestra el porcentaje como etiqueta */}
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
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
                  outerRadius={100}
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

      {/* <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-muted-foreground">
            Gastos - Gráfico Radial
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
              <RadialBarChart
                innerRadius="20%"
                outerRadius="100%"
                barSize={15}
                data={limitedChartData.map((item, index) => ({
                  ...item,
                  fill: COLORES[index % COLORES.length],
                }))}
              >
                <RadialBar background dataKey="value" />
                <Tooltip
                  formatter={(value) => formatter.format(Number(value))}
                  contentStyle={{
                    borderRadius: "0.375rem",
                    backgroundColor: "background",
                  }}
                />
                <Legend
                  iconSize={10}
                  layout="horizontal"
                  verticalAlign="bottom"
                  wrapperStyle={{ right: 0 }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card> */}
    </div>
  );
}
