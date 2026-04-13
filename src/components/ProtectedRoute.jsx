import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../contexts/Auth'

export default function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext)

  // Aguarda o carregamento sem redirecionar
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  )

  if (!token) return <Navigate to="/login" replace />
  return children
}
