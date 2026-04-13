import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, Plus, FileText, AlertTriangle, XCircle, CheckCircle, X, Filter } from "lucide-react";

const DOCUMENT_TYPES = [
  "Carta d'identità",
  "Passaporto",
  "Patente di guida",
  "Codice fiscale",
  "Permesso di soggiorno",
  "Tessera sanitaria",
];

const INITIAL_STATE = {
  nome: "",
  cognome: "",
  dataNascita: "",
  codiceFiscale: "",
  tipoDocumento: DOCUMENT_TYPES[0],
  numeroDocumento: "",
  dataEmissione: "",
  dataScadenza: "",
  enteEmittente: "",
};

function getExpiryStatus(dataScadenza) {
  if (!dataScadenza) return "unknown";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dataScadenza);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "expiring-soon";
  if (diffDays <= 90) return "expiring-warning";
  return "valid";
}

function StatusBadge({ status }) {
  const config = {
    expired: { label: "Scaduto", bg: "bg-red-100", text: "text-red-800", border: "border-red-200", icon: XCircle },
    "expiring-soon": { label: "Scade entro 30gg", bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200", icon: AlertTriangle },
    "expiring-warning": { label: "Scade entro 90gg", bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200", icon: AlertTriangle },
    valid: { label: "Valido", bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200", icon: CheckCircle },
    unknown: { label: "N/D", bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", icon: FileText },
  };
  const c = config[status] || config.unknown;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}>
      <Icon size={12} />
      {c.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function GestionaleDocumenti() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortField, setSortField] = useState("cognome");
  const [sortDir, setSortDir] = useState("asc");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [editingId, setEditingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={14} className="opacity-20" />;
    return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const filteredDocs = useMemo(() => {
    let result = [...documents];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.nome.toLowerCase().includes(q) ||
          d.cognome.toLowerCase().includes(q) ||
          `${d.nome} ${d.cognome}`.toLowerCase().includes(q) ||
          `${d.cognome} ${d.nome}`.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((d) => getExpiryStatus(d.dataScadenza) === filterStatus);
    }

    if (filterType !== "all") {
      result = result.filter((d) => d.tipoDocumento === filterType);
    }

    result.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";
      if (sortField === "dataScadenza" || sortField === "dataEmissione" || sortField === "dataNascita") {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [documents, searchQuery, filterStatus, filterType, sortField, sortDir]);

  const stats = useMemo(() => {
    const s = { total: documents.length, expired: 0, expiringSoon: 0, valid: 0 };
    documents.forEach((d) => {
      const status = getExpiryStatus(d.dataScadenza);
      if (status === "expired") s.expired++;
      else if (status === "expiring-soon" || status === "expiring-warning") s.expiringSoon++;
      else if (status === "valid") s.valid++;
    });
    return s;
  }, [documents]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId !== null) {
      setDocuments((docs) => docs.map((d) => (d.id === editingId ? { ...formData, id: editingId } : d)));
      setEditingId(null);
    } else {
      setDocuments((docs) => [...docs, { ...formData, id: Date.now() }]);
    }
    setFormData(INITIAL_STATE);
    setShowForm(false);
  };

  const handleEdit = (doc) => {
    setFormData({ ...doc });
    setEditingId(doc.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDocuments((docs) => docs.filter((d) => d.id !== id));
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
  const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1";

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Gestionale Documenti</h1>
                <p className="text-xs text-gray-500">Gestione documenti di identità</p>
              </div>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setFormData(INITIAL_STATE); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Nuovo Documento
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Totale", value: stats.total, color: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Validi", value: stats.valid, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
            { label: "In scadenza", value: stats.expiringSoon, color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
            { label: "Scaduti", value: stats.expired, color: "bg-red-50 border-red-200 text-red-700" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} border rounded-lg px-4 py-3`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per nome o cognome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                showFilters || filterStatus !== "all" || filterType !== "all"
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter size={16} />
              Filtri
              {(filterStatus !== "all" || filterType !== "all") && (
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3 mt-3 pt-3 border-t border-gray-100">
              <div className="flex-1">
                <label className={labelClass}>Stato scadenza</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={inputClass}
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="valid">Validi</option>
                  <option value="expiring-warning">In scadenza (90gg)</option>
                  <option value="expiring-soon">In scadenza (30gg)</option>
                  <option value="expired">Scaduti</option>
                </select>
              </div>
              <div className="flex-1">
                <label className={labelClass}>Tipo documento</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={inputClass}
                >
                  <option value="all">Tutti i tipi</option>
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => { setFilterStatus("all"); setFilterType("all"); }}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Reset filtri
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    { key: "cognome", label: "Cognome" },
                    { key: "nome", label: "Nome" },
                    { key: "dataNascita", label: "Data Nascita" },
                    { key: "codiceFiscale", label: "Codice Fiscale" },
                    { key: "tipoDocumento", label: "Tipo" },
                    { key: "numeroDocumento", label: "N° Documento" },
                    { key: "dataEmissione", label: "Emissione" },
                    { key: "dataScadenza", label: "Scadenza" },
                    { key: "enteEmittente", label: "Ente" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none whitespace-nowrap"
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        <SortIcon field={col.key} />
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stato</th>
                  <th className="px-3 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                      <FileText size={36} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">
                        {documents.length === 0
                          ? 'Nessun documento inserito. Clicca "Nuovo Documento" per iniziare.'
                          : "Nessun risultato trovato per i filtri selezionati."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const status = getExpiryStatus(doc.dataScadenza);
                    const rowBg =
                      status === "expired"
                        ? "bg-red-50/60"
                        : status === "expiring-soon"
                        ? "bg-orange-50/50"
                        : status === "expiring-warning"
                        ? "bg-yellow-50/40"
                        : "";
                    return (
                      <tr key={doc.id} className={`${rowBg} hover:bg-gray-50 transition-colors`}>
                        <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">{doc.cognome}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{doc.nome}</td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{formatDate(doc.dataNascita)}</td>
                        <td className="px-3 py-2.5 text-gray-600 font-mono text-xs whitespace-nowrap">{doc.codiceFiscale || "—"}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{doc.tipoDocumento}</td>
                        <td className="px-3 py-2.5 text-gray-600 font-mono text-xs whitespace-nowrap">{doc.numeroDocumento}</td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{formatDate(doc.dataEmissione)}</td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap font-medium">{formatDate(doc.dataScadenza)}</td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{doc.enteEmittente || "—"}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap"><StatusBadge status={status} /></td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(doc)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Modifica"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                              title="Elimina"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filteredDocs.length > 0 && (
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              {filteredDocs.length} di {documents.length} document{documents.length !== 1 ? "i" : "o"}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-900">
                {editingId !== null ? "Modifica Documento" : "Nuovo Documento"}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); setFormData(INITIAL_STATE); }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nome *</label>
                  <input
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className={inputClass}
                    placeholder="Mario"
                  />
                </div>
                <div>
                  <label className={labelClass}>Cognome *</label>
                  <input
                    required
                    value={formData.cognome}
                    onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                    className={inputClass}
                    placeholder="Rossi"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Data di Nascita</label>
                  <input
                    type="date"
                    value={formData.dataNascita}
                    onChange={(e) => setFormData({ ...formData, dataNascita: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Codice Fiscale</label>
                  <input
                    value={formData.codiceFiscale}
                    onChange={(e) => setFormData({ ...formData, codiceFiscale: e.target.value.toUpperCase() })}
                    className={inputClass}
                    placeholder="RSSMRA85M01H501Z"
                    maxLength={16}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tipo Documento *</label>
                  <select
                    required
                    value={formData.tipoDocumento}
                    onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                    className={inputClass}
                  >
                    {DOCUMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>N° Documento *</label>
                  <input
                    required
                    value={formData.numeroDocumento}
                    onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value.toUpperCase() })}
                    className={inputClass}
                    placeholder="CA12345AB"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Data Emissione</label>
                  <input
                    type="date"
                    value={formData.dataEmissione}
                    onChange={(e) => setFormData({ ...formData, dataEmissione: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Data Scadenza *</label>
                  <input
                    type="date"
                    required
                    value={formData.dataScadenza}
                    onChange={(e) => setFormData({ ...formData, dataScadenza: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Ente Emittente</label>
                <input
                  value={formData.enteEmittente}
                  onChange={(e) => setFormData({ ...formData, enteEmittente: e.target.value })}
                  className={inputClass}
                  placeholder="Comune di Roma"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); setFormData(INITIAL_STATE); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId !== null ? "Salva Modifiche" : "Aggiungi Documento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}