/* 
   ==========================================================================
   IMAM ZAMAN a.s ISLAMIC LIBRARY - MAIN APP
   ==========================================================================
*/
import React, { useState } from 'react';
import axios from 'axios';
import logo from './logo.jpg'; 

// --- YOUR RENDER BACKEND URL ---
const API = "https://library-backend-ac53.onrender.com/api"; 

export default function App() {
  const [view, setView] = useState('home');

  return (
    <div style={styles.app}>
      {/* HEADER */}
      <header style={styles.header}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <div>
          <h1 style={styles.title}>IMAM ZAMAN (a.s) ISLAMIC LIBRARY</h1>
          <p style={styles.subtitle}>Knowledge is the Life of the Soul</p>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav style={styles.nav}>
        <button style={styles.navBtn} onClick={() => setView('home')}>Home</button>
        <button style={styles.navBtn} onClick={() => setView('public')}>Public Search</button>
        <button style={styles.navBtn} onClick={() => setView('admin')}>Admin Dashboard</button>
      </nav>

      {/* CONTENT AREA */}
      <div style={styles.content}>
        {view === 'home' && <HomeView />}
        {view === 'public' && <PublicSearch />}
        {view === 'admin' && <AdminDashboard />}
      </div>
      
      <footer style={styles.footer}>
        <p>&copy; 2025 IMAM ZAMAN a.s ISLAMIC LIBRARY System</p>
      </footer>
    </div>
  );
}

// --- VIEW COMPONENTS ---

function HomeView() {
  return (
    <div style={{textAlign: 'center', padding: '50px'}}>
      <h2 style={{color: '#004d40', fontSize: '2rem'}}>Welcome to the Library</h2>
      <p style={{fontSize: '1.2rem'}}>Explore our collection of Islamic literature and knowledge.</p>
    </div>
  );
}

