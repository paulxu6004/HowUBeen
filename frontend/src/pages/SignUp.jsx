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

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Add API call to save user data
    console.log('Sign up data:', formData)
    // Navigate to login after successful signup
    navigate('/login')
  }

  return (
    <div className="background">
      <div className="form-container">
        <h1>Sign Up</h1>
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
