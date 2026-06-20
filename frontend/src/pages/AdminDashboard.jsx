import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import {
  CategoryDistributionChart,
  OrdersTrendChart,
  PopularItemsChart,
  RevenueTrendChart,
  StatusDistributionChart,
} from '../components/AdminAnalyticsCharts'

const cards = [
  ['Total Users', 'totalUsers', '/admin/users'], ['Students', 'totalStudents', '/admin/users?role=student'],
  ['Faculty', 'totalFaculty', '/admin/users?role=faculty'], ['Total Orders', 'totalOrders', '/admin/orders'],
  ['Received', 'receivedOrders', '/admin/orders'], ['Preparing', 'preparingOrders', '/admin/orders'],
  ['Ready', 'readyOrders', '/admin/orders'], ['Menu Items', 'menuItems', '/admin/menu'],
]

const analyticsCards = [
  ['Total Revenue', 'revenue', 'total'], ['Orders Today', 'orders', 'today'],
  ['Orders This Week', 'orders', 'week'], ['Orders This Month', 'orders', 'month'],
  ['Total Orders', 'orders', 'total'],
]

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(0)}`

function AdminDashboard() {
  const { stats, analytics, loading, error, fetchStats, fetchAnalytics } = useAdmin()
  useEffect(() => {
    fetchStats()
    fetchAnalytics()
  }, [fetchStats, fetchAnalytics])

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Admin</p><h1>Dashboard</h1></div></div>
      {error && <p className="alert error">{error}</p>}
      {loading && !stats && !analytics ? <p className="status">Loading dashboard...</p> : (
        <>
          <div className="stats-grid">{cards.map(([label, key, to]) => <Link className="stat-card" to={to} key={key}><span>{label}</span><strong>{stats?.[key] ?? 0}</strong></Link>)}</div>

          <section className="analytics-section">
            <div className="section-heading"><div><p className="eyebrow">Analytics</p><h1>Performance</h1></div><button className="button secondary" type="button" onClick={fetchAnalytics}>Refresh</button></div>
            <div className="analytics-cards">
              {analyticsCards.map(([label, group, key]) => {
                const value = analytics?.[group]?.[key] ?? 0
                return <div className="stat-card analytics-card" key={`${group}-${key}`}><span>{label}</span><strong>{group === 'revenue' ? formatCurrency(value) : value}</strong></div>
              })}
            </div>
            <div className="analytics-grid">
              <RevenueTrendChart data={analytics?.revenueTrend} />
              <OrdersTrendChart data={analytics?.ordersTrend} />
              <CategoryDistributionChart data={analytics?.categoryDistribution} />
              <StatusDistributionChart data={analytics?.statusDistribution} />
              <PopularItemsChart data={analytics?.topItems} />
            </div>
            <section className="analytics-panel analytics-panel-wide top-customers-panel">
              <h2>Top Customers</h2>
              {!analytics?.topCustomers?.length ? <p className="muted">No customer data yet</p> : (
                <div className="data-table analytics-table">
                  <div className="table-row table-head"><span>User</span><span>Role</span><span>Orders</span><span>Total Spend</span></div>
                  {analytics.topCustomers.map((customer) => (
                    <div className="table-row" key={customer.userId}>
                      <span><strong>{customer.fullName}</strong><small>{customer.email}</small></span>
                      <span className="capitalize">{customer.role}</span>
                      <span>{customer.orders}</span>
                      <span>{formatCurrency(customer.totalSpend)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>
        </>
      )}
    </main>
  )
}

export default AdminDashboard
