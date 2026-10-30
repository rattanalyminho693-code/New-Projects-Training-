import React, { useState, useEffect } from 'react';
import { Language, Role, VideoLesson, LessonCategory } from '../types';
import { 
  Play, 
  CheckCircle, 
  Lock, 
  Crown, 
  Search, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Eye, 
  Award, 
  Check, 
  Film, 
  Zap, 
  Share2 
} from 'lucide-react';

interface LessonsAcademyViewProps {
  lang: Language;
  currentRole: Role;
  lessons: VideoLesson[];
  onUpgradeToVip?: () => void;
  onOpenAdminManager?: () => void;
}

// Convert common YouTube or Vimeo links into secure embed URLs
export function formatVideoEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Already embed URL
  if (trimmed.includes('/embed/')) {
    return trimmed;
  }

  // Standard YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID or short URL: https://youtu.be/VIDEO_ID
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
  }

  // Vimeo URL: https://vimeo.com/VIDEO_ID
  const vimeoMatch = trimmed.match(/vimeo\.com\/([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return trimmed;
}

export const LessonsAcademyView: React.FC<LessonsAcademyViewProps> = ({
  lang,
  currentRole,
  lessons,
  onUpgradeToVip,
  onOpenAdminManager
}) => {
  const isKm = lang === 'km';
  const isAdmin = currentRole === 'admin';
  const isVip = currentRole === 'vip' || isAdmin;

  // Active playing lesson (defaults to first available)
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    return lessons.length > 0 ? lessons[0].id : '';
  });

  // Track completed lessons in localStorage
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('alphasignal_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | LessonCategory>('ALL');
  const [accessFilter, setAccessFilter] = useState<'ALL' | 'free' | 'vip'>('ALL');
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync completed lessons
  useEffect(() => {
    try {
      localStorage.setItem('alphasignal_completed_lessons', JSON.stringify(completedLessonIds));
    } catch (e) {
      console.error(e);
    }
  }, [completedLessonIds]);

  // Keep activeLesson valid if lessons change
  useEffect(() => {
    if (lessons.length > 0 && !lessons.some(l => l.id === activeLessonId)) {
      setActiveLessonId(lessons[0].id);
    }
  }, [lessons, activeLessonId]);

  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];

  const toggleLessonCompleted = (lessonId: string) => {
    setCompletedLessonIds(prev => 
      prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
    );
  };

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const title = isKm ? lesson.titleKm : lesson.title;
    const desc = isKm ? lesson.descriptionKm : lesson.description;
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lesson.instructor && lesson.instructor.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (selectedCategory !== 'ALL' && lesson.category !== selectedCategory) {
      return false;
    }

    if (accessFilter === 'free' && lesson.accessLevel === 'vip') return false;
    if (accessFilter === 'vip' && lesson.accessLevel !== 'vip') return false;

    return true;
  });

  // Check if current user is locked out of the active lesson
  const isLessonLocked = activeLesson && activeLesson.accessLevel === 'vip' && !isVip;

  // Completion calculation
  const totalLessonsCount = lessons.length;
  const completedCount = completedLessonIds.filter(id => lessons.some(l => l.id === id)).length;
  const progressPercentage = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  const handleCopyShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const categories: { key: 'ALL' | LessonCategory; labelKm: string; labelEn: string }[] = [
    { key: 'ALL', labelKm: 'ទាំងអស់', labelEn: 'All Modules' },
    { key: 'basics', labelKm: 'មូលដ្ឋានគ្រឹះ', labelEn: 'Basics' },
    { key: 'technical', labelKm: 'បច្ចេកទេស Trade', labelEn: 'Technical' },
    { key: 'smc', labelKm: 'SMC & OrderBlock', labelEn: 'SMC / Banks' },
    { key: 'mt5_bot', labelKm: 'MT5 Auto-Bot', labelEn: 'MT5 Bot' },
    { key: 'risk_management', labelKm: 'គ្រប់គ្រងដើមទុន', labelEn: 'Risk Mgmt' },
    { key: 'psychology', labelKm: 'ចិត្តវិទ្យា', labelEn: 'Psychology' },
  ];

  return (
    <div className="space-y-6 py-2">
      {/* Academy Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                <span>{isKm ? 'បណ្ឌិតសភាជួញដូរអាជីព' : 'Trading Masterclass Academy'}</span>
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-400">
                {totalLessonsCount} {isKm ? 'មេរៀនវីដេអូ' : 'Video Lessons'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isKm ? 'វីដេអូមេរៀនជួញដូរ និងយុទ្ធសាស្ត្រ AlphaSignal' : 'Trading Video Courses & Masterclasses'}
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              {isKm 
                ? 'រៀនពីមូលដ្ឋានគ្រឹះ TradingView, Smart Money Concepts (SMC), ក្បួនគ្រប់គ្រងដើមទុន 1:3 R:R និងរបៀបភ្ជាប់ Webhook Auto-Trading ចូល MT5 ដោយមិនគិតថ្លៃ និងសម្រាប់សមាជិក VIP។'
                : 'Master TradingView setup, institutional Smart Money Concepts (SMC), 1:3 risk management formulas, and zero-delay MT5 auto-trading bridge setups.'}
            </p>
          </div>

          {/* Quick Progress Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shrink-0 min-w-[260px]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {isKm ? 'វឌ្ឍនភាពការសិក្សា' : 'Your Progress'}
              </span>
              <span className="font-mono text-amber-400 font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>{completedCount} / {totalLessonsCount} {isKm ? 'បានមើលចប់' : 'completed'}</span>
              {isAdmin && onOpenAdminManager && (
                <button
                  onClick={onOpenAdminManager}
                  className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <span>{isKm ? '+ គ្រប់គ្រងមេរៀន' : '+ Admin Studio'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Theatre & Playlist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Cinema Video Player & Lesson Details (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Cinema Frame */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            {isLessonLocked ? (
              /* VIP Paywall Overlay */
              <div className="aspect-video w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/90 relative flex flex-col items-center justify-center p-6 text-center">
                {activeLesson?.thumbnailUrl && (
                  <img 
                    src={activeLesson.thumbnailUrl} 
                    alt="Lesson preview" 
                    className="absolute inset-0 w-full h-full object-cover opacity-15 filter blur-sm"
                  />
                )}
                <div className="relative z-10 max-w-lg space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/20">
                    <Crown className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 inline-block mb-2">
                      {isKm ? 'មេរៀនកម្រិត VIP ផ្តាច់មុខ' : 'VIP Exclusive Masterclass'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {activeLesson ? (isKm ? activeLesson.titleKm : activeLesson.title) : 'VIP Masterclass'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      {isKm
                        ? 'មេរៀននេះមានបង្រៀនយុទ្ធសាស្ត្រជួញដូរកម្រិតខ្ពស់ (SMC & MT5 Auto-Bot) សំរាប់តែសមាជិក VIP ប៉ុណ្ណោះ។ សូម Upgrade ដើម្បីចូលទស្សនាភ្លាមៗ។'
                        : 'This masterclass contains high-value institutional strategies reserved strictly for VIP members. Upgrade today to unlock instant access.'}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {onUpgradeToVip && (
                      <button
                        onClick={onUpgradeToVip}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Crown className="w-4 h-4 fill-slate-950" />
                        <span>{isKm ? 'Upgrade ទៅកាន់ VIP ឥឡូវនេះ ($89)' : 'Upgrade to VIP ($89)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : activeLesson ? (
              /* Active Responsive Video Embed Player */
              <div className="aspect-video w-full bg-black relative">
                <iframe
                  key={activeLesson.id}
                  src={formatVideoEmbedUrl(activeLesson.videoUrl)}
                  title={isKm ? activeLesson.titleKm : activeLesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video w-full bg-slate-900 flex items-center justify-center text-slate-500">
                <span>{isKm ? 'សូមជ្រើសរើសមេរៀន' : 'Select a lesson to begin'}</span>
              </div>
            )}

            {/* Theatre Bottom Bar */}
            {activeLesson && (
              <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    activeLesson.accessLevel === 'vip'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {activeLesson.accessLevel === 'vip' ? (isKm ? 'VIP ផ្តាច់មុខ' : 'VIP Only') : (isKm ? 'សមាជិកទាំងអស់' : 'Free / Member')}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {activeLesson.duration}
                  </span>
                  {activeLesson.instructor && (
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      · {activeLesson.instructor}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLessonCompleted(activeLesson.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      completedLessonIds.includes(activeLesson.id)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${completedLessonIds.includes(activeLesson.id) ? 'fill-emerald-400 text-slate-950' : ''}`} />
                    <span>
                      {completedLessonIds.includes(activeLesson.id)
                        ? (isKm ? 'បានរៀនចប់' : 'Completed')
                        : (isKm ? 'កត់ត្រាថារៀនចប់' : 'Mark as Done')}
                    </span>
                  </button>

                  <button
                    onClick={handleCopyShare}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    title={isKm ? 'ចែករំលែក' : 'Share'}
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Metadata & Key Takeaways Card */}
          {activeLesson && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isKm ? activeLesson.titleKm : activeLesson.title}
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {isKm ? activeLesson.descriptionKm : activeLesson.description}
                </p>
              </div>

              {/* Key Takeaways Points */}
              {((isKm && activeLesson.keyTakeawaysKm && activeLesson.keyTakeawaysKm.length > 0) ||
                (!isKm && activeLesson.keyTakeaways && activeLesson.keyTakeaways.length > 0)) && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isKm ? 'ចំណុចសំខាន់ៗដែលទទួលបានពីមេរៀននេះ (Key Takeaways)' : 'Key Takeaways & Execution Rules'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(isKm ? activeLesson.keyTakeawaysKm : activeLesson.keyTakeaways)?.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor Bio Box */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    {(activeLesson.instructor || 'A')[0]}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">{activeLesson.instructor || 'Alpha Master Trader'}</span>
                    <span className="block text-[11px] text-slate-500">{isKm ? 'គ្រូជំនាញយុទ្ធសាស្ត្រ' : 'Senior Quantitative Analyst'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    {activeLesson.viewsCount || 850} {isKm ? 'ទស្សនា' : 'views'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Playlist Curriculum & Filters (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>{isKm ? 'បញ្ជីមេរៀនទាំងអស់' : 'Course Curriculum'}</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {filteredLessons.length} {isKm ? 'មេរៀន' : 'lessons'}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isKm ? 'ស្វែងរកមេរៀនតាមចំណងជើង...' : 'Search lessons...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer text-[11px] font-medium ${
                    selectedCategory === cat.key
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {isKm ? cat.labelKm : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Access Toggle: All vs VIP Only vs Free */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-medium text-center">
              <button
                onClick={() => setAccessFilter('ALL')}
                className={`py-1 rounded-lg transition-colors cursor-pointer ${
                  accessFilter === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isKm ? 'ទាំងអស់' : 'All'}
              </button>
              <button
                onClick={() => setAccessFilter('free')}
                className={`py-1 rounded-lg transition-colors cursor-pointer ${
                  accessFilter === 'free' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isKm ? 'សេរី (Free)' : 'Free'}
              </button>
              <button
                onClick={() => setAccessFilter('vip')}
                className={`py-1 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  accessFilter === 'vip' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-2.5 h-2.5 text-amber-400" />
                <span>VIP</span>
              </button>
            </div>

            {/* Scrollable Playlist Cards */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredLessons.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  {isKm ? 'មិនមានមេរៀនត្រូវតាមការស្វែងរកទេ' : 'No lessons matched your criteria'}
                </div>
              ) : (
                filteredLessons.map((lesson, idx) => {
                  const isActive = lesson.id === activeLessonId;
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const isLocked = lesson.accessLevel === 'vip' && !isVip;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                        isActive
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                          : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Thumbnail or Play Icon */}
                      <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden relative shrink-0 border border-slate-800">
                        {lesson.thumbnailUrl ? (
                          <img 
                            src={lesson.thumbnailUrl} 
                            alt={lesson.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                            <Film className="w-5 h-5" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-amber-400" />
                          ) : isActive ? (
                            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow">
                              <Play className="w-2.5 h-2.5 fill-slate-950 ml-0.5" />
                            </div>
                          ) : (
                            <Play className="w-3.5 h-3.5 text-white/80 group-hover:text-amber-400 group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-mono text-slate-500">
                            #{idx + 1}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            lesson.accessLevel === 'vip' 
                              ? 'bg-amber-500/15 text-amber-400' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {lesson.accessLevel === 'vip' ? 'VIP' : 'FREE'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono ml-auto">
                            {lesson.duration}
                          </span>
                        </div>

                        <h4 className={`text-xs font-semibold line-clamp-2 leading-snug ${
                          isActive ? 'text-amber-400' : 'text-slate-200 group-hover:text-white'
                        }`}>
                          {isKm ? lesson.titleKm : lesson.title}
                        </h4>

                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                            {isKm ? lesson.categoryKm : lesson.category}
                          </span>
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                              <CheckCircle className="w-3 h-3 fill-emerald-400 text-slate-950" />
                              <span>{isKm ? 'បានមើល' : 'Done'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Need More Assistance Banner */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-950/40 to-slate-950 border border-purple-900/40 text-xs">
              <div className="flex items-center gap-2 text-purple-300 font-semibold mb-1">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>{isKm ? 'ចង់បានមេរៀនបន្ថែម?' : 'Request Custom Lesson'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isKm 
                  ? 'អ្នកគ្រប់គ្រង (Admin) បង្ហោះមេរៀនថ្មីៗជារៀងរាល់សប្តាហ៍។ សមាជិក VIP អាចស្នើសុំ Topic វិភាគជាក់លាក់បាន។' 
                  : 'Admin posts new strategy videos weekly. VIP members can request specific symbol breakdowns.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
