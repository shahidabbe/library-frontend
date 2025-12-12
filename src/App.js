import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- YOUR RENDER BACKEND URL ---
const API = "https://library-backend-ac53.onrender.com"; 
export default function App() {
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState("Ready"); // Debug Status
  const [error, setError] = useState("");        // Error Message

  const [newBook, setNewBook] = useState({ 
    title: '', author: '', shelfNumber: '', copies: 1 
  });

  // 1. Load Data on Start
  useEffect(() => {
    refreshData();
  }, []);

  // 2. Refresh Function (With detailed logs)
  const refreshData = async () => {
    setStatus("Loading Data...");
    try {
      const res = await axios.get(`${API}/books`);
      console.log("Data Received:", res.data); // Open Console (F12) to see this
      setBooks(res.data);
      setStatus(`Loaded ${res.data.length} books.`);
    } catch (err) {
      setError("Load Failed: " + err.message);
      setStatus("Error Loading");
    }
  };

  // 3. Add Book Function (Simplified for testing)
  const addBook = async () => {
    setStatus("Saving Book...");
    setError(""); // Clear previous errors
    
    // Check inputs
    if (!newBook.title) { setError("Title is missing!"); return; }

    try {
      // POST request
      const res = await axios.post(`${API}/books`, newBook);
      setStatus("Book Saved! Server said: " + res.status);
      
      // CLEAR FORM
      setNewBook({ title: '', author: '', shelfNumber: '', copies: 1 });
      
      // FORCE REFRESH
      await refreshData();
      
    } catch (err) {
      console.error(err);
      setError("Save Failed: " + (err.response?.data?.error || err.message));
      setStatus("Error Saving");
    }
  };

  return (
    <div style={{padding: '20px', fontFamily: 'Arial'}}>
      <h1>🛠️ SYSTEM DIAGNOSTIC MODE</h1>
      
      {/* STATUS BOARD */}
      <div style={{border: '2px solid blue', padding: '10px', background: '#e3f2fd', marginBottom: '20px'}}>
        <h3>📢 STATUS BOARD</h3>
        <p><strong>System Status:</strong> {status}</p>
        <p style={{color: 'red'}}><strong>Last Error:</strong> {error || "None"}</p>
        <p><strong>Total Books in Memory:</strong> {books.length}</p>
      </div>

      {/* ADD BOOK TEST */}
      <div style={{border: '2px solid green', padding: '10px', background: '#e8f5e9'}}>
        <h3>➕ Add Test Book</h3>
        <input placeholder="Title" value={newBook.title} onChange={e=>setNewBook({...newBook, title:e.target.value})} style={{padding: '5px', marginRight: '5px'}}/>
        <input placeholder="Author" value={newBook.author} onChange={e=>setNewBook({...newBook, author:e.target.value})} style={{padding: '5px', marginRight: '5px'}}/>
        <button onClick={addBook} style={{padding: '5px 20px', background: 'green', color: 'white'}}>SAVE TO DATABASE</button>
      </div>

      {/* RAW DATA LIST */}
      <h3>📚 Database Content (Raw List)</h3>
      <button onClick={refreshData}>🔄 Force Refresh</button>
      <ul>
        {books.map((b, index) => (
          <li key={index} style={{borderBottom: '1px solid #ccc', padding: '5px'}}>
            <strong>{index + 1}. {b.title}</strong> (ID: {b._id})
          </li>
        ))}
      </ul>
    </div>
  );
}
