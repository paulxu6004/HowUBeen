import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // State for error handling
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { default: client } = await import('../api/client');
      const response = await client.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('Login success:', response.data);
      // Store user info
      localStorage.setItem('user_id', response.data.id);
      localStorage.setItem('user_name', response.data.name);

      // Navigate to profile
      navigate('/profile', { state: { name: response.data.name } })
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  }

  return (
    <div className="background">
      <div className="form-container">
        <h1>Log In</h1>
        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
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
