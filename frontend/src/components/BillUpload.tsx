import React from 'react';

const BillUpload: React.FC = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">

                    {/* Header */}
                    <header className="flex items-center justify-between border-b border-primary/10 bg-background-light dark:bg-background-dark px-6 py-4 sticky top-0 z-50">
                        <div className="flex items-center gap-2">
                            <div className="text-primary">
                                <span className="material-symbols-outlined text-3xl font-bold">account_balance_wallet</span>
                            </div>
                            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-extrabold tracking-tight">Project McCaren</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm">bolt</span>
                                <span>Fast Claims</span>
                            </div>
                            <button className="flex items-center justify-center rounded-lg h-10 px-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold">
                                <span>EN/HI</span>
                            </button>
                        </div>
                    </header>

                    <main className="flex flex-1 flex-col items-center px-6 py-8 max-w-lg mx-auto w-full">

                        {/* Hero Icon & Title */}
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-primary text-5xl">receipt_long</span>
                            </div>
                            <h1 className="text-2xl font-bold leading-tight mb-2">Take Photo of Hospital Bill</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Upload your medical bills for instant claim analysis</p>
                        </div>

                        {/* Primary Action: Camera */}
                        <div className="w-full space-y-4 mb-8">
                            <button className="w-full flex items-center justify-center gap-3 rounded-xl h-16 bg-[#10B981] hover:bg-[#059669] text-white text-lg font-bold shadow-lg shadow-[#10B981]/20 transition-all">
                                <span className="material-symbols-outlined text-2xl">photo_camera</span>
                                <span>OPEN CAMERA</span>
                            </button>

                            <div className="flex items-center gap-4 py-2">
                                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700"></div>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">or</span>
                                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700"></div>
                            </div>

                            <button className="w-full flex items-center justify-center gap-3 rounded-xl h-14 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-base font-bold transition-all">
                                <span className="material-symbols-outlined text-2xl">gallery_thumbnail</span>
                                <span>Upload from Gallery</span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-8"></div>

                        {/* Form Section */}
                        <div className="w-full space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Total Bill Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        className="w-full h-14 pl-10 pr-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-0 font-mono text-lg tracking-[0.2em] placeholder-slate-300 dark:placeholder-slate-600"
                                        placeholder="[ 0 0 0 0 0 ]"
                                        type="text"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                        <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                                        OCR AUTO-FILL
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Patient Name</label>
                                <div className="relative">
                                    <input
                                        className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-0 text-base"
                                        placeholder="e.g., Raju Kumar"
                                        type="text"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">person</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer CTA */}
                        <div className="w-full mt-10 pb-10">
                            <button className="w-full flex items-center justify-between px-8 rounded-xl h-16 bg-primary text-white text-lg font-bold shadow-xl shadow-primary/20 hover:opacity-95 transition-all">
                                <span>ANALYZE CLAIMS</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <p className="text-center text-slate-400 text-xs mt-4 italic">
                                By clicking Analyze, you agree to our privacy policy and terms of service.
                            </p>
                        </div>
                    </main>

                    {/* Bottom Navigation (Visual Aid) */}
                    <div className="flex border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark py-3 px-6 justify-around items-center sticky bottom-0">
                        <div className="flex flex-col items-center gap-1 text-primary">
                            <span className="material-symbols-outlined">add_circle</span>
                            <span className="text-[10px] font-bold">New Claim</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                            <span className="material-symbols-outlined">history</span>
                            <span className="text-[10px] font-bold">History</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                            <span className="material-symbols-outlined">help_center</span>
                            <span className="text-[10px] font-bold">Support</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillUpload;
