import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const genders = ['Male', 'Female', 'Prefer not to say']
const branches = ['CSE', 'EXTC', 'COMS']
const divisions = ['A', 'B', 'C', 'D']
const classOptions = {
  CSE: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMCA', 'SYMCA', 'FYMTech', 'SYMTech'],
  EXTC: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMTech', 'SYMTech'],
  COMS: ['1st Year BTech', '2nd Year BTech', '3rd Year BTech', '4th Year BTech', 'FYMTech', 'SYMTech'],
}

const initialStudent = { fullName: '', ucid: '', email: '', gender: '', branch: '', className: '', division: '', password: '', confirmPassword: '' }
const initialFaculty = { fullName: '', email: '', gender: '', branch: '', designation: '', password: '', confirmPassword: '' }

const passwordChecks = (password) => [
  { label: 'At least 8 characters', valid: password.length >= 8 },
  { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
  { label: 'Lowercase letter', valid: /[a-z]/.test(password) },
  { label: 'Number', valid: /\d/.test(password) },
  { label: 'Special character', valid: /[^A-Za-z\d]/.test(password) },
]

function Register() {
  const [role, setRole] = useState('student')
  const [student, setStudent] = useState(initialStudent)
  const [faculty, setFaculty] = useState(initialFaculty)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const form = role === 'student' ? student : faculty
  const checks = useMemo(() => passwordChecks(form.password), [form.password])
  const strength = checks.filter((check) => check.valid).length

  const updateField = (field, value) => {
    const setter = role === 'student' ? setStudent : setFaculty
    setter((current) => ({ ...current, [field]: value, ...(field === 'branch' && role === 'student' ? { className: '' } : {}) }))
  }

  const clientErrors = useMemo(() => {
    const errors = []
    if (role === 'student' && form.ucid && !/^\d{10}$/.test(form.ucid)) errors.push('UCID must be exactly 10 digits.')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push('Enter a valid email address.')
    checks.forEach((check) => {
      if (form.password && !check.valid) errors.push(check.label)
    })
    if (form.confirmPassword && form.password !== form.confirmPassword) errors.push('Passwords do not match.')
    return errors
  }, [role, form, checks])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const endpoint = role === 'student' ? '/auth/register/student' : '/auth/register/faculty'
      const { data } = await api.post(endpoint, form)
      setMessage(data.message)
      role === 'student' ? setStudent(initialStudent) : setFaculty(initialFaculty)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="page-heading">
          <p className="eyebrow">Registration</p>
          <h1>Create your account</h1>
        </div>

        <div className="segmented">
          <button className={role === 'student' ? 'active' : ''} type="button" onClick={() => setRole('student')}>Student</button>
          <button className={role === 'faculty' ? 'active' : ''} type="button" onClick={() => setRole('faculty')}>Faculty</button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Full Name<input value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} required /></label>
          {role === 'student' && <label>UCID<input value={form.ucid} maxLength="10" onChange={(e) => updateField('ucid', e.target.value.replace(/\D/g, ''))} required /></label>}
          <label>Email<input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required /></label>
          <label>Gender<select value={form.gender} onChange={(e) => updateField('gender', e.target.value)} required><option value="">Select gender</option>{genders.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Branch<select value={form.branch} onChange={(e) => updateField('branch', e.target.value)} required><option value="">Select branch</option>{branches.map((item) => <option key={item}>{item}</option>)}</select></label>
          {role === 'student' && <label>Class<select value={form.className} onChange={(e) => updateField('className', e.target.value)} required><option value="">Select class</option>{(classOptions[form.branch] || []).map((item) => <option key={item}>{item}</option>)}</select></label>}
          {role === 'student' && <label>Division<select value={form.division} onChange={(e) => updateField('division', e.target.value)} required><option value="">Select division</option>{divisions.map((item) => <option key={item}>{item}</option>)}</select><span className="hint">If your class has only one division, select A.</span></label>}
          {role === 'faculty' && <label>Designation<input value={form.designation} onChange={(e) => updateField('designation', e.target.value)} required /></label>}
          <label>Password<input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateField('password', e.target.value)} required /></label>
          <label>Confirm Password<input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} required /></label>
          <button className="text-button" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide Password' : 'Show Password'}</button>

          <div className="meter" aria-label="Password strength"><span style={{ width: `${strength * 20}%` }} /></div>
          <ul className="validation-list">{clientErrors.map((item) => <li key={item}>{item}</li>)}</ul>
          {error && <p className="alert error">{error}</p>}
          {message && <p className="alert success">{message}</p>}
          <button className="button primary full" disabled={loading || clientErrors.length > 0}>{loading ? 'Creating account...' : 'Register'}</button>
        </form>
        <p className="switch-copy">Already registered? <Link to="/login">Login</Link></p>
      </div>
    </main>
  )
}

export default Register