function PublicSearch() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);

  const search = async () => {
    try {
      const res = await axios.get(`${API}/search?q=${query}`);
      setBooks(res.data);
    } catch (e) { alert("Error connecting to server. Check API URL."); }
  };

  return (
    <div>
      <h2 style={{color: '#004d40'}}>Public Catalog Search</h2>
      <div style={styles.searchBar}>
        <input 
          style={styles.input} 
          placeholder="Enter Book Title or Author..." 
          onChange={(e) => setQuery(e.target.value)} 
        />
        <button style={styles.btn} onClick={search}>Search</button>
      </div>
      
      <div style={styles.grid}>
        {books.map(b => (
          <div key={b._id} style={styles.card}>
            <h3 style={{margin: '0 0 10px 0', color: '#1b5e20'}}>{b.title}</h3>
            <p><strong>Author:</strong> {b.author}</p>
            <p><strong>Status:</strong> <span style={{fontWeight: 'bold', color: b.available>0?'green':'red'}}>{b.available > 0 ? 'Available' : 'Issued'}</span></p>
            <p><strong>Shelf:</strong> {b.shelfNumber}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState('addBook');
  const [data, setData] = useState({});

  const handleInput = (e) => setData({...data, [e.target.name]: e.target.value});

  const submitBook = async () => {
    try { await axios.post(`${API}/books`, data); alert("Book Added Successfully!"); }
    catch (e) { alert("Error Adding Book"); }
  };

  const submitMember = async () => {
    try { await axios.post(`${API}/members`, data); alert("Member Registered!"); }
    catch (e) { alert("Error Adding Member"); }
  };

  const issueBook = async () => {
    try { await axios.post(`${API}/issue`, data); alert("Book Issued Successfully!"); }
    catch (e) { alert("Error Issuing Book (Check Availability)"); }
  };

  const returnBook = async () => {
    try { 
      const res = await axios.post(`${API}/return`, data); 
      alert(`Book Returned.\n\nFine Amount: ${res.data.fine}`); 
    }
    catch (e) { alert("Error Returning Book"); }
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.sidebar}>
        <button style={styles.sideBtn} onClick={() => setTab('addBook')}>Add Book</button>
        <button style={styles.sideBtn} onClick={() => setTab('addMember')}>Add Member</button>
        <button style={styles.sideBtn} onClick={() => setTab('issue')}>Issue Book</button>
        <button style={styles.sideBtn} onClick={() => setTab('return')}>Return Book</button>
      </div>
      <div style={styles.panel}>
        {tab === 'addBook' && (
          <>
            <h3>Add New Book</h3>
            <input name="title" placeholder="Title" style={styles.input} onChange={handleInput} />
            <input name="author" placeholder="Author" style={styles.input} onChange={handleInput} />
            <input name="edition" placeholder="Edition" style={styles.input} onChange={handleInput} />
            <input name="language" placeholder="Language" style={styles.input} onChange={handleInput} />
            <input name="shelfNumber" placeholder="Shelf No." style={styles.input} onChange={handleInput} />
            <input name="copies" type="number" placeholder="Copies" style={styles.input} onChange={handleInput} />
            <button style={styles.btn} onClick={submitBook}>Save Book</button>
          </>
        )}
        {tab === 'addMember' && (
          <>
            <h3>Add New Member</h3>
            <input name="name" placeholder="Name" style={styles.input} onChange={handleInput} />
            <input name="fatherName" placeholder="S/o" style={styles.input} onChange={handleInput} />
            <input name="address" placeholder="R/o (Address)" style={styles.input} onChange={handleInput} />
            <input name="email" placeholder="Email" style={styles.input} onChange={handleInput} />
            <input name="phone" placeholder="Phone" style={styles.input} onChange={handleInput} />
            <button style={styles.btn} onClick={submitMember}>Register Member</button>
          </>
        )}
        {tab === 'issue' && (
          <>
            <h3>Issue Book</h3>
            <input name="bookId" placeholder="Book ID (Copy from DB)" style={styles.input} onChange={handleInput} />
            <input name="memberId" placeholder="Member ID" style={styles.input} onChange={handleInput} />
            <input name="days" type="number" placeholder="Days (e.g. 15)" style={styles.input} onChange={handleInput} />
            <button style={styles.btn} onClick={issueBook}>Issue Now</button>
          </>
        )}
        {tab === 'return' && (
          <>
            <h3>Return Book</h3>
            <input name="bookId" placeholder="Book ID" style={styles.input} onChange={handleInput} />
            <input name="memberId" placeholder="Member ID" style={styles.input} onChange={handleInput} />
            <button style={styles.btn} onClick={returnBook}>Process Return</button>
          </>
        )}
      </div>
    </div>
  );
}

// --- STYLES (Deep Green & Gold) ---
const styles = {
  app: { fontFamily: "Georgia, serif", backgroundColor: '#f4f4f4', minHeight: '100vh' },
  header: { 
    display: 'flex', alignItems: 'center', padding: '20px 40px', 
    backgroundColor: '#1b5e20', color: '#ffd700', borderBottom: '5px solid #ffd700',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  logo: { height: '80px', marginRight: '20px', borderRadius: '50%', border: '2px solid #ffd700' },
  title: { margin: 0, fontSize: '1.8rem', letterSpacing: '1px' },
  subtitle: { margin: 0, fontStyle: 'italic', opacity: 0.9, fontSize: '1rem' },
  nav: { backgroundColor: '#2e7d32', padding: '10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  navBtn: { 
    margin: '0 15px', padding: '10px 25px', backgroundColor: 'transparent', 
    color: 'white', border: '1px solid #ffd700', borderRadius: '30px', 
    cursor: 'pointer', fontSize: '1rem', transition: 'all 0.3s'
  },
  content: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
  footer: { textAlign: 'center', padding: '20px', backgroundColor: '#1b5e20', color: 'white', marginTop: '50px' },
  searchBar: { display: 'flex', gap: '10px', marginBottom: '30px' },
  input: { padding: '12px', flex: 1, border: '1px solid #ccc', borderRadius: '5px', marginBottom: '15px', width: '100%', fontSize: '1rem' },
  btn: { padding: '12px 30px', backgroundColor: '#1b5e20', color: '#ffd700', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderTop: '5px solid #1b5e20' },
  dashboard: { display: 'flex', gap: '30px', alignItems: 'flex-start' },
  sidebar: { width: '220px', display: 'flex', flexDirection: 'column', gap: '10px' },
  sideBtn: { padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 'bold', color: '#2e7d32' },
  panel: { flex: 1, backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }
};
