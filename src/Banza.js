import React, { useState, useMemo, useEffect } from "react";
import Papa from "papaparse";
import CardContent from '@mui/material/CardContent';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import './banza.css'

import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    LineChart,
    Line,
} from "recharts";

const Input = (props) => <Form.Control {...props} />;
const Textarea = (props) => <Form.Control as="textarea" rows={4} {...props} />;
// --- Lightweight smoke tests (no state mutation) ---------------------------
function runSmokeTests(data) {
  try {
    console.assert(Array.isArray(data), "Seed should be an array");
    console.assert(data.length >= 4, "Expected at least 4 seeded tickets");
    const statuses = ["Open", "In Progress", "Escalated", "Resolved"];
    const sum = statuses.reduce(
      (acc, s) => acc + data.filter((c) => c.status === s).length,
      0
    );
    console.assert(sum === data.length, "Status counts should sum to total");
  } catch (e) {
    console.warn("Smoke tests skipped:", e);
  }
}

// --- Helpers for CSV header mapping ---------------------------------------
const HEADER_ALIASES = {
  ticketId: ["Case ID (unique)", "Case ID", "Ticket ID"],
  product: ["Product", "SKU", "Line"],
  lotCode: ["Lot #", "Lot", "Lot Number"],
  createdDate: ["Contact Date", "Created At", "Date"],
  timeStamp: ["Time Stamp", "Time"],
  description: ["Case Description", "Description", "Notes"],
  status: ["Case Status", "Status"],
  store: ["Store", "Purchase Location", "Retailer"],
  email: ["Email", "Consumer Email", "Customer Email"],
};

function normalizeHeaderName(name = "") {
  // FIX: correctly escape newline, carriage return, and tab
  const s = String(name).replaceAll("\n", " ").replaceAll("\r", " ").replaceAll("\t", " ");
  return s
    .split(" ")
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .trim();
}

function findHeaderKeyIndex(headers, options) {
  const norm = headers.map(normalizeHeaderName);
  for (const opt of options) {
    const idx = norm.indexOf(normalizeHeaderName(opt));
    if (idx !== -1) return idx;
  }
  return -1;
}

function normalizeStatus(val) {
  const s = String(val || "").toLowerCase();
  if (s.includes("progress")) return "In Progress";
  if (s.includes("escala")) return "Escalated";
  if (s.includes("resolv") || s.includes("closed")) return "Resolved";
  if (s.includes("open") || s === "") return "Open";
  return "Open";
}

function combineDateTime(dateStr, timeStr) {
  try {
    if (dateStr && timeStr) return new Date(`${dateStr} ${timeStr}`).toISOString();
    if (dateStr) return new Date(dateStr).toISOString();
  } catch {}
  return new Date().toISOString();
}

function runHeaderMappingTests() {
  const headers = [
    "Case ID (unique)",
    "Product",
    "Lot #",
    "Contact Date",
    "Time Stamp",
    "Case Description",
    "Case Status",
    "Store",
  ];
  console.assert(findHeaderKeyIndex(headers, HEADER_ALIASES.ticketId) === 0, "ticketId idx");
  console.assert(findHeaderKeyIndex(headers, HEADER_ALIASES.product) === 1, "product idx");
  console.assert(findHeaderKeyIndex(headers, HEADER_ALIASES.status) === 6, "status idx");
}

const COLORS = ["#f87171", "#60a5fa", "#facc15", "#34d399", "#a78bfa", "#f472b6"];

const SectionHeader = ({ title, desc }) => (
  <div className="mb-4">
    <h2 className="text-xl font-bold">{title}</h2>
    {desc && <p className="text-sm text-gray-500">{desc}</p>}
  </div>
);

