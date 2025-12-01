
import React, { useState, useMemo } from 'react';
import { 
  FileText, Feather, Activity, BookOpen, Mail, Video, LayoutTemplate, 
  Search, ChevronRight, ChevronDown, Code, Database, Server, Cpu, Settings, 
  FlaskConical, FileSearch, Sigma, DollarSign, TrendingUp, Calendar, Briefcase, 
  ClipboardList, Scale, Clapperboard, Music, Mic, GraduationCap, CheckSquare, 
  User, Projector, Scroll, Stethoscope, Pill, Gavel, FileSignature, Landmark,
  Receipt, Building2, ShieldAlert, Hammer, Map, Plane, Leaf, Recycle, Wind, 
  TreeDeciduous, Factory, Wrench, Mountain, Camera, Utensils, Trophy, Dumbbell,
  Brain, Tv, Radio, HeartHandshake, Film, Gamepad2, Scissors, Lightbulb, GitBranch,
  History, Palette, Globe, Library, Microscope
} from 'lucide-react';

import { RESEARCH_ACADEMIC } from './Research & Academic';
import { TECHNICAL_ENGINEERING } from './Technical & Engineering';
import { BUSINESS_MANAGEMENT } from './Business & Management';
import { CREATIVE_MEDIA } from './Creative & Media';
import { EDUCATION_TEACHING } from './Education & Teaching';
import { LEGAL_REGULATORY } from './Legal & Regulatory';
import { HEALTHCARE_MEDICAL } from './Healthcare & Medical';
import { FINANCE_ACCOUNTING } from './Finance & Accounting';
import { GOVERNMENT_POLICY } from './Government & Policy';
import { ARCHITECTURE_CONSTRUCTION } from './Architecture & Construction';
import { TRAVEL_TOURISM } from './Travel & Tourism';
import { ENVIRONMENTAL_SUSTAINABILITY } from './Environmental Science & Sustainability';
import { FOOD_RECIPE } from './Food & Recipe';
import { SPORTS_FITNESS } from './Sports & Fitness';
import { ENTERTAINMENT_MEDIA } from './Entertainment & Media';
import { PSYCHOLOGY_MENTAL_HEALTH } from './Psychology & Mental Health';
import { DIY_HOW_TO } from './DIY & How-To';
import { GAMING_ESPORTS } from './Gaming & eSports';
import { TECHNOLOGY_INNOVATION } from './Technology & Innovation';
import { CULTURAL_HUMANITIES } from './Cultural Studies & Humanities';
import { TRAVEL_TOURISM_INNOVATIONS } from './Travel & Tourism Innovations';
import { SCIENCE_RESEARCH_DOCUMENTATION } from './Science & Research Documentation';
import { ARTS_PERFORMING_ARTS } from './Arts & Performing Arts';
import { HEALTH_WELLNESS } from './Health & Wellness';
import { BUSINESS_ENTREPRENEURSHIP } from './Business & Entrepreneurship';
import { LEGAL_COMPLIANCE } from './Legal & Compliance';
import { MEDIA_JOURNALISM } from './Media & Journalism';
import { SPORTS_RECREATION } from './Sports & Recreation';

const PREDICTIVE_CATEGORIES = {
  "Technology & Innovation": TECHNOLOGY_INNOVATION,
  "Cultural Studies & Humanities": CULTURAL_HUMANITIES,
  "Research & Academic": RESEARCH_ACADEMIC,
  "Science & Research Documentation": SCIENCE_RESEARCH_DOCUMENTATION,
  "Technical & Engineering": TECHNICAL_ENGINEERING,
  "Business & Management": BUSINESS_MANAGEMENT,
  "Business & Entrepreneurship": BUSINESS_ENTREPRENEURSHIP,
  "Creative & Media": CREATIVE_MEDIA,
  "Media & Journalism": MEDIA_JOURNALISM,
  "Arts & Performing Arts": ARTS_PERFORMING_ARTS,
  "Education & Teaching": EDUCATION_TEACHING,
  "Legal & Regulatory": LEGAL_REGULATORY,
  "Legal & Compliance": LEGAL_COMPLIANCE,
  "Healthcare & Medical": HEALTHCARE_MEDICAL,
  "Health & Wellness": HEALTH_WELLNESS,
  "Finance & Accounting": FINANCE_ACCOUNTING,
  "Government & Policy": GOVERNMENT_POLICY,
  "Architecture & Construction": ARCHITECTURE_CONSTRUCTION,
  "Travel & Tourism": TRAVEL_TOURISM,
  "Travel & Tourism Innovations": TRAVEL_TOURISM_INNOVATIONS,
  "Environmental Science & Sustainability": ENVIRONMENTAL_SUSTAINABILITY,
  "Food & Recipe": FOOD_RECIPE,
  "Sports & Fitness": SPORTS_FITNESS,
  "Sports & Recreation": SPORTS_RECREATION,
  "Entertainment & Media": ENTERTAINMENT_MEDIA,
  "Psychology & Mental Health": PSYCHOLOGY_MENTAL_HEALTH,
  "DIY & How-To": DIY_HOW_TO,
  "Gaming & eSports": GAMING_ESPORTS
};

