import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import HowItWorks from './components/HowItWorks';
import Navbar from './components/Navbar';

export type RouteName = 'home' | 'login' | 'signup' | 'how';

function App() {
  const [route, setRoute] = useState<RouteName>('home');

  return (
    <div className="min-h-screen bg-white">
      {route !== 'login' && route !== 'signup' && <Navbar route={route} setRoute={setRoute} />}
      <main className={route === 'login' || route === 'signup' ? '' : 'pt-20'}>
        {route === 'home' && <LandingPage />}
        {route === 'login' && <Login onSwitchToSignup={() => setRoute('signup')} onLoginSuccess={() => setRoute('home')} />}
        {route === 'signup' && <Signup onDone={() => setRoute('home')} onSwitchToLogin={() => setRoute('login')} onSignupSuccess={() => setRoute('home')} />}
        {route === 'how' && <HowItWorks />}
      </main>
    </div>
  );
}

export default App;
