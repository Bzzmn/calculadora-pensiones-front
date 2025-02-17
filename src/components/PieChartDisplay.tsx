import { Doughnut } from 'react-chartjs-2';
import { SaldoAcumulado } from '../types/pension';
import { formatCurrency } from '../utils/formatters';
import { TooltipItem } from 'chart.js';

interface PieChartDisplayProps {
  data: SaldoAcumulado;
  title: string;
  className?: string;
}

export const PieChartDisplay = ({ data, title }: PieChartDisplayProps) => {
  const chartData = {
    labels: ['Aporte Trabajador', 'Aporte Empleador', 'Rentabilidad'],
    datasets: [
      {
        data: [
          data.aporte_trabajador,
          data.aporte_empleador,
          data.rentabilidad_acumulada,
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
        cutout: '60%',
        spacing: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'doughnut'>) {
            const value = context.raw as number;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
};