const getIconForOption = (label: string) => {
  const l = label.toLowerCase();
  
  // Technology & Innovation
  if (l.includes('roadmap') || l.includes('timeline') || l.includes('milestone')) return GitBranch;
  if (l.includes('innovation') || l.includes('pitch') || l.includes('strategy') || l.includes('idea')) return Lightbulb;
  if (l.includes('prototype') || l.includes('demo')) return Box;
  if (l.includes('specification') || l.includes('spec') || l.includes('requirement')) return ClipboardList;
  if (l.includes('architecture') || l.includes('system') || l.includes('design')) return Settings;
  
  // Cultural Studies & Humanities
  if (l.includes('history') || l.includes('historical') || l.includes('archive') || l.includes('past')) return History;
  if (l.includes('culture') || l.includes('society') || l.includes('ethnography') || l.includes('anthropology')) return Globe;
  if (l.includes('art') || l.includes('museum') || l.includes('exhibit') || l.includes('gallery')) return Palette;
  if (l.includes('literature') || l.includes('book') || l.includes('novel') || l.includes('poem')) return BookOpen;
  if (l.includes('research') || l.includes('study') || l.includes('paper') || l.includes('thesis')) return Library;

  // Gaming & eSports
  if (l.includes('game') || l.includes('level') || l.includes('player') || l.includes('match') || l.includes('tournament') || l.includes('esport') || l.includes('patch') || l.includes('bug') || l.includes('quest') || l.includes('streaming') || l.includes('leaderboard')) return Gamepad2;

  // DIY & How-To
  if (l.includes('diy') || l.includes('repair') || l.includes('craft') || l.includes('paint') || l.includes('home improvement') || l.includes('assembly') || l.includes('project plan') || l.includes('renovation') || l.includes('woodworking')) return Hammer;
  
  // Entertainment & Media
  if (l.includes('tv') || l.includes('broadcast') || l.includes('show')) return Tv;
  if (l.includes('radio') || l.includes('podcast')) return Radio;
  if (l.includes('film') || l.includes('movie') || l.includes('cinema')) return Film;
  if (l.includes('script') || l.includes('screenplay') || l.includes('production')) return Clapperboard;
  if (l.includes('music') || l.includes('album') || l.includes('song') || l.includes('lyrics')) return Music;
  if (l.includes('casting') || l.includes('actor') || l.includes('role')) return User;
  
  // Psychology & Mental Health
  if (l.includes('therapy') || l.includes('counseling') || l.includes('psych') || l.includes('mental')) return Brain;
  if (l.includes('patient') || l.includes('client') || l.includes('support') || l.includes('care')) return HeartHandshake;
  if (l.includes('assessment') || l.includes('evaluation') || l.includes('test')) return ClipboardList;
  if (l.includes('mood') || l.includes('emotion') || l.includes('behavior')) return Activity;

  // Food & Recipe
  if (l.includes('recipe') || l.includes('cook') || l.includes('food') || l.includes('meal') || l.includes('menu') || l.includes('chef') || l.includes('ingredient') || l.includes('dish') || l.includes('baking') || l.includes('culinary')) return Utensils;

  // Sports & Fitness
  if (l.includes('fitness') || l.includes('workout') || l.includes('exercise') || l.includes('gym') || l.includes('strength') || l.includes('cardio') || l.includes('endurance')) return Dumbbell;
  if (l.includes('sport') || l.includes('game') || l.includes('match') || l.includes('tournament') || l.includes('league') || l.includes('competition') || l.includes('athlete') || l.includes('team') || l.includes('coach') || l.includes('award')) return Trophy;

  // Architecture & Construction
  if (l.includes('blueprint') || l.includes('plan') || l.includes('architect') || l.includes('layout')) return Building2;
  if (l.includes('construction') || l.includes('build') || l.includes('contractor') || l.includes('site')) return Hammer;
  if (l.includes('design') || l.includes('interior') || l.includes('landscape')) return LayoutTemplate;
  if (l.includes('inspection') || l.includes('audit') || l.includes('checklist') || l.includes('safety')) return ClipboardList;
  if (l.includes('material') || l.includes('procurement') || l.includes('inventory')) return Factory;
  if (l.includes('maintenance') || l.includes('repair') || l.includes('work order')) return Wrench;

  // Travel & Tourism
  if (l.includes('travel') || l.includes('tour') || l.includes('trip') || l.includes('itinerary')) return Map;
  if (l.includes('flight') || l.includes('airline') || l.includes('airport')) return Plane;
  if (l.includes('hotel') || l.includes('booking') || l.includes('accommodation')) return Briefcase;
  if (l.includes('guide') || l.includes('brochure') || l.includes('culture')) return BookOpen;
  if (l.includes('hiking') || l.includes('camping') || l.includes('adventure') || l.includes('backpack')) return Mountain;
  if (l.includes('photo') || l.includes('sightseeing')) return Camera;
  if (l.includes('cruise') || l.includes('sea')) return Video;

  // Environmental
  if (l.includes('environment') || l.includes('ecology') || l.includes('nature') || l.includes('habitat')) return Leaf;
  if (l.includes('climate') || l.includes('weather') || l.includes('energy') || l.includes('carbon')) return Wind;
  if (l.includes('recycle') || l.includes('waste') || l.includes('sustainab')) return Recycle;
  if (l.includes('forest') || l.includes('wildlife') || l.includes('conservation') || l.includes('bio')) return TreeDeciduous;
  if (l.includes('pollution') || l.includes('air') || l.includes('water')) return FlaskConical;

  // Tech
  if (l.includes('code') || l.includes('sdk') || l.includes('api') || l.includes('snippet')) return Code;
  if (l.includes('database') || l.includes('sql') || l.includes('schema')) return Database;
  if (l.includes('server') || l.includes('cloud') || l.includes('devops')) return Server;
  if (l.includes('hardware') || l.includes('iot') || l.includes('robotics')) return Cpu;
  if (l.includes('technical') || l.includes('spec') || l.includes('system')) return Settings;
  
  // Science & Math
  if (l.includes('lab') || l.includes('experiment') || l.includes('microscope')) return Microscope;
  if (l.includes('science') || l.includes('chemical')) return FlaskConical;
  if (l.includes('research') || l.includes('study') || l.includes('analysis') || l.includes('thesis')) return FileSearch;
  if (l.includes('math') || l.includes('equation') || l.includes('formula')) return Sigma;
  
  // Business & Finance
  if (l.includes('financial') || l.includes('budget') || l.includes('profit') || l.includes('revenue') || l.includes('cash') || l.includes('payroll')) return DollarSign;
  if (l.includes('market') || l.includes('sales') || l.includes('growth') || l.includes('trend')) return TrendingUp;
  if (l.includes('meeting') || l.includes('agenda') || l.includes('schedule')) return Calendar;
  if (l.includes('business') || l.includes('company') || l.includes('startup') || l.includes('corporate')) return Briefcase;
  if (l.includes('report') || l.includes('audit') || l.includes('log') || l.includes('review') || l.includes('summary')) return ClipboardList;
  if (l.includes('invoice') || l.includes('receipt') || l.includes('bill')) return Receipt;
  
  // Legal & Government
  if (l.includes('legal') || l.includes('court') || l.includes('litigation') || l.includes('judgment')) return Gavel;
  if (l.includes('contract') || l.includes('agreement') || l.includes('policy') || l.includes('terms')) return FileSignature;
  if (l.includes('regulation') || l.includes('compliance') || l.includes('law')) return Scale;
  if (l.includes('government') || l.includes('public') || l.includes('municipal') || l.includes('civic') || l.includes('census')) return Landmark;
  if (l.includes('infrastructure') || l.includes('urban') || l.includes('housing')) return Building2;
  if (l.includes('safety') || l.includes('security') || l.includes('risk') || l.includes('disaster')) return ShieldAlert;

  // Medical
  if (l.includes('medical') || l.includes('patient') || l.includes('doctor') || l.includes('clinical') || l.includes('surgery') || l.includes('diagnosis')) return Stethoscope;
  if (l.includes('medication') || l.includes('drug') || l.includes('prescription') || l.includes('pharmacy') || l.includes('treatment')) return Pill;
  if (l.includes('health') || l.includes('nursing') || l.includes('vital') || l.includes('discharge')) return Activity;

  // Creative
  if (l.includes('music') || l.includes('song') || l.includes('lyric')) return Music;
  if (l.includes('podcast') || l.includes('audio') || l.includes('speech')) return Mic;
  if (l.includes('video') || l.includes('animation')) return Video;
  if (l.includes('poem') || l.includes('poetry')) return Feather;
  if (l.includes('story') || l.includes('novel') || l.includes('fiction')) return BookOpen;
  
  // Education
  if (l.includes('lesson') || l.includes('syllabus') || l.includes('curriculum') || l.includes('teaching')) return GraduationCap;
  if (l.includes('quiz') || l.includes('exam') || l.includes('test') || l.includes('grade')) return CheckSquare;
  
  // General
  if (l.includes('resume') || l.includes('cv') || l.includes('profile')) return User;
  if (l.includes('email') || l.includes('letter')) return Mail;
  if (l.includes('presentation') || l.includes('slide')) return Projector;
  if (l.includes('scroll') || l.includes('certificate')) return Scroll;
  if (l.includes('scissor') || l.includes('cut')) return Scissors;
  
  return FileText;
};

