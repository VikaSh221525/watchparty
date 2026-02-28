import { Routes, Route, Navigate } from 'react-router';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Landing from '../pages/Landing';
import Room from '../pages/Room';

const MainRoutes = () => {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Room Page - Protected */}
      <Route
        path="/room/:roomCode"
        element={
          <>
            <SignedIn>
              <Room />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />

      {/* Catch-all - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default MainRoutes;
