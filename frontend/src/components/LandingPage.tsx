import { Camera, Image as ImageIcon, X, Coins, Building, HardHat, Building2, CreditCard, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { palette } from '../theme/colors';
import { validateCardWithProgress, CardType, CardValidationResult } from '../services/cardVerification';
import { extractBillAmount } from '../services/billOcr';
import { generateClaimsSummaryPDF } from '../services/pdfGenerator';

type ScreenName = 'hero' | 'cardVerify' | 'cardProcessing' | 'results';

export default function LandingPage() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>('hero');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [billAmount, setBillAmount] = useState('');
  const [patientName, setPatientName] = useState('');
  
  // OCR state
  const [isExtractingBill, setIsExtractingBill] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');

  // Card verification state
  const [cardType, setCardType] = useState<CardType>('pmjay');
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [cardValidationResult, setCardValidationResult] = useState<CardValidationResult | null>(null);
  const [processingSteps, setProcessingSteps] = useState<Record<string, 'pending' | 'processing' | 'completed' | 'failed'>>({
    qr: 'pending',
    hologram: 'pending',
    idFormat: 'pending',
    tampering: 'pending'
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCardCameraActive, setIsCardCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cardStreamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access the camera. Please ensure you have granted camera permissions.");
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setUploadedImage(imageDataUrl);
        stopCamera();
        // Trigger OCR extraction
        runOcrExtraction(imageDataUrl);
      }
    }
  };

  // OCR extraction function
  const runOcrExtraction = async (imageData: string) => {
    setIsExtractingBill(true);
    setOcrProgress(0);
    setOcrStatus('Starting OCR...');
    
    try {
      const result = await extractBillAmount(imageData, (progress, status) => {
        setOcrProgress(progress);
        setOcrStatus(status);
      });
      
      if (result.totalAmount) {
        setBillAmount(result.totalAmount.toString());
        setOcrStatus(`Extracted ₹${result.totalAmount.toLocaleString()}`);
      } else {
        setOcrStatus('Could not extract amount - please enter manually');
      }
      
      console.log('🧾 Bill OCR Result:', result);
    } catch (error) {
      console.error('OCR failed:', error);
      setOcrStatus('OCR failed - please enter amount manually');
    } finally {
      setIsExtractingBill(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setUploadedImage(imageData);
        // Trigger OCR extraction
        runOcrExtraction(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Card camera functions
  const startCardCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      cardStreamRef.current = stream;
      setIsCardCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access the camera. Please ensure you have granted camera permissions.");
    }
  };

  useEffect(() => {
    if (isCardCameraActive && cardVideoRef.current && cardStreamRef.current) {
      cardVideoRef.current.srcObject = cardStreamRef.current;
    }
  }, [isCardCameraActive]);

  const stopCardCamera = () => {
    if (cardStreamRef.current) {
      cardStreamRef.current.getTracks().forEach(track => track.stop());
      cardStreamRef.current = null;
    }
    setIsCardCameraActive(false);
  };

  const captureCardImage = () => {
    if (cardVideoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = cardVideoRef.current.videoWidth;
      canvas.height = cardVideoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(cardVideoRef.current, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCardImage(imageDataUrl);
        stopCardCamera();
      }
    }
  };

  const handleCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCardImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Card validation handler
  const handleVerifyCard = async () => {
    if (!cardImage) return;

    setActiveScreen('cardProcessing');
    setProcessingSteps({
      qr: 'pending',
      hologram: 'pending', 
      idFormat: 'pending',
      tampering: 'pending'
    });

    try {
      const result = await validateCardWithProgress(
        cardImage,
        cardType,
        (step, status) => {
          setProcessingSteps(prev => ({ ...prev, [step]: status }));
        }
      );
      
      setCardValidationResult(result);
      
      // Small delay before showing results
      setTimeout(() => {
        setActiveScreen('results');
      }, 500);
    } catch (error) {
      console.error('Card validation error:', error);
      alert('Error validating card. Please try again.');
      setActiveScreen('cardVerify');
    }
  };

  // Proceed from bill to card verification
  const handleProceedToCardVerify = () => {
    window.scrollTo(0, 0);
    setActiveScreen('cardVerify');
  };

  // Reset for new scan
  const handleNewScan = () => {
    setCardImage(null);
    setCardValidationResult(null);
    setActiveScreen('cardVerify');
  };

  return (
    <div className="min-h-screen" style={{ background: palette.vanillaCustard }}>

      {activeScreen === 'hero' && (
        <section className="pt-20 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 space-y-8 border border-gray-100">
              {/* Title */}
              <div className="space-y-2 text-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Hospital Bill?</h1>
                <p className="text-gray-600 text-base sm:text-lg">
                  Show us your bill. We find you savings.
                </p>
              </div>

              {/* Image Upload Area */}
              <div className="w-full space-y-4">
                {isCameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 bg-black flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] shadow-lg" style={{ borderColor: palette.forestMoss }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Camera Controls Overlay */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center px-8 gap-8">
                      <button onClick={stopCamera} className="w-12 h-12 bg-gray-900/50 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-gray-900/70 border border-white/20">
                        <X className="w-6 h-6" />
                      </button>
                      <button onClick={captureImage} className="w-16 h-16 bg-white/20 backdrop-blur-sm border-4 border-white rounded-full shadow-xl active:scale-95 flex items-center justify-center transition-all hover:bg-white/40">
                        <div className="w-12 h-12 bg-white rounded-full shadow-inner"></div>
                      </button>
                      <div className="w-12 h-12"></div> {/* Spacer to keep capture button centered */}
                    </div>
                  </div>
                ) : uploadedImage ? (
                  <div
                    className="relative rounded-2xl p-4 border-2 border-dashed transition-all"
                    style={{ background: '#FAFBF6', borderColor: palette.forestMoss }}
                  >
                    <img src={uploadedImage} alt="Bill" className="w-full min-h-[200px] object-cover rounded-xl mb-4 border border-gray-100 shadow-sm" />
                    
                    {/* OCR Progress Indicator */}
                    {isExtractingBill && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800">{ocrStatus}</p>
                            <div className="mt-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${ocrProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* OCR Success Message */}
                    {!isExtractingBill && ocrStatus && billAmount && (
                      <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-medium text-green-800">
                          Extracted: <span className="font-bold">₹{parseInt(billAmount).toLocaleString()}</span>
                        </p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setBillAmount('');
                        setOcrStatus('');
                      }}
                      className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-sm hover:shadow active:scale-[0.98]"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={startCamera}
                      className="w-full flex items-center justify-center gap-3 rounded-xl h-16 text-white text-lg font-bold shadow-lg shadow-green-900/10 transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                      style={{ background: palette.forestMoss }}
                    >
                      <Camera className="w-6 h-6" />
                      <span>TAKE PHOTO</span>
                    </button>

                    <div className="flex items-center gap-4 py-2">
                      <div className="h-[1px] flex-1 bg-gray-200"></div>
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">or</span>
                      <div className="h-[1px] flex-1 bg-gray-200"></div>
                    </div>

                    <button
                      onClick={() => document.getElementById('galleryInput')?.click()}
                      className="w-full flex items-center justify-center gap-3 rounded-xl h-14 bg-white border-2 text-gray-700 text-base font-bold transition-all hover:bg-gray-50 active:scale-[0.98]"
                      style={{ borderColor: palette.forestMoss }}
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span>Upload from Gallery</span>
                    </button>
                  </div>
                )}

                {/* Hidden Input for handling gallery upload */}
                <input
                  id="galleryInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-200"></div>

              {/* Manual Entry */}
              <div className="space-y-4">
                <label className="block">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Total Bill Amount (₹)
                    </span>
                    {uploadedImage && !isExtractingBill && billAmount && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        ✓ Auto-extracted
                      </span>
                    )}
                    {isExtractingBill && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Extracting...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                    <input
                      type="number"
                      placeholder={isExtractingBill ? "Extracting from bill..." : "e.g. 50000"}
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      disabled={isExtractingBill}
                      className="w-full pl-10 pr-4 py-3 sm:py-4 border-2 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-wait"
                      style={{ 
                        borderColor: billAmount ? palette.forestMoss : '#dcdcdc',
                        backgroundColor: billAmount ? '#f0fdf4' : undefined
                      }}
                    />
                  </div>
                  {!uploadedImage && (
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a bill photo to auto-extract the amount
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-gray-900 mb-2 block">
                    Patient Name
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Raju Kumar"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-4 py-3 sm:py-4 border-2 rounded-xl text-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-colors"
                    style={{ borderColor: '#dcdcdc' }}
                  />
                </label>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProceedToCardVerify}
                disabled={!billAmount || !patientName}
                className="w-full text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ background: `linear-gradient(90deg, ${palette.forestMoss}, ${palette.cinnabar})` }}
              >
                Next: Verify Insurance Card →
              </button>

              {/* Info */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
                <span className="material-symbols-outlined text-blue-500 shrink-0 select-none">lock</span>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <strong className="text-gray-900 font-semibold">Safe & Private:</strong> Your data is encrypted and never shared.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Card Verification Screen */}
      {activeScreen === 'cardVerify' && (
        <section className="pt-20 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 space-y-6 border border-gray-100">
              
              {/* Back Button */}
              <button
                onClick={() => setActiveScreen('hero')}
                className="flex items-center gap-1 text-gray-700 hover:text-black font-semibold text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back_ios</span>
                Back
              </button>

              {/* Title */}
              <div className="space-y-2 text-center">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Verify Insurance Card</h1>
                <p className="text-gray-600 text-sm">
                  Upload your PMJAY or ESIC card to verify eligibility
                </p>
              </div>

              {/* Card Type Selection */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCardType('pmjay')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    cardType === 'pmjay' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🏥</div>
                  <div className="font-bold text-gray-900">PM-JAY</div>
                  <div className="text-xs text-gray-500">Ayushman Bharat</div>
                </button>
                <button
                  onClick={() => setCardType('esic')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    cardType === 'esic' 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">👷</div>
                  <div className="font-bold text-gray-900">ESIC</div>
                  <div className="text-xs text-gray-500">Worker Insurance</div>
                </button>
              </div>

              {/* Card Image Upload */}
              <div className="w-full space-y-4">
                {isCardCameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 bg-black flex flex-col items-center justify-center min-h-[300px] shadow-lg" style={{ borderColor: palette.forestMoss }}>
                    <video
                      ref={cardVideoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center px-8 gap-8">
                      <button onClick={stopCardCamera} className="w-12 h-12 bg-gray-900/50 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all">
                        <X className="w-6 h-6" />
                      </button>
                      <button onClick={captureCardImage} className="w-16 h-16 bg-white/20 backdrop-blur-sm border-4 border-white rounded-full shadow-xl active:scale-95 flex items-center justify-center transition-all">
                        <div className="w-12 h-12 bg-white rounded-full shadow-inner"></div>
                      </button>
                      <div className="w-12 h-12"></div>
                    </div>
                  </div>
                ) : cardImage ? (
                  <div className="relative rounded-2xl p-4 border-2 border-dashed transition-all" style={{ background: '#FAFBF6', borderColor: palette.forestMoss }}>
                    <img src={cardImage} alt="Card" className="w-full min-h-[200px] object-cover rounded-xl mb-4 border border-gray-100 shadow-sm" />
                    <button
                      onClick={() => setCardImage(null)}
                      className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-sm"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={startCardCamera}
                      className="w-full flex items-center justify-center gap-3 rounded-xl h-14 text-white text-lg font-bold shadow-lg transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                      style={{ background: palette.forestMoss }}
                    >
                      <Camera className="w-5 h-5" />
                      <span>Take Photo of Card</span>
                    </button>

                    <div className="flex items-center gap-4 py-1">
                      <div className="h-[1px] flex-1 bg-gray-200"></div>
                      <span className="text-gray-400 text-xs font-bold uppercase">or</span>
                      <div className="h-[1px] flex-1 bg-gray-200"></div>
                    </div>

                    <button
                      onClick={() => document.getElementById('cardGalleryInput')?.click()}
                      className="w-full flex items-center justify-center gap-3 rounded-xl h-12 bg-white border-2 text-gray-700 text-base font-bold transition-all hover:bg-gray-50"
                      style={{ borderColor: palette.forestMoss }}
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span>Upload from Gallery</span>
                    </button>
                  </div>
                )}

                <input
                  id="cardGalleryInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCardImageUpload}
                />
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyCard}
                disabled={!cardImage}
                className="w-full text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ background: `linear-gradient(90deg, ${palette.forestMoss}, ${palette.cinnabar})` }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Verify Card</span>
                </div>
              </button>

              {/* Security Note */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3 items-start">
                <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  We check QR code, hologram, ID format and tampering detection to verify authenticity.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Card Processing Screen */}
      {activeScreen === 'cardProcessing' && (
        <section className="pt-20 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 border border-gray-100 text-center">
              
              {/* Spinner */}
              <div className="w-20 h-20 mx-auto mb-6">
                <Loader2 className="w-20 h-20 text-green-600 animate-spin" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Card...</h2>
              <p className="text-gray-500 mb-8">Please wait while we analyze your card</p>

              {/* Processing Steps */}
              <div className="space-y-4 text-left">
                {[
                  { key: 'qr', label: 'Scanning QR Code', icon: '📱' },
                  { key: 'hologram', label: 'Checking Hologram', icon: '✨' },
                  { key: 'idFormat', label: 'Validating ID Format', icon: '🔢' },
                  { key: 'tampering', label: 'Detecting Tampering', icon: '🔍' }
                ].map(step => (
                  <div key={step.key} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    processingSteps[step.key] === 'processing' ? 'bg-blue-50 border border-blue-200' :
                    processingSteps[step.key] === 'completed' ? 'bg-green-50' :
                    processingSteps[step.key] === 'failed' ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <div className="text-2xl">{step.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{step.label}</div>
                    </div>
                    <div>
                      {processingSteps[step.key] === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>}
                      {processingSteps[step.key] === 'processing' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                      {processingSteps[step.key] === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {processingSteps[step.key] === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Section - Screen 2: Claims Breakdown */}
      {activeScreen === 'results' && (
        <section className="pt-20 min-h-screen flex items-start sm:items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
          <div className="w-full max-w-2xl">
            <div className="space-y-6">

              {/* Back Button */}
              <button
                onClick={() => setActiveScreen('cardVerify')}
                className="flex items-center gap-1 text-gray-700 hover:text-black font-semibold text-sm bg-white/40 hover:bg-white/70 py-2 px-4 rounded-xl backdrop-blur-md transition-all self-start shadow-sm border border-black/5"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back_ios</span>
                Back
              </button>

              {/* Card Verification Result */}
              {cardValidationResult && (
                <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
                  cardValidationResult.isValid ? 'border-green-500' : 'border-red-500'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    {cardValidationResult.isValid ? (
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-500" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {cardValidationResult.isValid ? 'Card Verified!' : 'Verification Issues'}
                      </h3>
                      <p className="text-gray-600">
                        {cardType.toUpperCase()} Card • Score: {Math.round(cardValidationResult.overallScore * 100)}%
                      </p>
                    </div>
                  </div>

                  {/* Verification Checks */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { key: 'qrCode', label: 'QR Code' },
                      { key: 'hologram', label: 'Hologram' },
                      { key: 'idFormat', label: 'ID Format' },
                      { key: 'tampering', label: 'No Tampering' }
                    ].map(check => {
                      const result = cardValidationResult.checks[check.key as keyof typeof cardValidationResult.checks];
                      return (
                        <div key={check.key} className={`p-3 rounded-lg flex items-center gap-2 ${
                          result.passed ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          {result.passed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">{check.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {cardValidationResult.flags.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 font-medium">⚠️ {cardValidationResult.flags.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Results Card */}
              <div className="bg-white rounded-3xl shadow-xl shadow-black/5 overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="text-white p-6 sm:p-8" style={{ background: cardValidationResult?.isValid 
                  ? `linear-gradient(90deg, ${palette.forestMoss}, ${palette.cinnabar})` 
                  : 'linear-gradient(90deg, #DC2626, #991B1B)' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: '#F7F9F6', opacity: 0.95 }}>Your Bill: ₹{billAmount}</p>
                  <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
                    {cardValidationResult?.isValid ? 'Great News!' : 'Card Not Verified'}
                  </h2>
                  <p className="opacity-90 leading-relaxed text-sm sm:text-base">
                    {cardValidationResult?.isValid 
                      ? 'You can save money with these schemes based on your details.'
                      : 'Your card could not be verified. Don\'t worry - we have other options to help you!'}
                  </p>
                </div>

                {/* CONDITIONAL: Show Benefits OR EMI Option */}
                {cardValidationResult?.isValid ? (
                  <>
                    {/* Savings Summary - Only for valid cards */}
                    <div className="p-6 sm:p-8 border-b border-gray-100">
                      <div className="rounded-2xl p-6 sm:p-8 border-2 shadow-sm" style={{ background: '#FBFBFE', borderColor: palette.forestMoss }}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-gray-600 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">Total You Can Get Back</p>
                            <p className="text-4xl sm:text-5xl font-extrabold text-green-700 mb-1 tracking-tight">
                              ₹{Math.round(parseInt(billAmount || '0') * 0.7).toLocaleString()}
                            </p>
                            <div className="inline-flex mt-2 items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none bg-green-100 text-green-800">
                              Save {Math.round((0.7 * 100))}% of your bill!
                            </div>
                          </div>
                          <div className="shrink-0 select-none flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full border border-green-100 shadow-sm">
                            <Coins className="text-green-600 w-10 h-10 sm:w-12 sm:h-12" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Schemes Table - Only for valid cards */}
                    <div className="p-6 sm:p-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Which Schemes Can Help You?</h3>

                      <div className="space-y-4">
                        {/* PM-JAY */}
                        <div className="border-2 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-md" style={{ borderColor: palette.forestMoss, background: '#FBFBFE' }}>
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 rounded-xl text-green-600">
                                <Building className="w-6 h-6 sm:w-7 sm:h-7" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg sm:text-xl">PM-JAY</h4>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Ayushman Bharat Scheme</p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border sm:border-transparent border-green-100">
                              <div className="text-2xl font-bold" style={{ color: palette.forestMoss }}>
                                ₹{Math.round(parseInt(billAmount || '0') * 0.5).toLocaleString()}
                              </div>
                              <div className="text-xs font-bold mt-1 tracking-wider uppercase" style={{ color: palette.forestMoss }}>✓ Eligible</div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border border-green-50">
                            <p className="leading-relaxed">
                              <strong className="text-gray-900">What to do:</strong> Ask at hospital for PM-JAY desk. Show your ID. They handle everything.
                            </p>
                          </div>
                        </div>

                        {/* ESIC */}
                        <div className="border-2 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-md" style={{ borderColor: '#D7B82A', background: '#FFFBEB' }}>
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-yellow-100/50 rounded-xl text-yellow-600">
                                <HardHat className="w-6 h-6 sm:w-7 sm:h-7" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg sm:text-xl">ESIC</h4>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Worker Insurance</p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border sm:border-transparent border-yellow-100">
                              <div className="text-2xl font-bold" style={{ color: '#B58200' }}>
                                ₹{Math.round(parseInt(billAmount || '0') * 0.2).toLocaleString()}
                              </div>
                              <div className="text-xs font-bold mt-1 tracking-wider uppercase" style={{ color: '#B58200' }}>✓ Eligible</div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border border-yellow-50">
                            <p className="leading-relaxed">
                              <strong className="text-gray-900">What to do:</strong> Find your ESIC card. Visit ESIC office nearby with card & bank passbook.
                            </p>
                          </div>
                        </div>

                        {/* Group Policy */}
                        <div className="border-2 border-gray-200 rounded-2xl p-5 sm:p-6 bg-gray-50 opacity-80">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-gray-200 rounded-xl text-gray-500">
                                <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-600 text-lg sm:text-xl">Group Policy</h4>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Corporate / Employer</p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="text-2xl font-bold text-gray-400">₹0</div>
                              <div className="text-xs text-gray-400 font-bold mt-1 tracking-wider uppercase">✗ Not Found</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Next Steps - For valid cards */}
                    <div className="p-6 sm:p-8 border-t border-gray-100" style={{ background: palette.lavender }}>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">What to Do Now?</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4 bg-white/60 p-3 sm:p-4 rounded-xl">
                          <div className="text-lg font-bold shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm" style={{ background: palette.forestMoss }}>1</div>
                          <div>
                            <p className="font-bold text-gray-900">Go to PM-JAY desk at hospital</p>
                            <p className="text-sm text-gray-600 mt-1">Bring: ID, address proof, hospital bill</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 bg-white/60 p-3 sm:p-4 rounded-xl">
                          <div className="text-lg font-bold shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm" style={{ background: palette.forestMoss }}>2</div>
                          <div>
                            <p className="font-bold text-gray-900">Find your local ESIC office</p>
                            <p className="text-sm text-gray-600 mt-1">
                              <button className="text-blue-600 font-medium hover:underline flex items-center gap-0.5">
                                Search nearby <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              </button>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 bg-white/60 p-3 sm:p-4 rounded-xl">
                          <div className="text-lg font-bold shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm" style={{ background: palette.forestMoss }}>3</div>
                          <div>
                            <p className="font-bold text-gray-900">Call us if you need help</p>
                            <p className="text-sm text-gray-600 mt-1 font-medium">Toll Free: 1800-MED-HELP (24/7)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - For valid cards */}
                    <div className="p-6 sm:p-8 bg-white border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button className="border-2 w-full py-4 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all font-bold text-base shadow-sm" style={{ borderColor: palette.forestMoss, color: palette.forestMoss }}>
                        Share Result
                      </button>
                      <button 
                        onClick={() => generateClaimsSummaryPDF(
                          patientName,
                          parseInt(billAmount || '0'),
                          cardType,
                          cardValidationResult?.overallScore || 0
                        )}
                        className="text-white w-full py-4 rounded-xl hover:shadow-lg active:scale-[0.98] transition-all font-bold text-base" 
                        style={{ background: `linear-gradient(90deg, ${palette.forestMoss}, ${palette.cinnabar})` }}
                      >
                        Get Documents
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* EMI OPTION - For invalid/unverified cards */}
                    <div className="p-6 sm:p-8 border-b border-gray-100">
                      <div className="rounded-2xl p-6 sm:p-8 border-2 border-red-200 shadow-sm bg-red-50">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-red-800 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">Card Verification Score</p>
                            <p className="text-4xl sm:text-5xl font-extrabold text-red-600 mb-1 tracking-tight">
                              {Math.round((cardValidationResult?.overallScore || 0) * 100)}%
                            </p>
                            <div className="inline-flex mt-2 items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none bg-red-100 text-red-800">
                              Below verification threshold
                            </div>
                          </div>
                          <div className="shrink-0 select-none flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full border border-red-200 shadow-sm">
                            <XCircle className="text-red-500 w-10 h-10 sm:w-12 sm:h-12" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* EMI Suggestion Section */}
                    <div className="p-6 sm:p-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Don't Worry - We Can Still Help!</h3>
                      <p className="text-gray-600 mb-6">Since your card couldn't be verified for government schemes, we recommend our EMI payment option to ease your financial burden.</p>

                      <div className="space-y-4">
                        {/* EMI Option Card */}
                        <div className="border-2 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-md" style={{ borderColor: '#6366F1', background: '#EEF2FF' }}>
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-xl text-indigo-600">
                                <CreditCard className="w-6 h-6 sm:w-7 sm:h-7" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg sm:text-xl">Easy EMI Plan</h4>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Pay in easy monthly installments</p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border sm:border-transparent border-indigo-100">
                              <div className="text-2xl font-bold text-indigo-600">
                                ₹{Math.round(parseInt(billAmount || '0') / 6).toLocaleString()}/mo
                              </div>
                              <div className="text-xs font-bold mt-1 tracking-wider uppercase text-indigo-600">6 months @ 0% interest</div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border border-indigo-100">
                            <p className="leading-relaxed">
                              <strong className="text-gray-900">Benefits:</strong> No upfront payment required. Split ₹{parseInt(billAmount || '0').toLocaleString()} into 6 easy payments. Zero processing fee for first-time users.
                            </p>
                          </div>
                        </div>

                        {/* Alternative: Manual Verification */}
                        <div className="border-2 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-md border-amber-300 bg-amber-50">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-amber-100 rounded-xl text-amber-600">
                                <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg sm:text-xl">Manual Card Verification</h4>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Visit PM-JAY desk for in-person verification</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border border-amber-100">
                            <p className="leading-relaxed">
                              <strong className="text-gray-900">Still think your card is valid?</strong> Visit the PM-JAY desk at the hospital with your original card and ID for manual verification. Our automated check may have flagged issues that can be resolved in person.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Next Steps - For invalid cards */}
                    <div className="p-6 sm:p-8 border-t border-gray-100" style={{ background: '#FEF2F2' }}>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">Your Options</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4 bg-white/60 p-3 sm:p-4 rounded-xl">
                          <div className="text-lg font-bold shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm bg-indigo-500">1</div>
                          <div>
                            <p className="font-bold text-gray-900">Apply for EMI Payment Plan</p>
                            <p className="text-sm text-gray-600 mt-1">Quick approval, start paying in easy monthly installments</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 bg-white/60 p-3 sm:p-4 rounded-xl">
                          <div className="text-lg font-bold shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm bg-amber-500">2</div>
                          <div>
                            <p className="font-bold text-gray-900">Try Manual Verification</p>
                            <p className="text-sm text-gray-600 mt-1">Visit PM-JAY desk with original card for in-person check</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 bg-white/60 p-3 sm:p-4 rounded-xl">
                          <div className="text-lg font-bold shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm bg-gray-500">3</div>
                          <div>
                            <p className="font-bold text-gray-900">Contact Support</p>
                            <p className="text-sm text-gray-600 mt-1 font-medium">Toll Free: 1800-MED-HELP (24/7)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - For invalid cards */}
                    <div className="p-6 sm:p-8 bg-white border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={handleNewScan}
                        className="border-2 border-gray-300 w-full py-4 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all font-bold text-base shadow-sm text-gray-700"
                      >
                        Try Different Card
                      </button>
                      <button className="text-white w-full py-4 rounded-xl hover:shadow-lg active:scale-[0.98] transition-all font-bold text-base bg-gradient-to-r from-indigo-600 to-purple-600">
                        Apply for EMI
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* FAQ Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Common Questions</h3>
                <div className="space-y-4">
                  <details className="group cursor-pointer bg-gray-50 rounded-xl p-4">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between hover:text-green-700 select-none">
                      Is this really free?
                      <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-gray-400">keyboard_arrow_down</span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed border-t border-gray-200 pt-3">
                      Yes! These are government schemes meant for you. We just help you get what you already deserve without any hidden fees.
                    </p>
                  </details>
                  <details className="group cursor-pointer bg-gray-50 rounded-xl p-4">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between hover:text-green-700 select-none">
                      What if I don't qualify?
                      <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-gray-400">keyboard_arrow_down</span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed border-t border-gray-200 pt-3">
                      We can help you with EMI (easy payment plans) to pay your bill in smaller amounts so you don't face financial burden at once.
                    </p>
                  </details>
                  <details className="group cursor-pointer bg-gray-50 rounded-xl p-4">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between hover:text-green-700 select-none">
                      How long does it take?
                      <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-gray-400">keyboard_arrow_down</span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed border-t border-gray-200 pt-3">
                      PM-JAY is usually instant at the hospital. ESIC claims generally take 2-5 days to process. We'll guide you through each step.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