// Helper component for dynamic icons, e.g. Box
const Box = (props: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 24} 
      height={props.size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);

interface PredictiveBuilderProps {
    onSelect: (item: { l: string, f: string }) => void;
}

export const PredictiveBuilder: React.FC<PredictiveBuilderProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return null;
    const lowerSearch = searchTerm.toLowerCase();
    const results: { l: string, f: string, category: string }[] = [];
    
    Object.entries(PREDICTIVE_CATEGORIES).forEach(([category, items]) => {
      items.forEach(item => {
        if (item.l.toLowerCase().includes(lowerSearch)) {
          results.push({ ...item, category });
        }
      });
    });
    return results;
  }, [searchTerm]);

  return (
     <div className="flex flex-col flex-1 min-h-0 bg-slate-50/50">
         <div className="px-3 pt-3 pb-2 border-t border-slate-100 bg-slate-50 sticky top-0 z-10">
             <div className="flex items-center justify-between mb-2">
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                     <LayoutTemplate size={10}/> Predictive Builder
                 </div>
                 <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-mono">
                    {Object.values(PREDICTIVE_CATEGORIES).reduce((acc, curr) => acc + curr.length, 0)}+
                 </span>
             </div>
             <div className="relative group">
                 <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"/>
                 <input 
                    type="text" 
                    placeholder="Search document type..." 
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                 />
             </div>
         </div>

         <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 flex-1 px-2 pb-2">
             {searchTerm ? (
                 <div className="space-y-0.5">
                     {filteredItems && filteredItems.length > 0 ? (
                         filteredItems.map((item, idx) => {
                             const Icon = getIconForOption(item.l);
                             return (
                                 <button 
                                    key={idx} 
                                    onClick={() => onSelect(item)}
                                    className="w-full text-left px-3 py-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-md group transition-all"
                                 >
                                     <div className="flex justify-between items-baseline">
                                         <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 flex items-center gap-2">
                                             <Icon size={12} className="text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                                             {item.l}
                                         </span>
                                         <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tight">{item.category.split(' ')[0]}</span>
                                     </div>
                                     <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 opacity-80 pl-5">
                                         <span className="truncate">{item.f.split('→')[0].trim()}</span>
                                         <ChevronRight size={8} />
                                         <span className="truncate text-blue-600 font-medium">{item.f.split('→')[1]?.trim() || 'Next Section'}</span>
                                     </div>
                                 </button>
                             );
                         })
                     ) : (
                         <div className="py-8 text-center text-slate-400 text-xs">
                             No templates found for "{searchTerm}"
                         </div>
                     )}
                 </div>
             ) : (
                 <div className="space-y-1">
                     {Object.entries(PREDICTIVE_CATEGORIES).map(([category, items]) => {
                         const isExpanded = expandedCategory === category;
                         return (
                             <div key={category} className="rounded-lg overflow-hidden border border-slate-100 bg-white">
                                 <button 
                                    onClick={() => setExpandedCategory(isExpanded ? null : category)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50 border-b border-slate-100' : ''}`}
                                 >
                                     {category}
                                     <div className="flex items-center gap-2">
                                         <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 rounded">{items.length}</span>
                                         <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}/>
                                     </div>
                                 </button>
                                 
                                 {isExpanded && (
                                     <div className="bg-slate-50/50 p-1 space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                                         {items.map((item, idx) => {
                                             const Icon = getIconForOption(item.l);
                                             return (
                                                 <button 
                                                    key={idx} 
                                                    onClick={() => onSelect(item)}
                                                    className="w-full text-left px-3 py-1.5 hover:bg-white hover:shadow-sm rounded border border-transparent hover:border-slate-100 transition-all group"
                                                 >
                                                     <div className="text-xs text-slate-600 group-hover:text-blue-700 font-medium flex items-center gap-2">
                                                        <Icon size={12} className="text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                                                        {item.l}
                                                     </div>
                                                     <div className="text-[10px] text-slate-400 truncate pl-5">{item.f}</div>
                                                 </button>
                                             );
                                         })}
                                     </div>
                                 )}
                             </div>
                         );
                     })}
                 </div>
             )}
         </div>
     </div>
  );
};
