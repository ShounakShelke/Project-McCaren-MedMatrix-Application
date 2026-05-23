import { Camera, BrainCircuit, PiggyBank, ShieldCheck } from 'lucide-react';
import { palette, gradients } from '../theme/colors';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Camera className="w-8 h-8 text-white" />,
      title: "1. Snap & Upload",
      description: "Take a clear picture of your hospital bill or upload it directly from your gallery. No manual typing required.",
      color: palette.forestMoss,
      bgColor: "bg-green-50"
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-white" />,
      title: "2. AI Instantly Analyzes",
      description: "Our intelligent engine scans the bill, extracts charges, and instantly cross-references it with hundreds of government and private schemes.",
      color: palette.cinnabar,
      bgColor: "bg-red-50"
    },
    {
      icon: <PiggyBank className="w-8 h-8 text-white" />,
      title: "3. Discover Savings",
      description: "We reveal exactly which schemes (like PM-JAY or ESIC) you qualify for, showing you line-by-line how much money you can save.",
      color: "#D7B82A", // Matching the ESIC yellow
      bgColor: "bg-yellow-50"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      title: "4. Claim With Expert Help",
      description: "Get step-by-step guidance on how to claim your benefits at the hospital. Our experts are available 24/7 if you need extra support.",
      color: palette.onyx,
      bgColor: "bg-gray-100"
    }
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: palette.vanillaCustard }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="font-bold tracking-widest uppercase text-sm" style={{ color: palette.forestMoss }}>
            Simple & Transparent
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            How Project McCaren Works
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            We've revolutionized the way you process hospital bills. See how we find your missing benefits in four simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col sm:flex-row gap-6 items-start"
            >
              <div
                className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-md rotate-3"
                style={{ background: step.color }}
              >
                {step.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="rounded-3xl p-10 sm:p-14 text-center shadow-2xl relative overflow-hidden" style={{ background: gradients.primary }}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 max-w-2xl mx-auto text-white space-y-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Stop Overpaying Medical Bills
            </h2>
            <p className="text-lg sm:text-xl font-medium opacity-90">
              Join thousands of users who are unlocking the financial support they rightfully deserve. Let Project McCaren analyze your bill today.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-extrabold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{ color: palette.forestMoss }}
            >
              Upload Your First Bill
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}