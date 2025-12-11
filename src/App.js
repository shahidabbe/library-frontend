import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react'; 

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

  // Admin Actions - ALL FIELDS RESTORED
  const [newBook, setNewBook] = useState({ 
    title: '', author: '', language: '', volume: '', section: '', category: '', shelfNumber: '', copies: 1 
  });
  const [newMember, setNewMember] = useState({ 
    name: '', fatherName: '', address: '', email: '', phone: '' 
  });
  
  // Transaction State
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

  // --- LOGIN ---
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
    if (!newBook.title) return alert("Enter Title");
    await axios.post(`${API}/books`, newBook);
    alert("Book Added!");
    setNewBook({ title: '', author: '', language: '', volume: '', section: '', category: '', shelfNumber: '', copies: 1 });
    refreshData();
  };

  const addMember = async () => {
    if (!newMember.name) return alert("Enter Name");
    await axios.post(`${API}/members`, newMember);
    alert("Member Added!");
    setNewMember({ name: '', fatherName: '', address: '', email: '', phone: '' });
    refreshData();
  };

  const issueBook = async () => {
    if (!transBookId || !transMemberId) return alert("Enter Book ID and Member ID");
    try {
      await axios.post(`${API}/transactions/issue`, { bookId: transBookId, memberId: transMemberId });
      alert("✅ Book Issued!");
      setTransBookId(''); setTransMemberId(''); refreshData();
    } catch (err) { alert("Failed: " + (err.response?.data?.error || "Error")); }
  };

  const returnBook = async () => {
    if (!transBookId || !transMemberId) return alert("Enter Book ID and Member ID");
    try {
      await axios.post(`${API}/transactions/return`, { bookId: transBookId, memberId: transMemberId });
      alert("✅ Book Returned!");
      setTransBookId(''); setTransMemberId(''); refreshData();
    } catch (err) { alert("Failed: " + (err.response?.data?.error || "Error")); }
  };

  // --- SMART FILTERS (Title OR Author) ---
  const publicBooks = books.filter(b => 
    b.title.toLowerCase().includes(publicSearch.toLowerCase()) || 
    b.author.toLowerCase().includes(publicSearch.toLowerCase())
  );

  const adminBooks = books.filter(b => b.title.toLowerCase().includes(adminBookSearch.toLowerCase()));
  const adminMembers = members.filter(m => m.name.toLowerCase().includes(adminMemberSearch.toLowerCase()));

  // --- STYLES ---
  const styles = {
    container: { maxWidth: '1100px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' },
    header: { background: '#1b5e20', color: '#ffd700', padding: '20px', textAlign: 'center', borderRadius: '8px' },
    nav: { display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' },
    btn: { padding: '10px 15px', cursor: 'pointer', background: '#2e7d32', color: 'white', border: '1px solid gold', borderRadius: '5px' },
    section: { border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginTop: '20px', background: '#f9f9f9' },
    input: { padding: '8px', margin: '5px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' },
    card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px', margin: '10px 0', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    qrBlock: { textAlign: 'center', marginLeft: '15px' },
    row: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>🏛️ IMAM ZAMAN (a.s) ISLAMIC LIBRARY</h1>
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

      {/* === PUBLIC SEARCH (TITLE OR AUTHOR) === */}
      {view === 'public' && (
        <div style={styles.section}>
          <h2 style={{color: '#1b5e20'}}>🔍 Search Library Catalog</h2>
          <p>Search by Book Title OR Author Name:</p>
          <input 
            style={{...styles.input, width: '95%', padding: '12px', fontSize: '1.1rem'}} 
            placeholder="Type Title or Author Name here..." 
            value={publicSearch} 
            onChange={e => setPublicSearch(e.target.value)} 
          />
          {publicBooks.map(book => (
            <div key={book._id} style={styles.card}>
              <div>
                <h3 style={{margin:0, color:'#2e7d32'}}>{book.title}</h3>
                <p><strong>Author:</strong> {book.author} | <strong>Lang:</strong> {book.language}</p>
                <p><strong>Loc:</strong> Shelf {book.shelfNumber} | Section {book.section}</p>
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

      {/* === LOGIN === */}
      {view === 'login' && (
        <div style={{...styles.section, textAlign: 'center', maxWidth: '400px', margin: '40px auto'}}>
          <h2>🔐 Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input style={styles.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /><br/>
            <input type="password" style={styles.input} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><br/>
            <button type="submit" style={{...styles.btn, background: 'gold', color: 'black', marginTop: '10px'}}>Login</button>
          </form>
        </div>
      )}

      {/* === ADMIN DASHBOARD === */}
      {view === 'admin' && (
        <div>
          {/* 1. TRANSACTION DESK */}
          <div style={{...styles.section, border: '2px solid gold'}}>
            <h3>⚡ Issue / Return Desk</h3>
            <p>Scan QR code with handheld scanner OR copy-paste ID manually.</p>
            <input style={{...styles.input, width:'40%'}} placeholder="Book ID" value={transBookId} onChange={e => setTransBookId(e.target.value)} />
            <input style={{...styles.input, width:'40%'}} placeholder="Member ID" value={transMemberId} onChange={e => setTransMemberId(e.target.value)} />
            <br/>
            <button style={{...styles.btn, background: 'green', marginRight: '10px'}} onClick={issueBook}>ISSUE</button>
            <button style={{...styles.btn, background: 'orange'}} onClick={returnBook}>RETURN</button>
          </div>

          {/* 2. MANAGE BOOKS (Full Details) */}
          <div style={styles.section}>
            <h3>📚 Add New Book</h3>
            <div style={styles.row}>
              <input style={styles.input} placeholder="Title" value={newBook.title} onChange={e => setNewBook({...newBook, title:e.target.value})}/>
              <input style={styles.input} placeholder="Author" value={newBook.author} onChange={e => setNewBook({...newBook, author:e.target.value})}/>
              <input style={styles.input} placeholder="Language" value={newBook.language} onChange={e => setNewBook({...newBook, language:e.target.value})}/>
              <input style={styles.input} placeholder="Volume" value={newBook.volume} onChange={e => setNewBook({...newBook, volume:e.target.value})}/>
              <input style={styles.input} placeholder="Section" value={newBook.section} onChange={e => setNewBook({...newBook, section:e.target.value})}/>
              <input style={styles.input} placeholder="Category" value={newBook.category} onChange={e => setNewBook({...newBook, category:e.target.value})}/>
              <input style={styles.input} placeholder="Shelf No." value={newBook.shelfNumber} onChange={e => setNewBook({...newBook, shelfNumber:e.target.value})}/>
              <input type="number" style={{...styles.input, width:'80px'}} placeholder="Copies" value={newBook.copies} onChange={e => setNewBook({...newBook, copies:e.target.value})}/>
            </div>
            <button style={styles.btn} onClick={addBook}>+ SAVE BOOK</button>

            <hr/>
            <input style={{...styles.input, width: '100%', background:'#eef'}} placeholder="Filter Admin Books..." value={adminBookSearch} onChange={e => setAdminBookSearch(e.target.value)} />
            
            {adminBooks.map(book => (
              <div key={book._id} style={styles.card}>
                <div>
                  <strong>{book.title}</strong> <small>({book.language})</small><br/>
                  <small>ID: {book._id}</small><br/>
                  Loc: Shelf {book.shelfNumber}
                </div>
                <div style={styles.qrBlock}>
                  <QRCodeCanvas value={book._id} size={60} />
                  <br/><small>Book QR</small>
                </div>
              </div>
            ))}
          </div>

          {/* 3. MANAGE MEMBERS (Full Details) */}
          <div style={styles.section}>
            <h3>👥 Register Member</h3>
            <div style={styles.row}>
              <input style={styles.input} placeholder="Name" value={newMember.name} onChange={e => setNewMember({...newMember, name:e.target.value})}/>
              <input style={styles.input} placeholder="S/o (Father)" value={newMember.fatherName} onChange={e => setNewMember({...newMember, fatherName:e.target.value})}/>
              <input style={styles.input} placeholder="R/o (Address)" value={newMember.address} onChange={e => setNewMember({...newMember, address:e.target.value})}/>
              <input style={styles.input} placeholder="Email" value={newMember.email} onChange={e => setNewMember({...newMember, email:e.target.value})}/>
              <input style={styles.input} placeholder="Phone" value={newMember.phone} onChange={e => setNewMember({...newMember, phone:e.target.value})}/>
            </div>
            <button style={styles.btn} onClick={addMember}>+ SAVE MEMBER</button>

            <hr/>
            <input style={{...styles.input, width: '100%', background:'#eef'}} placeholder="Filter Members..." value={adminMemberSearch} onChange={e => setAdminMemberSearch(e.target.value)} />

            {adminMembers.map(member => (
              <div key={member._id} style={styles.card}>
                <div>
                  <strong>{member.name}</strong> <small>S/o {member.fatherName}</small><br/>
                  <small>ID: {member._id}</small><br/>
                  {member.phone}
                </div>
                <div style={styles.qrBlock}>
                  <QRCodeCanvas value={member._id} size={60} />
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
