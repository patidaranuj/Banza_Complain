import React, { useState } from "react";
import "./CustomerPage.css";
import banzabackground from '../assets/banzabackground.png';
import banzaLogo from '../assets/banzaLogo.png';


function CustomerPage() {
  const [view, setView] = useState("raise"); // raise | track
  const [searchId, setSearchId] = useState("");
  const [foundTicket, setFoundTicket] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  // Hardcoded tickets
  const tickets = [
    {
      id: "A101",
      creator: "John Doe",
      batch: "B123",
      status: "Open",
      resolution: "Pending",
      product: "Pizza",
    },
    {
      id: "C202",
      creator: "Sara Lee",
      batch: "B321",
      status: "Closed",
      resolution: "Replacement sent",
      product: "Penne",
    },
  ];

  const handleSearch = () => {
    const ticket = tickets.find((t) => t.id === searchId);
    setFoundTicket(ticket || null);
  };

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    
    <div className="customer-container">
      {/* Header */}
      <header className="customer-header">
        <div className="logo">
          <img src={banzaLogo} alt="Banza Logo" style={{ height: 32 }} />
        </div>
        <nav>
          <button onClick={() => setView("raise")}>Raise Complaint</button>
          <button onClick={() => setView("track")}>Track Complaint</button>
        </nav>
      </header>

      {/* Main content */}

      <div
      className="customer-main"
      style={{
        backgroundImage: `url(${banzabackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <main className="customer-main">
        {view === "raise" && (
          <div className="form-container">
            <h2>Raise a Complaint</h2>
            <form>
              <div className="form-row">
                <div className="form-group">
                  <label>Product</label>
                  <select>
                    <option>Chickpea Pasta Rotini</option>
                    <option>Chickpea Mac and Cheese</option>
                    <option>Pizza Crust</option>
                    <option>Penne</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Lot Code</label>
                  <input type="text" placeholder="Enter your lot code" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiration</label>
                  <input type="date" placeholder="Expiraiton Date"></input>
                </div>
                <div className="form-group">
                  <label>Purchase Location</label>
                  <select>
                    <option>Target</option>
                    <option>Amazon</option>
                    <option>Whole Food</option>
                    <option>Kroger</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="Enter your email" />
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select>
                    <option>Level 1 - Low</option>
                    <option>Level 2 - Medium</option>
                    <option>Level 3 - High</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
              
              <div className="form-group" style={{ flexDirection: "column" }}>
                <label>Tags</label>
                <div className="tags-container">
                  {["Quality", "Taste", "Packaging", "Delivery", "Foreign Object", "Allergy", "Other"].map(tag => (
                    <button
                      type="button"
                      className={`tag-btn${selectedTags.includes(tag) ? " selected" : ""}`}
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="suggested-tag">
                  Suggested: <a href="#">Other</a>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flexDirection: "column" }}>
                <label>Photo (optional)</label>
                <div className="photo-upload-container">
                  <input type="file" accept="image/*" id="photo-upload" style={{ display: "none" }} />
                  <label htmlFor="photo-upload" className="upload-photo-btn">Upload Photo</label>
                  <button type="button" className="analyze-photo-btn">Analyze Photo (demo)</button>
                </div>
              </div>
            </div>
              <div className="form-row">
                
                <div className="form-group">
                  <label>Complaint</label>
                  <textarea placeholder="Describe your issue"></textarea>
                </div>
              </div>
              <button type="submit">Submit</button>
            </form>
          </div>
        )}

        {view === "track" && (
          <div className="form-container">
            <h2>Track Complaint</h2>
            <div className="track-box">
              <input
                type="text"
                placeholder="Enter Ticket ID (e.g., A101)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button onClick={handleSearch}>Search</button>
            </div>

            {foundTicket ? (
              <div className="ticket-details">
              <h3>Complaint Ticket #{foundTicket.id}</h3>
              <div className="ticket-meta">
                <p><strong>Creator:</strong> {foundTicket.creator}</p>
                <p><strong>Batch Code:</strong> {foundTicket.batch}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="ticket-status">{foundTicket.status}</span>
                </p>
              </div>
              <p><strong>Product:</strong> {foundTicket.product}</p>
              <p><strong>Resolution:</strong> {foundTicket.resolution}</p>
            </div>
            ) : searchId ? (
              <p className="no-result">No ticket found for ID {searchId}</p>
            ) : null}
          </div>
        )}
      </main>
      </div>

      {/* Footer */}
      <footer className="customer-footer"></footer>
    </div>
  );
}

export default CustomerPage;
