
import React, { useEffect, useState } from 'react';
import { Check, X, Trash2, ShieldCheck, Inbox, Search, Plus, Edit2, Save, RotateCcw, ArrowUpDown, Filter, Calendar, Globe, User, Image as ImageIcon, ExternalLink, MapPin, Tag, Clock, Flag, AlertTriangle, FileText, Loader2, Ban } from 'lucide-react';
import { Brand, BrandReport, Category } from '../types';
import { Card, Button, Badge, Input, Select, Label, Textarea } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface Submission extends Brand {
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
}

const AdminPage: React.FC = () => {
  const { t, getCategoryLabel } = useLanguage();
  const [activeTab, setActiveTab] = useState<'submissions' | 'reports'>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reports, setReports] = useState<BrandReport[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'resolved' | 'dismissed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Submission>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
        // Fetch Brands (Submissions)
        const { data: brandsData, error: brandsError } = await supabase
            .from('brands')
            .select('*')
            .order('created_at', { ascending: false });

        if (brandsError) throw brandsError;

        if (brandsData) {
            const mappedBrands: Submission[] = brandsData.map((item: any) => ({
                id: item.id,
                name: item.name,
                category: item.category as Category,
                purpose: item.purpose,
                purposeKm: item.purpose_km,
                location: item.location,
                locationKm: item.location_km,
                website: item.website,
                description: item.description,
                descriptionKm: item.description_km,
                imageUrl: item.image_url,
                evidenceUrl: item.evidence_url,
                status: item.status,
                submissionDate: item.created_at,
                submittedBy: item.submitted_by
            }));
            setSubmissions(mappedBrands);
        }

        // Fetch Reports
        const { data: reportsData, error: reportsError } = await supabase
            .from('reports')
            .select('*')
            .order('submitted_at', { ascending: false });

        if (reportsError) throw reportsError;

        if (reportsData) {
            const mappedReports: BrandReport[] = reportsData.map((item: any) => ({
                id: item.id,
                brandId: item.brand_id,
                brandName: item.brand_name,
                brandImage: item.brand_image,
                reason: item.reason,
                details: item.details,
                email: item.email,
                status: item.status,
                submittedAt: item.submitted_at
            }));
            setReports(mappedReports);
        }

    } catch (error) {
        console.error('Error fetching admin data:', error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Actions ---

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    // Optimistic update
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    
    const { error } = await supabase
        .from('brands')
        .update({ status: newStatus })
        .eq('id', id);

    if (error) {
        console.error('Update failed:', error);
        fetchData(); // Revert
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
        // Optimistic
        setSubmissions(prev => prev.filter(s => s.id !== id));
        if (editingId === id) cancelEdit();

        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Delete failed:', error);
            fetchData();
        }
    }
  };

  const handleReportStatus = async (id: string, newStatus: 'resolved' | 'dismissed' | 'pending') => {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

      const { error } = await supabase
          .from('reports')
          .update({ status: newStatus })
          .eq('id', id);
       
      if (error) fetchData();
  };

  const deleteReport = async (id: string) => {
     if (window.confirm('Delete this report permanently?')) {
         setReports(prev => prev.filter(r => r.id !== id));
         const { error } = await supabase.from('reports').delete().eq('id', id);
         if (error) fetchData();
     }
  };

  // Special function to delete the BRAND referenced in the report
  const deleteTargetBrand = async (brandId: string, reportId: string) => {
      if (window.confirm('WARNING: This will permanently delete the Brand listing associated with this report. Continue?')) {
          
          // 1. Delete Brand
          const { error: brandError } = await supabase.from('brands').delete().eq('id', brandId);
          
          if (brandError) {
              alert('Failed to delete brand: ' + brandError.message);
              return;
          }

          // 2. Mark report as resolved
          await handleReportStatus(reportId, 'resolved');
          
          // 3. Remove from local state
          setSubmissions(prev => prev.filter(s => s.id !== brandId));
          alert('Brand deleted successfully.');
      }
  };

  // --- Filtering & Sorting ---

  const filteredSubmissions = submissions
    .filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
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
      name: '',
      category: Category.RETAIL,
      purpose: '',
      location: '',
      website: '',
      description: '',
      imageUrl: '',
      evidenceUrl: '',
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

  const saveEdit = async () => {
    if (!editForm.name || !editForm.category) {
      alert('Name and Category are required.');
      return;
    }

    const payload = {
        name: editForm.name,
        category: editForm.category,
        purpose: editForm.purpose,
        purpose_km: editForm.purposeKm,
        location: editForm.location,
        location_km: editForm.locationKm,
        website: editForm.website,
        description: editForm.description,
        description_km: editForm.descriptionKm,
        image_url: editForm.imageUrl,
        evidence_url: editForm.evidenceUrl,
        status: editForm.status || 'pending',
        submitted_by: editForm.submittedBy || 'Admin'
    };

    if (editingId === 'new') {
       const { error } = await supabase.from('brands').insert([payload]);
       if (error) console.error(error);
    } else {
       const { error } = await supabase.from('brands').update(payload).eq('id', editingId);
       if (error) console.error(error);
    }
    
    await fetchData();
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
             <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
             <h2 className="text-3xl font-bold text-foreground">{t('adminDashboard')}</h2>
           </div>
           <p className="text-muted-foreground">{t('manageSubmissionsDesc')}</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start md:self-center">
            <button 
                onClick={() => { setActiveTab('submissions'); setStatusFilter('all'); setCategoryFilter('all'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'submissions' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
                <Inbox className="w-4 h-4" />
                {t('brandSubmissions')}
                {pendingSubmissionCount > 0 && (
                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs px-1.5 py-0.5 rounded-full">{pendingSubmissionCount}</span>
                )}
            </button>
            <button 
                onClick={() => { setActiveTab('reports'); setStatusFilter('all'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'reports' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
                <Flag className="w-4 h-4" />
                {t('issueReports')}
                {pendingReportCount > 0 && (
                    <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs px-1.5 py-0.5 rounded-full">{pendingReportCount}</span>
                )}
            </button>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        {/* Search Bar */}
        <div className={`${activeTab === 'submissions' ? 'md:col-span-3' : 'md:col-span-6'} relative`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input 
                className="pl-12 h-12 rounded-2xl border-input text-lg shadow-sm w-full" 
                placeholder={activeTab === 'submissions' ? t('searchSubmissions') : t('searchReports')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        {/* Category Filter (Submissions Only) */}
        {activeTab === 'submissions' && (
            <div className="md:col-span-3 relative">
                 <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none z-10" />
                 <Select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-10 h-12 rounded-2xl border-input bg-card shadow-sm w-full"
                 >
                    <option value="all">{t('allListings')}</option>
                    {Object.values(Category).filter(c => c !== 'All').map((cat) => (
                         // @ts-ignore
                        <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                    ))}
                 </Select>
            </div>
        )}

        {/* Status Filter */}
        <div className="md:col-span-3 relative">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none z-10" />
             <Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-10 h-12 rounded-2xl border-input bg-card shadow-sm w-full"
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
                    className="pl-10 h-12 rounded-2xl border-input bg-card shadow-sm w-full"
                 >
                    <option value="newest">{t('newest')}</option>
                    <option value="oldest">{t('oldest')}</option>
                 </Select>
            </div>
            {activeTab === 'submissions' && (
                <Button onClick={startCreate} className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center p-0 shrink-0 shadow-sm">
                    <Plus className="w-5 h-5" />
                </Button>
            )}
        </div>
      </div>

      {loading && (
          <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
      )}

      {!loading && activeTab === 'submissions' && (
         <>
          {/* Create Form */}
          {editingId === 'new' && (
            <div className="mb-8 animate-in slide-in-from-top-4">
                <Card className="p-6 border-indigo-200 dark:border-indigo-900 shadow-lg shadow-indigo-100/50 dark:shadow-none bg-indigo-50/30 dark:bg-indigo-900/20">
                    <div className="flex items-center justify-between mb-4 border-b border-indigo-100 dark:border-indigo-800 pb-2">
                        <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                            <Plus className="w-5 h-5" /> {t('createNewListing')}
                        </h3>
                    </div>
                    <EditForm 
                        form={editForm} 
                        onChange={handleFormChange} 
                        onSave={saveEdit} 
                        onCancel={cancelEdit} 
                        t={t}
                        getCategoryLabel={getCategoryLabel}
                    />
                </Card>
            </div>
          )}

          <div className="space-y-6">
            {filteredSubmissions.length === 0 ? (
              <EmptyState type="submission" clear={() => {setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all');}} t={t} />
            ) : (
              filteredSubmissions.map((item) => (
                <React.Fragment key={item.id}>
                    {editingId === item.id ? (
                        <Card className="p-6 border-blue-200 dark:border-blue-900 shadow-lg ring-2 ring-blue-500/10">
                            <div className="flex items-center justify-between mb-4 border-b border-blue-100 dark:border-blue-900 pb-2">
                                <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300 flex items-center gap-2">
                                    <Edit2 className="w-5 h-5" /> {t('editing')}: {item.name}
                                </h3>
                            </div>
                            <EditForm 
                                form={editForm} 
                                onChange={handleFormChange} 
                                onSave={saveEdit} 
                                onCancel={cancelEdit} 
                                t={t}
                                getCategoryLabel={getCategoryLabel}
                            />
                        </Card>
                    ) : (
                        <SubmissionCard 
                            item={item} 
                            t={t} 
                            getCategoryLabel={getCategoryLabel}
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

      {!loading && activeTab === 'reports' && (
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
                 <EmptyState type="report" clear={() => {setSearchQuery(''); setStatusFilter('all');}} t={t} />
            ) : (
                filteredReports.map((report) => (
                    <Card key={report.id} className={`p-0 overflow-hidden group transition-all hover:shadow-md ${
                        report.status === 'resolved' ? 'border-green-200 dark:border-green-900 bg-slate-50/50 dark:bg-slate-900/50' : 
                        report.status === 'dismissed' ? 'border-border opacity-75 bg-slate-50 dark:bg-slate-900' : 
                        'border-red-200 dark:border-red-900/50 bg-card shadow-sm'
                    }`}>
                        <div className="flex flex-col md:flex-row">
                            {/* Brand Context Side */}
                            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border shrink-0">
                                <div className="w-16 h-16 bg-white p-2 mb-3 border border-border shadow-sm rounded-xl">
                                    <img src={report.brandImage || 'https://via.placeholder.com/150'} alt={report.brandName} className="w-full h-full object-contain" />
                                </div>
                                <h4 className="font-bold text-foreground line-clamp-1">{report.brandName}</h4>
                                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                    <span className="uppercase tracking-wider font-bold text-[10px]">{t('reportId')}:</span>
                                    <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded font-mono text-[10px]">{report.id.slice(0, 8)}</code>
                                </div>
                            </div>

                            {/* Report Details */}
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            <AlertTriangle className={`w-3.5 h-3.5 ${report.status === 'pending' ? 'text-red-500' : 'text-slate-400'}`} />
                                            {t('issueReported')}
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground">
                                            {report.reason === 'incorrect_info' ? t('reason_incorrect') :
                                             report.reason === 'not_thai' ? t('reason_not_thai') :
                                             report.reason === 'closed' ? t('reason_closed') :
                                             report.reason === 'duplicate' ? t('reason_duplicate') : t('reason_other')}
                                        </h3>
                                    </div>
                                    
                                    <Badge className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border shadow-sm flex items-center gap-1.5 ${
                                        report.status === 'pending' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' :
                                        report.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                                        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                    }`}>
                                        {report.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                        {report.status === 'resolved' && <Check className="w-3.5 h-3.5" />}
                                        {report.status === 'dismissed' && <X className="w-3.5 h-3.5" />}
                                        {report.status === 'pending' ? t('status_pending') : 
                                         report.status === 'resolved' ? t('status_resolved') : t('status_dismissed')}
                                    </Badge>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-border mb-6 flex-grow relative">
                                    {/* Quote decoration */}
                                    <div className="absolute top-3 left-3 text-slate-200 dark:text-slate-700 pointer-events-none">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V15C13.017 18.3137 10.3307 21 7.01697 21H5.01697Z" /></svg>
                                    </div>
                                    <div className="flex items-start gap-3 relative z-10 pl-2">
                                        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{report.details}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground w-full md:w-auto">
                                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(report.submittedAt).toLocaleDateString()}
                                        </div>
                                        {report.email && (
                                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                <User className="w-3.5 h-3.5" />
                                                <span className="truncate max-w-[150px]" title={report.email}>{report.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                                        
                                        {/* Workflow Actions */}
                                        {report.status === 'pending' && (
                                            <>
                                                <Button 
                                                    onClick={() => deleteTargetBrand(report.brandId, report.id)}
                                                    variant="outline" 
                                                    className="h-10 text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 font-medium"
                                                >
                                                    <Ban className="w-4 h-4 mr-1.5" /> Delete Brand
                                                </Button>
                                                <Button 
                                                    onClick={() => handleReportStatus(report.id, 'dismissed')} 
                                                    variant="outline" 
                                                    className="h-10 text-xs font-medium"
                                                >
                                                    {t('dismiss')}
                                                </Button>
                                                <Button 
                                                    onClick={() => handleReportStatus(report.id, 'resolved')} 
                                                    className="h-10 text-xs bg-green-600 hover:bg-green-700 text-white border-green-700 font-bold shadow-sm"
                                                >
                                                    <Check className="w-4 h-4 mr-1.5" />
                                                    {t('markResolved')}
                                                </Button>
                                            </>
                                        )}
                                         {report.status !== 'pending' && (
                                             <Button 
                                                onClick={() => handleReportStatus(report.id, 'pending')} 
                                                variant="outline" 
                                                className="h-10 text-xs"
                                             >
                                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                                {t('reopen')}
                                            </Button>
                                         )}

                                        {/* Delete Report Button - Made larger and separated */}
                                        <div className="h-8 w-px bg-border mx-1"></div>
                                        <Button 
                                            onClick={() => deleteReport(report.id)}
                                            variant="ghost" 
                                            className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
                                            title="Delete This Report"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
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
    <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-border">
        <div className="mx-auto w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-muted-foreground font-medium">
            {type === 'submission' ? t('noSubmissionsFound') : t('noReportsFound')}
        </p>
        <Button onClick={clear} variant="outline" className="mt-4 border-border">
            {t('clearFilters')}
        </Button>
    </div>
);

// Extracted Submission Card Component
const SubmissionCard = ({ item, t, getCategoryLabel, onEdit, onDelete, onStatusChange }: any) => {
    // Helper to ensure URLs are absolute (external)
    const getSafeUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    return (
        <Card className={`group overflow-hidden transition-all duration-200 hover:shadow-lg ${
            item.status === 'approved' ? 'border-green-200 dark:border-green-900 bg-card' :
            item.status === 'rejected' ? 'border-red-200 dark:border-red-900 bg-card opacity-80 hover:opacity-100' :
            'border-yellow-400 dark:border-yellow-600 bg-card'
        }`}>
            {/* Top Color Bar Status Indicator */}
            <div className={`h-1.5 w-full ${
            item.status === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
            item.status === 'rejected' ? 'bg-gradient-to-r from-red-500 to-rose-400' :
            'bg-gradient-to-r from-yellow-400 to-yellow-300'
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
                                <h3 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {item.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ID:</span>
                                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-muted-foreground font-mono">{item.id.slice(0, 8)}</code>
                            </div>
                        </div>
                        <Badge variant="outline" className={`border-0 font-bold uppercase tracking-wider text-[11px] px-3 py-1 ${
                            item.status === 'approved' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                            item.status === 'rejected' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        }`}>
                            {item.status === 'approved' ? t('status_approved') : 
                             item.status === 'rejected' ? t('status_rejected') : t('status_pending')}
                        </Badge>
                    </div>
                    
                    {/* Modern Meta Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-border">
                            {/* Category */}
                            <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <Tag className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('category')}</span>
                                <span className="text-sm font-medium text-foreground truncate">{getCategoryLabel(item.category)}</span>
                            </div>
                            </div>

                            {/* Website */}
                            <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Globe className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('website')}</span>
                                {item.website ? (
                                    <a href={getSafeUrl(item.website)} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate flex items-center gap-1">
                                        {item.website} <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">{t('noneProvided')}</span>
                                )}
                            </div>
                            </div>
                            
                            {/* Evidence */}
                            <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('viewEvidence')}</span>
                                {item.evidenceUrl ? (
                                    <a href={getSafeUrl(item.evidenceUrl)} target="_blank" rel="noreferrer" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline truncate flex items-center gap-1">
                                        Link <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">{t('noneProvided')}</span>
                                )}
                            </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('submittedDate')}</span>
                                <span className="text-sm font-medium text-foreground truncate">{new Date(item.submissionDate).toLocaleDateString()}</span>
                            </div>
                            </div>

                            {/* Submitter */}
                            <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('submittedBy')}</span>
                                <span className="text-sm font-medium text-foreground truncate" title={item.submittedBy}>{item.submittedBy}</span>
                            </div>
                            </div>
                    </div>
                </div>
            </div>

            {/* 2. Content Comparison Grid */}
            <div className="border border-border rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                {/* Left: English Details */}
                <div className="p-5 bg-white dark:bg-slate-900 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-border">
                        <span className="text-sm font-bold text-slate-400 tracking-widest">English</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase mt-0.5">{t('purpose')}</span>
                            <span className="text-sm font-medium text-foreground">{item.purpose}</span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase mt-0.5">{t('location')}</span>
                            <span className="text-sm text-muted-foreground flex items-start gap-1">
                                <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" /> {item.location}
                            </span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase mt-0.5">{t('descriptionLabel')}</span>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {item.description || <span className="italic text-slate-300">{t('noDescription')}</span>}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Khmer Details */}
                <div className="p-5 bg-slate-50/50 dark:bg-slate-800/50 border-t lg:border-t-0 lg:border-l border-border space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-border">
                        <span className="text-sm font-bold text-slate-400 font-['Kantumruy_Pro']">ភាសាខ្មែរ</span>
                    </div>

                    <div className="space-y-4 font-['Kantumruy_Pro']">
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase mt-0.5 font-sans">{t('purpose')}</span>
                            <span className="text-sm font-medium text-foreground">{item.purposeKm || <span className="text-slate-300 italic">-</span>}</span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase mt-0.5 font-sans">{t('location')}</span>
                            <span className="text-sm text-muted-foreground flex items-start gap-1">
                                <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" /> {item.locationKm || <span className="text-slate-300 italic">-</span>}
                            </span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase mt-0.5 font-sans">{t('descriptionLabel')}</span>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {item.descriptionKm || <span className="italic text-slate-300">{t('noDescriptionKm')}</span>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            </div>
            
            {/* Action Footer */}
            <div className={`px-4 py-4 md:px-6 md:py-3 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 ${
            item.status === 'approved' ? 'bg-green-50/30 dark:bg-green-900/10' :
            item.status === 'rejected' ? 'bg-red-50/30 dark:bg-red-900/10' :
            'bg-yellow-50/50 dark:bg-yellow-900/10'
            }`}>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button onClick={() => onEdit(item)} variant="outline" className="flex-1 md:flex-none justify-center h-9 text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-border text-muted-foreground font-medium shadow-sm">
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" /> {t('edit')}
                    </Button>
                    <Button onClick={() => onDelete(item.id)} variant="ghost" className="flex-1 md:flex-none justify-center h-9 text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-transparent hover:border-red-100 dark:hover:border-red-900/50">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {t('delete')}
                    </Button>
                </div>

                <div className="flex gap-3 w-full md:w-auto md:ml-auto">
                        {item.status === 'pending' && (
                        <>
                            <Button onClick={() => onStatusChange(item.id, 'rejected')} variant="ghost" className="flex-1 md:flex-none justify-center h-9 text-xs font-semibold bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-900 dark:hover:text-red-100 hover:border-red-600 shadow-sm transition-all">
                                <X className="w-3.5 h-3.5 mr-1.5" /> {t('reject')}
                            </Button>
                            <Button onClick={() => onStatusChange(item.id, 'approved')} className="flex-1 md:flex-none justify-center h-9 text-xs font-semibold bg-green-600 text-white hover:bg-green-700 border border-green-700 shadow-sm transition-all">
                                <Check className="w-3.5 h-3.5 mr-1.5" /> {t('approve')}
                            </Button>
                        </>
                        )}
                        {item.status === 'rejected' && (
                            <Button onClick={() => onStatusChange(item.id, 'pending')} variant="outline" className="flex-1 md:flex-none justify-center h-9 text-xs border-border text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm bg-white dark:bg-slate-800">
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> {t('restorePending')}
                            </Button>
                        )}
                        {item.status === 'approved' && (
                            <Button onClick={() => onStatusChange(item.id, 'pending')} variant="outline" className="flex-1 md:flex-none justify-center h-9 text-xs border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 shadow-sm bg-white dark:bg-slate-800">
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> {t('reevaluate')}
                            </Button>
                        )}
                </div>
            </div>
        </Card>
    );
};

// Sub-component for the edit form
const EditForm = ({ form, onChange, onSave, onCancel, t, getCategoryLabel }: any) => {
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
                            <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
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
                 <div className="space-y-2">
                    <Label>{t('imageUrl')}</Label>
                    <div className="flex gap-2">
                         <Input value={form.imageUrl || ''} onChange={(e: any) => onChange('imageUrl', e.target.value)} className="flex-grow h-10" />
                         {form.imageUrl && <img src={form.imageUrl} alt={t('preview')} className="w-10 h-10 object-contain rounded border border-border bg-white" />}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>{t('evidenceUrl')}</Label>
                    <Input value={form.evidenceUrl || ''} onChange={(e: any) => onChange('evidenceUrl', e.target.value)} className="h-10" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-4">
                    <h4 className="font-semibold text-foreground text-sm uppercase">{t('englishDetails')}</h4>
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
                    <h4 className="font-semibold text-foreground text-sm uppercase text-blue-600 dark:text-blue-400">{t('khmerDetails')}</h4>
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
                <Button onClick={onSave} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full md:w-auto shadow-md">
                    <Save className="w-4 h-4 mr-2" /> {t('saveChanges')}
                </Button>
            </div>
        </div>
    );
}

export default AdminPage;
