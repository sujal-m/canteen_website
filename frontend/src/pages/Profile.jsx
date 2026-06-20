import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user } = useAuth()
  const rows = [
    ['Full Name', user.fullName],
    ['Email', user.email],
    ['Role', user.role],
    ['Gender', user.gender],
    ['Branch', user.branch],
    ['Class', user.className],
    ['Division', user.division],
    ['Designation', user.designation],
  ].filter(([, value]) => value)

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="profile-summary compact">
          <img className="avatar" src={user.profilePic || 'https://placehold.co/96x96?text=User'} alt="Profile" />
          <div><p className="eyebrow">Profile</p><h1>{user.fullName}</h1></div>
        </div>
        <dl className="detail-list">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <div className="actions"><Link className="button primary" to="/profile/edit">Edit profile</Link><Link className="button secondary" to="/dashboard">Dashboard</Link></div>
      </div>
    </main>
  )
}

export default Profile

