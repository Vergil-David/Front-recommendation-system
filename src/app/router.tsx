import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { RootRedirect } from "@/components/common/RootRedirect";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { ExplorePage } from "@/features/placeholders/ExplorePage";
import { FriendsPage } from "@/features/placeholders/FriendsPage";
import { HomePage } from "@/features/placeholders/HomePage";
import { SettingsPage } from "@/features/placeholders/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/home", element: <HomePage /> },
          { path: "/explore", element: <ExplorePage /> },
          { path: "/friends", element: <FriendsPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
