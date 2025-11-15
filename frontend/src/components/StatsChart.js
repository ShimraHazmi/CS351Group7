import React, { useMemo } from 'react';
import { useRecentActivity } from '../context/RecentActivityContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../css/home.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Helper to format a timestamp as YYYY-MM-DD
function formatDateKey(ts) {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function StatsChart({ days = 14 }) {
  const { items } = useRecentActivity();

  // Aggregate by day: sum of candidate counts from candidate-search activities
  const { labels, dataPoints, total } = useMemo(() => {
    const now = Date.now();
    const daysArr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      daysArr.push(key);
    }

    const counts = Object.fromEntries(daysArr.map(k => [k, 0]));
    let totalCount = 0;

    for (const it of items) {
      // We only count candidate search results which store meta.count
      if (it.action === 'search_candidates' && it.meta && typeof it.meta.count === 'number') {
        const dateKey = formatDateKey(it.timestamp);
        if (counts[dateKey] !== undefined) {
          counts[dateKey] += it.meta.count;
        }
        totalCount += it.meta.count;
      }
    }

    const labelsOut = daysArr.map(k => k);
    const dataOut = daysArr.map(k => counts[k] || 0);
    return { labels: labelsOut, dataPoints: dataOut, total: totalCount };
  }, [items, days]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Representatives Searched',
        data: dataPoints,
        fill: true,
        backgroundColor: 'rgba(34,197,94,0.12)',
        borderColor: 'rgba(34,197,94,0.9)',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Representatives searched (last ${days} days)`,
        font: { size: 14 }
      },
      tooltip: { mode: 'index', intersect: false },
    },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, minRotation: 0 } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div className="stats-chart-wrapper">
      <div className="stats-summary">
        <div>
          <div className="stats-number">{total}</div>
          <div className="stats-label">Total reps searched</div>
        </div>
      </div>
      <div className="stats-chart" style={{ height: 220 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
