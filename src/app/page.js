'use client';
import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import axios from 'axios';

cytoscape.use(coseBilkent);

export default function Home() {
  const cyRef = useRef(null);
  const [selectedProps, setSelectedProps] = useState(null);

  const [airport, setAirport] = useState({ id: '', name: '', city: '' });
  const [flight, setFlight] = useState({ from: '', to: '', id: '', airline: '', duration: '', flightNumber: '' });
  const [deleteId, setDeleteId] = useState('');
  const [modal, setModal] = useState(null); // 'airport', 'flight', 'delete'

  useEffect(() => {
    fetchGraph();
  }, []);

  const fetchGraph = async () => {
    const res = await axios.get('/api/get-graph');
    const data = res.data;

    const cy = cytoscape({
      container: cyRef.current,
      elements: [...data.nodes, ...data.edges],
      layout: { name: 'cose-bilkent' },
      minZoom: 0.5,
      maxZoom: 2,
      wheelSensitivity: 0.2,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#3f51b5',
            'label': 'data(label)',
            'shape': 'ellipse',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
            'color': '#000',
            'font-size': '10px',
            'text-wrap': 'wrap',
            'background-image': 'url("https://img.icons8.com/emoji/48/airplane-emoji.png")',
            'background-fit': 'cover',
            'width': '48px',
            'height': '48px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#888',
            'target-arrow-color': '#888',
            'target-arrow-shape': 'triangle',
            'label': 'data(label)',
            'font-size': '9px',
            'text-rotation': 'autorotate',
            'text-margin-y': '-10px',
            'color': '#000',
            'text-background-color': '#fff',
            'text-background-opacity': 0.7,
            'text-background-padding': '2px',
            'curve-style': 'bezier'
          }
        }
      ]
    });

    cy.nodes().grabify();
    cy.userZoomingEnabled(true);
    cy.userPanningEnabled(true);

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedProps(node.data().properties || {});
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedProps(edge.data().properties || {});
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) setSelectedProps(null);
    });
  };

  const submitAirport = async () => {
    await axios.post('/api/addVertex', airport);
    setModal(null);
    fetchGraph();
  };

  const submitFlight = async () => {
    await axios.post('/api/addEdge', flight);
    setModal(null);
    fetchGraph();
  };

  const submitDelete = async () => {
    await axios.post('/api/deleteVertex', { id: deleteId });
    setModal(null);
    fetchGraph();
  };

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#fff',
    padding: '20px',
    border: '2px solid #3f51b5',
    borderRadius: '8px',
    zIndex: 1000,
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  };

  const backdropStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '20px' }}>✈️ Airport & Flight Network</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setModal('airport')} style={{ margin: '10px', backgroundColor: '#4caf50', color: '#fff', padding: '10px 20px', borderRadius: '6px' }}>Add Airport</button>
        <button onClick={() => setModal('flight')} style={{ margin: '10px', backgroundColor: '#2196f3', color: '#fff', padding: '10px 20px', borderRadius: '6px' }}>Add Flight</button>
        <button onClick={() => setModal('delete')} style={{ margin: '10px', backgroundColor: '#f44336', color: '#fff', padding: '10px 20px', borderRadius: '6px' }}>Delete Airport</button>
      </div>

      {selectedProps && (
        <div style={{ margin: 'auto', maxWidth: '400px', textAlign: 'left', backgroundColor: '#f1f1f1', padding: '15px', borderRadius: '6px' }}>
          <h3>🧾 Selected Details</h3>
          <ul>
            {Object.entries(selectedProps).map(([k, v]) => (
              <li key={k}><b>{k}</b>: {Array.isArray(v) ? v.join(', ') : v}</li>
            ))}
          </ul>
        </div>
      )}

      <div ref={cyRef} style={{ height: '75vh', marginTop: '20px', border: '2px solid #ccc', borderRadius: '10px' }} />

      {/* Modal + Backdrop */}
      {modal && <div style={backdropStyle} onClick={() => setModal(null)} />}
      {modal === 'airport' && (
        <div style={modalStyle}>
          <h3>Add Airport</h3>
          <input placeholder="ID" onChange={(e) => setAirport({ ...airport, id: e.target.value })} /><br />
          <input placeholder="Name" onChange={(e) => setAirport({ ...airport, name: e.target.value })} /><br />
          <input placeholder="City" onChange={(e) => setAirport({ ...airport, city: e.target.value })} /><br />
          <button onClick={submitAirport} style={{ marginTop: '10px', backgroundColor: '#4caf50', color: '#fff', padding: '8px 16px' }}>Submit</button>
        </div>
      )}

      {modal === 'flight' && (
        <div style={modalStyle}>
          <h3>Add Flight</h3>
          <input placeholder="From" onChange={(e) => setFlight({ ...flight, from: e.target.value })} /><br />
          <input placeholder="To" onChange={(e) => setFlight({ ...flight, to: e.target.value })} /><br />
          <input placeholder="ID" onChange={(e) => setFlight({ ...flight, id: e.target.value })} /><br />
          <input placeholder="Airline" onChange={(e) => setFlight({ ...flight, airline: e.target.value })} /><br />
          <input placeholder="Duration (min)" onChange={(e) => setFlight({ ...flight, duration: e.target.value })} /><br />
          <input placeholder="Flight Number" onChange={(e) => setFlight({ ...flight, flightNumber: e.target.value })} /><br />
          <button onClick={submitFlight} style={{ marginTop: '10px', backgroundColor: '#2196f3', color: '#fff', padding: '8px 16px' }}>Submit</button>
        </div>
      )}

      {modal === 'delete' && (
        <div style={modalStyle}>
          <h3>Delete Airport</h3>
          <input placeholder="Airport ID" onChange={(e) => setDeleteId(e.target.value)} /><br />
          <button onClick={submitDelete} style={{ marginTop: '10px', backgroundColor: '#f44336', color: '#fff', padding: '8px 16px' }}>Delete</button>
        </div>
      )}
    </div>
  );
}


