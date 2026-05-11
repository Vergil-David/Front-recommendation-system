import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { RootRedirect } from "@/components/common/RootRedirect";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { OnboardingPage } from "@/features/onboarding/OnboardingPage";
import { Explore } from "@/pages/Explore";
import { BooksExplore } from "@/pages/BooksExplore";
import { Friends } from "@/pages/Friends";
import { Home } from "@/pages/Home";
import { Library } from "@/pages/Library";
import { MovieDetails } from "@/pages/MovieDetails";
import { BookDetails } from "@/pages/BookDetails";
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
        path: "/onboarding",
        element: <OnboardingPage />,
      },
      {
        element: <AppShell />,
        children: [
          { path: "/home", element: <Home /> },
          { path: "/explore", element: <Explore /> },
          { path: "/books", element: <BooksExplore /> },
          { path: "/movies/:movieId", element: <MovieDetails /> },
          { path: "/books/:bookId", element: <BookDetails /> },
          { path: "/library", element: <Library /> },
          { path: "/friends", element: <Friends /> },
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
