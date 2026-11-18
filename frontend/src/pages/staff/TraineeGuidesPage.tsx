import React, { useState } from 'react';
import {
  BookOpen,
  Video,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  Clock,
  ShieldCheck,
  Building2,
  Key,
  ExternalLink,
  Sparkles,
  Youtube,
  Globe,
  Dumbbell,
  HeartPulse,
} from 'lucide-react';
import { MoaLogo } from '../../components/MoaLogo';

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
    amharicTitle: 'የጂም አጀማመር፣ የመሳሪያዎች አጠቃቀም እና የአደጋ መከላከያ መመሪያ',
    category: 'Beginner',
    isAmharicAudio: true,
    duration: '6:20 min',
    instructor: 'Coach Henok (Gym Attendant)',
    amharicInstructor: 'አሰልጣኝ ሄኖክ (የግብርና ሚኒስቴር ጂም)',
    targetMuscles: 'Full Body, Machine Calibration & Core Stability',
    amharicTargetMuscles: 'ሙሉ አካል፣ የማሽን አጠቃቀም እና የወገብ ደህንነት',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    youtubeSearchTerm: 'የጅምናዚየም ስፖርት አሰራር ለጀማሪዎች በአማርኛ gym workout amharic',
    description: 'A comprehensive beginner walkthrough in Amharic covering how to adjust pin-selected machines, calibrate seat height, breathe during lifts, and maintain safe spinal posture.',
    amharicDescription: 'ለአዲስ ሰልጣኞች የተዘጋጀ የአማርኛ መመሪያ፡ ማሽኖችን እንዴት ከቁመት ጋር ማስተካከል እንደሚቻል፣ የደህንነት ፒኖች አጠቃቀም፣ የመተንፈስ ስርዓት እና ትክክለኛ አቋቋም።',
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
    amharicTitle: 'ቦርጭን ለማጥፋት እና የሆድ ጡንቻን ለማጠንከር የሚረዱ እንቅስቃሴዎች',
    category: 'Cardio',
    isAmharicAudio: true,
    duration: '8:30 min',
    instructor: 'Meski Fitness (Ethiopian Home & Gym Routine)',
    amharicInstructor: 'ኢንስትራክተር ምስኪ (Meski Fitness)',
    targetMuscles: 'Rectus Abdominis, Obliques, Transverse Core',
    amharicTargetMuscles: 'የሆድ ጡንቻዎች፣ ጎንና ወገብ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
    youtubeSearchTerm: 'ቦርጭን ለማጥፋት የሚረዱ ቀላል ስፖርታዊ እንቅስቃሴዎች meski fitness',
    description: 'Proven core toning and abdominal exercises taught in Amharic, focusing on plank alignment, knee drives, and pelvic tilts without placing strain on your lower back.',
    amharicDescription: 'በቀላል የሆድ እና የወገብ ስፖርቶች አማካኝነት የሆድ ስብን ለማቅለጥ እና ወገብን ለማጠንከር የሚረዳ ታዋቂ የአማርኛ ስልጠና።',
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
    amharicTitle: 'የኤሮቢክስ እንቅስቃሴ ለጤና፣ ቅልጥፍና እና ክብደት መቀነስ',
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
      'በደረቅ ወይም ተንሸራታች ወለል ላይ ያለ ተገቢ የስፖርት ጫማ አለመስራት።',
      'እንቅስቃሴውን በድንገት አቁሞ አለመቀመጥ (Always cool down gradually)።',
    ],
    englishMistakes: [
      'Never train on slippery floors without proper grip sneakers.',
      'Avoid abruptly sitting down right after high-intensity cardio.',
    ],
  },
  {
    id: 'vid-amharic-chest',
    title: 'Proper Chest Workout Form: Barbell Bench Press & Dumbbell Press (Amharic)',
    amharicTitle: 'ትክክለኛ የደረት ስፖርት አሰራር - ቤንች ፕሬስ እና ዳምቤል',
    category: 'Strength',
    isAmharicAudio: true,
    duration: '7:15 min',
    instructor: 'Trainer Tsegaye (Ethio Fitness / Surafel Gym Series)',
    amharicInstructor: 'አሰልጣኝ ፀጋዬ (Tsegaye Workout / Ethiopian Trainers)',
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
      'ወደ ላይ ሲገፉ እጆችን ሙሉ በሙሉ ሳያስረሱ (Without locking out elbows) ግፊቱን ደረት ላይ ማቆየት።',
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
    title: 'Safe Squats & Deadlifts: Neutral Spine & Knee Protection (Amharic)',
    amharicTitle: 'ትክክለኛ የስኳት እና የዳድሊፍት አሰራር - ወገብ እና ጉልበት ሳይጎዳ',
    category: 'Strength',
    isAmharicAudio: true,
    duration: '6:45 min',
    instructor: 'Coach Henok (Gym Attendant)',
    amharicInstructor: 'አሰልጣኝ ሄኖክ (የግብርና ሚኒስቴር ጂም)',
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
    amharicTitle: 'ቀኑን ሙሉ ለተቀመጠ ሰራተኛ የአንገት፣ ትከሻ እና የወገብ ማፍታቻ',
    category: 'Mobility',
    isAmharicAudio: true,
    duration: '5:10 min',
    instructor: 'Trainer Bethel (MoA Wellness Team)',
    amharicInstructor: 'አሰልጣኝ ቤቴል (የግብርና ሚኒስቴር ጤና ቡድን)',
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
    amharicTitle: 'የትሬድሚል አጠቃቀም፣ የፍጥነት መቆጣጠሪያ እና የቀይ ደህንነት ክሊፕ አስፈላጊነት',
    category: 'Cardio',
    isAmharicAudio: true,
    duration: '4:20 min',
    instructor: 'Coach Henok (Gym Attendant)',
    amharicInstructor: 'አሰልጣኝ ሄኖክ (የግብርና ሚኒስቴር ጂም)',
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
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'VIDEOS'>('VIDEOS');
  const [selectedCategory, setSelectedCategory] = useState<string>('AMHARIC');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<VideoGuide | null>(null);
  const [modalLanguage, setModalLanguage] = useState<'AMHARIC' | 'ENGLISH'>('AMHARIC');

  const handlePrint = () => {
    window.print();
  };

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
      {/* Top Banner (Hidden on print) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Trainee Manuals & Video Training Hub
            </h1>
            <span className="text-xs font-mono font-semibold text-[#00843D] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              የስልጠና መመሪያዎች እና ቪዲዮዎች
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official Ministry of Agriculture fitness center guidelines, safety SOP, and curated Ethiopian Amharic workout tutorials.
          </p>
        </div>

        {/* Tab switcher & Print Button */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-lg">
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
      {/* TAB 1: CURATED VIDEO TRAINING HUB (DEFAULT)                               */}
      {/* ========================================================================= */}
      {activeTab === 'VIDEOS' && (
        <div className="space-y-6">
          {/* Ethiopian Amharic Fitness Video Highlight Banner */}
          <div className="bg-gradient-to-r from-emerald-800 via-[#00843D] to-teal-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
                  <span>🇪🇹</span>
                  <span>የአማርኛ ስፖርታዊ ልምምድ ቪዲዮዎች</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Learn Exercise Form with Ethiopian Trainers in Amharic
                </h2>
                <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
                  ትክክለኛ የስፖርት አሰራር፣ የደረት እና የእግር ስኳት ልምምድ፣ የሆድና ቦርጭ ማጥፊያ፣ እና ለቢሮ ሰራተኞች የሚሆን የወገብ ማፍታቻ በአማርኛ ቪዲዮዎች ይከታተሉ።
                </p>
              </div>

              {/* Direct YouTube Search External Action */}
              <div className="shrink-0 flex items-center gap-2">
                <a
                  href="https://www.youtube.com/results?search_query=%E1%8B%A8%E1%8C%85%E1%88%9D%E1%8A%93%E1%8B%9A%E1%8B%A8%E1%88%9D+%E1%88%85%E1%8D%96%E1%88%AD%E1%89%85+%E1%8A%A0%E1%88%B0%E1%88%AB%E1%88%AD+%E1%89%A0%E1%80%8%E1%88%9B%E1%88%AD%E1%8A%9B"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 h-9 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <Youtube className="h-4 w-4 text-red-600" />
                  <span>በዩቲዩብ ተጨማሪ ፈልግ ↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ስፖርቶችን ፈልግ (ደረት፣ ስኳት፣ ቦርጭ፣ ትሬድሚል፣ ማፍታቻ)..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00843D] text-slate-900"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedCategory('AMHARIC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedCategory === 'AMHARIC'
                    ? 'bg-[#00843D] text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <span>🇪🇹 በአማርኛ (Amharic)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Videos
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('Strength')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === 'Strength'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Strength & የጡንቻ
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('Cardio')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === 'Cardio'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cardio & ቦርጭ ማጥፊያ
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('Mobility')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === 'Mobility'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Desk Mobility (ማፍታቻ)
              </button>
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
                    onClick={() => {
                      setActiveVideo(guide);
                      setModalLanguage('AMHARIC');
                    }}
                    className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={guide.thumbnailUrl}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>

                    {/* Play Badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#00843D]/95 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#00843D] transition-transform">
                        <Play className="h-5 w-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold">
                      {guide.duration}
                    </div>

                    {/* Amharic Language Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {guide.isAmharicAudio && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                          <span>🇪🇹</span>
                          <span>በአማርኛ</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-[#00843D] text-white text-[10px] font-bold uppercase tracking-wider">
                        {guide.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00843D] transition-colors leading-snug">
                      {guide.amharicTitle}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium line-clamp-1">
                      {guide.title}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {guide.amharicDescription}
                    </p>

                    <div className="pt-2 text-[11px] text-slate-500 font-mono">
                      አሰልጣኝ: <strong className="text-slate-800">{guide.amharicInstructor}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-semibold truncate max-w-[140px]">
                    {guide.amharicTargetMuscles}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVideo(guide);
                      setModalLanguage('AMHARIC');
                    }}
                    className="px-3 h-7.5 text-xs font-semibold text-white bg-[#00843D] hover:bg-[#007033] rounded-[6px] shadow-2xs transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>ቪዲዮውን ይመልከቱ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TRAINEE MANUAL & OPERATING STANDARD (Printable Handbook)            */}
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
      {/* VIDEO DETAIL & PLAYER MODAL                                               */}
      {/* ========================================================================= */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  {activeVideo.isAmharicAudio && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-950 bg-amber-400 px-2 py-0.5 rounded-md shadow-2xs">
                      🇪🇹 በአማርኛ (Amharic Audio)
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00843D] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {activeVideo.category} · {activeVideo.duration}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                  {activeVideo.amharicTitle}
                </h2>
                <div className="text-xs font-medium text-slate-500">
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

            {/* Video Player Display Container */}
            <div className="mt-4 relative aspect-video bg-slate-950 rounded-xl overflow-hidden shadow-inner group">
              <img
                src={activeVideo.thumbnailUrl}
                alt={activeVideo.title}
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/20 flex flex-col items-center justify-center text-center p-6 text-white space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#00843D] text-white flex items-center justify-center shadow-xl ring-4 ring-white/20 animate-pulse">
                  <Play className="h-7 w-7 fill-white ml-1" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-amber-300">
                    🇪🇹 {activeVideo.amharicInstructor}
                  </div>
                  <div className="text-sm font-bold text-white max-w-md">
                    {activeVideo.amharicTitle}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Target Muscles: {activeVideo.amharicTargetMuscles}
                  </div>
                </div>

                {/* Direct Launch on YouTube Button */}
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeVideo.youtubeSearchTerm)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md transition transform hover:scale-105 cursor-pointer"
                >
                  <Youtube className="h-4 w-4" />
                  <span>ቪዲዮውን በዩቲዩብ ይመልከቱ (Open on YouTube) ↗</span>
                </a>
              </div>

              {/* Bottom Stream Info Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-black/85 p-2.5 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2">
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span className="text-[10px] font-mono text-slate-300">HQ 1080p · {activeVideo.duration}</span>
                </div>
                <div className="text-[10px] font-semibold text-emerald-300">
                  MoA Wellness Streaming Channel
                </div>
              </div>
            </div>

            {/* Language Switcher for Coaching Notes */}
            <div className="mt-5 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Coaching Cues & Instructions / የስልጠና መመሪያ
              </span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setModalLanguage('AMHARIC')}
                  className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                    modalLanguage === 'AMHARIC'
                      ? 'bg-[#00843D] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🇪🇹 በአማርኛ
                </button>
                <button
                  type="button"
                  onClick={() => setModalLanguage('ENGLISH')}
                  className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                    modalLanguage === 'ENGLISH'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Step-by-Step Key Form Cues */}
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00843D]" />
                  <span>
                    {modalLanguage === 'AMHARIC'
                      ? 'የልምምድ ቅደም ተከተል እና ትክክለኛ አሰራር (Checklist)'
                      : 'Execution Form Checklist & Posture Rules'}
                  </span>
                </h4>
                <div className="space-y-1.5">
                  {(modalLanguage === 'AMHARIC' ? activeVideo.amharicCues : activeVideo.englishCues).map(
                    (cue, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100"
                      >
                        <span className="h-4 w-4 rounded-full bg-[#00843D] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{cue}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Mistakes to Avoid */}
              <div>
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span>
                    {modalLanguage === 'AMHARIC'
                      ? 'ሊወገዱ የሚገቡ ስህተቶች እና የአደጋ መከላከያ'
                      : 'Common Safety Pitfalls & Mistakes to Avoid'}
                  </span>
                </h4>
                <div className="space-y-1.5">
                  {(modalLanguage === 'AMHARIC' ? activeVideo.amharicMistakes : activeVideo.englishMistakes).map(
                    (mistake, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-rose-800 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200"
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
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                አሰልጣኝ: <strong className="text-slate-800">{activeVideo.amharicInstructor}</strong>
              </span>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="px-4 h-8.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[6px] transition cursor-pointer"
              >
                ዝጋ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
