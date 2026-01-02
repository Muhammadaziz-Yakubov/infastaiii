import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { TrendingUp, Calendar, Target } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';

Chart.register(...registerables);

const GoalProgressChart = ({ goal }) => {
  const { isDark } = useTheme();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !goal) return;

    // Destroy previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Calculate progress data
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = 100 - progress;

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Yig\'ilgan', 'Qolgan'],
        datasets: [{
          data: [progress, remaining],
          backgroundColor: [
            progress >= 100 ? '#10b981' : '#3b82f6',
            isDark ? '#374151' : '#e5e7eb'
          ],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value.toFixed(1)}%`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [goal, isDark]);

  if (!goal) return null;

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const daysRemaining = goal.deadline 
    ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const monthlyNeeded = daysRemaining && daysRemaining > 0
    ? (goal.targetAmount - goal.currentAmount) / Math.ceil(daysRemaining / 30)
    : 0;

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Progress Tahlili
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {goal.title}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 mb-6">
        <canvas ref={chartRef}></canvas>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {progress.toFixed(1)}%
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Bajarilgan
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'} border ${isDark ? 'border-gray-600' : 'border-blue-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Yig'ilgan
            </span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(goal.currentAmount)}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {formatCurrency(goal.targetAmount)} dan
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-green-50'} border ${isDark ? 'border-gray-600' : 'border-green-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Qolgan
            </span>
          </div>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(goal.targetAmount - goal.currentAmount)}
          </p>
          {daysRemaining && (
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {daysRemaining > 0 ? `${daysRemaining} kun` : 'Muddati o\'tgan'}
            </p>
          )}
        </div>
      </div>

      {/* Monthly Savings Needed */}
      {monthlyNeeded > 0 && daysRemaining > 0 && (
        <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-amber-900/20' : 'bg-amber-50'} border ${isDark ? 'border-amber-800' : 'border-amber-200'}`}>
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            Maqsadga erishish uchun oylik tejash
          </p>
          <p className={`text-2xl font-bold ${isDark ? 'text-amber-200' : 'text-amber-600'}`}>
            {formatCurrency(monthlyNeeded)}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            Har oy shuncha yig'ish kerak
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalProgressChart;

