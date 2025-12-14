
import React, { useEffect, useState } from 'react';
import { Check, X, Trash2, ShieldCheck, Inbox, Search, Plus, Edit2, Save, RotateCcw, ArrowUpDown, Filter, Calendar, Globe, User, Image as ImageIcon, ExternalLink, MapPin, Tag, Clock, Flag, AlertTriangle, FileText } from 'lucide-react';
import { Brand, BrandReport, Category } from '../types';
import { Card, Button, Badge, Input, Select, Label, Textarea } from './ui';
import { getCategoryTranslationKey } from '../translations';

interface AdminDashboardProps {
  t: (key: any) => string;
}

interface Submission extends Brand {
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
}

const SAMPLE_SUBMISSIONS: Submission[] = [
  {
    id: 'sample-1',
    name: 'Thai Tea Express',
    category: Category.FOOD_BEVERAGE,
    purpose: 'Bubble Tea Franchise',
    location: 'Phnom Penh',
    website: 'thaiteaexpress.com',
    description: 'A new franchise spotted in BKK1 claiming 100% Thai origin.',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3054/3054889.png',
    submissionDate: new Date().toISOString(),
    status: 'pending',
    submittedBy: 'concerned_citizen@gmail.com',
    purposeKm: 'ហ្វ្រេនឆាយតែគុជ',
    locationKm: 'ភ្នំពេញ',
    descriptionKm: 'ហ្វ្រេនឆាយថ្មីនៅបឹងកេងកង១'
  },
  {
    id: 'sample-2',
    name: 'Bangkok Construction Supplies',
    category: Category.CONSTRUCTION,
    purpose: 'Building Materials',
    location: 'Siem Reap',
    website: 'bkk-construction.th',
    description: 'Major distributor of Thai cement operating near Pub Street.',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2666/2666505.png',
    submissionDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'pending',
    submittedBy: 'builder_union@cam.com'
  },
   {
    id: 'sample-3',
    name: 'Siam Smile Clinic',
    category: Category.HEALTHCARE,
    purpose: 'Dental Services',
    location: 'Battambang',
    website: 'siamsmile.com',
    description: 'Chain of dental clinics owned by Thai investors.',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/4997/4997543.png',
    submissionDate: new Date(Date.now() - 172800000).toISOString(),
    status: 'rejected',
    submittedBy: 'admin_test'
  }
];

