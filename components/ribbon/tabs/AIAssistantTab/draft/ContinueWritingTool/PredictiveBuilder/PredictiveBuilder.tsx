
import React, { useState, useMemo } from 'react';
import { 
  FileText, Feather, Activity, BookOpen, Mail, Video, LayoutTemplate, 
  Search, ChevronRight, ChevronDown, Code, Database, Server, Cpu, Settings, 
  FlaskConical, FileSearch, Sigma, DollarSign, TrendingUp, Calendar, Briefcase, 
  ClipboardList, Scale, Clapperboard, Music, Mic, GraduationCap, CheckSquare, 
  User, Projector, Scroll, Stethoscope, Pill, Gavel, FileSignature, Landmark,
  Receipt, Building2, ShieldAlert, Hammer, Map, Plane, Leaf, Recycle, Wind, 
  Construction, Tent, TreeDeciduous, Factory, Wrench, Mountain, Camera
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

const PREDICTIVE_CATEGORIES = {
  "Research & Academic": RESEARCH_ACADEMIC,
  "Technical & Engineering": TECHNICAL_ENGINEERING,
  "Business & Management": BUSINESS_MANAGEMENT,
  "Creative & Media": CREATIVE_MEDIA,
  "Education & Teaching": EDUCATION_TEACHING,
  "Legal & Regulatory": LEGAL_REGULATORY,
  "Healthcare & Medical": HEALTHCARE_MEDICAL,
  "Finance & Accounting": FINANCE_ACCOUNTING,
  "Government & Policy": GOVERNMENT_POLICY,
  "Architecture & Construction": ARCHITECTURE_CONSTRUCTION,
  "Travel & Tourism": TRAVEL_TOURISM,
  "Environmental Science & Sustainability": ENVIRONMENTAL_SUSTAINABILITY
};

const getIconForOption = (label: string) => {
  const l = label.toLowerCase();
  
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
  if (l.includes('cruise') || l.includes('sea')) return Video; // Fallback or Ship if available

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
  if (l.includes('lab') || l.includes('experiment') || l.includes('science') || l.includes('chemical')) return FlaskConical;
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
  if (l.includes('script') || l.includes('screenplay') || l.includes('movie') || l.includes('film')) return Clapperboard;
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
  
  return FileText;
};

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
                 <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-mono">700+</span>
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
