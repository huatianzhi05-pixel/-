// Netlify Serverless Function for /api/health, /api/save, and /api/report
// Compatible with Netlify Functions v1/v2 handler signature

let memorySaveArchive = null;
const memoryReports = [];

export async function handler(event) {
  const rawPath = event.path || '';
  const method = (event.httpMethod || 'GET').toUpperCase();

  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  if (rawPath.endsWith('/health')) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: true,
        platform: 'netlify-serverless',
        protocolVersion: '1.0',
        timestamp: new Date().toISOString(),
      }),
    };
  }

  if (rawPath.endsWith('/save')) {
    if (method === 'POST') {
      try {
        memorySaveArchive = event.body ? JSON.parse(event.body) : null;
      } catch {
        // Ignore malformed JSON
      }
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: true,
          savedAt: new Date().toISOString(),
          storage: 'netlify-edge-ephemeral+client-indexeddb',
        }),
      };
    }
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: true,
        save: memorySaveArchive,
      }),
    };
  }

  if (rawPath.endsWith('/report') && method === 'POST') {
    try {
      const payload = event.body ? JSON.parse(event.body) : {};
      memoryReports.unshift({
        ...payload,
        receivedAt: new Date().toISOString(),
      });
    } catch {
      // Ignore malformed JSON
    }
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: true,
        totalReports: memoryReports.length,
      }),
    };
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      ok: true,
      service: 'glimmer-travelers-netlify-api',
    }),
  };
}
