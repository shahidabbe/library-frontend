import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react'; 
import logo from './logo.jpg'; 

// --- YOUR RENDER BACKEND URL ---
const API = "https://library-backend-ac53.onrender.com/api"; 

export default function App() {
  // --- STATES ---
  const [view, setView] = useState('public'); 
  const [books, setBooks] = useState([]);         // Full List from DB
  const [members, setMembers] = useState([]);     // Full List from DB
  
  // Display Lists (Controlled by Search Button)
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [displayedMembers, setDisplayedMembers] = useState([]);

  // Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Forms
  const [newBook, setNewBook] = useState({ 
    title: '', author: '', language: '', volume: '', section: '', category: '', shelfNumber: '', copies: 1 
  });
  const [newMember, setNewMember] = useState({ 
    name: '', fatherName: '', address: '', email: '', phone: '' 
  });
  
  // Transaction
  const [transBookId, setTransBookId] = useState('');
  const [transMemberId, setTransMemberId] = useState('');

  // Search Inputs
  const [publicQuery, setPublicQuery] = useState('');
  const [adminBookQuery, setAdminBookQuery] = useState('');
  const [adminMemberQuery, setAdminMemberQuery] = useState('');

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
      // Initially show all
      setDisplayedBooks(bRes.data);
      setDisplayedMembers(mRes.data);
    } catch (err) { console.error("Error loading data", err); }
  };

  // --- SEARCH LOGIC (ANY ATTRIBUTE) ---
  const handleSearch = (type) => {
    if (type === 'public') {
      if(!publicQuery) return setDisplayedBooks(books);
      const result = books.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(publicQuery.toLowerCase())));
      setDisplayedBooks(result);
    }
    if (type === 'adminBook') {
      if(!adminBookQuery) return setDisplayedBooks(books);
      const result = books.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(adminBookQuery.toLowerCase())));
      setDisplayedBooks(result);
    }
    if (type === 'adminMember') {
      if(!adminMemberQuery) return setDisplayedMembers(members);
      const result = members.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(adminMemberQuery.toLowerCase())));
      setDisplayedMembers(result);
    }
  };

  // --- LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "1234") {
      setIsAdmin(true);
      setView('admin');
      // Reset Admin filters when logging in
      setDisplayedBooks(books);
      setDisplayedMembers(members);
    } else {
      alert("Wrong ID or Password!");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false); setView('public'); setUsername(''); setPassword('');
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

  // --- STYLES ---
  const styles = {
    container: { maxWidth: '1200px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' },
    header: { 
        background: '#1b5e20', color: '#ffd700', padding: '20px', 
        textAlign: 'center', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px'
    },
    logo: { height: '80px', borderRadius: '50%', border: '3px solid #ffd700' },
    nav: { display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' },
    btn: { padding: '10px 15px', cursor: 'pointer', background: '#2e7d32', color: 'white', border: '1px solid gold', borderRadius: '5px' },
    searchBtn: { padding: '10px 20px', cursor: 'pointer', background: '#f57f17', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' },
    section: { border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginTop: '20px', background: '#f9f9f9' },
    input: { padding: '10px', margin: '5px', borderRadius: '4px', border: '1px solid #ccc', width: '220px' },
    idBox: { background: '#e0e0e0', border: '1px solid #999', padding: '5px', fontFamily: 'monospace', fontWeight: 'bold', width: '200px' },
    card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px', margin: '10px 0', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    qrBlock: { textAlign: 'center', marginLeft: '15px' },
    row: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <div>
           <h1 style={{margin: 0}}>IMAM ZAMAN (a.s) ISLAMIC LIBRARY</h1>
           <p style={{margin: 0, fontStyle: 'italic', opacity: 0.9}}>Knowledge is the Life of the Soul</p>
        </div>
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

      {/* === PUBLIC SEARCH (TITLE, AUTHOR, SHELF, ETC) === */}
      {view === 'public' && (
        <div style={styles.section}>
          <h2 style={{color: '#1b5e20'}}>🔍 Search Library Catalog</h2>
          <div style={{marginBottom: '20px'}}>
            <input 
                style={{...styles.input, width: '60%'}} 
                placeholder="Type Title, Author, Shelf, Category..." 
                value={publicQuery} 
                onChange={e => setPublicQuery(e.target.value)} 
            />
            <button style={styles.searchBtn} onClick={() => handleSearch('public')}>SEARCH</button>
            <button style={{...styles.btn, background: '#555', marginLeft:'5px'}} onClick={refreshData}>Reset</button>
          </div>

          {displayedBooks.map(book => (
            <div key={book._id} style={styles.card}>
              <div>
                <h3 style={{margin:0, color:'#2e7d32'}}>{book.title}</h3>
                <p><strong>Author:</strong> {book.author} | <strong>Lang:</strong> {book.language} | <strong>Vol:</strong> {book.volume}</p>
                <p><strong>Loc:</strong> Shelf {book.shelfNumber} | Section {book.section} | Cat: {book.category}</p>
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
            <p>Scan QR code or Copy-Paste ID from below.</p>
            <input style={{...styles.input, width:'40%'}} placeholder="Paste Book ID Here" value={transBookId} onChange={e => setTransBookId(e.target.value)} />
            <input style={{...styles.input, width:'40%'}} placeholder="Paste Member ID Here" value={transMemberId} onChange={e => setTransMemberId(e.target.value)} />
            <br/>
            <button style={{...styles.btn, background: 'green', marginRight: '10px'}} onClick={issueBook}>ISSUE BOOK</button>
            <button style={{...styles.btn, background: 'orange'}} onClick={returnBook}>RETURN BOOK</button>
          </div>

          {/* 2. MANAGE BOOKS */}
          <div style={styles.section}>
            <h3>📚 Manage Books</h3>
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
            <div style={{background: '#dcedc8', padding: '10px', borderRadius: '5px'}}>
                <input 
                    style={{...styles.input, width: '50%'}} 
                    placeholder="Search by Title, ID, Shelf..." 
                    value={adminBookQuery} 
                    onChange={e => setAdminBookQuery(e.target.value)} 
                />
                <button style={styles.searchBtn} onClick={() => handleSearch('adminBook')}>FILTER BOOKS</button>
            </div>
            
            {displayedBooks.map(book => (
              <div key={book._id} style={styles.card}>
                <div>
                  <strong>{book.title}</strong> <small>({book.language})</small><br/>
                  Loc: Shelf {book.shelfNumber}<br/>
                  <div style={{marginTop: '5px'}}>
                    <small>ID (Copy this):</small><br/>
                    <input style={styles.idBox} value={book._id} readOnly />
                  </div>
                </div>
                <div style={styles.qrBlock}>
                  <QRCodeCanvas value={book._id} size={60} />
                </div>
              </div>
            ))}
          </div>

          {/* 3. MANAGE MEMBERS */}
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
            <div style={{background: '#dcedc8', padding: '10px', borderRadius: '5px'}}>
                <input 
                    style={{...styles.input, width: '50%'}} 
                    placeholder="Search by Name, Phone, Father Name..." 
                    value={adminMemberQuery} 
                    onChange={e => setAdminMemberQuery(e.target.value)} 
                />
                <button style={styles.searchBtn} onClick={() => handleSearch('adminMember')}>FILTER MEMBERS</button>
            </div>

            {displayedMembers.map(member => (
              <div key={member._id} style={styles.card}>
                <div>
                  <strong>{member.name}</strong> <small>S/o {member.fatherName}</small><br/>
                  {member.phone}<br/>
                  <div style={{marginTop: '5px'}}>
                    <small>ID (Copy this):</small><br/>
                    <input style={styles.idBox} value={member._id} readOnly />
                  </div>
                </div>
                <div style={styles.qrBlock}>
                  <QRCodeCanvas value={member._id} size={60} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
