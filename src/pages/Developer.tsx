import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Send, ExternalLink, ShieldCheck, Rocket, Code2, Globe } from 'lucide-react';

const Developer = () => {
  const contacts = [
    { label: 'Email', icon: Mail, value: 'ramodatechnologies@gmail.com', href: 'mailto:ramodatechnologies@gmail.com', color: 'bg-red-50 text-red-600' },
    { label: 'Phone', icon: Phone, value: '+251 993 253 633', href: 'tel:+251993253633', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Telegram', icon: Send, value: '@Rtdart', href: 'https://t.me/Rtdart', color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold tracking-widest uppercase border border-indigo-100 dark:border-indigo-800"
        >
           Authorized Developer Section
        </motion.div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">RAMODA TECHNOLOGIES</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
          Crafting high-performance digital solutions for modern educational institutions in Ethiopia and beyond.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Company Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden flex flex-col justify-center"
        >
          <div className="relative z-10 flex flex-col items-center text-center">
             <img 
               src="https://i.postimg.cc/Bv0tdgJh/a-premium-corporate-logo-design-featurin-v-N8j-Lss-Wsycx-HTk-GT4as-Q-X7Hkqgyr-Sa6F8HUkp-R7H-Q-sd-(1).jpg" 
               alt="Ramoda Logo" 
               className="w-32 h-32 object-contain mb-8 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700"
             />
             <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">RT-SYSTEMS PRO</h2>
             <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex flex-col items-center gap-1 border border-slate-100 dark:border-slate-700">
                   <ShieldCheck className="text-emerald-500" size={20} />
                   <span className="text-[9px] font-bold text-slate-400 uppercase">Secure Core</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex flex-col items-center gap-1 border border-slate-100 dark:border-slate-700">
                   <Rocket className="text-indigo-500" size={20} />
                   <span className="text-[9px] font-bold text-slate-400 uppercase">Fast Deploy</span>
                </div>
             </div>
          </div>
          <div className="absolute top-0 right-0 p-8 text-slate-100 dark:text-slate-800 font-black text-9xl opacity-20 select-none pointer-events-none">RT</div>
        </motion.div>

        {/* Founder Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-sm border border-slate-200 dark:border-slate-700 relative flex flex-col"
        >
          <div className="flex items-center gap-6 mb-8">
             <img 
                src="https://i.postimg.cc/Y0yKdbbg/IMG-20260517-213404-358.jpg" 
                alt="Nahom Debebe" 
                className="w-24 h-24 rounded-2xl object-cover shadow-md border-2 border-white dark:border-slate-700 transition-transform"
             />
             <div>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-[10px] tracking-widest uppercase mb-1">Lead Engineer</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2">Nahom Debebe</h3>
                <div className="flex items-center gap-1.5">
                   <Globe size={12} className="text-slate-400" />
                   <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Addis Ababa, Ethiopia</span>
                </div>
             </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic mb-8 font-medium">
            "We believe that education management should be intuitive, fast, and accessible. Our mission at Ramoda is to bridge the technology gap in our schools."
          </p>

          <div className="space-y-2 mt-auto">
             {contacts.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl group transition-all border border-slate-100 dark:border-slate-700"
                >
                   <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${contact.color.replace('50', '100')}`}>
                         <contact.icon size={16} />
                      </div>
                      <div className="text-left">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{contact.label}</p>
                         <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{contact.value}</p>
                      </div>
                   </div>
                   <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </a>
             ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-900 dark:bg-indigo-950 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-lg"
      >
        <div className="relative z-10">
           <h2 className="text-2xl font-bold mb-3 uppercase tracking-tighter">Request Your Digital Platform</h2>
           <p className="text-sm opacity-90 max-w-2xl mx-auto mb-8 font-medium">
             If you need a professional student result management system for your school, contact us directly.
           </p>
           <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:ramodatechnologies@gmail.com" className="px-8 py-3 bg-white text-indigo-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-md">
                 GET STARTED
              </a>
              <a href="https://t.me/Rtdart" className="px-8 py-3 bg-indigo-800 text-white border border-indigo-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
                 CHAT ON TELEGRAM
              </a>
           </div>
        </div>
        <div className="absolute left-0 bottom-0 p-10 opacity-10 pointer-events-none">
           <Code2 size={100} />
        </div>
      </motion.div>
    </div>
  );
};

export default Developer;
