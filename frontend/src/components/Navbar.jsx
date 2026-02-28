import { useState, useEffect } from 'react';
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { Video } from 'lucide-react';
import { Link } from 'react-router';

const Navbar = () => {
  const { isSignedIn } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="navbar bg-base-300 shadow-lg px-6">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl gap-2">
          <Video className="w-6 h-6 text-primary" />
          <span className="font-bold">Streamify</span>
        </Link>
      </div>
      
      <div className="flex gap-4">
        {/* Date and Time */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="opacity-70">{formatTime(currentTime)}</span>
          <span className="opacity-50">•</span>
          <span className="opacity-70">{formatDate(currentTime)}</span>
        </div>

        {/* Auth Button */}
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <SignInButton mode="modal">
            <button className="btn btn-primary btn-sm">Sign In</button>
          </SignInButton>
        )}
      </div>
    </div>
  );
};

export default Navbar;
