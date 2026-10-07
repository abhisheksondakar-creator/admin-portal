import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold text-ink mb-2">404</h1>
      <p className="text-muted mb-6">Page not found</p>
      <Link to="/overview">
        <Button variant="outline">Back to Overview</Button>
      </Link>
    </div>
  )
}
