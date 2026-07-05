import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Sparkles,
  ClipboardList,
  Edit2,
  CheckCircle2,
  Circle,
  X,
  CalendarDays
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  category?: string;
  addedBy?: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dateAdded: string;
  addedBy?: string;
}

export default function CalendarTab() {
  // --- States ---
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 24)); // June 24, 2026 based on mock context
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Interaction states
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [newEventText, setNewEventText] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<string>('VDV');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventText, setEditingEventText] = useState('');

  // --- Load initial data from localStorage ---
  useEffect(() => {
    const savedEvents = localStorage.getItem('vrasar_calendar_events');
    const savedTasks = localStorage.getItem('vrasar_tasks');
    
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      // Default placeholder events for rich initial visual feel
      const defaultEvents: CalendarEvent[] = [
        { id: '1', date: '2026-06-15', text: 'Obuka za kontrolore - MZ Neimar', category: 'Sastanak', addedBy: 'Kaluđer' },
        { id: '2', date: '2026-06-20', text: 'VDV Akcija - Crveni Krst', category: 'VDV', addedBy: 'Kaluđer' },
        { id: '3', date: '2026-06-24', text: 'Podela propagandnog materijala - Kalenić pijaca', category: 'Štand', addedBy: 'Kaluđer' },
        { id: '4', date: '2026-06-26', text: 'Sastanak opštinskog tima', category: 'Sastanak', addedBy: 'Kaluđer' },
        { id: '5', date: '2026-06-28', text: 'Finalna provera spiskova', category: 'Drugo', addedBy: 'Kaluđer' }
      ];
      setEvents(defaultEvents);
      localStorage.setItem('vrasar_calendar_events', JSON.stringify(defaultEvents));
    }

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Default placeholder tasks for Notion feel
      const defaultTasks: Task[] = [
        { id: 't1', text: 'Pozvati preostale volontere za VDV akciju', completed: false, priority: 'high', dateAdded: '2026-06-23', addedBy: 'Kaluđer' },
        { id: 't2', text: 'Odštampati spiskove biračkih mesta', completed: true, priority: 'medium', dateAdded: '2026-06-22', addedBy: 'Kaluđer' },
        { id: 't3', text: 'Ažurirati Excel fajl sa finansijama', completed: false, priority: 'low', dateAdded: '2026-06-24', addedBy: 'Kaluđer' },
        { id: 't4', text: 'Pripremiti osveženje za sastanak u petak', completed: false, priority: 'low', dateAdded: '2026-06-24', addedBy: 'Kaluđer' }
      ];
      setTasks(defaultTasks);
      localStorage.setItem('vrasar_tasks', JSON.stringify(defaultTasks));
    }
  }, []);

  // --- Persist data ---
  const saveEventsToStorage = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('vrasar_calendar_events', JSON.stringify(newEvents));
  };

  const saveTasksToStorage = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('vrasar_tasks', JSON.stringify(newTasks));
  };

  // --- Calendar Helpers ---
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate calendar grid array
  const totalDays = daysInMonth(currentYear, currentMonth);
  const startOffset = firstDayOfMonth(currentYear, currentMonth);
  
  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d);
  }

  // Formatting date string
  const formatDateStr = (dayNum: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  const monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];

  // --- Event Handlers ---
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateStr || !newEventText.trim()) return;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: selectedDateStr,
      text: newEventText.trim(),
      category: newEventCategory,
      addedBy: 'Kaluđer'
    };

    saveEventsToStorage([...events, newEvent]);
    setNewEventText('');
  };

  const handleDeleteEvent = (id: string) => {
    const filtered = events.filter(ev => ev.id !== id);
    saveEventsToStorage(filtered);
  };

  const handleStartEditEvent = (ev: CalendarEvent) => {
    setEditingEventId(ev.id);
    setEditingEventText(ev.text);
  };

  const handleSaveEditEvent = (id: string) => {
    const updated = events.map(ev => ev.id === id ? { ...ev, text: editingEventText } : ev);
    saveEventsToStorage(updated);
    setEditingEventId(null);
  };

  // --- Task Handlers ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: 't_' + Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
      dateAdded: new Date().toISOString().split('T')[0],
      addedBy: 'Kaluđer'
    };

    saveTasksToStorage([...tasks, newTask]);
    setNewTaskText('');
    setNewTaskPriority('medium');
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasksToStorage(updated);
  };

  const handleDeleteTask = (id: string) => {
    const filtered = tasks.filter(t => t.id !== id);
    saveTasksToStorage(filtered);
  };

  // Calculate task completions
  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEVA KOLONA: INTERAKTIVNI KALENDAR (lg:col-span-8 na velikim ekranima) */}
      <div className="lg:col-span-8 space-y-4">
        <div className="p-6 bg-[#101318] border border-[#1e222b] rounded-2xl space-y-4">
          
          {/* Calendar Header with Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Planer i Kalendar akcija
              </h3>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex items-center gap-1 self-start sm:self-auto">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 bg-[#161a22] hover:bg-white/5 border border-[#232935] text-gray-400 hover:text-white rounded-lg transition-colors"
                title="Prethodni mesec"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-bold text-gray-200 px-3 py-1 bg-[#161a22] border border-[#232935] rounded-lg min-w-[100px] text-center">
                {monthNames[currentMonth]} {currentYear}.
              </span>

              <button
                onClick={handleNextMonth}
                className="p-1.5 bg-[#161a22] hover:bg-white/5 border border-[#232935] text-gray-400 hover:text-white rounded-lg transition-colors"
                title="Sledeći mesec"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Category Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 border-t border-[#1e222b]/50 text-[10px] text-[#9aa3b2]">
            <span className="font-semibold text-gray-400 uppercase tracking-wider">Kategorije:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500/20 border border-blue-500" />
              <span>VDV akcija</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500" />
              <span>Sastanak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]/20 border border-[#a855f7]" />
              <span>Štand / Promo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500" />
              <span>Prikupljanje potpisa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500/20 border border-sky-500" />
              <span>Obuka kontrolora</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500/20 border border-teal-500" />
              <span>Obuka vdv volontera</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500" />
              <span>Drugo</span>
            </div>
          </div>

          {/* Monthly Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Day of Week Labels */}
            {['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'].map((day) => (
              <div key={day} className="py-2 text-[10px] font-extrabold text-[#9aa3b2] uppercase tracking-wider">
                {day}
              </div>
            ))}

            {/* Grid days */}
            {daysArray.map((day, idx) => {
              if (day === null) {
                return (
                  <div 
                    key={`empty-${idx}`} 
                    className="aspect-square bg-transparent border border-transparent rounded-xl"
                  />
                );
              }

              const dateStr = formatDateStr(day);
              const dayEvents = events.filter(e => e.date === dateStr);
              const isToday = dateStr === '2026-06-24'; // context current local mock day
              const isSelected = selectedDateStr === dateStr;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`aspect-square p-2 rounded-xl border text-left flex flex-col justify-between transition-all group relative cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600/15 border-blue-500 text-white'
                      : isToday
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-[#161a22] border-[#232935] hover:border-gray-500 text-gray-300 hover:text-white'
                  }`}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${isToday ? 'text-amber-400' : 'text-gray-300'}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[8px] font-extrabold tracking-wide uppercase px-1 py-0.2 bg-amber-500 text-black rounded">
                        Danas
                      </span>
                    )}
                  </div>

                  {/* Badges or Dot indicators for events inside this cell */}
                  <div className="mt-1 space-y-0.5 overflow-hidden w-full">
                    {dayEvents.slice(0, 2).map((ev) => {
                      let catColor = 'bg-blue-500';
                      if (ev.category === 'Sastanak') catColor = 'bg-amber-500';
                      if (ev.category === 'Štand') catColor = 'bg-purple-500';
                      if (ev.category === 'Prikupljanje potpisa') catColor = 'bg-rose-500';
                      if (ev.category === 'Obuka kontrolora') catColor = 'bg-sky-500';
                      if (ev.category === 'Obuka vdv volontera') catColor = 'bg-teal-500';
                      if (ev.category === 'Drugo') catColor = 'bg-emerald-500';

                      return (
                        <div 
                          key={ev.id} 
                          className="flex items-center gap-1 text-[8px] font-medium leading-none text-gray-200 truncate"
                        >
                          <span className={`w-1 h-1 rounded-full ${catColor} flex-shrink-0`} />
                          <span className="truncate max-w-[90%]">{ev.text}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[7px] font-extrabold text-blue-400 text-right">
                        +{dayEvents.length - 2} još
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DESNA KOLONA: ZADACI I TASKOVI (lg:col-span-4 na velikim ekranima) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="p-6 bg-[#101318] border border-[#1e222b] rounded-2xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-[#1e222b] pb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Zadaci / Taskovi
              </h3>
            </div>
            
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-600/10 text-blue-400 rounded-lg">
              Notion stil
            </span>
          </div>

          {/* Stats Progress Bar */}
          <div className="space-y-1.5 bg-[#161a22] border border-[#232935] p-3.5 rounded-xl">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-gray-400">Progres zadataka</span>
              <span className="text-white">{completedCount} od {totalTasksCount} ({progressPercent}%)</span>
            </div>
            <div className="w-full h-1.5 bg-[#101318] rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* New Task Entry Input */}
          <form onSubmit={handleAddTask} className="space-y-3 p-3 bg-[#161a22]/30 border border-[#232935]/50 rounded-xl">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#9aa3b2] uppercase tracking-wider">Novi zadatak</label>
              <input
                type="text"
                required
                placeholder="Napišite šta treba uraditi..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-[#9aa3b2] uppercase tracking-wider block">Prioritet</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setNewTaskPriority('high')}
                  className={`flex-1 py-1 text-[9px] font-extrabold uppercase rounded-lg border transition-all ${
                    newTaskPriority === 'high'
                      ? 'bg-red-500/15 border-red-500 text-red-400'
                      : 'bg-transparent border-[#232935] text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Visok
                </button>
                <button
                  type="button"
                  onClick={() => setNewTaskPriority('medium')}
                  className={`flex-1 py-1 text-[9px] font-extrabold uppercase rounded-lg border transition-all ${
                    newTaskPriority === 'medium'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                      : 'bg-transparent border-[#232935] text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Srednji
                </button>
                <button
                  type="button"
                  onClick={() => setNewTaskPriority('low')}
                  className={`flex-1 py-1 text-[9px] font-extrabold uppercase rounded-lg border transition-all ${
                    newTaskPriority === 'low'
                      ? 'bg-blue-500/15 border-blue-500 text-blue-400'
                      : 'bg-transparent border-[#232935] text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Nizak
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dodaj zadatak</span>
            </button>
          </form>

          {/* List of Tasks */}
          <div className="pt-2 border-t border-[#1e222b] space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-[#9aa3b2] italic text-xs space-y-1">
                <Sparkles className="w-6 h-6 mx-auto text-gray-600" />
                <p>Nema unetih zadataka.</p>
                <p className="text-[10px]">Unesite novi zadatak iznad.</p>
              </div>
            ) : (
              tasks.map((task) => {
                let priorityColor = 'text-blue-400';
                let priorityText = 'Nizak';
                let priorityBg = 'bg-blue-500/5';
                
                if (task.priority === 'high') {
                  priorityColor = 'text-red-400';
                  priorityText = 'Visok';
                  priorityBg = 'bg-red-500/5';
                } else if (task.priority === 'medium') {
                  priorityColor = 'text-amber-400';
                  priorityText = 'Srednji';
                  priorityBg = 'bg-amber-500/5';
                }

                return (
                  <div 
                    key={task.id} 
                    className={`p-3 bg-[#161a22] border border-[#232935] rounded-xl flex items-start gap-2.5 transition-all group ${
                      task.completed ? 'opacity-55' : ''
                    } ${priorityBg}`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 text-gray-400 hover:text-blue-400 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    {/* Task Text & Priority Info */}
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className={`text-xs font-semibold text-white leading-snug break-words ${
                        task.completed ? 'line-through text-gray-500 font-medium' : ''
                      }`}>
                        {task.text}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] font-semibold text-[#9aa3b2]">
                        <span className={`font-bold ${priorityColor}`}>
                          {priorityText} prioritet
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {task.dateAdded}
                        </span>
                        <span>•</span>
                        <span className="text-blue-400">Dodao: {task.addedBy || 'Kaluđer'}</span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-[#9aa3b2] hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-white/5 cursor-pointer"
                      title="Obriši zadatak"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* 3. CALENDAR DATE DETAILS MODAL POPUP (POJAVLJUJE SE KLIKOM NA BILO KOJI DATUM) */}
      {selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          
          {/* Modal Box */}
          <div className="w-full max-w-xl bg-[#0e1116] border border-[#1e222b] rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-[#12161f] border-b border-[#1e222b]">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="text-[10px] font-bold text-[#9aa3b2] uppercase tracking-wider">Plan za odabrani datum</h4>
                  <p className="text-xs font-bold text-white">
                    {new Date(selectedDateStr).toLocaleDateString('sr-RS', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedDateStr(null)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                title="Zatvori"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* List of actions/events */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Planirane aktivnosti za ovaj dan
                </span>
                
                {events.filter(e => e.date === selectedDateStr).length === 0 ? (
                  <div className="p-4 bg-[#161a22]/30 border border-[#232935]/50 rounded-xl text-center">
                    <p className="text-xs text-[#9aa3b2] italic">Nema zakazanih aktivnosti za ovaj dan.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events
                      .filter(e => e.date === selectedDateStr)
                      .map(ev => {
                        let catBg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                        if (ev.category === 'Sastanak') catBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                        if (ev.category === 'Štand') catBg = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                        if (ev.category === 'Prikupljanje potpisa') catBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                        if (ev.category === 'Obuka kontrolora') catBg = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                        if (ev.category === 'Obuka vdv volontera') catBg = 'bg-teal-500/10 text-teal-400 border-teal-500/20';
                        if (ev.category === 'Drugo') catBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                        return (
                          <div 
                            key={ev.id} 
                            className="p-3 bg-[#161a22] border border-[#232935] rounded-xl flex items-center justify-between gap-3 group"
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${catBg}`}>
                                  {ev.category || 'Drugo'}
                                </span>
                                <span className="text-[9px] font-semibold text-[#9aa3b2]">
                                  Dodao: <span className="text-blue-400">{ev.addedBy || 'Kaluđer'}</span>
                                </span>
                              </div>
                              
                              {editingEventId === ev.id ? (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <input
                                    type="text"
                                    value={editingEventText}
                                    onChange={(e) => setEditingEventText(e.target.value)}
                                    className="px-2.5 py-1 text-xs bg-[#101318] border border-blue-500 rounded-lg text-white focus:outline-none flex-1"
                                  />
                                  <button
                                    onClick={() => handleSaveEditEvent(ev.id)}
                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-[10px] font-semibold text-white rounded-lg transition-colors cursor-pointer"
                                  >
                                    Sačuvaj
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs font-semibold text-white">{ev.text}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {editingEventId !== ev.id && (
                                <button
                                  onClick={() => handleStartEditEvent(ev)}
                                  className="p-1 text-[#9aa3b2] hover:text-white rounded hover:bg-white/5 cursor-pointer"
                                  title="Izmeni"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteEvent(ev.id)}
                                className="p-1 text-red-400 hover:bg-red-500/10 rounded cursor-pointer"
                                title="Obriši akciju"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </div>

              {/* Form to add calendar event */}
              <form onSubmit={handleAddEvent} className="pt-4 border-t border-[#1e222b] space-y-3">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Plus className="w-3 h-3 text-blue-400" />
                  <span>Dodaj akciju na ovaj dan</span>
                </h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      required
                      placeholder="Unesite opis akcije (npr. Podela flajera)"
                      value={newEventText}
                      onChange={(e) => setNewEventText(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#161a22] border border-[#232935] rounded-xl text-white focus:outline-none cursor-pointer"
                    >
                      <option value="VDV">VDV akcija</option>
                      <option value="Sastanak">Sastanak</option>
                      <option value="Štand">Štand / Promo</option>
                      <option value="Prikupljanje potpisa">Prikupljanje potpisa</option>
                      <option value="Obuka kontrolora">Obuka kontrolora</option>
                      <option value="Obuka vdv volontera">Obuka vdv volontera</option>
                      <option value="Drugo">Drugo</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Sačuvaj akciju</span>
                </button>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#12161f] border-t border-[#1e222b] flex justify-end">
              <button
                onClick={() => setSelectedDateStr(null)}
                className="px-4 py-1.5 bg-[#161a22] hover:bg-white/5 text-xs font-semibold text-gray-400 hover:text-white rounded-xl border border-[#232935] transition-colors cursor-pointer"
              >
                Zatvori prozor
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
