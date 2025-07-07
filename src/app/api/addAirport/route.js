import { client } from '@/lib/gremlin-client';

export async function POST(req) {
  const { id, name, city } = await req.json();

  try {
    await client.open();
    await client.submit(`
      g.addV('airport')
      .property('id', '${id}')
      .property('name', '${name}')
      .property('city', '${city}')
      .property('pk', '${id}')
    `);
    return new Response('Airport added', { status: 200 });
  } catch (err) {
    console.error('Add airport error:', err);
    return new Response('Error adding airport', { status: 500 });
  } finally {
    await client.close();
  }
}