// 'use client';
// import { useEffect, useRef, useState } from 'react';
// import cytoscape from 'cytoscape';
// import coseBilkent from 'cytoscape-cose-bilkent';
// import axios from 'axios';

// cytoscape.use(coseBilkent);

// export default function Home() {
//   const cyRef = useRef(null);
//   const [selectedProps, setSelectedProps] = useState(null);

//   const [airport, setAirport] = useState({ id: '', name: '', city: '' });
//   const [flight, setFlight] = useState({ from: '', to: '', id: '', airline: '', duration: '', flightNumber: '' });
//   const [deleteId, setDeleteId] = useState('');

//   const [modal, setModal] = useState(null); // 'airport', 'flight', 'delete'

//   useEffect(() => {
//     fetchGraph();
//   }, []);

//   const fetchGraph = async () => {
//     const res = await axios.get('/api/get-graph');
//     const data = res.data;

//     const cy = cytoscape({
//       container: cyRef.current,
//       elements: [...data.nodes, ...data.edges],
//       layout: { name: 'cose-bilkent' },
//       style: [
//         {
//           selector: 'node',
//           style: {
//             'background-color': '#3f51b5',
//             'label': 'data(label)',
//             'shape': 'ellipse',
//             'background-image': 'url("https://img.icons8.com/emoji/48/airplane-emoji.png")',
//             'background-fit': 'cover',
//             'width': '48px',
//             'height': '48px'
//           }
//         },
//         {
//           selector: 'edge',
//           style: {
//             'width': 3,
//             'line-color': '#888',
//             'target-arrow-color': '#888',
//             'target-arrow-shape': 'triangle',
//             'label': 'data(label)',
//             'font-size': '10px',
//             'curve-style': 'bezier'
//           }
//         }
//       ]
//     });

//     cy.on('tap', 'node', (evt) => {
//       const node = evt.target;
//       setSelectedProps(node.data().properties || {});
//     });

//     cy.on('tap', (evt) => {
//       if (evt.target === cy) setSelectedProps(null);
//     });
//   };

//   const submitAirport = async () => {
//     await axios.post('/api/addVertex', airport);
//     setModal(null);
//     fetchGraph();
//   };

//   const submitFlight = async () => {
//     await axios.post('/api/addEdge', flight);
//     setModal(null);
//     fetchGraph();
//   };

//   const submitDelete = async () => {
//     await axios.post('/api/deleteVertex', { id: deleteId });
//     setModal(null);
//     fetchGraph();
//   };

