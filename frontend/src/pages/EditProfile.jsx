import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const genders = ['Male', 'Female', 'Prefer not to say']
const branches = ['CSE', 'EXTC', 'COMS']
const divisions = ['A', 'B', 'C', 'D']
const classOptions = {
  CSE: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMCA', 'SYMCA', 'FYMTech', 'SYMTech'],
  EXTC: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMTech', 'SYMTech'],
  COMS: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMTech', 'SYMTech'],
}

const defaultAvatar = 'https://placehold.co/128x128?text=User'

function EditProfile() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ fullName: '', gender: '', branch: '', className: '', division: '', designation: '' })
  const [profilePic, setProfilePic] = useState(null)
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) return
    setForm({
      fullName: user.fullName || '',
      gender: user.gender || '',
      branch: user.branch || '',
      className: user.className || '',
      division: user.division || '',
      designation: user.designation || ''
    })
  }, [user])

  const submitProfile = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => payload.append(key, value))
      if (profilePic) payload.append('profilePic', profilePic)
      const { data } = await api.put('/auth/profile', payload)
      updateUser(data.user)
      setSuccess(data.message || 'Profile updated successfully.')
      setProfilePic(null)
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed.')
    } finally {
      setLoading(false)
    }
  }

  const removePhoto = async () => {
    if (!window.confirm('Remove your profile picture?')) return

    setRemoving(true)
    setError('')
    setSuccess('')

    try {
      const payload = new FormData()
      payload.append('removeProfilePic', 'true')
      const { data } = await api.put('/auth/profile', payload)
      updateUser(data.user)
      setProfilePic(null)
      setSuccess(data.message || 'Profile picture removed successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove profile picture.')
    } finally {
      setRemoving(false)
    }
  }

  if (!user) return null

  const hasProfilePic = Boolean(user.profilePic)

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="page-heading"><p className="eyebrow">Profile</p><h1>Edit profile</h1></div>
        <div className="profile-summary compact">
          <img className="avatar" src={user.profilePic || defaultAvatar} alt="Profile" />
          <div>
            <p className="eyebrow">Profile Photo</p>
            <h2>{hasProfilePic ? 'Upload New Photo' : 'Upload Photo'}</h2>
            <div className="actions">
              <label className="button secondary" htmlFor="profilePicInput">{hasProfilePic ? 'Upload New Photo' : 'Upload Photo'}</label>
              {hasProfilePic && (
                <button className="button secondary" type="button" onClick={removePhoto} disabled={removing || loading}>
                  {removing ? 'Removing...' : 'Remove Photo'}
                </button>
              )}
            </div>
          </div>
        </div>
        <form className="form-grid" onSubmit={submitProfile}>
          <input id="profilePicInput" type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          <label>Full Name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
          <label>Gender<select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="">Select gender</option>{genders.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Branch<select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value, className: '' })}><option value="">Select branch</option>{branches.map((item) => <option key={item}>{item}</option>)}</select></label>
          {user.role === 'student' && <label>Class<select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}><option value="">Select class</option>{(classOptions[form.branch] || []).map((item) => <option key={item}>{item}</option>)}</select></label>}
          {user.role === 'student' && <label>Division<select value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })}><option value="">Select division</option>{divisions.map((item) => <option key={item}>{item}</option>)}</select></label>}
          {user.role === 'faculty' && <label>Designation<input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></label>}
          {success && <p className="alert success">{success}</p>}
          {error && <p className="alert error">{error}</p>}
          <button className="button primary full" disabled={loading || removing}>{loading ? 'Saving...' : 'Save profile'}</button>
        </form>
      </div>
    </main>
  )
}

export default EditProfile
