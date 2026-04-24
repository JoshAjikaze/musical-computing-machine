import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import type { User } from "../../store/api/vibeApi"

export interface ProtectedRouteProps {
  children: React.ReactNode
  /** Optional array of roles that are allowed to access this route */
  allowedRoles?: User["role"][]
  /** Where to redirect if unauthenticated. Defaults to "/login" */
  redirectPath?: string
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectPath = "/login" 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to={redirectPath} state={{ from: location }} replace />
  }

  // If roles are specified and user's role is not in the allowed list, redirect to home
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
