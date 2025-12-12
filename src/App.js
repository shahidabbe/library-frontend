import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react'; 
import logo from './logo.jpg'; 

const BASE_URL = "https://library-backend-ac53.onrender.com"; 

export default function App() {
  const [view, setView] = useState('public'); 
  const [books, setBooks] = useState([]);         
  const [members, setMembers] = useState([]);     
  
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [displayedMembers, setDisplayedMembers] = useState([]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // ADDED 'section' BACK HERE
  const [newBook, setNewBook] = useState({ title: '', author: '', language: '', volume: '', section: '', category: '', shelfNumber: '', copies: 1 });
  const [newMember, setNewMember] = useState({ name: '', fatherName: '', address: '', email: '', phone: '' });
  
  const [transBookId, setTransBookId] = useState('');
  const [transMemberId, setTransMemberId] = useState('');
  const [publicQuery, setPublicQuery] = useState('');
  const [searchMode, setSearchMode] = useState('title'); 
  const [adminBookQuery, setAdminBookQuery] = useState('');
  const [adminMemberQuery, setAdminMemberQuery] = useState('');

  useEffect(() => { refreshData(); }, []);

  const refreshData = async () => {
    try {
      console.log("Loading Data...");
      let bRes = await axios.get(`${BASE_URL}/api/books`).catch(() => null);
      let mRes = await axios.get(`${BASE_URL}/api/members`).catch(() => null);

      if (!bRes) {
         bRes = await axios.get(`${BASE_URL}/books`);
         mRes = await axios.get(`${BASE_URL}/members`);
      }

      setBooks(bRes.data);
      setMembers(mRes.data);
      setDisplayedBooks(bRes.data);   
      setDisplayedMembers(mRes.data); 
      console.log("Data Loaded!");

    } catch (err) { 
        console.error("LOAD ERROR:", err); 
        alert("Could not load data. Check console.");
    }
  };

  const handleAdminBookFilter = () => {
    if (!adminBookQuery) return setDisplayedBooks(books);
    const q = adminBookQuery.toLowerCase();
    const result = books.filter(b => Object.values(b).some(val => String(val).toLowerCase().includes(q)));
    setDisplayedBooks(result);
  };

  const handleAdminMemberFilter = () => {
    if (!adminMemberQuery) return setDisplayedMembers(members);
    const q = adminMemberQuery.toLowerCase();
    const result = members.filter(m => Object.values(m).some(val => String(val).toLowerCase().includes(q)));
    setDisplayedMembers(result);
  };

  const showIssuedBooks = () => {
    const result = books.filter(b => b.copies === 0);
    setDisplayedBooks(result);
    alert(`Showing ${result.length} Issued Books`);
  };

  const showAllBooks = () => { setDisplayedBooks(books); setAdminBookQuery(''); };
  const showAllMembers = () => { setDisplayedMembers(members); setAdminMemberQuery(''); };

  const handlePublicSearch = () => {
    if (!publicQuery) return alert("Type something.");
    const q = publicQuery.toLowerCase();
    const result = books.filter(b => searchMode === 'title' ? b.title.toLowerCase().includes(q) : b.author.toLowerCase().includes(q));
    if (result.length === 0) alert("No results.");
    setDisplayedBooks(result);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "1234") {
      setIsAdmin(true); setView('admin'); showAllBooks(); showAllMembers();
    } else alert("Wrong Password");
  };

  const handleLogout = () => { setIsAdmin(false); setView('public'); showAllBooks(); };

  const addBook = async () => {
    if (!newBook.title) return alert("Title Required");
    try {
        await axios.post(`${BASE_URL}/api/books`, newBook);
    } catch (e) {
        await axios.post(`${BASE_URL}/books`, newBook);
    }
    alert("Book Saved!"); 
    setNewBook({ title: '', author: '', language: '', volume: '', section: '', category: '', shelfNumber: '', copies: 1 });
    refreshData();
  };

  const addMember = async () => {
    if (!newMember.name) return alert("Name Required");
    try {
        await axios.post(`${BASE_URL}/api/members`, newMember);
    } catch (e) {
        await axios.post(`${BASE_URL}/members`, newMember);
    }
    alert("Member Saved!"); 
    setNewMember({ name: '', fatherName: '', address: '', email: '', phone: '' });
    refreshData();
  };

  const issueBook = async () => {
    if (!transBookId || !transMemberId) return alert("Enter IDs");
    try { await axios.post(`${BASE_URL}/api/transactions/issue`, { bookId: transBookId, memberId: transMemberId }); }
    catch(e) { await axios.post(`${BASE_URL}/transactions/issue`, { bookId: transBookId, memberId: transMemberId }); }
    alert("✅ Issued!"); refreshData();
  };

  const returnBook = async () => {
    if (!transBookId || !transMemberId) return alert("Enter IDs");
    try { await axios.post(`${BASE_URL}/api/transactions/return`, { bookId: transBookId, memberId: transMemberId }); }
    catch(e) { await axios.post(`${BASE_URL}/transactions/return`, { bookId: transBookId, memberId: transMemberId }); }
    alert("✅ Returned!"); refreshData();
  };

  const styles = {
    container: { maxWidth: '1200px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' },
    header: { background: '#1b5e20', color: '#ffd700', padding: '20px', textAlign: 'center', borderRadius: '8px', display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center' },
    logo: { height: '80px', borderRadius: '50%', border: '3px solid #ffd700' },
    nav: { display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' },
    btn: { padding: '10px 15px', cursor: 'pointer', background: '#2e7d32', color: 'white', border: '1px solid gold', borderRadius: '5px' },
    filterBox: { background: '#dcedc8', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #c5e1a5' },
    input: { padding: '8px', margin: '5px', borderRadius: '4px', border: '1px solid #ccc' },
    card: { background: 'white', padding: '15px', margin: '10px 0', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <div><h1 style={{margin:0}}>IMAM ZAMAN (a.s) ISLAMIC LIBRARY</h1><p style={{margin:0, opacity:0.8}}>Knowledge is Life</p></div>
      </header>

      <div style={styles.nav}>
        <button style={styles.btn} onClick={() => setView('public')}>Public Search</button>
        {!isAdmin ? <button style={{...styles.btn, background:'#0d47a1'}} onClick={() => setView('login')}>Admin Login</button> : 
        <><button style={{...styles.btn, background:'#1b5e20'}} onClick={() => setView('admin')}>Dashboard</button><button style={{...styles.btn, background:'#c62828'}} onClick={handleLogout}>Logout</button></>}
      </div>

      {view === 'public' && (
        <div style={{...styles.filterBox, background: '#fff', border:'1px solid #ddd'}}>
          <h2 style={{color:'#1b5e20'}}>🔍 Search Catalog</h2>
          <div style={{marginBottom:'10px'}}>
             <label style={{marginRight:'15px'}}><input type="radio" checked={searchMode==='title'} onChange={()=>setSearchMode('title')}/> Title</label>
             <label><input type="radio" checked={searchMode==='author'} onChange={()=>setSearchMode('author')}/> Author</label>
          </div>
          <input style={{...styles.input, width:'50%'}} placeholder="Type here..." value={publicQuery} onChange={e=>setPublicQuery(e.target.value)} />
          <button style={{...styles.btn, background:'#f57f17'}} onClick={handlePublicSearch}>SEARCH</button>
          <button style={{...styles.btn, background:'#555', marginLeft:'5px'}} onClick={showAllBooks}>RESET</button>
          
          {displayedBooks.map(b => (
            <div key={b._id} style={styles.card}>
              <div><strong>{b.title}</strong> by {b.author}<br/><small>Shelf: {b.shelfNumber} | Cat: {b.category}</small></div>
              <div style={{color: b.copies>0?'green':'red', fontWeight:'bold'}}>{b.copies>0?'AVAILABLE':'OUT OF STOCK'}</div>
            </div>
          ))}
        </div>
      )}

      {view === 'login' && (
        <div style={{textAlign:'center', marginTop:'50px'}}>
           <h2>🔐 Login</h2>
           <form onSubmit={handleLogin}>
             <input style={styles.input} placeholder="User" value={username} onChange={e=>setUsername(e.target.value)} /><br/>
             <input type="password" style={styles.input} placeholder="Pass" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
             <button type="submit" style={{...styles.btn, background:'gold', color:'black', marginTop:'10px'}}>ENTER</button>
           </form>
        </div>
      )}

      {view === 'admin' && (
        <div>
           <div style={{...styles.filterBox, border:'2px solid gold'}}>
              <h3>⚡ Quick Transaction</h3>
              <input style={styles.input} placeholder="Book ID" value={transBookId} onChange={e=>setTransBookId(e.target.value)} />
              <input style={styles.input} placeholder="Member ID" value={transMemberId} onChange={e=>setTransMemberId(e.target.value)} />
              <button style={{...styles.btn, background:'green', marginLeft:'10px'}} onClick={issueBook}>ISSUE</button>
              <button style={{...styles.btn, background:'orange', marginLeft:'5px'}} onClick={returnBook}>RETURN</button>
           </div>

           <div style={styles.filterBox}>
              <h3>📚 Manage Books</h3>
              <div style={{display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'15px'}}>
                <input style={styles.input} placeholder="Title" value={newBook.title} onChange={e=>setNewBook({...newBook, title:e.target.value})}/>
                <input style={styles.input} placeholder="Author" value={newBook.author} onChange={e=>setNewBook({...newBook, author:e.target.value})}/>
                <input style={styles.input} placeholder="Lang" value={newBook.language} onChange={e=>setNewBook({...newBook, language:e.target.value})}/>
                <input style={styles.input} placeholder="Shelf" value={newBook.shelfNumber} onChange={e=>setNewBook({...newBook, shelfNumber:e.target.value})}/>
                {/* ADDED SECTION INPUT HERE */}
                <input style={styles.input} placeholder="Section" value={newBook.section} onChange={e=>setNewBook({...newBook, section:e.target.value})}/>
                <input style={styles.input} placeholder="Cat" value={newBook.category} onChange={e=>setNewBook({...newBook, category:e.target.value})}/>
                <input type="number" style={{...styles.input, width:'60px'}} placeholder="Qty" value={newBook.copies} onChange={e=>setNewBook({...newBook, copies:e.target.value})}/>
                <button style={styles.btn} onClick={addBook}>+ ADD</button>
              </div>

              <div style={{background:'#fff', padding:'10px', borderRadius:'5px'}}>
                 <strong>Filter By: </strong>
                 <input style={{...styles.input, width:'40%'}} placeholder="Any (Shelf, Author, Title...)" value={adminBookQuery} onChange={e=>setAdminBookQuery(e.target.value)} />
                 <button style={{...styles.btn, background:'#f57f17'}} onClick={handleAdminBookFilter}>FILTER</button>
                 <button style={{...styles.btn, background:'#555', marginLeft:'5px'}} onClick={showAllBooks}>SHOW ALL</button>
                 <button style={{...styles.btn, background:'#d81b60', marginLeft:'5px'}} onClick={showIssuedBooks}>SHOW ISSUED ONLY</button>
              </div>

              {displayedBooks.map(b => (
                <div key={b._id} style={styles.card}>
                   <div><strong>{b.title}</strong><br/>Shelf: {b.shelfNumber} | Section: {b.section}<br/><small>ID: {b._id}</small></div>
                   {/* QR CODE IS HERE */}
                   <div style={{textAlign:'center'}}><QRCodeCanvas value={b._id} size={50}/><br/><small>Scan</small></div>
                </div>
              ))}
           </div>

           <div style={styles.filterBox}>
              <h3>👥 Manage Members</h3>
              <div style={{display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'15px'}}>
                <input style={styles.input} placeholder="Name" value={newMember.name} onChange={e=>setNewMember({...newMember, name:e.target.value})}/>
                <input style={styles.input} placeholder="Father Name" value={newMember.fatherName} onChange={e=>setNewMember({...newMember, fatherName:e.target.value})}/>
                <input style={styles.input} placeholder="Phone" value={newMember.phone} onChange={e=>setNewMember({...newMember, phone:e.target.value})}/>
                <button style={styles.btn} onClick={addMember}>+ ADD</button>
              </div>

              <div style={{background:'#fff', padding:'10px', borderRadius:'5px'}}>
                 <strong>Filter By: </strong>
                 <input style={{...styles.input, width:'40%'}} placeholder="Name, Phone, Father Name..." value={adminMemberQuery} onChange={e=>setAdminMemberQuery(e.target.value)} />
                 <button style={{...styles.btn, background:'#f57f17'}} onClick={handleAdminMemberFilter}>FILTER</button>
                 <button style={{...styles.btn, background:'#555', marginLeft:'5px'}} onClick={showAllMembers}>SHOW ALL</button>
              </div>

              {displayedMembers.map(m => (
                <div key={m._id} style={styles.card}>
                   <div><strong>{m.name}</strong><br/>S/o {m.fatherName} | {m.phone}<br/><small>ID: {m._id}</small></div>
                   <div style={{textAlign:'center'}}><QRCodeCanvas value={m._id} size={50}/><br/><small>Scan</small></div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
