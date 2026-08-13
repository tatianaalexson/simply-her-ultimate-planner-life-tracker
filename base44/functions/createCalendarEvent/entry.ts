import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CONNECTOR_ID = '6a7e1fcd17fed60ea3da0119';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const title = (body.title || '').trim();
    const start = body.start;
    const end = body.end;
    if (!title || !start || !end) {
      return Response.json({ error: 'title, start, end required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: title,
        start: { dateTime: start },
        end: { dateTime: end }
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      return Response.json({ error: `Google API ${res.status}: ${txt}` }, { status: res.status });
    }
    const data = await res.json();
    return Response.json({ id: data.id, htmlLink: data.htmlLink });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}