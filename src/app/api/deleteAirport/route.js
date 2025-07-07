import { client } from '@/lib/gremlin-client';

export async function DELETE(req) {
  const { id } = await req.json();

  try {
    await client.open();
    await client.submit(`g.V('${id}').drop()`);
    return new Response('Airport deleted', { status: 200 });
  } catch (err) {
    console.error('Delete error:', err);
    return new Response('Error deleting airport', { status: 500 });
  } finally {
    await client.close();
  }
}
