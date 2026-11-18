import React, { useState } from 'react';
import {
  BookOpen,
  Video,
  Printer,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  Clock,
  ShieldCheck,
  Building2,
  Key,
  Flame,
  Dumbbell,
  HeartPulse,
  Sparkles,
  Info,
  Check,
  FileText,
} from 'lucide-react';
import { MoaLogo } from '../../components/MoaLogo';

interface VideoGuide {
  id: string;
  title: string;
  amharicTitle: string;
  category: 'Cardio' | 'Strength' | 'Mobility' | 'Beginner';
  duration: string;
  instructor: string;
  targetMuscles: string;
  thumbnailUrl: string;
  videoUrl?: string;
  description: string;
  keyCues: string[];
  mistakesToAvoid: string[];
}

const VIDEO_GUIDES: VideoGuide[] = [
  {
    id: 'vid-1',
    title: 'Treadmill & Elliptical Calibration, Incline & Emergency Stop',
    amharicTitle: 'የትሬድሚል አጠቃቀም እና የአደጋ መከላከያ ቅንብር',
    category: 'Cardio',
    duration: '4:20 min',
    instructor: 'Coach Henok (Gym Attendant)',
    targetMuscles: 'Cardiovascular, Quads, Calves',
    thumbnailUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=600&q=80',
    description: 'Learn how to safely step onto the treadmill, clip the magnetic emergency safety lanyard to your waist, calibrate walking/running speed, and adjust incline for joint-friendly cardio.',
    keyCues: [
      'Always stand with feet on the side rails before pressing Start.',
      'Clip the red safety lanyard to your waistband or shirt hem.',
      'Maintain an upright posture and avoid leaning heavily on handrails.',
      'Allow the belt to come to a complete stop before stepping off.',
    ],
    mistakesToAvoid: [
      'Never step onto a moving belt at full speed.',
      'Do not look down at your phone while running at high speeds.',
    ],
  },
  {
    id: 'vid-2',
    title: 'Safe Squats & Deadlifts: Neutral Spine & Hip Hinge',
    amharicTitle: 'ትክክለኛ የክብደት ማንሳት እና የወገብ ደህንነት',
    category: 'Strength',
    duration: '6:45 min',
    instructor: 'Coach Henok (Gym Attendant)',
    targetMuscles: 'Hamstrings, Glutes, Lumbar Spine, Core',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
    description: 'Master the fundamental hip hinge movement pattern to safely lift free weights without stressing your lower back or knees.',
    keyCues: [
      'Feet shoulder-width apart with toes turned slightly outward (10-15 degrees).',
      'Brace your abdominal core as if expecting a punch before every descent.',
      'Keep your chest proud and spine neutral from cervical to sacrum.',
      'Drive evenly through the mid-foot and heel on the upward drive.',
    ],
    mistakesToAvoid: [
      'Do not round your lower back when lifting off the floor.',
      'Never lift heavy barbell weights without collar safety clips.',
    ],
  },
  {
    id: 'vid-3',
    title: 'Desk Worker Posture: Relieving Neck, Shoulder & Lower Back Tension',
    amharicTitle: 'የቢሮ ሰራተኞች የአንገት እና የወገብ ማፍታቻ',
    category: 'Mobility',
    duration: '5:10 min',
    instructor: 'Trainer Bethel (Wellness Team)',
    targetMuscles: 'Cervical Spine, Trapezius, Hip Flexors, Pectorals',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    description: 'Tailored specifically for Ministry of Agriculture civil servants spending long hours at computers. Opens tight hip flexors and restores cervical spine posture.',
    keyCues: [
      'Couch stretch against the wall for 45 seconds per hip flexor.',
      'Band pull-aparts to retract scapulae and counter hunched shoulders.',
      'Gentle chin tucks to align cervical vertebrae.',
      'Deep diaphragmatic breathing to release postural tension.',
    ],
    mistakesToAvoid: [
      'Avoid jerking or forcing the neck into sudden rotations.',
      'Do not hold your breath during stretching sequences.',
    ],
  },
  {
    id: 'vid-4',
    title: 'Lat Pulldown & Seated Cable Row: Proper Back Contraction',
    amharicTitle: 'የጀርባ ጡንቻ ማጎልበቻ ማሽን አጠቃቀም',
    category: 'Strength',
    duration: '4:30 min',
    instructor: 'Coach Tigist',
    targetMuscles: 'Latissimus Dorsi, Rhomboids, Biceps',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    description: 'Adjust the thigh pads on the lat pulldown machine and maintain proper elbow path to target your back rather than overloading your wrists and elbows.',
    keyCues: [
      'Adjust thigh roller pads so your thighs are snugly locked under the rollers.',
      'Grip the bar slightly wider than shoulder-width with palms facing away.',
      'Pull the bar down toward upper chest while depressing shoulder blades.',
      'Control the return weight stack; do not let it slam.',
    ],
    mistakesToAvoid: [
      'Do not swing your entire torso back and forth like a pendulum.',
      'Never pull the bar behind your neck.',
    ],
  },
  {
    id: 'vid-5',
    title: 'Dumbbell Chest Press & Shoulder Press Fundamentals',
    amharicTitle: 'የደረት እና ትከሻ ዳምቤል ስራዎች',
    category: 'Strength',
    duration: '5:00 min',
    instructor: 'Coach Henok',
    targetMuscles: 'Pectoralis Major, Anterior Deltoid, Triceps',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    description: 'How to safely pick up dumbbells from the rack, position them onto your knees, kick back onto the bench, and press with 45-degree flared elbows.',
    keyCues: [
      'Rest dumbbells vertically on knees before lying back on the bench.',
      'Tuck elbows at roughly 45 to 60 degrees relative to your torso.',
      'Keep feet firmly planted flat on the rubber floor for stability.',
      'When finished, bring dumbbells back to knees before sitting up.',
    ],
    mistakesToAvoid: [
      'Never drop dumbbells onto the rubber floor from high extension.',
      'Avoid letting elbows flare out at 90 degrees (protects rotator cuff).',
    ],
  },
  {
    id: 'vid-6',
    title: 'Beginner 20-Minute Express Full-Body Circuit',
    amharicTitle: 'የጀማሪዎች የ20 ደቂቃ አጠቃላይ የአካል ብቃት ልምምድ',
    category: 'Beginner',
    duration: '8:15 min',
    instructor: 'Trainer Bethel',
    targetMuscles: 'Full Body Cardiovascular & Muscular Endurance',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    description: 'An efficient 4-station circuit designed for MoA staff who want a complete, balanced workout in under 25 minutes during morning or evening shifts.',
    keyCues: [
      'Station 1: 5 minutes warm-up on stationary bicycle.',
      'Station 2: Dumbbell Goblet Squats (3 sets of 10 reps).',
      'Station 3: Seated Chest Press machine (3 sets of 12 reps).',
      'Station 4: Plank hold (3 sets of 30 seconds).',
    ],
    mistakesToAvoid: [
      'Do not rush through repetitions; focus on controlled cadence.',
      'Hydrate with water between circuit stations.',
    ],
  },
];

