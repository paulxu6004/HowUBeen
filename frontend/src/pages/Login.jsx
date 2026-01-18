import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Add API call to verify credentials
    console.log('Login data:', formData)
    // Navigate to profile after successful login
    navigate('/profile', { state: { name: formData.name } })
  }

  return (
    <div className="background">
      <div className="form-container">
        <h1>Log In</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="get-started-btn">Log In</button>
          <button
            type="button"
            className="get-started-btn secondary-btn"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
