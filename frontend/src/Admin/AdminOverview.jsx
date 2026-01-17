import { useEffect, useState } from 'react';
import { orderAPI, productAPI } from '../services/api';

function AdminOverview() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          orderAPI.getAll(),
          productAPI.getAll(),
        ]);

        // Handle orders: new pagination format { orders: [], ... } vs old array []
        if (ordersRes.data.orders) {
          setOrders(ordersRes.data.orders);
        } else {
          setOrders(ordersRes.data || []);
        }

        // Handle both array (old) and paginated object (new)
        if (productsRes.data.products) {
          setProducts(productsRes.data.products);
        } else {
          setProducts(productsRes.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch analytics data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function formatDate(dateStr) {
    const d = parseDate(dateStr);
    if (!d) return "-";
    return d.toLocaleString();
  }


  function parseDate(dateStr) {
    if (!dateStr) return null;

    const tryDirect = new Date(dateStr);
    if (!isNaN(tryDirect.getTime())) return tryDirect;


    const m = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2}):(\d{2})\s*(am|pm)?$/i);
    if (m) {
      let [, day, month, year, hh, mm, ss, ampm] = m;
      day = parseInt(day, 10);
      month = parseInt(month, 10) - 1; // JS months 0-11
      year = parseInt(year, 10);
      hh = parseInt(hh, 10);
      mm = parseInt(mm, 10);
      ss = parseInt(ss, 10);
      if (ampm) {
        if (/pm/i.test(ampm) && hh < 12) hh += 12;
        if (/am/i.test(ampm) && hh === 12) hh = 0;
      }
      const d = new Date(year, month, day, hh, mm, ss);
      if (!isNaN(d.getTime())) return d;
    }


    const alt = dateStr.replace(/\//g, '-').replace(/,?\s*(am|pm)/i, '');
    const tryAlt = new Date(alt);
    if (!isNaN(tryAlt.getTime())) return tryAlt;

    return null;
  }

  if (loading) return <div className="p-6">Loading analytics...</div>;


  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const avgOrderValue = totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0;


  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});


  const productSales = {};
  orders.forEach(o => {
    (o.items || []).forEach(it => {
      productSales[it.name] = (productSales[it.name] || 0) + (it.quantity || 0);
    });
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);


  const recentOrders = orders.slice().reverse().slice(0, 5);


  const dayMillis = 24 * 60 * 60 * 1000;
  const today = new Date();
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today.getTime() - (6 - i) * dayMillis);
    const key = d.toISOString().slice(0, 10);
    return { date: key, revenue: 0 };
  });

  orders.forEach((o) => {

    if (!o.date) return;
    const od = parseDate(o.date);
    if (!od) return;
    const key = od.toISOString().slice(0, 10);
    const idx = last7.findIndex((d) => d.date === key);
    if (idx !== -1) last7[idx].revenue += o.totalAmount || 0;
  });

  function BarChart({ data = [], width = 560, height = 160 }) {
    const pad = 24;
    const innerW = width - pad * 2;
    const innerH = height - pad * 2;
    const max = Math.max(...data.map((d) => d.revenue), 1);
    const barW = innerW / data.length - 8;

    const allZero = data.every((d) => !d.revenue || d.revenue === 0);
    if (allZero) {
      return (
        <div className="w-full h-40 flex items-center justify-center text-gray-500">
          No revenue data in the last 7 days
        </div>
      );
    }

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <>
          {data.map((d, i) => {
            const x = pad + i * (barW + 8);
            const h = (d.revenue / max) * innerH;
            const y = pad + (innerH - h);
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={h} rx={4} fill="#00b2fe" />
                <text x={x + barW / 2} y={height - 6} fontSize={11} textAnchor="middle" fill="#6b7280">
                  {d.date.slice(5)}
                </text>
              </g>
            );
          })}
        </>
      </svg>
    );
  }


  function PieChart({ data = [], size = 140, colors = [] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    let cumulative = 0;
    const center = size / 2;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const value = d.value;
          if (value === 0) return null;
          const startAngle = (cumulative / total) * Math.PI * 2;
          cumulative += value;
          const endAngle = (cumulative / total) * Math.PI * 2;
          const x1 = center + center * Math.cos(startAngle - Math.PI / 2);
          const y1 = center + center * Math.sin(startAngle - Math.PI / 2);
          const x2 = center + center * Math.cos(endAngle - Math.PI / 2);
          const y2 = center + center * Math.sin(endAngle - Math.PI / 2);
          const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
          const path = `M ${center} ${center} L ${x1} ${y1} A ${center} ${center} 0 ${largeArc} 1 ${x2} ${y2} Z`;
          return (
            <path key={i} d={path} fill={colors[i % colors.length] || `hsl(${(i * 60) % 360} 70% 60%)`} />
          );
        })}
        {/* center hole to make it look nicer */}
        <circle cx={center} cy={center} r={center * 0.5} fill="#ffffff" />
      </svg>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-semibold">{totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-semibold">₹{totalRevenue}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="text-2xl font-semibold">₹{avgOrderValue}</p>
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded shadow overflow-x-auto">
        <h3 className="font-semibold mb-3">Revenue (last 7 days)</h3>
        <BarChart data={last7} width={720} height={180} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <h3 className="font-semibold mb-3">Orders by Status</h3>
          <PieChart
            data={Object.entries(statusCounts).map(([k, v]) => ({ label: k, value: v }))}
            size={180}
          />
          <div className="mt-3 w-full">
            {Object.entries(statusCounts).map(([status, count], idx) => (
              <div key={status} className="flex items-center gap-2 py-1">
                <span className="w-3 h-3" style={{ background: `hsl(${(idx * 60) % 360} 70% 60%)`, display: 'inline-block', borderRadius: 4 }}></span>
                <span className="text-sm flex-1">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
          <h3 className="font-semibold mb-3">Top Products (by qty)</h3>
          <PieChart
            data={topProducts.map(([name, qty]) => ({ label: name, value: qty }))}
            size={180}
          />
          <div className="mt-3 w-full">
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No sales data yet</p>
            ) : (
              topProducts.map(([name, qty], idx) => (
                <div key={name} className="flex items-center gap-2 py-1">
                  <span className="w-3 h-3" style={{ background: `hsl(${(idx * 60) % 360} 70% 60%)`, display: 'inline-block', borderRadius: 4 }}></span>
                  <span className="text-sm flex-1">{name}</span>
                  <span className="font-medium">{qty}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No recent orders</p>
        ) : (
          recentOrders.map((o) => (
            <div key={o.id} className="flex justify-between py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium">Order #{o.id}</p>
                <p className="text-sm text-gray-500">{o.customerName || 'Unknown'} • {o.items?.length || 0} items</p>
              </div>
              <div className="text-right">
                <p className="font-medium">₹{o.totalAmount}</p>
                <p className="text-sm text-gray-500">{formatDate(o.date)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminOverview;