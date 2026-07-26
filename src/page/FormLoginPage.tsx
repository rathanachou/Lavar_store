// src/pages/FormLoginPage.tsx

import { LoginForm } from '../components/LoginForm/LoginForm'
import { useLocation } from 'react-router-dom'

function FormLoginPage() {
  const location = useLocation()
  const isSignup = location.pathname === '/signup'

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}

export default FormLoginPage