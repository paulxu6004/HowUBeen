import { useNavigate, useLocation } from 'react-router-dom'
import '../App.css'

function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const userName = location.state?.name || 'User'

  return (
    <div className="background">
      <div className="profile-container">
        <h1>Welcome, {userName}!</h1>
        <div className="profile-content">
          <p>This is your profile page.</p>
          <p>Your goals and check-ins will appear here.</p>
        </div>
        <button
          className="get-started-btn secondary-btn"
          onClick={() => navigate('/')}
        >
          Log Out
        </button>
      </div>
    </div>
  )
}

export default Profile
