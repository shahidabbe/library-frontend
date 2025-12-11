import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react'; // QR Code Library

// --- YOUR RENDER BACKEND URL ---
const API = "https://library-backend-ac53.onrender.com/api"; 

export default function App() {
  // --- STATES ---
  const [view, setView] = useState('public'); 
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin Actions
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', copies: 1 });
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' });
  
  // QR Transaction State
  const [transBookId, setTransBookId] = useState('');
  const [transMemberId, setTransMemberId] = useState('');

  // Search Filters
  const [publicSearch, setPublicSearch] = useState('');
  const [adminBookSearch, setAdminBookSearch] = useState('');
  const [adminMemberSearch, setAdminMemberSearch] = useState('');

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const bRes = await axios.get(`${API}/books`);
      const mRes = await axios.get(`${API}/members`);
      setBooks(bRes.data);
      setMembers(mRes.data);
    } catch (err) { console.error("Error loading data", err); }
  };

  // --- SECURITY (LOGIN) ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "1234") {
      setIsAdmin(true);
      setView('admin');
    } else {
      alert("Wrong ID or Password!");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setView('public');
    setUsername('');
    setPassword('');
  };

  // --- ADMIN ACTIONS ---
  const addBook = async () => {
    if (!newBook.title) return alert("Enter a title");
    await axios.post(`${API}/books`, newBook);
    alert("Book Added!");
    setNewBook({ title: '', author: '', isbn: '', copies: 1 });
    refreshData();
  };

  const addMember = async () => {
    if (!newMember.name) return alert("Enter a name");
    await axios.post(`${API}/members`, newMember);
    alert("Member Added!");
    setNewMember({ name: '', email: '', phone: '' });
    refreshData();
  };

  const issueBook = async () => {
    if (!transBookId || !transMemberId) return alert("Scan both QR Codes first");
    try {
      await axios.post(`${API}/transactions/issue`, { bookId: transBookId, memberId: transMemberId });
      alert("✅ Book Issued Successfully!");
      setTransBookId(''); setTransMemberId(''); 
      refreshData();
    } catch (err) { alert("Failed: " + (err.response?.data?.error || "Unknown Error")); }
  };

  const returnBook = async () => {
    if (!transBookId || !transMemberId) return alert("Scan both QR Codes first");
    try {
      await axios.post(`${API}/transactions/return`, { bookId: transBookId, memberId: transMemberId });
      alert("✅ Book Returned Successfully!");
      setTransBookId(''); setTransMemberId('');
      refreshData();
    } catch (err) { alert("Failed: " + (err.response?.data?.error || "Unknown Error")); }
  };

  // --- FILTERS ---
  const publicBooks = books.filter(b => b.title.toLowerCase().includes(publicSearch.toLowerCase()));
  const adminBooks = books.filter(b => b.title.toLowerCase().includes(adminBookSearch.toLowerCase()));
  const adminMembers = members.filter(m => m.name.toLowerCase().includes(adminMemberSearch.toLowerCase()));

  // --- STYLES ---
  const styles = {
    container: { maxWidth: '1000px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif' },
    header: { background: '#1b5e20', color: '#ffd700', padding: '20px', textAlign: 'center', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    nav: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' },
    btn: { padding: '10px 20px', cursor: 'pointer', background: '#2e7d32', color: 'white', border: '1px solid gold', borderRadius: '5px', fontWeight: 'bold' },
    section: { border: '1px solid #ddd', padding: '20px', borderRadius: '10px', marginTop: '20px', background: '#f9f9f9' },
    input: { padding: '10px', width: '200px', margin: '5px', borderRadius: '5px', border: '1px solid #ccc' },
    card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px', margin: '10px 0', border: '1px solid #eee', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    qrBlock: { textAlign: 'center', marginLeft: '10px' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>🏛️ IMAM ZAMAN (a.s) LIBRARY SYSTEM</h1>
      </header>

      {/* NAVIGATION */}
      <div style={styles.nav}>
        <button style={styles.btn} onClick={() => setView('public')}>Public Search</button>
        {!isAdmin ? (
          <button style={{...styles.btn, background: '#0d47a1'}} onClick={() => setView('login')}>Admin Login</button>
        ) : (
          <>
            <button style={{...styles.btn, background: '#1b5e20'}} onClick={() => setView('admin')}>Dashboard</button>
            <button style={{...styles.btn, background: '#c62828'}} onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>

      {/* === VIEW: PUBLIC SEARCH === */}
      {view === 'public' && (
        <div style={styles.section}>
          <h2 style={{color: '#1b5e20'}}>🔍 Search for Books</h2>
          <input 
            style={{...styles.input, width: '95%'}} 
            placeholder="Type book title or author..." 
            value={publicSearch} 
            onChange={e => setPublicSearch(e.target.value)} 
          />
          {publicBooks.map(book => (
            <div key={book._id} style={styles.card}>
              <div>
                <h3 style={{margin:0, color:'#2e7d32'}}>{book.title}</h3>
                <p>Author: {book.author}</p>
              </div>
              <div>
                {book.copies > 0 
                  ? <span style={{color:'green', fontWeight:'bold'}}>AVAILABLE ({book.copies})</span> 
                  : <span style={{color:'red', fontWeight:'bold'}}>OUT OF STOCK</span>
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === VIEW: LOGIN === */}
      {view === 'login' && (
        <div style={{...styles.section, textAlign: 'center', maxWidth: '400px', margin: '40px auto'}}>
          <h2>🔐 Admin Access</h2>
          <form onSubmit={handleLogin}>
            <input style={styles.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /><br/>
            <input type="password" style={styles.input} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br/>
            <button type="submit" style={{...styles.btn, background: 'gold', color: 'black', marginTop: '10px'}}>Login</button>
          </form>
        </div>
      )}

      {/* === VIEW: ADMIN DASHBOARD === */}
      {view === 'admin' && (
        <div>
          {/* 1. TRANSACTION DESK (SCAN QR) */}
          <div style={{...styles.section, border: '2px solid gold'}}>
            <h3>⚡ Quick Issue / Return (Scan QR)</h3>
            <p>Click inside the box, then scan the QR code.</p>
            <input 
              style={{...styles.input, width: '40%', borderColor: 'blue'}} 
              placeholder="Click here & Scan BOOK QR" 
              value={transBookId} 
              onChange={e => setTransBookId(e.target.value)} 
            />
            <input 
              style={{...styles.input, width: '40%', borderColor: 'green'}} 
              placeholder="Click here & Scan MEMBER QR" 
              value={transMemberId} 
              onChange={e => setTransMemberId(e.target.value)} 
            />
            <br/>
            <button style={{...styles.btn, background: 'green', marginRight: '10px'}} onClick={issueBook}>ISSUE BOOK</button>
            <button style={{...styles.btn, background: 'orange'}} onClick={returnBook}>RETURN BOOK</button>
          </div>

          {/* 2. MANAGE BOOKS */}
          <div style={styles.section}>
            <h3>📚 Manage Books</h3>
            <div style={{marginBottom:'15px'}}>
              <input style={styles.input} placeholder="Title" value={newBook.title} onChange={e => setNewBook({...newBook, title:e.target.value})}/>
              <input style={styles.input} placeholder="Author" value={newBook.author} onChange={e => setNewBook({...newBook, author:e.target.value})}/>
              <input style={styles.input} placeholder="ISBN" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn:e.target.value})}/>
              <input type="number" style={{...styles.input, width:'60px'}} placeholder="Qty" value={newBook.copies} onChange={e => setNewBook({...newBook, copies:e.target.value})}/>
              <button style={styles.btn} onClick={addBook}>Add Book</button>
            </div>
            
            <input style={{...styles.input, width: '95%', background:'#eef'}} placeholder="Filter Admin Books..." value={adminBookSearch} onChange={e => setAdminBookSearch(e.target.value)} />
            
            {adminBooks.map(book => (
              <div key={book._id} style={styles.card}>
                <div>
                  <strong>{book.title}</strong><br/>
                  <small>ID: {book._id}</small><br/>
                  Copies: {book.copies}
                </div>
                <div style={styles.qrBlock}>
                  <QRCodeCanvas value={book._id} size={64} />
                  <br/><small>Book QR</small>
                </div>
              </div>
            ))}
          </div>

          {/* 3. MANAGE MEMBERS */}
          <div style={styles.section}>
            <h3>👥 Manage Members</h3>
            <div style={{marginBottom:'15px'}}>
              <input style={styles.input} placeholder="Name" value={newMember.name} onChange={e => setNewMember({...newMember, name:e.target.value})}/>
              <input style={styles.input} placeholder="Phone" value={newMember.phone} onChange={e => setNewMember({...newMember, phone:e.target.value})}/>
              <button style={styles.btn} onClick={addMember}>Add Member</button>
            </div>

            <input style={{...styles.input, width: '95%', background:'#eef'}} placeholder="Filter Members..." value={adminMemberSearch} onChange={e => setAdminMemberSearch(e.target.value)} />

            {adminMembers.map(member => (
              <div key={member._id} style={styles.card}>
                <div>
                  <strong>{member.name}</strong><br/>
                  <small>ID: {member._id}</small>
                </div>
                <div style={styles.qrBlock}>
                  <QRCodeCanvas value={member._id} size={64} />
                  <br/><small>Member QR</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