//   const modalStyle = {
//     position: 'fixed',
//     top: '50%', left: '50%',
//     transform: 'translate(-50%, -50%)',
//     background: '#fff',
//     padding: '20px',
//     border: '2px solid #3f51b5',
//     borderRadius: '8px',
//     zIndex: 1000,
//     boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
//   };

//   const backdropStyle = {
//     position: 'fixed',
//     top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     zIndex: 999
//   };

//   return (
//     <div style={{ padding: '20px', textAlign: 'center' }}>
//       <h1 style={{ marginBottom: '20px' }}>✈️ Airport & Flight Network</h1>

//       <div style={{ marginBottom: '20px' }}>
//         <button onClick={() => setModal('airport')} style={{ margin: '10px', backgroundColor: '#4caf50', color: '#fff', padding: '10px 20px', borderRadius: '6px' }}>Add Airport</button>
//         <button onClick={() => setModal('flight')} style={{ margin: '10px', backgroundColor: '#2196f3', color: '#fff', padding: '10px 20px', borderRadius: '6px' }}>Add Flight</button>
//         <button onClick={() => setModal('delete')} style={{ margin: '10px', backgroundColor: '#f44336', color: '#fff', padding: '10px 20px', borderRadius: '6px' }}>Delete Airport</button>
//       </div>

//       {selectedProps && (
//         <div style={{ margin: 'auto', maxWidth: '400px', textAlign: 'left', backgroundColor: '#f1f1f1', padding: '15px', borderRadius: '6px' }}>
//           <h3>🛫 Selected Airport Details</h3>
//           <ul>
//             {Object.entries(selectedProps).map(([k, v]) => (
//               <li key={k}><b>{k}</b>: {Array.isArray(v) ? v.join(', ') : v}</li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <div ref={cyRef} style={{ height: '75vh', marginTop: '20px', border: '2px solid #ccc', borderRadius: '10px' }} />

//       {/* Modal + Backdrop */}
//       {modal && <div style={backdropStyle} onClick={() => setModal(null)} />}
//       {modal === 'airport' && (
//         <div style={modalStyle}>
//           <h3>Add Airport</h3>
//           <input placeholder="ID" onChange={(e) => setAirport({ ...airport, id: e.target.value })} /><br />
//           <input placeholder="Name" onChange={(e) => setAirport({ ...airport, name: e.target.value })} /><br />
//           <input placeholder="City" onChange={(e) => setAirport({ ...airport, city: e.target.value })} /><br />
//           <button onClick={submitAirport} style={{ marginTop: '10px', backgroundColor: '#4caf50', color: '#fff', padding: '8px 16px' }}>Submit</button>
//         </div>
//       )}

//       {modal === 'flight' && (
//         <div style={modalStyle}>
//           <h3>Add Flight</h3>
//           <input placeholder="From" onChange={(e) => setFlight({ ...flight, from: e.target.value })} /><br />
//           <input placeholder="To" onChange={(e) => setFlight({ ...flight, to: e.target.value })} /><br />
//           <input placeholder="ID" onChange={(e) => setFlight({ ...flight, id: e.target.value })} /><br />
//           <input placeholder="Airline" onChange={(e) => setFlight({ ...flight, airline: e.target.value })} /><br />
//           <input placeholder="Duration (min)" onChange={(e) => setFlight({ ...flight, duration: e.target.value })} /><br />
//           <input placeholder="Flight Number" onChange={(e) => setFlight({ ...flight, flightNumber: e.target.value })} /><br />
//           <button onClick={submitFlight} style={{ marginTop: '10px', backgroundColor: '#2196f3', color: '#fff', padding: '8px 16px' }}>Submit</button>
//         </div>
//       )}

//       {modal === 'delete' && (
//         <div style={modalStyle}>
//           <h3>Delete Airport</h3>
//           <input placeholder="Airport ID" onChange={(e) => setDeleteId(e.target.value)} /><br />
//           <button onClick={submitDelete} style={{ marginTop: '10px', backgroundColor: '#f44336', color: '#fff', padding: '8px 16px' }}>Delete</button>
//         </div>
//       )}
//     </div>
//   );
// }
