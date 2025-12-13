import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react'; 
import logo from './logo.jpg'; 

// --- BACKEND CONNECTION ---
const BASE_URL = "https://library-backend-ac53.onrender.com"; 

export default function App() {
  // --- STATE VARIABLES ---
  const [view, setView] = useState('public'); 
  const [books, setBooks] = useState([]);         
  const [members, setMembers] = useState([]);     
  
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [displayedMembers, setDisplayedMembers] = useState([]);
  const [limit, setLimit] = useState(30);       // Limit visible books
  const [memLimit, setMemLimit] = useState(20); // Limit visible members
  
  // --- NEW: TRANSACTION HISTORY STATE ---
  const [transactions, setTransactions] = useState([]); 
  const [historyView, setHistoryView] = useState(null); // Stores ID of member being viewed

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Forms
  const [newBook, setNewBook] = useState({ title: '', author: '', language: '', volume: '', section: '', category: '', shelfNumber: '', copies: 1 });
  const [newMember, setNewMember] = useState({ name: '', fatherName: '', address: '', email: '', phone: '' });
  
  // Transaction
  const [transBookId, setTransBookId] = useState('');
  const [transMemberId, setTransMemberId] = useState('');

  // Search
  const [publicQuery, setPublicQuery] = useState('');
  const [searchMode, setSearchMode] = useState('title'); 
  const [adminBookQuery, setAdminBookQuery] = useState('');
  const [adminMemberQuery, setAdminMemberQuery] = useState('');

  // --- 1. LOAD DATA ON START ---
  useEffect(() => { refreshData(); }, []);

  const refreshData = async () => {
    try {
      console.log("Loading Data...");
      
      // Parallel Fetch for speed
      const [bRes, mRes, tRes] = await Promise.all([
         axios.get(`${BASE_URL}/api/books`).catch(() => null),
         axios.get(`${BASE_URL}/api/members`).catch(() => null),
         axios.get(`${BASE_URL}/api/transactions`).catch((e) => { console.error("History Error", e); return null; })
      ]);

      // Fallback if APIs fail (legacy support)
      if (!bRes) {
         const fb = await axios.get(`${BASE_URL}/books`).catch(()=>null);
         const fm = await axios.get(`${BASE_URL}/members`).catch(()=>null);
         if(fb) setBooks(fb.data);
         if(fm) setMembers(fm.data);
         if(fb) setDisplayedBooks(fb.data);
         if(fm) setDisplayedMembers(fm.data);
      } else {
         setBooks(bRes.data);
         setMembers(mRes.data);
         setDisplayedBooks(bRes.data);   
         setDisplayedMembers(mRes.data);
      }

      // SET TRANSACTIONS
      if (tRes && tRes.data) {
          console.log("✅ Transactions Loaded:", tRes.data.length);
          setTransactions(tRes.data);
      } else {
          console.warn("⚠️ No Transactions Loaded (Check Backend)");
      }

      console.log("Data Refresh Complete!");
    } catch (err) { console.error("Error loading data", err); }
  };

  // --- HELPER: Find who has a book ---
  const getBookHolder = (bookId) => {
    const txn = transactions.find(t => t.bookId === bookId && t.status === 'Issued');
    if (!txn) return null;
    const member = members.find(m => m._id === txn.memberId);
    return member ? member.name : "Unknown Member";
  };

  // --- 2. QR CODE DOWNLOADER ---
  const downloadQR = (id, title) => {
    const canvas = document.getElementById(`qr-${id}`);
    if (canvas) {
      const qrSize = 300; 
      const padding = 20; 
      const textSpace = 50; 
      
      const labelCanvas = document.createElement("canvas");
      const ctx = labelCanvas.getContext("2d");
      
      labelCanvas.width = qrSize + (padding * 2);
      labelCanvas.height = qrSize + (padding * 2) + textSpace;
      
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
      
      ctx.drawImage(canvas, padding, padding, qrSize, qrSize);
      
      ctx.fillStyle = "#000000";
      ctx.font = "bold 24px Arial"; 
      ctx.textAlign = "center";
      
      const cleanTitle = title.length > 18 ? title.substring(0, 18) + "..." : title;
      ctx.fillText(cleanTitle, labelCanvas.width / 2, qrSize + padding + 35);
      
      const pngUrl = labelCanvas.toDataURL("image/png");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${cleanTitle}_Label.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // --- 3. ACTIONS ---

  const addBook = async () => {
    if (!newBook.title) return alert("Title Required");
    try { await axios.post(`${BASE_URL}/api/books`, newBook); } 
    catch (e) { await axios.post(`${BASE_URL}/books`, newBook); }
    alert("Book Saved!"); 
    setNewBook({ title: '', author: '', language: '', volume: '', section: '', category: '', shelfNumber: '', copies: 1 });
    refreshData();
  };

  const deleteBook = async (id) => {
    if(!window.confirm("Delete this book?")) return;
    try { await axios.delete(`${BASE_URL}/api/books/${id}`); }
    catch(e) { await axios.delete(`${BASE_URL}/books/${id}`); }
    refreshData();
  };

  const editBook = async (b) => {
    const newTitle = prompt("Edit Title:", b.title);
    const newAuthor = prompt("Edit Author:", b.author);
    if (newTitle !== null && newAuthor !== null) {
       try {
         await axios.put(`${BASE_URL}/api/books/${b._id}`, { ...b, title: newTitle, author: newAuthor });
         alert("✅ Book Updated!");
         refreshData();
       } catch(e) { alert("Error updating book"); }
    }
  };

  const addMember = async () => {
    if (!newMember.name) return alert("Name Required");
    try { await axios.post(`${BASE_URL}/api/members`, newMember); } 
    catch (e) { await axios.post(`${BASE_URL}/members`, newMember); }
    alert("Member Saved!"); 
    setNewMember({ name: '', fatherName: '', address: '', email: '', phone: '' });
    refreshData();
  };

  const deleteMember = async (id) => {
    if(!window.confirm("Delete this member?")) return;
    try { await axios.delete(`${BASE_URL}/api/members/${id}`); }
    catch(e) { await axios.delete(`${BASE_URL}/members/${id}`); }
    refreshData();
  };

  const editMember = async (m) => {
     const newName = prompt("Edit Name:", m.name);
     const newPhone = prompt("Edit Phone:", m.phone);
     if (newName !== null && newPhone !== null) {
        try {
          await axios.put(`${BASE_URL}/api/members/${m._id}`, { ...m, name: newName, phone: newPhone });
          alert("✅ Member Updated!");
          refreshData();
        } catch(e) { alert("Error updating member"); }
     }
  };

  const issueBook = async () => {
    if (!transBookId || !transMemberId) return alert("Enter IDs");
    try { await axios.post(`${BASE_URL}/api/transactions/issue`, { bookId: transBookId, memberId: transMemberId }); }
    catch(e) { await axios.post(`${BASE_URL}/transactions/issue`, { bookId: transBookId, memberId: transMemberId }); }
    alert("✅ Issued!"); refreshData();
  };

  const returnBook = async () => {
    if (!transBookId) return alert("Please Scan Book ID");
    try { 
        const res = await axios.post(`${BASE_URL}/api/transactions/return`, { bookId: transBookId }); 
        if (res.data.fine > 0) {
            alert(`✅ RETURNED!\n\n⚠️ LATE FINE: ₹${res.data.fine}`);
        } else {
            alert("✅ Returned Successfully! (No Fine)");
        }
        setTransBookId(''); 
        setTransMemberId(''); 
        refreshData();
    }
    catch(e) { alert("Error: Book not found or not currently issued."); }
  };

  // --- 4. FILTERS ---

  const handleAdminBookFilter = () => {
    if (!adminBookQuery) return setDisplayedBooks(books);
    const q = adminBookQuery.toLowerCase();
    const result = books.filter(b => Object.values(b).some(val => String(val).toLowerCase().includes(q)));
    setDisplayedBooks(result);
  };

  const handleAdminMemberFilter = () => {
    if (!adminMemberQuery) return setDisplayedMembers(members);
    setMemLimit(20);
    const q = adminMemberQuery.toLowerCase();
    const result = members.filter(m => Object.values(m).some(val => String(val).toLowerCase().includes(q)));
    setDisplayedMembers(result);
  };

  const showIssuedBooks = () => {
    const result = books.filter(b => b.copies === 0);
    setDisplayedBooks(result);
    alert(`Showing ${result.length} Issued Books`);
  };

  const showAllBooks = () => { setDisplayedBooks(books); setAdminBookQuery(''); setLimit(30); };
  const showAllMembers = () => { setDisplayedMembers(members); setAdminMemberQuery(''); setMemLimit(20); };

  const handlePublicSearch = () => {
    if (!publicQuery) return alert("Type something.");
    setLimit(30);
    const q = publicQuery.toLowerCase();
    const result = books.filter(b => searchMode === 'title' ? b.title.toLowerCase().includes(q) : b.author.toLowerCase().includes(q));
    if (result.length === 0) alert("No results.");
    setDisplayedBooks(result);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "Ibrahim" && password === "7692") {
      setIsAdmin(true); setView('admin'); showAllBooks(); showAllMembers();
    } else alert("Wrong Password");
  };

  const handleLogout = () => { setIsAdmin(false); setView('public'); showAllBooks(); };

  // --- STYLES ---
  const styles = {
    container: { maxWidth: '1200px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' },
    header: { background: '#1b5e20', color: '#ffd700', padding: '20px', textAlign: 'center', borderRadius: '8px', display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center' },
    logo: { height: '80px', borderRadius: '50%', border: '3px solid #ffd700' },
    nav: { display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' },
    btn: { padding: '10px 15px', cursor: 'pointer', background: '#2e7d32', color: 'white', border: '1px solid gold', borderRadius: '5px' },
    delBtn: { padding: '5px 10px', cursor: 'pointer', background: '#c62828', color: 'white', border: 'none', borderRadius: '3px', marginTop: '5px' },
    downBtn: { padding: '5px 10px', cursor: 'pointer', background: '#0277bd', color: 'white', border: 'none', borderRadius: '3px', marginTop: '5px' },
    filterBox: { background: '#dcedc8', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #c5e1a5' },
    input: { padding: '8px', margin: '5px', borderRadius: '4px', border: '1px solid #ccc' },
    card: { background: 'white', padding: '15px', margin: '10px 0', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <div><h1 style={{margin:0}}>IMAM ZAMAN (a.s) ISLAMIC LIBRARY</h1><p style={{margin:0, opacity:0.8}}>Knowledge is Life</p></div>
      </header>

      {/* NAV */}
      <div style={styles.nav}>
        <button style={styles.btn} onClick={() => setView('public')}>Public Search</button>
        {!isAdmin ? <button style={{...styles.btn, background:'#0d47a1'}} onClick={() => setView('login')}>Admin Login</button> : 
        <><button style={{...styles.btn, background:'#1b5e20'}} onClick={() => setView('admin')}>Dashboard</button><button style={{...styles.btn, background:'#c62828'}} onClick={handleLogout}>Logout</button></>}
      </div>

      {/* PUBLIC VIEW */}
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
          
          {displayedBooks.slice(0, limit).map(b => (
            <div key={b._id} style={styles.card}>
              <div><strong>{b.title}</strong> by {b.author}<br/><small>Shelf: {b.shelfNumber} | Vol: {b.volume} | Cat: {b.category}</small></div>
              <div style={{color: b.copies>0?'green':'red', fontWeight:'bold'}}>{b.copies>0?'AVAILABLE':'OUT OF STOCK'}</div>
            </div>
          ))}
          {displayedBooks.length > limit && (
            <button style={{...styles.btn, background:'#555', width:'100%', marginTop:'10px'}} onClick={() => setLimit(limit + 30)}>SHOW MORE BOOKS ▼</button>
          )}
          {limit > 30 && (
             <button style={{...styles.btn, background:'#888', width:'100%', marginTop:'5px'}} onClick={() => setLimit(30)}>SHOW LESS ▲</button>
          )}
        </div>
      )}

      {/* LOGIN VIEW */}
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

      {/* ADMIN DASHBOARD */}
      {view === 'admin' && (
        <div>
           {/* 1. TRANSACTION */}
           <div style={{...styles.filterBox, border:'2px solid gold'}}>
              <h3>⚡ Quick Transaction</h3>
              <input style={styles.input} placeholder="Book ID" value={transBookId} onChange={e=>setTransBookId(e.target.value)} />
              <input style={styles.input} placeholder="Member ID" value={transMemberId} onChange={e=>setTransMemberId(e.target.value)} />
              <button style={{...styles.btn, background:'green', marginLeft:'10px'}} onClick={issueBook}>ISSUE</button>
              <button style={{...styles.btn, background:'orange', marginLeft:'5px'}} onClick={returnBook}>RETURN</button>
           </div>

           {/* 2. MANAGE BOOKS */}
           <div style={styles.filterBox}>
              <h3>📚 Manage Books</h3>
              <div style={{display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'15px'}}>
                <input style={styles.input} placeholder="Title" value={newBook.title} onChange={e=>setNewBook({...newBook, title:e.target.value})}/>
                <input style={styles.input} placeholder="Author" value={newBook.author} onChange={e=>setNewBook({...newBook, author:e.target.value})}/>
                <input style={styles.input} placeholder="Lang" value={newBook.language} onChange={e=>setNewBook({...newBook, language:e.target.value})}/>
                <input style={styles.input} placeholder="Vol" value={newBook.volume} onChange={e=>setNewBook({...newBook, volume:e.target.value})}/>
                <input style={styles.input} placeholder="Shelf" value={newBook.shelfNumber} onChange={e=>setNewBook({...newBook, shelfNumber:e.target.value})}/>
                <input style={styles.input} placeholder="Section" value={newBook.section} onChange={e=>setNewBook({...newBook, section:e.target.value})}/>
                <input style={styles.input} placeholder="Cat" value={newBook.category} onChange={e=>setNewBook({...newBook, category:e.target.value})}/>
                <input type="number" style={{...styles.input, width:'60px'}} placeholder="Qty" value={newBook.copies} onChange={e=>setNewBook({...newBook, copies:e.target.value})}/>
                <button style={styles.btn} onClick={addBook}>+ ADD</button>
              </div>

              <div style={{background:'#fff', padding:'10px', borderRadius:'5px'}}>
                 <strong>Filter By: </strong>
                 <input style={{...styles.input, width:'40%'}} placeholder="Any..." value={adminBookQuery} onChange={e=>setAdminBookQuery(e.target.value)} />
                 <button style={{...styles.btn, background:'#f57f17'}} onClick={handleAdminBookFilter}>FILTER</button>
                 <button style={{...styles.btn, background:'#555', marginLeft:'5px'}} onClick={showAllBooks}>SHOW ALL</button>
                 <button style={{...styles.btn, background:'#d81b60', marginLeft:'5px'}} onClick={showIssuedBooks}>SHOW ISSUED ONLY</button>
              </div>

              {displayedBooks.slice(0, limit).map(b => (
                <div key={b._id} style={styles.card}>
                   <div>
                       <strong>{b.title}</strong> <small>({b.language})</small><br/>
                       Shelf: {b.shelfNumber} | Vol: {b.volume} | Sec: {b.section}<br/>
                       <small>ID: {b._id}</small>
                       {b.copies === 0 && (
                          <div style={{color:'red', fontWeight:'bold', marginTop:'5px'}}>
                              ⚠️ Issued To: {getBookHolder(b._id)}
                          </div>
                       )}
                   </div>
                   <div style={{textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center'}}>
                       <QRCodeCanvas id={`qr-${b._id}`} value={b._id} size={300} level={"H"} includeMargin={true} style={{width: '60px', height: '60px'}} />
                       <button style={styles.downBtn} onClick={() => downloadQR(b._id, b.title)}>Label</button>
                       <button style={{...styles.btn, background:'#fbc02d', color:'black', padding:'5px 10px', marginTop:'5px'}} onClick={() => editBook(b)}>Edit</button>
                       <button style={styles.delBtn} onClick={() => deleteBook(b._id)}>Delete</button>
                   </div>
                </div>
              ))}
              {displayedBooks.length > limit && (
                <button style={{...styles.btn, background:'#555', width:'100%', marginTop:'10px'}} onClick={() => setLimit(limit + 30)}>SHOW MORE BOOKS ▼</button>
              )}
              {limit > 30 && (
                <button style={{...styles.btn, background:'#888', width:'100%', marginTop:'5px'}} onClick={() => setLimit(30)}>SHOW LESS ▲</button>
              )}
           </div>

           {/* 3. MANAGE MEMBERS */}
           <div style={styles.filterBox}>
              <h3>👥 Manage Members</h3>
              <div style={{display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'15px'}}>
                 <input style={styles.input} placeholder="Name" value={newMember.name} onChange={e=>setNewMember({...newMember, name:e.target.value})}/>
                 <input style={styles.input} placeholder="Father Name" value={newMember.fatherName} onChange={e=>setNewMember({...newMember, fatherName:e.target.value})}/>
                 <input style={styles.input} placeholder="R/o (Address)" value={newMember.address} onChange={e=>setNewMember({...newMember, address:e.target.value})}/>
                 <input style={styles.input} placeholder="Phone" value={newMember.phone} onChange={e=>setNewMember({...newMember, phone:e.target.value})}/>
                 <button style={styles.btn} onClick={addMember}>+ ADD</button>
              </div>

              <div style={{background:'#fff', padding:'10px', borderRadius:'5px'}}>
                 <strong>Filter By: </strong>
                 <input style={{...styles.input, width:'40%'}} placeholder="Name, Phone, Father Name..." value={adminMemberQuery} onChange={e=>setAdminMemberQuery(e.target.value)} />
                 <button style={{...styles.btn, background:'#f57f17'}} onClick={handleAdminMemberFilter}>FILTER</button>
                 <button style={{...styles.btn, background:'#555', marginLeft:'5px'}} onClick={showAllMembers}>SHOW ALL</button>
              </div>

              {displayedMembers.slice(0, memLimit).map(m => (
                <div key={m._id} style={styles.card}>
                   <div>
                       <strong>{m.name}</strong><br/>
                       S/o {m.fatherName}<br/>
                       R/o: {m.address}<br/>
                       Phone: {m.phone}<br/>
                       <small>ID: {m._id}</small>
                   </div>
                   <div style={{textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center'}}>
                       <QRCodeCanvas id={`qr-${m._id}`} value={m._id} size={300} level={"H"} includeMargin={true} style={{width: '60px', height: '60px'}} />
                       <button style={styles.downBtn} onClick={() => downloadQR(m._id, m.name)}>Label</button>
                       <button style={{...styles.btn, background:'#0288d1', padding:'5px 10px', marginTop:'5px'}} onClick={() => setHistoryView(m._id)}>History</button>
                       <button style={{...styles.btn, background:'#fbc02d', color:'black', padding:'5px 10px', marginTop:'5px'}} onClick={() => editMember(m)}>Edit</button>
                       <button style={styles.delBtn} onClick={() => deleteMember(m._id)}>Delete</button>
                   </div>
                </div>
              ))}
              {displayedMembers.length > memLimit && (
                 <button style={{...styles.btn, background:'#555', width:'100%', marginTop:'10px'}} onClick={() => setMemLimit(memLimit + 20)}>SHOW MORE MEMBERS ▼</button>
              )}
              {memLimit > 20 && (
                 <button style={{...styles.btn, background:'#888', width:'100%', marginTop:'5px'}} onClick={() => setMemLimit(20)}>SHOW LESS ▲</button>
              )}
           </div>

           {/* 4. HISTORY POPUP */}
           {historyView && (
             <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
                <div style={{background:'white', padding:'20px', borderRadius:'10px', width:'80%', maxHeight:'80%', overflowY:'auto'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                        <h2>📜 History: {members.find(m=>m._id===historyView)?.name}</h2>
                        <button style={{background:'red', color:'white', border:'none', padding:'10px', cursor:'pointer'}} onClick={()=>setHistoryView(null)}>CLOSE ✖</button>
                    </div>
                    
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead>
                            <tr style={{background:'#eee', textAlign:'left'}}>
                                <th style={{padding:'10px'}}>Book</th>
                                <th style={{padding:'10px'}}>Issued On</th>
                                <th style={{padding:'10px'}}>Returned On</th>
                                <th style={{padding:'10px'}}>Status</th>
                                <th style={{padding:'10px'}}>Fine</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.filter(t => t.memberId === historyView).map(t => (
                                <tr key={t._id} style={{borderBottom:'1px solid #ddd'}}>
                                    <td style={{padding:'10px'}}>{t.bookTitle}</td>
                                    <td style={{padding:'10px'}}>{new Date(t.issueDate).toLocaleDateString()}</td>
                                    <td style={{padding:'10px'}}>{t.returnDate ? new Date(t.returnDate).toLocaleDateString() : '-'}</td>
                                    <td style={{padding:'10px', color: t.status==='Issued'?'red':'green', fontWeight:'bold'}}>{t.status}</td>
                                    <td style={{padding:'10px'}}>₹{t.fine || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {transactions.filter(t => t.memberId === historyView).length === 0 && <p style={{textAlign:'center', padding:'20px'}}>No history found.</p>}
                </div>
             </div>
           )}

        </div>
      )}
    </div>
  );
}