export default function BanzaPOC() {
  const seedNow = Date.now();
  const seeded = [
    {
      id: seedNow - 500000,
      ticketId: "BAN-RTN-" + (seedNow - 500000).toString().slice(-4),
      product: "Chickpea Pasta Rotini",
      lotCode: "L240812A",
      expiration: "2025-12-01",
      location: "Whole Foods",
      email: "customer1@example.com",
      complaint: "Packaging was torn and pasta spilled in the box.",
      category: "Packaging",
      status: "Open",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      timeline: [
        {
          at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          note: "Complaint submitted",
        },
      ],
    },
    {
      id: seedNow - 400000,
      ticketId: "BAN-MAC-" + (seedNow - 400000).toString().slice(-4),
      product: "Chickpea Mac & Cheese",
      lotCode: "L240901C",
      expiration: "2025-11-20",
      location: "Target",
      email: "customer2@example.com",
      complaint: "Odd taste and smell in the cheese sauce.",
      category: "Taste",
      status: "In Progress",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      timeline: [
        {
          at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          note: "Complaint submitted",
        },
        {
          at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
          note: "Assigned to CX agent",
        },
      ],
    },
    {
      id: seedNow - 300000,
      ticketId: "BAN-PCS-" + (seedNow - 300000).toString().slice(-4),
      product: "Pizza Crust",
      lotCode: "L240830B",
      expiration: "2025-10-15",
      location: "Amazon",
      email: "customer3@example.com",
      complaint: "Received late and box was dented.",
      category: "Delivery",
      status: "Escalated",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      timeline: [
        {
          at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          note: "Complaint submitted",
        },
        {
          at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 3600000).toISOString(),
          note: "Escalated to manufacturing partner (mock Slack)",
        },
      ],
    },
    {
      id: seedNow - 200000,
      ticketId: "BAN-PEN-" + (seedNow - 200000).toString().slice(-4),
      product: "Penne",
      lotCode: "L240825A",
      expiration: "2025-09-30",
      location: "Kroger",
      email: "customer4@example.com",
      complaint: "Found black specs and unusual texture.",
      category: "Quality",
      status: "Resolved",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
      timeline: [
        {
          at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
          note: "Complaint submitted",
        },
        {
          at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
          note: "Replacement shipped",
        },
        {
          at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          note: "Issue resolved",
        },
      ],
    },
  ];

  const [view, setView] = useState("complaint");
  const [complaints, setComplaints] = useState(seeded);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    product: "Chickpea Pasta Rotini",
    lotCode: "",
    expiration: "",
    location: "Whole Foods",
    email: "",
    complaint: "",
    status: "Open",
  });

  const [lookup, setLookup] = useState({ ticketId: "", email: "" });
  const [filters, setFilters] = useState({ status: "All", product: "All" });

  const categoryFromText = (text) => {
    const t = String(text || "").toLowerCase();
    if (t.includes("packag") || t.includes("torn") || t.includes("seal") || t.includes("leak")) return "Packaging";
    if (t.includes("taste") || t.includes("smell") || t.includes("flavor") || t.includes("cheese")) return "Taste";
    if (t.includes("mold") || t.includes("spec") || t.includes("spoil") || t.includes("quality") || t.includes("texture")) return "Quality";
    if (t.includes("late") || t.includes("deliver") || t.includes("shipping") || t.includes("carrier")) return "Delivery";
    return "Other";
  };

  const makeTicketId = () => {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const code = (form.product || "BAN").split(" ")[0].slice(0, 3).toUpperCase();
    return `BAN-${code}-${rand}`;
  };

  const submitComplaint = (e) => {
    e.preventDefault();
    const id = Date.now();
    const ticketId = makeTicketId();
    const cat = categoryFromText(form.complaint);
    const createdAt = new Date().toISOString();
    const newItem = {
      id,
      ticketId,
      ...form,
      category: cat,
      createdAt,
      timeline: [{ at: createdAt, note: "Complaint submitted" }],
    };
    setComplaints([newItem, ...complaints]);
    setView("tracking");
    setToast(`Ticket created: ${ticketId}`);
    setForm({
      product: "Chickpea Pasta Rotini",
      lotCode: "",
      expiration: "",
      location: "Whole Foods",
      email: "",
      complaint: "",
      status: "Open",
    });
    setTimeout(() => setToast(""), 3000);
  };

  const updateStatus = (id, status) => {
    const at = new Date().toISOString();
    setComplaints(
      complaints.map((c) =>
        c.id === id
          ? { ...c, status, timeline: [...c.timeline, { at, note: `Status → ${status}` }] }
          : c
      )
    );
  };

  const escalateToPartner = (id) => {
    const at = new Date().toISOString();
    setComplaints(
      complaints.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "Escalated",
              timeline: [
                ...c.timeline,
                { at, note: "Escalated to manufacturing partner (mock Slack)" },
              ],
            }
          : c
      )
    );
    setToast("Escalated to manufacturing partner (mock)");
    setTimeout(() => setToast(""), 2500);
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter(
      (c) =>
        (filters.status === "All" || c.status === filters.status) &&
        (filters.product === "All" || c.product === filters.product)
    );
  }, [complaints, filters]);

  const statusCounts = ["Open", "In Progress", "Escalated", "Resolved"].map((status) => ({
    name: status,
    value: complaints.filter((c) => c.status === status).length,
  }));

  const products = Array.from(
    new Set([
      "Chickpea Pasta Rotini",
      "Chickpea Mac & Cheese",
      "Pizza Crust",
      "Penne",
      ...complaints.map((c) => c.product),
    ])
  );

  const byProduct = products.map((p) => ({
    product: p,
    count: complaints.filter((c) => c.product === p).length,
  }));

  const byCategory = Array.from(new Set(complaints.map((c) => c.category))).map((cat) => ({
    category: cat,
    count: complaints.filter((c) => c.category === cat).length,
  }));

  // last 14 days trend
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return key;
  });
  const trend = days.map((key) => ({
    day: key.slice(5),
    count: complaints.filter((c) => (c.createdAt || "").slice(0, 10) === key).length,
  }));

  // Additional unit tests (run once in dev) ---------------------------------
  function runUnitTestsLocal() {
    try {
      console.assert(
        normalizeHeaderName(" Case\tID\r\n(unique) ") === "case id (unique)",
        "normalizeHeaderName whitespace handling"
      );
      console.assert(
        normalizeStatus("Closed") === "Resolved" &&
          normalizeStatus("In progress") === "In Progress" &&
          normalizeStatus("Escalated") === "Escalated",
        "normalizeStatus mapping"
      );
      const iso = combineDateTime("2024-01-02", "13:05");
      console.assert(iso.startsWith("2024-01-02T13:05"), "combineDateTime join");
      console.assert(categoryFromText("package torn") === "Packaging", "categoryFromText packaging");
    } catch (e) {
      console.warn("Unit tests skipped:", e);
    }
  }

  useEffect(() => {
    runSmokeTests(seeded);
    runHeaderMappingTests();
    runUnitTestsLocal();
  }, []);

  // ------- CSV import transformer (inside component) ---------
  function applyImportedRows(rows, headers) {
    const idx = {
      ticketId: findHeaderKeyIndex(headers, HEADER_ALIASES.ticketId),
      product: findHeaderKeyIndex(headers, HEADER_ALIASES.product),
      lotCode: findHeaderKeyIndex(headers, HEADER_ALIASES.lotCode),
      createdDate: findHeaderKeyIndex(headers, HEADER_ALIASES.createdDate),
      timeStamp: findHeaderKeyIndex(headers, HEADER_ALIASES.timeStamp),
      description: findHeaderKeyIndex(headers, HEADER_ALIASES.description),
      status: findHeaderKeyIndex(headers, HEADER_ALIASES.status),
      store: findHeaderKeyIndex(headers, HEADER_ALIASES.store),
      email: findHeaderKeyIndex(headers, HEADER_ALIASES.email),
    };

    const imported = rows
      .filter((r) => Object.keys(r).some((k) => String(r[k] || "").trim() !== ""))
      .map((r, i) => {
        const toVal = (key) => (idx[key] === -1 ? "" : r[headers[idx[key]]] || "");
        const ticketId = (toVal("ticketId") || `BAN-CSV-${(Date.now() + i).toString().slice(-4)}`).toString();
        const createdAt = combineDateTime(toVal("createdDate"), toVal("timeStamp"));
        const status = normalizeStatus(toVal("status"));
        const complaint = String(toVal("description") || "");
        const email = String(toVal("email") || "");
        return {
          id: Date.now() + i,
          ticketId,
          product: String(toVal("product") || "Unknown"),
          lotCode: String(toVal("lotCode") || ""),
          expiration: "",
          location: String(toVal("store") || ""),
          email,
          complaint,
          category: categoryFromText(complaint),
          status,
          createdAt,
          timeline: [
            { at: createdAt, note: "Imported from CSV" },
            ...(status && status !== "Open" ? [{ at: createdAt, note: `Status → ${status}` }] : []),
          ],
        };
      });

    setComplaints((prev) => [...imported, ...prev]);
    setView("reports");
    setToast(`Imported ${imported.length} rows`);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Nav Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant={view === "complaint" ? "default" : "outline"} onClick={() => setView("complaint")}>
          Complaint
        </Button>
        <Button variant={view === "tracking" ? "default" : "outline"} onClick={() => setView("tracking")}>
          Complaint Tracking
        </Button>
        <Button variant={view === "reports" ? "default" : "outline"} onClick={() => setView("reports")}>
          Reporting & Insights
        </Button>
        {toast && <span className="ml-auto text-sm text-green-600">{toast}</span>}
      </div>

      {view === "complaint" && (
        <Card className="p-4">
          <SectionHeader title="Submit a Complaint" desc="Create a ticket without login. You will receive a Ticket ID to track progress." />
          <form onSubmit={submitComplaint} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product</label>
              <select className="border rounded p-2 w-full" value={form.product} onChange={(e)=>setForm({...form, product: e.target.value})}>
                <option>Chickpea Pasta Rotini</option>
                <option>Chickpea Mac & Cheese</option>
                <option>Pizza Crust</option>
                <option>Penne</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lot Code</label>
              <Input placeholder="e.g., L240901C" value={form.lotCode} onChange={(e)=>setForm({...form, lotCode: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiration</label>
              <Input type="date" value={form.expiration} onChange={(e)=>setForm({...form, expiration: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Location</label>
              <select className="border rounded p-2 w-full" value={form.location} onChange={(e)=>setForm({...form, location: e.target.value})}>
                <option>Whole Foods</option>
                <option>Target</option>
                <option>Amazon</option>
                <option>Kroger</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Email</label>
              <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} required />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Complaint Details</label>
              <Input placeholder="Describe the issue (taste, packaging, delivery, etc.)" value={form.complaint} onChange={(e)=>setForm({...form, complaint: e.target.value})} required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full">Create Ticket</Button>
            </div>
          </form>
        </Card>
      )}

      {view === "tracking" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Public lookup */}
          <Card className="p-4 lg:col-span-1">
            <SectionHeader title="Track Your Ticket" desc="Use Ticket ID and Email to view progress (no login)." />
            <div className="space-y-2">
              <Input placeholder="Ticket ID (e.g., BAN-RTN-1234)" value={lookup.ticketId} onChange={(e)=>setLookup({...lookup, ticketId: e.target.value})} />
              <Input type="email" placeholder="Email used when submitting (optional)" value={lookup.email} onChange={(e)=>setLookup({...lookup, email: e.target.value})} />
            </div>
            <div className="mt-3">
              {lookup.ticketId ? (
                (()=>{
                  const found = complaints.find(c => {
                    if (!lookup.ticketId) return false;
                    if (lookup.email) return c.ticketId===lookup.ticketId && c.email===lookup.email;
                    return c.ticketId===lookup.ticketId;
                  });
                  if(!found) return <p className="text-sm text-gray-500">No ticket found for the provided details.</p>;
                  return (
                    <div className="mt-2 text-sm space-y-2">
                      <p><b>Status:</b> {found.status}</p>
                      <p><b>Product:</b> {found.product} | <b>Lot:</b> {found.lotCode}</p>
                      <p><b>Purchase Location:</b> {found.location}</p>
                      <p><b>Category:</b> {found.category}</p>
                      <div>
                        <b>Timeline</b>
                        <ul className="list-disc pl-5">
                          {found.timeline.map((t,i)=>(
                            <li key={i}>{new Date(t.at).toLocaleString()} — {t.note}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-sm text-gray-500">Enter details to view your ticket status. You may leave email blank if your ticket was created without one.</p>
              )}
            </div>
          </Card>

          {/* Internal inbox */}
          <Card className="p-4 lg:col-span-2">
            <SectionHeader title="Internal Inbox" desc="View and manage all complaints. Escalate to manufacturing partner when needed." />
            <div className="flex flex-wrap gap-2 mb-3">
              <select className="border rounded p-2" value={filters.status} onChange={(e)=>setFilters({...filters, status: e.target.value})}>
                <option>All</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Escalated</option>
                <option>Resolved</option>
              </select>
              <select className="border rounded p-2" value={filters.product} onChange={(e)=>setFilters({...filters, product: e.target.value})}>
                <option>All</option>
                {products.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="grid gap-3 max-h-[520px] overflow-auto pr-1">
              {filteredComplaints.map((c) => (
                <Card key={c.id} className="p-3">
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm">
                        <div className="font-medium">{c.ticketId} — {c.product}</div>
                        <div className="text-gray-600">Lot {c.lotCode} • {c.location} • {new Date(c.createdAt).toLocaleString()}</div>
                        <div className=""><b>Category:</b> {c.category} • <b>Status:</b> {c.status}</div>
                      </div>
                      <div className="flex gap-2">
                        {c.status !== "In Progress" && <Button size="sm" onClick={()=>updateStatus(c.id, "In Progress")}>In Progress</Button>}
                        {c.status !== "Escalated" && <Button size="sm" onClick={()=>escalateToPartner(c.id)}>Escalate</Button>}
                        {c.status !== "Resolved" && <Button size="sm" onClick={()=>updateStatus(c.id, "Resolved")}>Resolve</Button>}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <b>Complaint:</b> {c.complaint}
                    </div>
                    <div className="text-xs">
                      <b>Timeline</b>
                      <ul className="list-disc pl-5">
                        {c.timeline.map((t,i)=> <li key={i}>{new Date(t.at).toLocaleString()} — {t.note}</li>)}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredComplaints.length === 0 && (
                <p className="text-sm text-gray-500">No complaints match the current filters.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {view === "reports" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* CSV Import */}
          <Card className="p-4 xl:col-span-3">
            <SectionHeader title="Import from Quality Tracker CSV" desc="Upload the Google Sheet export to populate tickets (supports multi-row headers like Banza's)." />
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                Papa.parse(file, {
                  header: true,
                  skipEmptyLines: true,
                  complete: (res1) => {
                    let rows = res1.data;
                    let headers = res1.meta.fields || [];
                    const bad = !headers.some((h) => normalizeHeaderName(h).includes("case id"));
                    if (bad) {
                      Papa.parse(file, {
                        header: false,
                        skipEmptyLines: true,
                        complete: (res2) => {
                          const table = res2.data;
                          let headerRowIdx = table.findIndex((row) => row.some((cell) => String(cell).toLowerCase().includes("case id")));
                          if (headerRowIdx === -1) headerRowIdx = 0;
                          headers = table[headerRowIdx].map((x) => String(x).replaceAll("\n", " ").trim());
                          const body = table.slice(headerRowIdx + 1);
                          rows = body.map((r) => {
                            const obj = {};
                            headers.forEach((h, i) => (obj[h] = r[i]));
                            return obj;
                          });
                          applyImportedRows(rows, headers);
                        },
                      });
                    } else {
                      applyImportedRows(rows, headers);
                    }
                  },
                });
              }}
            />
            <p className="text-xs text-gray-500 mt-2">We map columns like <i>Case ID (unique), Product/SKU, Lot #, Contact Date, Time Stamp, Case Description, Case Status, Store</i>. Unknown fields are ignored.</p>
          </Card>

          {/* KPIs */}
          <Card className="p-4 xl:col-span-3">
            <SectionHeader title="Key Metrics" desc="Snapshot for CX leadership (inspired by food & beverage workflow)." />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statusCounts.map((s,i)=> (
                <div key={i} className="rounded-xl border p-4 text-center">
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-sm text-gray-600">{s.name}</div>
                </div>
              ))}
              <div className="rounded-xl border p-4 text-center">
                <div className="text-2xl font-bold">{complaints.filter(c=> (Date.now() - new Date(c.createdAt).getTime()) < 7*24*3600*1000).length}</div>
                <div className="text-sm text-gray-600">Last 7 days</div>
              </div>
            </div>
          </Card>

          {/* By Product */}
          <Card className="p-4">
            <SectionHeader title="Complaints by Product" />
            <BarChart width={380} height={260} data={byProduct}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#60a5fa" />
            </BarChart>
          </Card>

          {/* By Category */}
          <Card className="p-4">
            <SectionHeader title="Category Breakdown" />
            <PieChart width={380} height={260}>
              <Pie data={byCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80}>
                {byCategory.map((e, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Card>

          {/* Trend */}
          <Card className="p-4">
            <SectionHeader title="Complaints over Time (14 days)" />
            <LineChart width={380} height={260} data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#34d399" />
            </LineChart>
          </Card>
        </div>
      )}
    </div>
  );
}
