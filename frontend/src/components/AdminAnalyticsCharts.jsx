import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const colors = ['#0f6b5f', '#2f80ed', '#f2a93b', '#d94b3d', '#7a5af8', '#4f6f52']
const currency = (value) => `Rs. ${Number(value || 0).toFixed(0)}`

function EmptyChart({ title }) {
  return <section className="analytics-panel"><h2>{title}</h2><p className="muted">No data yet</p></section>
}

export function RevenueTrendChart({ data = [] }) {
  if (!data.length) return <EmptyChart title="Revenue Trend" />
  return (
    <section className="analytics-panel">
      <h2>Revenue Trend</h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6edf3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={currency} width={72} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => currency(value)} />
          <Area type="monotone" dataKey="revenue" stroke="#0f6b5f" fill="#d8efe9" name="Revenue" />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  )
}

export function OrdersTrendChart({ data = [] }) {
  if (!data.length) return <EmptyChart title="Orders Trend" />
  return (
    <section className="analytics-panel">
      <h2>Orders Trend</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6edf3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="orders" fill="#2f80ed" name="Orders" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}

export function CategoryDistributionChart({ data = [] }) {
  if (!data.length) return <EmptyChart title="Category Distribution" />
  return (
    <section className="analytics-panel">
      <h2>Category Distribution</h2>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="quantity" nameKey="category" outerRadius={86} label>
            {data.map((entry, index) => <Cell key={entry.category} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </section>
  )
}

export function StatusDistributionChart({ data = [] }) {
  if (!data.length) return <EmptyChart title="Status Distribution" />
  return (
    <section className="analytics-panel">
      <h2>Status Distribution</h2>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" innerRadius={48} outerRadius={86} label>
            {data.map((entry, index) => <Cell key={entry.status} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </section>
  )
}

export function PopularItemsChart({ data = [] }) {
  if (!data.length) return <EmptyChart title="Most Popular Items" />
  return (
    <section className="analytics-panel analytics-panel-wide">
      <h2>Most Popular Items</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 40, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6edf3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="quantity" fill="#0f6b5f" name="Quantity" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
