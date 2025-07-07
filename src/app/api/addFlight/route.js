import { client } from '@/lib/gremlin-client';

export async function POST(req) {
  const { from, to, id, airline, duration, flightNumber } = await req.json();

  try {
    await client.open();
    await client.submit(`
      g.V('${from}').addE('flight')
      .to(g.V('${to}'))
      .property('id', '${id}')
      .property('airline', '${airline}')
      .property('duration', ${duration})
      .property('flightNumber', '${flightNumber}')
    `);
    return new Response('Flight added', { status: 200 });
  } catch (err) {
    console.error('Add flight error:', err);
    return new Response('Error adding flight', { status: 500 });
  } finally {
    await client.close();
  }
}
