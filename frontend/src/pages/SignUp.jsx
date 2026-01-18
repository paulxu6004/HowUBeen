import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    emergencyContactEmail: '',
    friendEmail: '',
    profilePicture: null
  })

  // State for error handling
  const [error, setError] = useState('')

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({
        ...formData,
        profilePicture: e.target.files[0]
      })
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const { default: client } = await import('../api/client');

      // 1. Create User
      const signupRes = await client.post('/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      const userId = signupRes.data.id;
      console.log('Signup success, User ID:', userId);

      // 2. Add Emergency Contact (if provided)
      if (formData.emergencyContactEmail) {
        try {
          await client.post(`/contacts/${userId}`, {
            name: 'Emergency Contact', // API requires name, but form only has email. Using placeholder.
            email: formData.emergencyContactEmail
          });
        } catch (contactErr) {
          console.warn('Failed to save emergency contact:', contactErr);
          // Non-fatal error, continue
        }
      }

      // Navigate to login
      navigate('/login')

    } catch (err) {
      console.error('Signup failed:', err);
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    }
  }

  return (
    <div className="background">
      <div className="form-container">
        <h1>Sign Up</h1>
        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
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
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="emergencyContactEmail">Emergency Contact Email</label>
            <input
              type="email"
              id="emergencyContactEmail"
              name="emergencyContactEmail"
              value={formData.emergencyContactEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="friendEmail">Friend Email</label>
            <input
              type="email"
              id="friendEmail"
              name="friendEmail"
              value={formData.friendEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture</label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="get-started-btn">Sign Up</button>
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

export default SignUp
