import { client } from '@/lib/gremlin-client';

export async function GET() {
  try {
    await client.open();

    const result = await client.submit(`
      g.V().as('v')
        .project('id', 'label', 'name', 'properties', 'edges')
        .by(id)
        .by(label)
        .by(values('name'))
        .by(valueMap())
        .by(outE().as('e')
          .project('id', 'label', 'to', 'flightNumber')
          .by(id)
          .by(label)
          .by(inV().id())
          .by(values('flightNumber')).fold()
        )
    `);

    const raw = await result.toArray();
    const nodes = raw.map(v => ({
      data: { id: v.id, label: v.label, name: v.name }
    }));

    const edges = raw.flatMap(v =>
      v.edges.map(e => ({
        data: {
          id: e.id,
          label: e.label,
          source: v.id,
          target: e.to,
          flightNumber: e.flightNumber
        }
      }))
    );

    return Response.json({ nodes, edges });
  } catch (err) {
    console.error('Error fetching graph:', err);
    return new Response('Internal Server Error', { status: 500 });
  } finally {
    await client.close();
  }
}