const SAMPLE_REPORTS: BrandReport[] = [
  {
    id: 'rep-1',
    brandId: '1',
    brandName: 'PTT Gas Station',
    brandImage: 'https://cdn.worldvectorlogo.com/logos/ptt-station-logo.svg',
    reason: 'incorrect_info',
    details: 'The location information says "Nationwide" but they closed the branch in Kampot recently.',
    email: 'reporter@example.com',
    status: 'pending',
    submittedAt: new Date().toISOString()
  },
  {
    id: 'rep-2',
    brandId: '12',
    brandName: 'Fire Tiger',
    brandImage: 'https://firetigerfood.com/wp-content/uploads/2021/04/logo.png',
    reason: 'closed',
    details: 'This shop at BKK1 seems to be permanently closed. Signboard removed.',
    email: '',
    status: 'pending',
    submittedAt: new Date(Date.now() - 86400000).toISOString()
  },
   {
    id: 'rep-3',
    brandId: '6',
    brandName: 'Makro',
    brandImage: 'https://ayambrand.co.th/images/AYAM-Customer/logocustomer-11.png',
    reason: 'not_thai',
    details: 'I heard this is actually a joint venture, not fully Thai owned? Please verify ownership structure.',
    email: 'investigator@news.com',
    status: 'resolved',
    submittedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ t }) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'reports'>('submissions');
  
  // Submission State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  // Reports State
  const [reports, setReports] = useState<BrandReport[]>([]);

  // Common State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'resolved' | 'dismissed'>('all');
  
  // Edit/Create State
  const [editingId, setEditingId] = useState<string | null>(null); // 'new' for creating
  const [editForm, setEditForm] = useState<Partial<Submission>>({});

  useEffect(() => {
    // Load Submissions
    const storedSubmissions = localStorage.getItem('boycott_submissions');
    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions));
    } else {
      setSubmissions(SAMPLE_SUBMISSIONS);
      localStorage.setItem('boycott_submissions', JSON.stringify(SAMPLE_SUBMISSIONS));
    }

    // Load Reports
    const storedReports = localStorage.getItem('boycott_reports');
    if (storedReports) {
        setReports(JSON.parse(storedReports));
    } else {
        setReports(SAMPLE_REPORTS);
        localStorage.setItem('boycott_reports', JSON.stringify(SAMPLE_REPORTS));
    }
  }, []);

  // --- Submissions Logic ---

  const saveSubmissions = (newSubmissions: Submission[]) => {
    setSubmissions(newSubmissions);
    localStorage.setItem('boycott_submissions', JSON.stringify(newSubmissions));
    // Sync approved items to public list
    const approved = newSubmissions.filter(s => s.status === 'approved');
    localStorage.setItem('boycott_approved_brands', JSON.stringify(approved));
  };

  const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    const updated = submissions.map(s => 
      s.id === id ? { ...s, status: newStatus } : s
    );
    saveSubmissions(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this submission? This cannot be undone.')) {
      const updated = submissions.filter(s => s.id !== id);
      saveSubmissions(updated);
      if (editingId === id) cancelEdit();
    }
  };

  // --- Reports Logic ---

  const saveReports = (newReports: BrandReport[]) => {
    setReports(newReports);
    localStorage.setItem('boycott_reports', JSON.stringify(newReports));
  };

  const handleReportStatus = (id: string, newStatus: 'resolved' | 'dismissed' | 'pending') => {
    const updated = reports.map(r => r.id === id ? { ...r, status: newStatus } : r);
    saveReports(updated);
  };

  const deleteReport = (id: string) => {
     if (window.confirm('Delete this report?')) {
         saveReports(reports.filter(r => r.id !== id));
     }
  };

  // --- Filter Logic ---

  const filteredSubmissions = submissions
    .filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
        if (sortOrder === 'oldest') return new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
        return 0;
    });

  const filteredReports = reports
    .filter(r => {
        const matchesSearch = 
            r.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.details.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        return 0;
    });

  // --- Edit Form Handlers ---

  const startEdit = (submission: Submission) => {
    setEditingId(submission.id);
    setEditForm({ ...submission });
  };

  const startCreate = () => {
    setEditingId('new');
    setEditForm({
      id: Date.now().toString(),
      name: '',
      category: Category.RETAIL,
      purpose: '',
      location: '',
      website: '',
      description: '',
      imageUrl: '',
      status: 'approved',
      submittedBy: 'Admin',
      submissionDate: new Date().toISOString(),
      purposeKm: '',
      locationKm: '',
      descriptionKm: ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editForm.name || !editForm.category) {
      alert('Name and Category are required.');
      return;
    }
    let updated: Submission[];
    if (editingId === 'new') {
       updated = [editForm as Submission, ...submissions];
    } else {
       updated = submissions.map(s => s.id === editingId ? (editForm as Submission) : s);
    }
    saveSubmissions(updated);
    cancelEdit();
  };

  const handleFormChange = (field: keyof Submission, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const pendingSubmissionCount = submissions.filter(s => s.status === 'pending').length;
  const pendingReportCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <ShieldCheck className="w-8 h-8 text-indigo-600" />
             <h2 className="text-3xl font-bold text-slate-900">{t('adminDashboard')}</h2>
           </div>
           <p className="text-slate-500">{t('manageSubmissionsDesc')}</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl self-start md:self-center">
            <button 
                onClick={() => { setActiveTab('submissions'); setStatusFilter('all'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'submissions' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <Inbox className="w-4 h-4" />
                {t('brandSubmissions')}
                {pendingSubmissionCount > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full">{pendingSubmissionCount}</span>
                )}
            </button>
            <button 
                onClick={() => { setActiveTab('reports'); setStatusFilter('all'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'reports' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <Flag className="w-4 h-4" />
                {t('issueReports')}
                {pendingReportCount > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">{pendingReportCount}</span>
                )}
            </button>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        {/* Search Bar */}
        <div className="md:col-span-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input 
                className="pl-12 h-12 rounded-2xl border-slate-200 text-lg shadow-sm" 
                placeholder={activeTab === 'submissions' ? t('searchSubmissions') : t('searchReports')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3 relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none z-10" />
             <Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-10 h-12 rounded-2xl border-slate-200 bg-white shadow-sm"
             >
                <option value="all">{t('allStatus')}</option>
                <option value="pending">{t('status_pending')}</option>
                {activeTab === 'submissions' ? (
                    <>
                        <option value="approved">{t('status_approved')}</option>
                        <option value="rejected">{t('status_rejected')}</option>
                    </>
                ) : (
                    <>
                        <option value="resolved">{t('status_resolved')}</option>
                        <option value="dismissed">{t('status_dismissed')}</option>
                    </>
                )}
             </Select>
        </div>

        {/* Sort/Add */}
        <div className="md:col-span-3 flex gap-2">
            <div className="relative flex-grow">
                 <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none z-10" />
                 <Select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="pl-10 h-12 rounded-2xl border-slate-200 bg-white shadow-sm"
                 >
                    <option value="newest">{t('newest')}</option>
                    <option value="oldest">{t('oldest')}</option>
                 </Select>
            </div>
            {activeTab === 'submissions' && (
                <Button onClick={startCreate} className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center p-0 shrink-0 shadow-sm">
                    <Plus className="w-5 h-5" />
                </Button>
            )}
        </div>
      </div>

      {/* VIEW: SUBMISSIONS */}
      {activeTab === 'submissions' && (
         <>
          {/* Create Form (Visible when 'new' is selected) */}
          {editingId === 'new' && (
            <div className="mb-8 animate-in slide-in-from-top-4">
                <Card className="p-6 border-indigo-200 shadow-lg shadow-indigo-100/50 bg-indigo-50/30">
                    <div className="flex items-center justify-between mb-4 border-b border-indigo-100 pb-2">
                        <h3 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
                            <Plus className="w-5 h-5" /> {t('createNewListing')}
                        </h3>
                    </div>
                    <EditForm 
                        form={editForm} 
                        onChange={handleFormChange} 
                        onSave={saveEdit} 
                        onCancel={cancelEdit} 
                        t={t}
                    />
                </Card>
            </div>
          )}

          <div className="space-y-6">
            {filteredSubmissions.length === 0 ? (
              <EmptyState type="submission" clear={() => {setSearchQuery(''); setStatusFilter('all');}} t={t} />
            ) : (
              filteredSubmissions.map((item) => (
                <React.Fragment key={item.id}>
                    {editingId === item.id ? (
                        <Card className="p-6 border-blue-200 shadow-lg ring-2 ring-blue-500/10">
                            <div className="flex items-center justify-between mb-4 border-b border-blue-100 pb-2">
                                <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                                    <Edit2 className="w-5 h-5" /> {t('editing')}: {item.name}
                                </h3>
                            </div>
                            <EditForm 
                                form={editForm} 
                                onChange={handleFormChange} 
                                onSave={saveEdit} 
                                onCancel={cancelEdit} 
                                t={t}
                            />
                        </Card>
                    ) : (
                        <SubmissionCard 
                            item={item} 
                            t={t} 
                            onEdit={startEdit} 
                            onDelete={handleDelete} 
                            onStatusChange={handleStatusChange} 
                        />
                    )}
                </React.Fragment>
              ))
            )}
          </div>
         </>
      )}

      {/* VIEW: REPORTS */}
      {activeTab === 'reports' && (
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
                 <EmptyState type="report" clear={() => {setSearchQuery(''); setStatusFilter('all');}} t={t} />
            ) : (
                filteredReports.map((report) => (
                    <Card key={report.id} className={`p-0 overflow-hidden ${
                        report.status === 'resolved' ? 'border-green-200 bg-slate-50/50' : 
                        report.status === 'dismissed' ? 'border-slate-200 opacity-75' : 
                        'border-red-200 bg-white shadow-md shadow-red-100/20'
                    }`}>
                        <div className="flex flex-col md:flex-row">
                            {/* Brand Context Side */}
                            <div className="w-full md:w-64 bg-slate-50 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-100 shrink-0">
                                <div className="w-16 h-16 bg-white rounded-xl p-2 mb-3 border border-slate-200 shadow-sm">
                                    <img src={report.brandImage} alt={report.brandName} className="w-full h-full object-contain" />
                                </div>
                                <h4 className="font-bold text-slate-900">{report.brandName}</h4>
                                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                    <span className="uppercase tracking-wider">{t('reportId')}:</span>
                                    <code className="bg-slate-200 px-1 rounded">{report.id.slice(-4)}</code>
                                </div>
                            </div>

                            {/* Report Details */}
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                            {t('issueReported')}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {report.reason === 'incorrect_info' ? t('reason_incorrect') :
                                             report.reason === 'not_thai' ? t('reason_not_thai') :
                                             report.reason === 'closed' ? t('reason_closed') :
                                             report.reason === 'duplicate' ? t('reason_duplicate') : t('reason_other')}
                                        </h3>
                                    </div>
                                    <Badge className={`${
                                        report.status === 'pending' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                        report.status === 'resolved' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                        'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}>
                                        {report.status === 'pending' ? t('status_pending') : 
                                         report.status === 'resolved' ? t('status_resolved') : t('status_dismissed')}
                                    </Badge>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex-grow">
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{report.details}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                                    <div className="flex items-center gap-4 text-xs text-slate-500 w-full md:w-auto">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(report.submittedAt).toLocaleDateString()}
                                        </div>
                                        {report.email && (
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                {report.email}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <Button 
                                            onClick={() => deleteReport(report.id)}
                                            variant="ghost" 
                                            className="h-9 w-9 p-0 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                                            title={t('delete')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>

                                        {report.status === 'pending' && (
                                            <>
                                                <Button 
                                                    onClick={() => handleReportStatus(report.id, 'dismissed')} 
                                                    variant="outline" 
                                                    className="h-9 text-xs"
                                                >
                                                    {t('dismiss')}
                                                </Button>
                                                <Button 
                                                    onClick={() => handleReportStatus(report.id, 'resolved')} 
                                                    className="h-9 text-xs bg-green-600 hover:bg-green-700 text-white border-green-700"
                                                >
                                                    {t('markResolved')}
                                                </Button>
                                            </>
                                        )}
                                         {report.status !== 'pending' && (
                                             <Button 
                                                onClick={() => handleReportStatus(report.id, 'pending')} 
                                                variant="outline" 
                                                className="h-9 text-xs"
                                             >
                                                {t('reopen')}
                                            </Button>
                                         )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))
            )}
          </div>
      )}
    </div>
  );
};

// Extracted Empty State Component
const EmptyState = ({ type, clear, t }: { type: 'submission' | 'report', clear: () => void, t: (key: any) => string }) => (
    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Search className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">
            {type === 'submission' ? t('noSubmissionsFound') : t('noReportsFound')}
        </p>
        <Button onClick={clear} variant="outline" className="mt-4 border-slate-200">
            {t('clearFilters')}
        </Button>
    </div>
);

// Extracted Submission Card Component
const SubmissionCard = ({ item, t, onEdit, onDelete, onStatusChange }: any) => {
    return (
        <Card className={`group overflow-hidden transition-all duration-200 hover:shadow-lg ${
            item.status === 'approved' ? 'border-green-200 bg-white' :
            item.status === 'rejected' ? 'border-red-200 bg-white opacity-80 hover:opacity-100' :
            'border-amber-200 bg-white'
        }`}>
            {/* Top Color Bar Status Indicator */}
            <div className={`h-1.5 w-full ${
            item.status === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
            item.status === 'rejected' ? 'bg-gradient-to-r from-red-500 to-rose-400' :
            'bg-gradient-to-r from-amber-400 to-yellow-400'
            }`} />

            <div className="p-5 md:p-6 flex flex-col gap-6">
            
            {/* 1. Header Section: Identity */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Logo Box */}
                <div className="shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-2xl border border-slate-100 p-2 flex items-center justify-center relative overflow-hidden group-hover:bg-white group-hover:shadow-md transition-all">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <ImageIcon className="w-10 h-10 text-slate-300" />
                        )}
                    </div>
                </div>

                {/* Main Info with Modernized Grid */}
                <div className="flex-grow min-w-0 flex flex-col justify-between">
                    {/* Title Row */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="space-y-1">
                                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                                {item.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ID:</span>
                                <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">{item.id.slice(0, 8)}</code>
                            </div>
                        </div>
                        <Badge variant="outline" className={`border-0 font-bold uppercase tracking-wider text-[11px] px-3 py-1 ${
                            item.status === 'approved' ? 'bg-green-100 text-green-700' :
                            item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                            {item.status === 'approved' ? t('status_approved') : 
                             item.status === 'rejected' ? t('status_rejected') : t('status_pending')}
                        </Badge>
                    </div>
                    
                    {/* Modern Meta Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                            {/* Category */}
                            <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <Tag className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('category')}</span>
                                <span className="text-sm font-medium text-slate-700 truncate">{t(getCategoryTranslationKey(item.category))}</span>
                            </div>
                            </div>

                            {/* Website */}
                            <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Globe className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('website')}</span>
                                {item.website ? (
                                    <a href={`https://${item.website}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate flex items-center gap-1">
                                        {item.website} <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : (
                                    <span className="text-sm text-slate-400 italic">{t('noneProvided')}</span>
                                )}
                            </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('submittedDate')}</span>
                                <span className="text-sm font-medium text-slate-700 truncate">{new Date(item.submissionDate).toLocaleDateString()}</span>
                            </div>
                            </div>

                            {/* Submitter */}
                            <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('submittedBy')}</span>
                                <span className="text-sm font-medium text-slate-700 truncate" title={item.submittedBy}>{item.submittedBy}</span>
                            </div>
                            </div>
                    </div>
                </div>
            </div>

            {/* 2. Content Comparison Grid */}
            <div className="border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                {/* Left: English Details */}
                <div className="p-5 bg-white space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff"></rect><path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#a62842"></path><path d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z" fill="#a62842"></path><path fill="#a62842" d="M2 11.385H31V13.231H2z"></path><path fill="#a62842" d="M2 15.077H31V16.923000000000002H2z"></path><path fill="#a62842" d="M1 18.769H31V20.615H1z"></path><path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#a62842"></path><path d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z" fill="#a62842"></path><path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#102d5e"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path><path fill="#fff" d="M4.601 7.463L5.193 7.033 4.462 7.033 4.236 6.338 4.01 7.033 3.279 7.033 3.87 7.463 3.644 8.158 4.236 7.729 4.827 8.158 4.601 7.463z"></path><path fill="#fff" d="M7.58 7.463L8.172 7.033 7.441 7.033 7.215 6.338 6.989 7.033 6.258 7.033 6.849 7.463 6.623 8.158 7.215 7.729 7.806 8.158 7.58 7.463z"></path><path fill="#fff" d="M10.56 7.463L11.151 7.033 10.42 7.033 10.194 6.338 9.968 7.033 9.237 7.033 9.828 7.463 9.603 8.158 10.194 7.729 10.785 8.158 10.56 7.463z"></path><path fill="#fff" d="M6.066 9.283L6.658 8.854 5.927 8.854 5.701 8.158 5.475 8.854 4.744 8.854 5.335 9.283 5.109 9.979 5.701 9.549 6.292 9.979 6.066 9.283z"></path><path fill="#fff" d="M9.046 9.283L9.637 8.854 8.906 8.854 8.68 8.158 8.454 8.854 7.723 8.854 8.314 9.283 8.089 9.979 8.68 9.549 9.271 9.979 9.046 9.283z"></path><path fill="#fff" d="M12.025 9.283L12.616 8.854 11.885 8.854 11.659 8.158 11.433 8.854 10.702 8.854 11.294 9.283 11.068 9.979 11.659 9.549 12.251 9.979 12.025 9.283z"></path><path fill="#fff" d="M6.066 12.924L6.658 12.494 5.927 12.494 5.701 11.799 5.475 12.494 4.744 12.494 5.335 12.924 5.109 13.619 5.701 13.19 6.292 13.619 6.066 12.924z"></path><path fill="#fff" d="M9.046 12.924L9.637 12.494 8.906 12.494 8.68 11.799 8.454 12.494 7.723 12.494 8.314 12.924 8.089 13.619 8.68 13.19 9.271 13.619 9.046 12.924z"></path><path fill="#fff" d="M12.025 12.924L12.616 12.494 11.885 12.494 11.659 11.799 11.433 12.494 10.702 12.494 11.294 12.924 11.068 13.619 11.659 13.19 12.251 13.619 12.025 12.924z"></path><path fill="#fff" d="M13.539 7.463L14.13 7.033 13.399 7.033 13.173 6.338 12.947 7.033 12.216 7.033 12.808 7.463 12.582 8.158 13.173 7.729 13.765 8.158 13.539 7.463z"></path><path fill="#fff" d="M4.601 11.104L5.193 10.674 4.462 10.674 4.236 9.979 4.01 10.674 3.279 10.674 3.87 11.104 3.644 11.799 4.236 11.369 4.827 11.799 4.601 11.104z"></path><path fill="#fff" d="M7.58 11.104L8.172 10.674 7.441 10.674 7.215 9.979 6.989 10.674 6.258 10.674 6.849 11.104 6.623 11.799 7.215 11.369 7.806 11.799 7.58 11.104z"></path><path fill="#fff" d="M10.56 11.104L11.151 10.674 10.42 10.674 10.194 9.979 9.968 10.674 9.237 10.674 9.828 11.104 9.603 11.799 10.194 11.369 10.785 11.799 10.56 11.104z"></path><path fill="#fff" d="M13.539 11.104L14.13 10.674 13.399 10.674 13.173 9.979 12.947 10.674 12.216 10.674 12.808 11.104 12.582 11.799 13.173 11.369 13.765 11.799 13.539 11.104z"></path><path fill="#fff" d="M4.601 14.744L5.193 14.315 4.462 14.315 4.236 13.619 4.01 14.315 3.279 14.315 3.87 14.744 3.644 15.44 4.236 15.01 4.827 15.44 4.601 14.744z"></path><path fill="#fff" d="M7.58 14.744L8.172 14.315 7.441 14.315 7.215 13.619 6.989 14.315 6.258 14.315 6.849 14.744 6.623 15.44 7.215 15.01 7.806 15.44 7.58 14.744z"></path><path fill="#fff" d="M10.56 14.744L11.151 14.315 10.42 14.315 10.194 13.619 9.968 14.315 9.237 14.315 9.828 14.744 9.603 15.44 10.194 15.01 10.785 15.44 10.56 14.744z"></path><path fill="#fff" d="M13.539 14.744L14.13 14.315 13.399 14.315 13.173 13.619 12.947 14.315 12.216 14.315 12.808 14.744 12.582 15.44 13.173 15.01 13.765 15.44 13.539 14.744z"></path></svg>
                        <span className="text-sm font-bold text-slate-400 font-['Kantumruy_Pro']">ភាសាខ្មែរ</span>
                    </div>

                    <div className="space-y-4 font-['Kantumruy_Pro']">
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase mt-0.5 font-sans">{t('purpose')}</span>
                            <span className="text-sm font-medium text-slate-700">{item.purposeKm || <span className="text-slate-300 italic">-</span>}</span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase mt-0.5 font-sans">{t('location')}</span>
                            <span className="text-sm text-slate-600 flex items-start gap-1">
                                <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" /> {item.locationKm || <span className="text-slate-300 italic">-</span>}
                            </span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase mt-0.5 font-sans">{t('descriptionLabel')}</span>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {item.descriptionKm || <span className="italic text-slate-300">{t('noDescriptionKm')}</span>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            </div>
            
            {/* Action Footer */}
            <div className={`px-4 py-4 md:px-6 md:py-3 border-t flex flex-col md:flex-row items-center justify-between gap-3 ${
            item.status === 'approved' ? 'bg-green-50/30' :
            item.status === 'rejected' ? 'bg-red-50/30' :
            'bg-amber-50/30'
            }`}>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button onClick={() => onEdit(item)} variant="outline" className="flex-1 md:flex-none justify-center h-9 text-xs bg-white hover:bg-slate-50 border-slate-200 text-slate-600 font-medium shadow-sm">
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" /> {t('edit')}
                    </Button>
                    <Button onClick={() => onDelete(item.id)} variant="ghost" className="flex-1 md:flex-none justify-center h-9 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {t('delete')}
                    </Button>
                </div>

                <div className="flex gap-3 w-full md:w-auto md:ml-auto">
                        {item.status === 'pending' && (
                        <>
                            <Button onClick={() => onStatusChange(item.id, 'rejected')} variant="ghost" className="flex-1 md:flex-none justify-center h-9 text-xs font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm transition-all">
                                <X className="w-3.5 h-3.5 mr-1.5" /> {t('reject')}
                            </Button>
                            <Button onClick={() => onStatusChange(item.id, 'approved')} className="flex-1 md:flex-none justify-center h-9 text-xs font-semibold bg-green-600 text-white hover:bg-green-700 border border-green-700 shadow-sm transition-all">
                                <Check className="w-3.5 h-3.5 mr-1.5" /> {t('approve')}
                            </Button>
                        </>
                        )}
                        {item.status === 'rejected' && (
                            <Button onClick={() => onStatusChange(item.id, 'pending')} variant="outline" className="flex-1 md:flex-none justify-center h-9 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm bg-white">
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> {t('restorePending')}
                            </Button>
                        )}
                        {item.status === 'approved' && (
                            <Button onClick={() => onStatusChange(item.id, 'pending')} variant="outline" className="flex-1 md:flex-none justify-center h-9 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 shadow-sm bg-white">
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> {t('reevaluate')}
                            </Button>
                        )}
                </div>
            </div>
        </Card>
    );
};

// Sub-component for the edit form
const EditForm = ({ form, onChange, onSave, onCancel, t }: any) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>{t('brandName')}</Label>
                    <Input value={form.name || ''} onChange={(e: any) => onChange('name', e.target.value)} className="h-10" />
                </div>
                <div className="space-y-2">
                    <Label>{t('category')}</Label>
                    <Select value={form.category || ''} onChange={(e: any) => onChange('category', e.target.value)} className="h-10">
                        {Object.values(Category).filter(c => c !== 'All').map((cat) => (
                             // @ts-ignore
                            <option key={cat} value={cat}>{t(getCategoryTranslationKey(cat))}</option>
                        ))}
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>{t('status')}</Label>
                    <Select value={form.status || 'pending'} onChange={(e: any) => onChange('status', e.target.value)} className="h-10">
                        <option value="pending">{t('status_pending')}</option>
                        <option value="approved">{t('status_approved')}</option>
                        <option value="rejected">{t('status_rejected')}</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>{t('website')}</Label>
                    <Input value={form.website || ''} onChange={(e: any) => onChange('website', e.target.value)} className="h-10" />
                </div>
                 <div className="space-y-2 md:col-span-2">
                    <Label>{t('imageUrl')}</Label>
                    <div className="flex gap-2">
                         <Input value={form.imageUrl || ''} onChange={(e: any) => onChange('imageUrl', e.target.value)} className="flex-grow h-10" />
                         {form.imageUrl && <img src={form.imageUrl} alt={t('preview')} className="w-10 h-10 object-contain rounded border border-slate-200 bg-white" />}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 text-sm uppercase">{t('englishDetails')}</h4>
                    <div className="space-y-2">
                        <Label>{t('purpose')}</Label>
                        <Input value={form.purpose || ''} onChange={(e: any) => onChange('purpose', e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('location')}</Label>
                        <Input value={form.location || ''} onChange={(e: any) => onChange('location', e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('descriptionLabel')}</Label>
                        <Textarea value={form.description || ''} onChange={(e: any) => onChange('description', e.target.value)} className="min-h-[80px]" />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 text-sm uppercase text-blue-600">{t('khmerDetails')}</h4>
                    <div className="space-y-2">
                        <Label>{t('purposeKmLabel')}</Label>
                        <Input value={form.purposeKm || ''} onChange={(e: any) => onChange('purposeKm', e.target.value)} placeholder={t('purpose')} className="h-10 font-['Kantumruy_Pro']" />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('locationKmLabel')}</Label>
                        <Input value={form.locationKm || ''} onChange={(e: any) => onChange('locationKm', e.target.value)} placeholder={t('location')} className="h-10 font-['Kantumruy_Pro']" />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('descriptionKmLabel')}</Label>
                        <Textarea value={form.descriptionKm || ''} onChange={(e: any) => onChange('descriptionKm', e.target.value)} placeholder={t('descriptionLabel')} className="min-h-[80px] font-['Kantumruy_Pro']" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4">
                <Button onClick={onCancel} variant="ghost" className="h-10 w-full md:w-auto">{t('cancel')}</Button>
                <Button onClick={onSave} className="bg-slate-900 text-white hover:bg-slate-800 h-10 w-full md:w-auto shadow-md">
                    <Save className="w-4 h-4 mr-2" /> {t('saveChanges')}
                </Button>
            </div>
        </div>
    );
}

export default AdminDashboard;
