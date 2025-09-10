import React, { useState } from "react";
import "./SupportPage.css";

function SupportPage() {
  const [view, setView] = useState("dashboard"); // dashboard | active | closed | details
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Dummy tickets (you can replace with API data)
  const activeTickets = [
    {
      id: "BBTR1920876AQ",
      name: "Alex",
      product: "Four Cheese Pizza",
      batch: "BXC2024",
      date: "20/05/2024",
      status: "Active",
      resolution: "Pending",
      issue: "Quality",
      location: "Riverside, California",
      expiry: "23/07/2022",
      images: [
        "https://via.placeholder.com/100",
        "https://via.placeholder.com/100",
        "https://via.placeholder.com/100",
      ],
      brief:
        "Purchased on 07/20/2022 at a local supermarket and stored at room temperature per label. Opened on 07/22/2022 and noticed off-smell and unusual texture. A second slice from the same box showed the same issue. No one consumed it.",
    },
  ];

  const closedTickets = [
    {
      id: "BBTR1920876AQ",
      name: "John",
      product: "Flour Cheese Pizza",
      batch: "BXC2024",
      date: "10-2-2025",
      status: "Closed",
      resolution: "Applicable for Refund",
    },
    {
      id: "BBTR1920877AQ",
      name: "Paul",
      product: "Pasta",
      batch: "BXC2024",
      date: "22-6-2025",
      status: "Closed",
      resolution: "Return",
    },
    {
      id: "BBTR1920878AQ",
      name: "Clara",
      product: "Rotini",
      batch: "BXC2024",
      date: "22-6-2025",
      status: "Closed",
      resolution: "Return",
    },
  ];

  const showTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setView("details");
  };

  return (
    <div className="support-container">
      {/* Sidebar */}
      <aside className="support-sidebar">
        <h2>Banza</h2>
        <nav>
          <button onClick={() => setView("dashboard")}>Report</button>
          <button onClick={() => setView("active")}>Active Tickets</button>
          <button onClick={() => setView("closed")}>Closed Tickets</button>
        </nav>
      </aside>

      

      {/* Main content */}
      <main className="support-main">
        {/* Dashboard / Report */}
        {view === "dashboard" && (
          <div className="dashboard">
            <h2>Report</h2>
            <div className="cards">
              <div className="card">
                <h3>129</h3>
                <p>Number of Complaints</p>
                <span className="status closed">Closed</span>
              </div>
              <div className="card">
                <h3>23</h3>
                <p>Number of Complaints</p>
                <span className="status active">Active</span>
              </div>
              <div className="card">
                <h3>8</h3>
                <p>Number of Complaints</p>
                <span className="status delayed">Delayed</span>
              </div>
            </div>

            <div className="charts">
              <div className="chart">
                <h4>Complaints by product</h4>
                <ul>
                  <li>Rotini ████</li>
                  <li>C Pizza ███</li>
                  <li>Pasta ██</li>
                </ul>
              </div>
              <div className="chart">
                <h4>Tag Trends</h4>
                <ul>
                  <li>Quality ████</li>
                  <li>Foreign ██</li>
                  <li>Pasta ████</li>
                </ul>
              </div>
              <div className="chart">
                <h4>Team Analytics</h4>
                <ul>
                  <li>Sarah M – 14</li>
                  <li>Mike K – 12</li>
                  <li>Sydney J – 32</li>
                  <li>Lawson L – 23</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Active Tickets */}
        {view === "active" && (
          <div>
            <h2>Active Tickets</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Ticket ID</th>
                  <th>Product</th>
                  <th>Batch Code</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Resolution</th>
                </tr>
              </thead>
              <tbody>
                {activeTickets.map((t) => (
                  <tr key={t.id} onClick={() => showTicketDetails(t)}>
                    <td>{t.name}</td>
                    <td>{t.id}</td>
                    <td>{t.product}</td>
                    <td>{t.batch}</td>
                    <td>{t.date}</td>
                    <td>
                      <span className="status active">{t.status}</span>
                    </td>
                    <td>{t.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Closed Tickets */}
        {view === "closed" && (
          <div>
            <h2>Closed Tickets</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Ticket ID</th>
                  <th>Product</th>
                  <th>Batch Code</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Resolution</th>
                </tr>
              </thead>
              <tbody>
                {closedTickets.map((t) => (
                  <tr key={t.id} onClick={() => showTicketDetails(t)}>
                    <td>{t.name}</td>
                    <td>{t.id}</td>
                    <td>{t.product}</td>
                    <td>{t.batch}</td>
                    <td>{t.date}</td>
                    <td>
                      <span className="status closed">{t.status}</span>
                    </td>
                    <td>{t.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ticket Details */}
        {view === "details" && selectedTicket && (
          <div className="ticket-details">
            <div className="details-left">
              <h2>{selectedTicket.name}</h2>
              <p>
                <strong>Product:</strong> {selectedTicket.product}
              </p>
              <p>
                <strong>Issue:</strong> {selectedTicket.issue || "N/A"}
              </p>
              <p>
                <strong>Expiry Date:</strong> {selectedTicket.expiry}
              </p>
              <p>
                <strong>Manufacturing location:</strong>{" "}
                {selectedTicket.location}
              </p>
              <p>
                <strong>Batch no:</strong> {selectedTicket.batch}
              </p>
              <div className="images">
                {selectedTicket.images &&
                  selectedTicket.images.map((img, i) => (
                    <img key={i} src={img} alt="attachment" />
                  ))}
              </div>
              <p>
                <strong>Brief:</strong> {selectedTicket.brief}
              </p>
            </div>
            <div className="details-right">
              <p>
                <strong>Complaint raised:</strong> {selectedTicket.date}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="status closed">
                  {selectedTicket.status}
                </span>
              </p>
              <p>
                <strong>Resolution:</strong> {selectedTicket.resolution}
              </p>
              <button onClick={() => setView("active")}>Reactivate</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SupportPage;
