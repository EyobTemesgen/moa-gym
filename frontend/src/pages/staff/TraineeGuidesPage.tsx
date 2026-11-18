import React, { useState } from 'react';
import {
  Video,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface VideoGuide {
  id: string;
  title: string;
  amharicTitle: string;
  category: 'Cardio' | 'Strength' | 'Mobility' | 'Beginner';
  isAmharicAudio: boolean;
  duration: string;
  instructor: string;
  amharicInstructor: string;
  targetMuscles: string;
  amharicTargetMuscles: string;
  thumbnailUrl: string;
  youtubeSearchTerm: string;
  description: string;
  amharicDescription: string;
  amharicCues: string[];
  englishCues: string[];
  amharicMistakes: string[];
  englishMistakes: string[];
}

const VIDEO_GUIDES: VideoGuide[] = [
  {
    id: 'vid-amharic-beginner',
    title: 'Gym Beginner Starter Guide: Machine Settings, Posture & Safe Lifting',
    amharicTitle: 'የጂም አጀማመር እና የመሳሪያዎች አጠቃቀም መመሪያ',
    category: 'Beginner',
    isAmharicAudio: true,
    duration: '6:20 min',
    instructor: 'Henok (Facility Attendant)',
    amharicInstructor: 'ሄኖክ (የግብርና ሚኒስቴር ጂም)',
    targetMuscles: 'Full Body, Machine Calibration & Core Stability',
    amharicTargetMuscles: 'ሙሉ አካል፣ የማሽን አጠቃቀም እና የወገብ ደህንነት',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    youtubeSearchTerm: 'የጅምናዚየም ስፖርት አሰራር ለጀማሪዎች በአማርኛ gym workout amharic',
    description: 'A comprehensive beginner walkthrough in Amharic covering how to adjust pin-selected machines, calibrate seat height, and breathe properly during lifts.',
    amharicDescription: 'ለአዲስ ሰልጣኞች የተዘጋጀ የአማርኛ መመሪያ፡ ማሽኖችን እንዴት ከቁመት ጋር ማስተካከል እንደሚቻል፣ የደህንነት ፒኖች አጠቃቀም እና የመተንፈስ ስርዓት።',
    amharicCues: [
      'ማንኛውንም ማሽን ከመጠቀምዎ በፊት መቀመጫውን ከቁመትዎ ጋር አስተካክለው ይቆልፉ።',
      'የክብደት መምረጫ ፒኑ (weight stack pin) ሙሉ በሙሉ ወደ ውስጥ መግባቱን ያረጋግጡ።',
      'ክብደቱን ወደ ላይ ሲገፉ እስትንፋስዎን ወደ ውጭ ያውጡ (Exhale)፤ ሲመልሱ ወደ ውስጥ ይሳቡ (Inhale)።',
      'ከስራ በፊት ለ5–10 ደቂቃ በእግር ወይም በብስክሌት ማሟሟቅ የግድ ነው።',
      'ስራዎን ሲጨርሱ ክብደቶቹን በየቦታቸው ይመልሱ።',
    ],
    englishCues: [
      'Adjust seat height and pad alignment before loading weights.',
      'Ensure the selector pin is fully inserted into the stack plate.',
      'Exhale on concentric exertion, inhale on controlled eccentric return.',
      'Always warm up with 5-10 minutes of light cardio before lifting.',
      'Re-rack weights and dumbbells to numbered holders after each set.',
    ],
    amharicMistakes: [
      'ያለ ማሟሟቂያ በከባድ ክብደት አይጀምሩ።',
      'የመተንፈስ ስርዓትዎን አይግቱ (Never hold your breath)።',
      'ክብደቶችን በሃይል አያጋጩ (Do not slam the weight stacks)።',
    ],
    englishMistakes: [
      'Never skip the 5-minute pre-lift warm-up.',
      'Do not hold your breath during repetitions.',
      'Avoid letting the weight stack slam on the eccentric descent.',
    ],
  },
  {
    id: 'vid-amharic-abs',
    title: 'Belly Fat Reduction & Core Toning Exercises (Meski Fitness Amharic)',
    amharicTitle: 'ቦርጭን ለማጥፋት እና የሆድ ጡንቻን ለማጠንከር',
    category: 'Cardio',
    isAmharicAudio: true,
    duration: '8:30 min',
    instructor: 'Meski Fitness (Ethiopian Home & Gym Routine)',
    amharicInstructor: 'ኢንስትራክተር ምስኪ (Meski Fitness)',
    targetMuscles: 'Rectus Abdominis, Obliques, Transverse Core',
    amharicTargetMuscles: 'የሆድ ጡንቻዎች፣ ጎንና ወገብ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
    youtubeSearchTerm: 'ቦርጭን ለማጥፋት የሚረዱ ቀላል ስፖርታዊ እንቅስቃሴዎች meski fitness',
    description: 'Proven core toning and abdominal exercises taught in Amharic, focusing on plank alignment, knee drives, and pelvic tilts without back strain.',
    amharicDescription: 'በቀላል የሆድ እና የወገብ ስፖርቶች አማካኝነት የሆድ ስብን ለማቅለጥ እና ወገብን ለማጠንከር የሚረዳ የአማርኛ ስልጠና።',
    amharicCues: [
      'የፕላንክ (Plank) እንቅስቃሴ ላይ ወገብ ሳይወላገድ ሰውነትን እንደ ሳንቃ ቀጥ ማድረግ።',
      'እግሮችን ወደ ላይ በማንሳት (Leg Raises) የታችኛውን የሆድ ጡንቻ ማነቃቃት።',
      'በእያንዳንዱ ድግግሞሽ ላይ የሆድ ጡንቻን በደንብ ማጥበቅ (Engaging the core)።',
      'መተንፈስን ሳያቋርጡ በረጋ መንፈስ መስራት።',
    ],
    englishCues: [
      'Maintain a neutral spine and rigid core during planks.',
      'Focus on slow, controlled hip flexor and lower abdominal contraction.',
      'Breathe rhythmically throughout each set.',
    ],
    amharicMistakes: [
      'በሆድ ስፖርት ወቅት አንገትን በእጅ በሃይል ወደ ፊት መጎተት የለብዎትም።',
      'ወገብን ወደ ታች ማዘንበል (Sagging hips) የታችኛውን ጀርባ ይጎዳል።',
    ],
    englishMistakes: [
      'Never yank your cervical neck with your hands during crunches.',
      'Do not allow hips to sag during plank holds.',
    ],
  },
  {
    id: 'vid-amharic-aerobics',
    title: 'Aerobic Dance & High-Energy Cardio for Weight Loss & Heart Health',
    amharicTitle: 'የኤሮቢክስ እንቅስቃሴ ለጤና እና ክብደት መቀነስ',
    category: 'Cardio',
    isAmharicAudio: true,
    duration: '12:45 min',
    instructor: 'Instructor Netsanet Kassa (Aerobics Lead)',
    amharicInstructor: 'ኢንስትራክተር ነፃነት ካሳ (የኤሮቢክስ ዋና አሰልጣኝ)',
    targetMuscles: 'Cardiovascular System, Leg Stamina, Agility',
    amharicTargetMuscles: 'የልብ ጤንነት፣ የእግር ጥንካሬ እና ሙሉ ቅልጥፍና',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    youtubeSearchTerm: 'የኤሮቢክስ እንቅስቃሴ ለጤና እና ክብደት መቀነስ ነፃነት ካሳ',
    description: 'High-energy Ethiopian aerobics routine featuring guided Amharic instructions, stepping choreography, and heart-rate elevating movements.',
    amharicDescription: 'ልብን እና ሳንባን የሚያጠነክር፣ የሰውነት ቅልጥፍናን የሚጨምር እና ከፍተኛ ካሎሪ የሚያቃጥል የኤሮቢክስ ልምምድ በአማርኛ።',
    amharicCues: [
      'የሙዚቃውን ምት ተከትሎ በእግር ጫፍ እና ተረከዝ በቅደም ተከተል ማረፍ።',
      'የእጅ እና የእግር እንቅስቃሴዎችን በማቀናጀት የልብ ምትን በደረጃ ማሳደግ።',
      'እንቅስቃሴውን በድንገት ሳያቋርጡ በዝግታ ወደ ማቀዝቀዝ (Cool down) መሸጋገር።',
      'በየ15 ደቂቃው በትንሹ ውሃ መጠጣት።',
    ],
    englishCues: [
      'Land softly from ball of foot to heel to protect knees and ankles.',
      'Synchronize arm reaches with foot steps to maximize cardiovascular output.',
      'Sip small amounts of water during designated hydration breaks.',
    ],
    amharicMistakes: [
      'በተንሸራታች ወለል ላይ ያለ ተገቢ የስፖርት ጫማ አለመስራት።',
      'እንቅስቃሴውን በድንገት አቁሞ አለመቀመጥ (Always cool down gradually)።',
    ],
    englishMistakes: [
      'Never train on slippery floors without proper grip sneakers.',
      'Avoid abruptly sitting down right after high-intensity cardio.',
    ],
  },
  {
    id: 'vid-amharic-chest',
    title: 'Proper Chest Workout Form: Barbell Bench Press & Dumbbell Press',
    amharicTitle: 'ትክክለኛ የደረት ስፖርት አሰራር (ቤንች ፕሬስ እና ዳምቤል)',
    category: 'Strength',
    isAmharicAudio: true,
    duration: '7:15 min',
    instructor: 'Tsegaye (Ethio Fitness Guide)',
    amharicInstructor: 'ፀጋዬ (የአካል ብቃት ቪዲዮ መመሪያ)',
    targetMuscles: 'Pectoralis Major, Anterior Deltoid, Triceps',
    amharicTargetMuscles: 'የደረት ጡንቻዎች፣ የትከሻ ፊት እና እጅ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
    youtubeSearchTerm: 'የደረት ስፖርት አሰራር በአማርኛ chest workout amharic',
    description: 'Detailed Amharic tutorial on barbell bench pressing, elbow alignment, shoulder blade retraction, and avoiding rotator cuff injuries.',
    amharicDescription: 'ደረትና ትከሻ ሳይጎዳ ትክክለኛውን የቤንች ፕሬስ አሰራር፣ የክርን ማዕዘን እና የዳምቤል አያያዝን የሚያሳይ ጠቃሚ የአማርኛ ማብራሪያ።',
    amharicCues: [
      'ጀርባዎን በቤንቹ ላይ በማሳረፍ ደረትዎን ወደ ፊት አውጥተው ይተኙ።',
      'ክርንዎን ከሰውነትዎ በ45 ዲግሪ ማዕዘን ይያዙ (ትከሻ እንዳይጎዳ)።',
      'ባርቤሉን እስከ ደረትዎ ድረስ በቁጥጥር ዝቅ ያድርጉት።',
      'ወደ ላይ ሲገፉ እጆችን ሙሉ በሙሉ ሳያስረሱ ግፊቱን ደረት ላይ ማቆየት።',
    ],
    englishCues: [
      'Retract scapulae and plant feet firmly flat on the floor.',
      'Keep elbows at a 45-degree angle rather than flared 90 degrees.',
      'Lower the barbell under full control to mid-sternum.',
    ],
    amharicMistakes: [
      'ባርቤሉን ደረት ላይ አበርትቶ መምታት (Bouncing off the chest) በጥብቅ የተከለከለ ነው።',
      'ያለ መቆለፊያ ስፕሪንግ (Barbell Collars) ከባድ ክብደት አለማንሳት።',
    ],
    englishMistakes: [
      'Never bounce the barbell off your sternum.',
      'Do not lift without spring collar safety clips on barbell ends.',
    ],
  },
  {
    id: 'vid-amharic-squat',
    title: 'Safe Squats & Deadlifts: Neutral Spine & Knee Protection',
    amharicTitle: 'ትክክለኛ የስኳት አሰራር (ወገብ እና ጉልበት ሳይጎዳ)',
    category: 'Strength',
    isAmharicAudio: true,
    duration: '6:45 min',
    instructor: 'Henok (Facility Attendant)',
    amharicInstructor: 'ሄኖክ (የግብርና ሚኒስቴር ጂም)',
    targetMuscles: 'Quadriceps, Hamstrings, Gluteus, Lumbar Core',
    amharicTargetMuscles: 'የታችኛው እግር፣ ጭን፣ ዳሌ እና የታችኛው ወገብ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    youtubeSearchTerm: 'ትክክለኛ የስኳት አሰራር በአማርኛ squat deadlift amharic',
    description: 'Learn how to protect your lumbar spine and knees while performing squats and deadlifts in the Ministry gym facility.',
    amharicDescription: 'የታችኛውን የሰውነት ክፍል ለማጠንከር በሚሰራበት ጊዜ ወገብ እንዳይታጠፍ እና ጉልበት እንዳይጎዳ የሚደረጉ ወሳኝ ጥንቃቄዎች።',
    amharicCues: [
      'እግርዎን በትከሻዎ ስፋት ልክ አስቀምጠው ጣቶችዎን በትንሹ ወደ ውጭ ያዙሩ።',
      'ወደ ታች ሲወርዱ ወንበር ላይ እንደሚቀመጥ ሰው ዳሌዎን ወደ ኋላ ይግፉ።',
      'ጉልበትዎ ወደ ውስጥ እንዳይሰበሰብ ወደ ውጭ ይግፉት።',
      'ቀጥ ያለ ጀርባ እና ጠንካራ ሆድ ይያዙ።',
    ],
    englishCues: [
      'Set stance shoulder-width with toes angled outward 10-15 degrees.',
      'Hinge hips backward as if sitting down into an invisible chair.',
      'Drive knees outward along toe track on both descent and ascent.',
    ],
    amharicMistakes: [
      'የታችኛውን ወገብ ማጉበጥ (Rounding the lumbar spine) ከባድ ጉዳት ያመጣል።',
      'ተረከዝ ከመሬት እንዲነሳ አለመፍቀድ (Keep heels planted)።',
    ],
    englishMistakes: [
      'Never round lower back when lifting from floor.',
      'Do not allow heels to lift off the rubber flooring.',
    ],
  },
  {
    id: 'vid-amharic-desk',
    title: 'Office Worker Desk Decompression: Relieving Neck, Shoulder & Hip Stiffness',
    amharicTitle: 'ለቢሮ ሰራተኞች የአንገት፣ ትከሻ እና የወገብ ማፍታቻ',
    category: 'Mobility',
    isAmharicAudio: true,
    duration: '5:10 min',
    instructor: 'Bethel (MoA Staff Wellness)',
    amharicInstructor: 'ቤቴል (የግብርና ሚኒስቴር ጤና ቡድን)',
    targetMuscles: 'Cervical Spine, Trapezius, Hip Flexors, Pectorals',
    amharicTargetMuscles: 'አንገት፣ ትከሻ፣ የላይኛው ጀርባ እና የዳሌ ጡንቻዎች',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    youtubeSearchTerm: 'የቢሮ ሰራተኞች የአንገት እና የወገብ ማፍታቻ ስፖርት',
    description: 'Tailored for civil servants spending long hours at desk computers. Decompresses tight hip flexors and restores upright posture.',
    amharicDescription: 'በግብርና ሚኒስቴር ለረጅም ሰዓታት በኮምፒውተር ለሚሰሩ ሰራተኞች የአንገት፣ የትከሻ እና የዳሌ ጡንቻዎችን ለማፍታታት የተዘጋጀ።',
    amharicCues: [
      'አንገትን በዝግታ ወደ ቀኝና ግራ በማዘንበል ለ20 ሰከንድ መያዝ።',
      'የትከሻ ጡንቻዎችን ወደ ኋላ በማሽከርከር የተጎበጠ አቋቋምን ማስተካከል።',
      'የዳሌ ጡንቻን (Hip Flexors) በመወጠር ለረጅም ሰዓት የመቀመጥን ጫና መቀነስ።',
      'ጥልቅ እስትንፋስ በመውሰድና በማውጣት ሰውነትን ማረጋጋት።',
    ],
    englishCues: [
      'Gentle chin tucks and lateral neck flexion held for 20 seconds.',
      'Scapular retractions and shoulder rolls to counter computer hunching.',
      'Half-kneeling hip flexor stretches to open anterior hip chain.',
    ],
    amharicMistakes: [
      'አንገትን በድንገት በሃይል አለማዞር።',
      'በመወጠር ወቅት እስትንፋስን አለመግታት።',
    ],
    englishMistakes: [
      'Avoid jerking or forcing the cervical vertebrae.',
      'Do not hold your breath during stretching exercises.',
    ],
  },
  {
    id: 'vid-amharic-treadmill',
    title: 'Treadmill & Cardio Calibration: Speed, Incline & Emergency Stop',
    amharicTitle: 'የትሬድሚል አጠቃቀም እና የቀይ ደህንነት ክሊፕ አስፈላጊነት',
    category: 'Cardio',
    isAmharicAudio: true,
    duration: '4:20 min',
    instructor: 'Henok (Facility Attendant)',
    amharicInstructor: 'ሄኖክ (የግብርና ሚኒስቴር ጂም)',
    targetMuscles: 'Cardiovascular, Quads, Calves',
    amharicTargetMuscles: 'የልብና የደም ዝውውር፣ ጭን እና ባት',
    thumbnailUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=600&q=80',
    youtubeSearchTerm: 'የትሬድሚል አጠቃቀም እና የአካል ብቃት እንቅስቃሴ amharic',
    description: 'Safe treadmill startup, magnetic safety lanyard attachment, speed adjustments, and joint-friendly incline walking.',
    amharicDescription: 'የትሬድሚል ፍጥነትን እንዴት ማስተካከል እንደሚቻል፣ የቀይ የአደጋ መከላከያ ክሊፕ አስፈላጊነት እና የልብ ምት ቁጥጥር።',
    amharicCues: [
      'የትሬድሚሉን ቀይ የደህንነት ክሊፕ በወገብዎ ልብስ ላይ ማሰርዎን ያረጋግጡ።',
      'በመጀመሪያ በዝቅተኛ ፍጥነት (3.0 – 4.0 ኪ.ሜ/ሰ) ለ3 ደቂቃ ማሟሟቅ።',
      'ቀጥ ብሎ መቆም እና የእጅ መደገፊያዎችን ብቻ ተደግፎ አለመስራት።',
      'ማሽኑ ሙሉ በሙሉ ሳይቆም በድንገት አይውረዱ።',
    ],
    englishCues: [
      'Always clip red emergency magnetic lanyard to waistband.',
      'Warm up at 3.0 - 4.0 km/h walking speed for 3 minutes.',
      'Maintain upright running form; avoid death-gripping handrails.',
    ],
    amharicMistakes: [
      'በከፍተኛ ፍጥነት እየሮጠ ባለ ማሽን ላይ በድንገት አለመዝለል።',
      'ስልኩን እየተመለከቱ በከፍተኛ ፍጥነት አለመሮጥ።',
    ],
    englishMistakes: [
      'Never step onto a fast-moving belt.',
      'Avoid looking down at smartphone screens while running.',
    ],
  },
];

export const TraineeGuidesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<VideoGuide | null>(null);
  const [modalLanguage, setModalLanguage] = useState<'AMHARIC' | 'ENGLISH'>('AMHARIC');

  const filteredVideos = VIDEO_GUIDES.filter((v) => {
    if (selectedCategory === 'AMHARIC' && !v.isAmharicAudio) return false;
    if (selectedCategory !== 'ALL' && selectedCategory !== 'AMHARIC' && v.category !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = v.title.toLowerCase().includes(q) || v.amharicTitle.includes(searchQuery);
      const matchInstructor = v.instructor.toLowerCase().includes(q) || v.amharicInstructor.includes(searchQuery);
      const matchMuscles = v.targetMuscles.toLowerCase().includes(q) || v.amharicTargetMuscles.includes(searchQuery);
      if (!matchTitle && !matchInstructor && !matchMuscles) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Clean Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Exercise Video Guides
            </h1>
            <span className="text-xs font-mono font-semibold text-[#00843D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              የአካል ብቃት ቪዲዮዎች
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Curated workout tutorials, equipment form guides, and office worker mobility in Amharic & English.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            {filteredVideos.length} Video Tutorials
          </span>
        </div>
      </div>

      {/* Minimal Filter & Search Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercise or body part (ደረት፣ ስኳት፣ ቦርጭ)..."
            className="w-full pl-8.5 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#00843D] text-slate-900 bg-slate-50/50"
          />
        </div>

        {/* Clean Segmented Filter Tabs matching MoA / ATS Standard */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { key: 'ALL', label: 'All Guides' },
            { key: 'AMHARIC', label: 'Amharic Audio' },
            { key: 'Beginner', label: 'Beginner' },
            { key: 'Strength', label: 'Strength' },
            { key: 'Cardio', label: 'Cardio & Abs' },
            { key: 'Mobility', label: 'Desk Mobility' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedCategory(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer select-none ${
                selectedCategory === tab.key
                  ? 'bg-[#00843D] text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clean, Refined Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((guide) => (
          <div
            key={guide.id}
            onClick={() => {
              setActiveVideo(guide);
              setModalLanguage('AMHARIC');
            }}
            className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img
                  src={guide.thumbnailUrl}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors"></div>

                {/* Centered Minimal Play Pill */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-black/60 group-hover:bg-[#00843D] text-white flex items-center justify-center shadow-md backdrop-blur-xs transition-transform group-hover:scale-110">
                    <Play className="h-4 w-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Clean Corner Duration Tag */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[10px] font-semibold">
                  {guide.duration}
                </div>

                {/* Minimal Category Pill */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/90 text-slate-800 text-[10px] font-semibold backdrop-blur-xs">
                  {guide.category}
                </div>
              </div>

              {/* Clean Content Body */}
              <div className="p-4 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00843D] transition-colors leading-snug line-clamp-1">
                  {guide.amharicTitle}
                </h3>
                <div className="text-xs text-slate-500 font-medium line-clamp-1">
                  {guide.title}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                  {guide.amharicDescription}
                </p>
              </div>
            </div>

            {/* Clean Bottom Meta Row */}
            <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate font-medium text-slate-700">
                {guide.amharicInstructor}
              </span>
              <span className="text-[#00843D] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                <span>Watch</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* CLEAN VIDEO DETAIL MODAL                                                  */}
      {/* ========================================================================= */}
      {activeVideo && (
        <div
          onClick={(e) => e.target === e.currentTarget && setActiveVideo(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#00843D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {activeVideo.category} · {activeVideo.duration}
                  </span>
                  {activeVideo.isAmharicAudio && (
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      🇪🇹 በአማርኛ
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                  {activeVideo.amharicTitle}
                </h2>
                <div className="text-xs text-slate-500 font-medium">
                  {activeVideo.title}
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

            {/* Clean Video Thumbnail / Preview */}
            <div className="mt-4 relative aspect-video bg-slate-950 rounded-xl overflow-hidden shadow-inner group">
              <img
                src={activeVideo.thumbnailUrl}
                alt={activeVideo.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#00843D] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <Play className="h-5 w-5 fill-white ml-0.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    {activeVideo.amharicInstructor}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Target: {activeVideo.amharicTargetMuscles}
                  </div>
                </div>

                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeVideo.youtubeSearchTerm)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 rounded-md text-xs font-semibold hover:bg-slate-100 transition shadow-xs cursor-pointer"
                >
                  <span>Open Video on YouTube ↗</span>
                </a>
              </div>
            </div>

            {/* Language Tab Switcher */}
            <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700">
                Workout Technique Checklist / የስልጠና ቅደም ተከተል
              </span>
              <div className="flex bg-slate-100 p-0.5 rounded text-xs">
                <button
                  type="button"
                  onClick={() => setModalLanguage('AMHARIC')}
                  className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                    modalLanguage === 'AMHARIC'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  በአማርኛ
                </button>
                <button
                  type="button"
                  onClick={() => setModalLanguage('ENGLISH')}
                  className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                    modalLanguage === 'ENGLISH'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className="mt-3.5 space-y-3.5">
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00843D]" />
                  <span>
                    {modalLanguage === 'AMHARIC' ? 'ትክክለኛ አሰራር እና አቋቋም' : 'Execution Form Checklist'}
                  </span>
                </h4>
                <div className="space-y-1">
                  {(modalLanguage === 'AMHARIC' ? activeVideo.amharicCues : activeVideo.englishCues).map(
                    (cue, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-md"
                      >
                        <span className="font-mono font-bold text-[#00843D] text-[11px] shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="leading-relaxed">{cue}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Mistakes */}
              <div>
                <h4 className="text-xs font-bold text-rose-800 mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                  <span>
                    {modalLanguage === 'AMHARIC' ? 'ሊወገዱ የሚገቡ ስህተቶች' : 'Common Mistakes to Avoid'}
                  </span>
                </h4>
                <div className="space-y-1">
                  {(modalLanguage === 'AMHARIC' ? activeVideo.amharicMistakes : activeVideo.englishMistakes).map(
                    (mistake, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-rose-800 bg-rose-50/60 p-2 rounded-md"
                      >
                        <span className="text-rose-600 font-bold shrink-0">✕</span>
                        <span className="leading-relaxed">{mistake}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Instructor: <strong className="text-slate-700">{activeVideo.instructor}</strong>
              </span>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="px-3.5 h-8 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[6px] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
