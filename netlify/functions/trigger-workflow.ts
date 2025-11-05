import { Handler } from '@netlify/functions';
import { Octokit } from '@octokit/rest';

const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { report_id, finding_id, action_type } = JSON.parse(event.body || '{}');

    // Validate inputs
    if (!report_id || !finding_id || !action_type) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required parameters: report_id, finding_id, action_type',
        }),
      };
    }

    // Validate report_id format
    const reportIdRegex = /^RPT-\d{4}-\d{2}-\d{2}-[a-f0-9]{8}$/;
    if (!reportIdRegex.test(report_id)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid report_id format. Expected: RPT-YYYY-MM-DD-XXXXXXXX',
        }),
      };
    }

    // Initialize Octokit with GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Trigger workflow
    const response = await octokit.actions.createWorkflowDispatch({
      owner: 'fpbordes',
      repo: 'shared',
      workflow_id: 'execute-action.yml',
      ref: 'main',
      inputs: {
        report_id,
        finding_id,
        action_type,
      },
    });

    console.log('Workflow triggered successfully:', {
      report_id,
      finding_id,
      action_type,
      status: response.status,
    });

    // Get the run ID (note: GitHub doesn't return it immediately, so we'll construct the URL)
    const runUrl = `https://github.com/fpbordes/shared/actions/workflows/execute-action.yml`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Workflow triggered successfully',
        run_url: runUrl,
        report_id,
        finding_id,
      }),
    };
  } catch (error: any) {
    console.error('Error triggering workflow:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to trigger workflow',
        details: error.message,
      }),
    };
  }
};

export { handler };
