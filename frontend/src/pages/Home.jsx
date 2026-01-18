import { useNavigate } from 'react-router-dom'
import '../App.css'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="background">
      <div className="home-container">
        <h1>HowUBeen</h1>
        <p className="subtitle">A digital log of your goals</p>
        <button className="get-started-btn" onClick={() => navigate('/login')}>
          Log in
        </button>
        <br />
        <br />
        <button className="get-started-btn" onClick={() => navigate('/signup')}>
          Sign up
        </button>
      </div>
    </div>
  )
}

export default Home
