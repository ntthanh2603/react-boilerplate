import { useEffect } from "react";
import {
  createBrowserRouter,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import GuestRoute from "./GuestRoute";
import NotFound from "./NotFound";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "@/components/app-layout";
import Login from "@/pages/login/login";
import Register from "@/pages/register/register";
import ForgotPassword from "@/pages/forgot-password/forgot-password";
import Dashboard from "@/pages/dashboard/dashboard";
import VerifyOtp from "@/pages/verify-otp/verify-otp";
import ConfirmRegistration from "@/pages/confirm-registration/confirm-registration";
import ReferrersList from "@/pages/referrers/referrers-list";
import ReferrersHistory from "@/pages/referrers/referrers-history";
import RegisterPartner from "@/pages/register-partner/register-partner";
import CompleteReferralRegistration from "@/pages/complete-referral/complete-referral";

const Root = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Other global effects can go here
  }, [location, navigate]);

  return (
    <div className="min-h-screen w-full">
      <Outlet />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      // Guest-only: auth pages
      {
        path: "login",
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        path: "register",
        element: (
          <GuestRoute>
            <Register />
          </GuestRoute>
        ),
      },
      {
        path: "verify-otp",
        element: (
          <GuestRoute>
            <VerifyOtp />
          </GuestRoute>
        ),
      },
      {
        path: "confirm-registration",
        element: (
          <GuestRoute>
            <ConfirmRegistration />
          </GuestRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        ),
      },
      {
        path: "register-partner",
        element: (
          <GuestRoute>
            <RegisterPartner />
          </GuestRoute>
        ),
      },
      {
        path: "verify-referral/:type",
        element: (
          <GuestRoute>
            <CompleteReferralRegistration />
          </GuestRoute>
        ),
      },
      // Protected: requires authentication + sidebar layout
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                element: <Dashboard />,
              },
              {
                path: "referrers",
                children: [
                  {
                    index: true,
                    element: <ReferrersList />,
                  },
                  {
                    path: ":id/history",
                    element: <ReferrersHistory />,
                  },
                ],
              },
              // Add more protected pages here, each gets sidebar + header automatically
            ],
          },
        ],
      },
      // 404
      { path: "*", element: <NotFound /> },
    ],
  },
]);
