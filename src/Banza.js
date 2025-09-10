import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Upload } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import "./banza.css";
import "./sidebar.css";

// Constants
const ComplaintStatus = ["Open", "In Process", "Escalated", "Closed"];
const SeverityLevel = { Low: "Low", Medium: "Medium", High: "High" };
const ConsumerType = { Individual: "Individual", Business: "Business" };
const ComplaintCategory = {
  Quality: "Quality",
  Safety: "Safety",
  Labeling: "Labeling",
  Other: "Other",
};

// Sidebar
function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">Banza</div>
      <div className="sidebar-item">Active tickets</div>
      <div className="sidebar-item">Closed tickets</div>
      <div className="sidebar-item">Report</div>
    </div>
  );
}

// Helpers
function getRandomStatus() {
  return ComplaintStatus[Math.floor(Math.random() * ComplaintStatus.length)];
}
function getRandomSeverity() {
  const levels = Object.values(SeverityLevel);
  return levels[Math.floor(Math.random() * levels.length)];
}
function getRandomCategory() {
  const categories = Object.values(ComplaintCategory);
  return categories[Math.floor(Math.random() * categories.length)];
}
function getRandomTags() {
  const tags = ["contamination", "packaging", "expired", "mislabeling", "spoiled"];
  return tags.sort(() => 0.5 - Math.random()).slice(0, 2);
}

// Seed Data
const seedComplaints = Array.from({ length: 8 }).map((_, i) => ({
  id: (i + 1).toString(),
  consumerName: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  product: `Product ${i + 1}`,
  lotCode: `LOT${1000 + i}`,
  location: "New Delhi",
  type: Math.random() > 0.5 ? ConsumerType.Individual : ConsumerType.Business,
  complaint: "Product was defective and not working as expected.",
  status: getRandomStatus(),
  severity: getRandomSeverity(),
  tags: getRandomTags(),
  category: getRandomCategory(),
  createdAt: new Date().toISOString(),
  timeline: [
    { at: new Date().toISOString(), note: "Complaint submitted" },
    { at: new Date().toISOString(), note: "Acknowledged by support team" },
  ],
}));

// Complaint Form
function ComplaintForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    consumerName: "",
    email: "",
    phone: "",
    product: "",
    lotCode: "",
    location: "",
    type: ConsumerType.Individual,
    complaint: "",
  });
  const [photo, setPhoto] = useState(null);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      id: Date.now().toString(),
      ...formData,
      status: "Open",
      severity: SeverityLevel.Medium,
      tags: getRandomTags(),
      category: getRandomCategory(),
      createdAt: new Date().toISOString(),
      timeline: [{ at: new Date().toISOString(), note: "Complaint submitted" }],
    });
    setFormData({
      consumerName: "",
      email: "",
      phone: "",
      product: "",
      lotCode: "",
      location: "",
      type: ConsumerType.Individual,
      complaint: "",
    });
    setPhoto(null);
  }

  return (
    <Form onSubmit={handleSubmit} className="complaint-form">
      <Form.Control
        placeholder="Your Name"
        name="consumerName"
        value={formData.consumerName}
        onChange={handleChange}
        required
      />
      <Form.Control
        placeholder="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Form.Control
        placeholder="Phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />
      <Form.Control
        placeholder="Product Name"
        name="product"
        value={formData.product}
        onChange={handleChange}
        required
      />
      <Form.Control
        placeholder="Lot Code"
        name="lotCode"
        value={formData.lotCode}
        onChange={handleChange}
      />
      <Form.Control
        placeholder="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
      />
      <Form.Select name="type" value={formData.type} onChange={handleChange}>
        <option value={ConsumerType.Individual}>Individual</option>
        <option value={ConsumerType.Business}>Business</option>
      </Form.Select>
      <Form.Control
        as="textarea"
        rows={4}
        placeholder="Describe your complaint"
        name="complaint"
        value={formData.complaint}
        onChange={handleChange}
        required
      />

      <div className="upload-wrapper">
        <input type="file" id="upload-photo" hidden onChange={(e) => setPhoto(e.target.files[0])} />
        <label htmlFor="upload-photo" className="upload-label">
          <Upload size={16} className="me-2" />
          {photo ? photo.name : "Upload photo"}
        </label>
      </div>

      <div className="d-flex gap-2">
        <Button variant="secondary" type="button">
          AI Analyze
        </Button>
        <Button type="submit">Submit Complaint</Button>
      </div>
    </Form>
  );
}

// Complaint Tracking
function ComplaintTracking({ complaints }) {
  const [trackingId, setTrackingId] = useState("");
  const [found, setFound] = useState(null);

  function handleSearch() {
    setFound(complaints.find((c) => c.id === trackingId) || null);
  }

  return (
    <div>
      <div className="d-flex gap-2 mb-3">
        <Form.Control
          placeholder="Enter Complaint ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />
        <Button onClick={handleSearch}>Track</Button>
      </div>
      {found && (
        <div className="tracking-result">
          <h5>Complaint #{found.id}</h5>
          <p><b>Status:</b> {found.status} | <b>Severity:</b> {found.severity}</p>
          <p><b>Product:</b> {found.product} | <b>Lot:</b> {found.lotCode}</p>
          <p><b>Complaint:</b> {found.complaint}</p>
          <p><b>Tags:</b> {found.tags.join(", ")}</p>
          <p><b>Category:</b> {found.category}</p>
        </div>
      )}
    </div>
  );
}

// Dashboard
function ComplaintDashboard({ complaints }) {
  const statusCounts = ComplaintStatus.map((s) => ({
    name: s,
    value: complaints.filter((c) => c.status === s).length,
  }));
  const severityCounts = Object.values(SeverityLevel).map((s) => ({
    name: s,
    count: complaints.filter((c) => c.severity === s).length,
  }));
  const complaintsOverTime = complaints.map((c, i) => ({
    day: `Day ${i + 1}`,
    complaints: Math.floor(Math.random() * 5) + 1,
  }));
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="dashboard-grid">
      <Card className="p-3">
        <h5>By Status</h5>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={statusCounts} dataKey="value" outerRadius={70} label>
              {statusCounts.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-3">
        <h5>By Severity</h5>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={severityCounts}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-3">
        <h5>Complaints Over Time</h5>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={complaintsOverTime}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="complaints" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// Main Layout
export default function SupportMicrosite() {
  const [complaints, setComplaints] = useState(seedComplaints);
  function addComplaint(c) {
    setComplaints([...complaints, c]);
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <h2 className="mb-4">Support Microsite</h2>

        <Card className="mb-4 p-3">
          <h4 className="mb-3">Submit a Complaint</h4>
          <ComplaintForm onSubmit={addComplaint} />
        </Card>

        <Card className="mb-4 p-3">
          <h4 className="mb-3">Track a Complaint</h4>
          <ComplaintTracking complaints={complaints} />
        </Card>

        <Card className="p-3">
          <h4 className="mb-3">Dashboard</h4>
          <ComplaintDashboard complaints={complaints} />
        </Card>
      </div>
    </div>
  );
}
