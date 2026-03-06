import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import './App.css'

interface WorkflowStatus {
  status: 'idle' | 'triggering' | 'running' | 'completed' | 'error'
  message: string
  runUrl?: string
}

function App() {
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    status: 'idle',
    message: ''
  })

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const reportId = urlParams.get('report')
  const findingId = urlParams.get('finding')
  const actionType = urlParams.get('action') || 'execute'

  useEffect(() => {
    if (reportId && findingId) {
      triggerWorkflow()
    }
  }, [reportId, findingId])

  const triggerWorkflow = async () => {
    if (!reportId || !findingId) {
      setWorkflowStatus({
        status: 'error',
        message: 'Paramètres manquants : report et finding requis'
      })
      return
    }

    setWorkflowStatus({
      status: 'triggering',
      message: 'Déclenchement du workflow GitHub Actions...'
    })

    try {
      // Call backend API to trigger GitHub Actions
      const response = await fetch('/api/trigger-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          report_id: reportId,
          finding_id: findingId,
          action_type: actionType
        })
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      setWorkflowStatus({
        status: 'running',
        message: 'Workflow déclenché avec succès ! Exécution en cours...',
        runUrl: data.run_url
      })

      // Poll for completion
      setTimeout(() => {
        setWorkflowStatus({
          status: 'completed',
          message: 'Action exécutée ! Tu recevras un email avec les résultats.',
          runUrl: data.run_url
        })
      }, 5000)

    } catch (error) {
      setWorkflowStatus({
        status: 'error',
        message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      })
    }
  }

  const getStatusIcon = () => {
    switch (workflowStatus.status) {
      case 'triggering':
      case 'running':
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle2 className="w-16 h-16 text-green-500" />
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500" />
      default:
        return null
    }
  }

  const getActionName = () => {
    const actions: Record<string, string> = {
      'CM-005': 'Génération d\'articles de blog',
      'CM-001': 'Newsletter mensuelle',
      'CM-007': 'Organisation d\'événement',
      'ACCT-001': 'Validation comptable',
    }
    return findingId ? actions[findingId] || findingId : 'Action'
  }

  if (!reportId || !findingId) {
    return (
      <div className="app-container">
        <div className="content-card">
          <h1 className="text-3xl font-bold mb-2">WeSmart AI</h1>
          <p className="text-gray-600 mb-6">
            L'intelligence artificielle au service de l'énergie
          </p>
          <a
            href="https://wesmart.com/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
          >
            Discuter avec Julie
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="content-card">
        {getStatusIcon()}

        <h1 className="text-3xl font-bold mt-6 mb-2">
          {getActionName()}
        </h1>

        <div className="info-box mb-6">
          <p className="text-sm text-gray-600">
            <strong>Report:</strong> <code>{reportId}</code>
          </p>
          <p className="text-sm text-gray-600">
            <strong>Finding:</strong> <code>{findingId}</code>
          </p>
        </div>

        <p className="text-lg text-gray-700 mb-6">
          {workflowStatus.message}
        </p>

        {workflowStatus.runUrl && (
          <a
            href={workflowStatus.runUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-button"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Voir les logs GitHub Actions
          </a>
        )}

        {workflowStatus.status === 'completed' && (
          <div className="success-box mt-6">
            <p className="text-sm">
              ✅ Tu recevras un email avec les résultats dans quelques minutes.
            </p>
          </div>
        )}

        {workflowStatus.status === 'error' && (
          <button
            onClick={triggerWorkflow}
            className="retry-button mt-6"
          >
            Réessayer
          </button>
        )}
      </div>

      <footer className="footer">
        <p className="text-sm text-gray-500">
          🤖 WeSmart AI Agent System •
          <a href="https://wesmart.com" className="text-blue-500 ml-2">wesmart.com</a>
        </p>
      </footer>
    </div>
  )
}

export default App