export const TraineeGuidesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'VIDEOS'>('MANUAL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<VideoGuide | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const filteredVideos = VIDEO_GUIDES.filter((v) => {
    if (selectedCategory !== 'ALL' && v.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !v.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !v.amharicTitle.includes(searchQuery) &&
      !v.targetMuscles.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner (Hidden on print) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Trainee Manuals & Video Training Hub
            </h1>
            <span className="text-xs font-mono font-semibold text-[#00843D] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              የስልጠና መመሪያዎች
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official Ministry of Agriculture fitness center guidelines, safety SOP, locker rules, and video exercise tutorials.
          </p>
        </div>

        {/* Tab switcher & Print Button */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('MANUAL')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'MANUAL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-[#00843D]" />
              <span>Handbook SOP</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('VIDEOS')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'VIDEOS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="h-3.5 w-3.5 text-moa-gold" />
              <span>Video Hub ({VIDEO_GUIDES.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 h-8.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-[6px] shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TRAINEE MANUAL & OPERATING STANDARD (Printable Handbook)            */}
      {/* ========================================================================= */}
      {activeTab === 'MANUAL' && (
        <div className="space-y-6">
          {/* Printable Official Document Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10 space-y-8">
            {/* Header Document Block */}
            <div className="border-b-2 border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <MoaLogo className="h-16 w-16 text-[#00843D] shrink-0" size={64} />
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Federal Democratic Republic of Ethiopia
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    MINISTRY OF AGRICULTURE
                  </h2>
                  <div className="text-sm font-bold text-[#00843D]">
                    Staff Wellness & Fitness Gymnasium — Trainee Handbook & SOP
                  </div>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 text-xs text-slate-500 space-y-1 font-mono">
                <div>DOC NO: <strong className="text-slate-900">MoA-GYM-SOP-2026/01</strong></div>
                <div>VERSION: <strong className="text-slate-900">2.4 (Active)</strong></div>
                <div>FACILITY: <strong className="text-slate-900">HQ Wellness Wing</strong></div>
                <div>INTERCOM: <strong className="text-slate-900">Ext. 4410</strong></div>
              </div>
            </div>

            {/* Quick Summary Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <Clock className="h-4 w-4 text-[#00843D]" />
                  <span>Two Daily Shifts</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  <strong>ጠዋት / Morning:</strong> 11:00 – 1:30 E.C. (6:00 – 8:30 AM)<br />
                  <strong>ማታ / Evening:</strong> 11:30 – 3:00 E.C. (5:30 – 9:00 PM)
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <Key className="h-4 w-4 text-amber-700" />
                  <span>Locker Keys (1–40)</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Issued upon check-in at gate terminal. <strong>Day-use only</strong>; must be returned before exiting facility.
                </div>
              </div>

              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                  <ShieldCheck className="h-4 w-4 text-blue-700" />
                  <span>Mandatory Hygiene</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Personal sweat towel required. Indoor clean athletic sneakers only. Wipe down stations after each set.
                </div>
              </div>
            </div>

            {/* Section 1: Introduction & Mission */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-[#00843D] text-white flex items-center justify-center text-xs font-mono font-bold">1</span>
                Mission & Scope of Facility
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Ministry of Agriculture Staff Wellness & Fitness Gymnasium is an institutional health facility dedicated exclusively to promoting cardiovascular health, muscular fitness, mental well-being, and work-life balance for MoA employees. All active civil servants and verified staff who have claimed their digital membership pass are eligible to train during their assigned shift.
              </p>
            </section>

            {/* Section 2: Gate Check-in & Entry Protocol */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-[#00843D] text-white flex items-center justify-center text-xs font-mono font-bold">2</span>
                Gate Access & Verification Protocol
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00843D] shrink-0 mt-0.5" />
                  <span><strong>Digital Pass Scanning:</strong> Present your permanent QR code (from your phone screen or printed pass) to the desk scanner at the entrance gate.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00843D] shrink-0 mt-0.5" />
                  <span><strong>Physical ID Verification:</strong> In the absence of a digital pass, present your official MoA Employee ID card for manual terminal verification by the gym attendant.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00843D] shrink-0 mt-0.5" />
                  <span><strong>Departure Check-Out:</strong> Always scan out or click "Check Out" on your portal when leaving. This frees your locker and keeps accurate occupancy records.</span>
                </li>
              </ul>
            </section>

            {/* Section 3: Locker Assignment Policy */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-[#00843D] text-white flex items-center justify-center text-xs font-mono font-bold">3</span>
                Locker Usage & Personal Belongings Policy
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
                <p>
                  <strong>1. Temporary Session Use Only:</strong> Lockers numbered 1 through 40 are provided solely for temporary storage during an active workout session.
                </p>
                <p>
                  <strong>2. Key Custody:</strong> The brass locker key issued to you at the front desk is your responsibility. Lost keys incur a 300 ETB lock replacement fee.
                </p>
                <p>
                  <strong>3. No Overnight Storage:</strong> At the close of each day (09:15 PM), all lockers are audited and cleared by the gym attendant and security committee. Unclaimed items will be transferred to security lost-and-found.
                </p>
                <p>
                  <strong>4. Valuables:</strong> While the facility has 24/7 gate security, the Ministry assumes no liability for large sums of cash, laptops, or high-value personal jewelry left unattended.
                </p>
              </div>
            </section>

            {/* Section 4: Gym Floor Etiquette & Hygiene Rules */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-[#00843D] text-white flex items-center justify-center text-xs font-mono font-bold">4</span>
                Floor Etiquette, Attire & Hygiene Standards
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Footwear & Sportswear
                  </div>
                  <p>Proper athletic footwear with rubber non-marking soles is mandatory. Sandals, bare feet, leather office dress shoes, or open-toe shoes are strictly barred.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Personal Towel Rule
                  </div>
                  <p>Every trainee must carry a sweat towel. Lay your towel over leather machine seats and bench surfaces before lying or sitting down.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Re-Racking Weights
                  </div>
                  <p>Always return dumbbells, weight plates, and barbell collars to their numbered rack positions immediately after completing your sets. Do not leave plates on the floor.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Machine Sharing & Rest Periods
                  </div>
                  <p>Allow fellow colleagues to work in between sets during peak shift hours. Avoid sitting on equipment scrolling mobile phones while others wait.</p>
                </div>
              </div>
            </section>

            {/* Section 5: Safe Equipment Operation */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-[#00843D] text-white flex items-center justify-center text-xs font-mono font-bold">5</span>
                Safe Equipment Operation Guide
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60">
                  <strong className="text-amber-950">Treadmill Safety Stop:</strong> The red magnetic clip must be attached to your waistband. In the event of a stumble or dizziness, the detachment will immediately kill power to the motor and prevent injury.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900">Barbell Spring Collars:</strong> When performing bench press, barbell squats, or overhead presses, spring clips must be fastened on both ends of the barbell to prevent unbalanced plate slides.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900">Pin-Selected Machines:</strong> Ensure selector pins are fully pushed in until they click flush against the weight stack plate before lifting. Never hang foreign weights on selector pins.
                </div>
              </div>
            </section>

            {/* Section 6: Emergency & Medical Support */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-[#00843D] text-white flex items-center justify-center text-xs font-mono font-bold">6</span>
                Emergency, First Aid & Attendant Contacts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-900">First Aid Station</div>
                  <div className="text-slate-500 mt-0.5">Located at the Front Desk counter next to Locker #01. Includes ice packs, bandages, and burn dressings.</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-900">Desk Intercom</div>
                  <div className="text-slate-500 mt-0.5">Internal Extension <strong>4410</strong> / Security Gate <strong>4400</strong>. Call immediately for medical assistance.</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-900">Equipment Defects</div>
                  <div className="text-slate-500 mt-0.5">Report frayed cables or loose bolts immediately to Coach Henok or any desk attendant. Do not operate defective gear.</div>
                </div>
              </div>
            </section>

            {/* Sign-off Footer */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
              <div>Approved by: <strong>Ministry of Agriculture Staff Welfare & Health Committee</strong></div>
              <div>Published: <strong>October 2026</strong> · Addis Ababa, Ethiopia</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CURATED VIDEO TRAINING HUB                                         */}
      {/* ========================================================================= */}
      {activeTab === 'VIDEOS' && (
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercise tutorials (e.g. treadmill, squats, posture)..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00843D] text-slate-900"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', 'Beginner', 'Cardio', 'Strength', 'Mobility'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#00843D] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Guides' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Video Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Video Thumbnail with Play Button */}
                  <div
                    onClick={() => setActiveVideo(guide)}
                    className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={guide.thumbnailUrl}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

                    {/* Play Badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#00843D]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#00843D] transition-transform">
                        <Play className="h-5 w-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold">
                      {guide.duration}
                    </div>

                    {/* Category pill */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#00843D] text-white text-[10px] font-bold uppercase tracking-wider">
                      {guide.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00843D] transition-colors leading-snug">
                      {guide.title}
                    </h3>
                    <div className="text-xs font-semibold text-emerald-800">
                      {guide.amharicTitle}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {guide.description}
                    </p>

                    <div className="pt-2 text-[11px] text-slate-500 font-mono">
                      Target: <span className="font-semibold text-slate-700">{guide.targetMuscles}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {guide.instructor}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveVideo(guide)}
                    className="px-3 h-7.5 text-xs font-semibold text-white bg-[#00843D] hover:bg-[#007033] rounded-[6px] shadow-2xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Watch Guide</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIDEO DETAIL & PLAYER MODAL                                               */}
      {/* ========================================================================= */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00843D] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {activeVideo.category} · {activeVideo.duration}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {activeVideo.title}
                </h2>
                <div className="text-xs font-semibold text-emerald-800">
                  {activeVideo.amharicTitle}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Simulated Video Player with Poster & Controls */}
            <div className="mt-4 relative aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-inner">
              <img
                src={activeVideo.thumbnailUrl}
                alt={activeVideo.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center text-center p-6 text-white space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#00843D] text-white flex items-center justify-center shadow-xl ring-4 ring-white/20 animate-pulse">
                  <Play className="h-6 w-6 fill-white ml-1" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-200">Interactive Video Guide Demo</div>
                  <div className="text-sm font-bold text-white mt-0.5">{activeVideo.title}</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Guided by {activeVideo.instructor} · Full HD 1080p MoA Intranet Stream
                  </div>
                </div>
              </div>

              {/* Video control bar simulation */}
              <div className="absolute bottom-0 inset-x-0 bg-black/80 p-2.5 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2">
                  <Play className="h-3.5 w-3.5 fill-white cursor-pointer" />
                  <span className="text-[10px] font-mono text-slate-300">01:14 / {activeVideo.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-400">1080p HQ</span>
                </div>
              </div>
            </div>

            {/* Step-by-Step Key Form Cues */}
            <div className="mt-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00843D]" />
                  <span>Key Execution Cues & Posture Checklist</span>
                </h4>
                <div className="space-y-1.5">
                  {activeVideo.keyCues.map((cue, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="h-4 w-4 rounded-full bg-[#00843D] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{cue}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mistakes to Avoid */}
              <div>
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span>Common Safety Pitfalls & Mistakes to Avoid</span>
                </h4>
                <div className="space-y-1.5">
                  {activeVideo.mistakesToAvoid.map((mistake, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-rose-800 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200">
                      <span className="text-rose-600 font-bold shrink-0">✕</span>
                      <span>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Target: <strong>{activeVideo.targetMuscles}</strong>
              </span>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="px-4 h-8.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[6px] transition cursor-pointer"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
