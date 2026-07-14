import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, Upload, Trash2, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';

interface SignatureBlockProps {
  id?: string;
  roleTitle: string; // e.g. "Chairman, School of Engineering HND Projects Committee"
  signatoryName: string;
  onNameChange: (name: string) => void;
  signatureData: string | null;
  onSignatureChange: (signature: string | null, type: 'drawn' | 'typed' | 'uploaded') => void;
  signType: 'drawn' | 'typed' | 'uploaded';
  dateValue: string;
  onDateChange: (date: string) => void;
  isValidated: boolean;
  onValidate: () => void;
}

export const SignatureBlock: React.FC<SignatureBlockProps> = ({
  id,
  roleTitle,
  signatoryName,
  onNameChange,
  signatureData,
  onSignatureChange,
  signType,
  dateValue,
  onDateChange,
  isValidated,
  onValidate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedFont, setTypedFont] = useState<'cursive' | 'serif' | 'fantasy'>('cursive');
  const [typedSigText, setTypedSigText] = useState('');
  const [timestamp, setTimestamp] = useState<string | null>(null);

  // Initialize canvas stroke styles
  useEffect(() => {
    if (signType === 'drawn' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1a2a6c'; // DSPG Blue
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [signType]);

  // Update canvas when drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasData();
  };

  const saveCanvasData = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Check if canvas is empty
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
        const hasContent = buffer.some(color => color !== 0);
        if (hasContent) {
          const dataUrl = canvas.toDataURL('image/png');
          onSignatureChange(dataUrl, 'drawn');
          setTimestamp(new Date().toLocaleString('en-NG'));
        }
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onSignatureChange(null, 'drawn');
        setTimestamp(null);
      }
    }
  };

  // Convert typed name to cursive signature
  const handleTypeSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setTypedSigText(text);
    if (text.trim() === '') {
      onSignatureChange(null, 'typed');
      setTimestamp(null);
      return;
    }

    // Draw typed text onto a hidden canvas to create PNG base64
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1a2a6c'; // DSPG Blue
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      
      let fontStyle = 'italic 32px cursive';
      if (typedFont === 'serif') fontStyle = 'italic 32px Georgia, serif';
      if (typedFont === 'fantasy') fontStyle = '32px Impact, Charcoal, sans-serif';
      
      ctx.font = fontStyle;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      
      onSignatureChange(canvas.toDataURL('image/png'), 'typed');
      setTimestamp(new Date().toLocaleString('en-NG'));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSignatureChange(event.target.result as string, 'uploaded');
          setTimestamp(new Date().toLocaleString('en-NG'));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id={id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {roleTitle}
        </label>
        <input
          type="text"
          className="w-full text-base font-semibold text-slate-800 border-b border-slate-200 hover:border-slate-400 focus:border-[#1a2a6c] pb-1 outline-none transition-all duration-150"
          placeholder="Enter Signatory Full Name"
          value={signatoryName}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      {/* Mode Switches */}
      <div className="flex gap-1.5 mb-3 bg-slate-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => {
            onSignatureChange(null, 'drawn');
            setTypedSigText('');
          }}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all',
            signType === 'drawn' ? 'bg-white text-[#1a2a6c] shadow-xs' : 'text-slate-600 hover:text-slate-800'
          )}
        >
          <PenTool className="h-3.5 w-3.5" />
          Draw
        </button>
        <button
          type="button"
          onClick={() => {
            onSignatureChange(null, 'typed');
            setTypedSigText('');
          }}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all',
            signType === 'typed' ? 'bg-white text-[#1a2a6c] shadow-xs' : 'text-slate-600 hover:text-slate-800'
          )}
        >
          <Type className="h-3.5 w-3.5" />
          Type
        </button>
        <button
          type="button"
          onClick={() => {
            onSignatureChange(null, 'uploaded');
            setTypedSigText('');
          }}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all',
            signType === 'uploaded' ? 'bg-white text-[#1a2a6c] shadow-xs' : 'text-slate-600 hover:text-slate-800'
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
      </div>

      {/* Dynamic Signature Area */}
      <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 relative overflow-hidden h-[130px] flex items-center justify-center">
        {signType === 'drawn' && (
          <div className="w-full h-full flex flex-col justify-between">
            <canvas
              ref={canvasRef}
              width={400}
              height={110}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full bg-white rounded cursor-crosshair touch-none"
            />
            {signatureData && (
              <button
                type="button"
                onClick={clearCanvas}
                className="absolute bottom-2 right-2 p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100"
                title="Clear Signature"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {signType === 'typed' && (
          <div className="w-full h-full flex flex-col justify-between p-2">
            <div className="flex gap-2 mb-1.5">
              <button
                type="button"
                onClick={() => {
                  setTypedFont('cursive');
                  const event = { target: { value: typedSigText } } as React.ChangeEvent<HTMLInputElement>;
                  // Wait for font change then update signature
                  setTimeout(() => handleTypeSignature(event), 0);
                }}
                className={clsx('px-2 py-0.5 text-[10px] rounded border font-medium', typedFont === 'cursive' ? 'bg-[#1a2a6c] text-white' : 'bg-white border-slate-200')}
              >
                Cursive
              </button>
              <button
                type="button"
                onClick={() => {
                  setTypedFont('serif');
                  const event = { target: { value: typedSigText } } as React.ChangeEvent<HTMLInputElement>;
                  setTimeout(() => handleTypeSignature(event), 0);
                }}
                className={clsx('px-2 py-0.5 text-[10px] rounded border font-medium', typedFont === 'serif' ? 'bg-[#1a2a6c] text-white' : 'bg-white border-slate-200')}
              >
                Elegant Serif
              </button>
            </div>
            <input
              type="text"
              placeholder="Type signature name..."
              value={typedSigText}
              onChange={handleTypeSignature}
              className="w-full px-2.5 py-1 text-sm bg-white border border-slate-200 rounded outline-none focus:border-[#1a2a6c]"
            />
            <div className="h-10 flex items-center justify-center mt-1 bg-white rounded">
              {signatureData ? (
                <img src={signatureData} alt="Typed Signature Preview" className="max-h-full object-contain" />
              ) : (
                <span className="text-xs text-slate-400 italic">Signature preview will appear here</span>
              )}
            </div>
          </div>
        )}

        {signType === 'uploaded' && (
          <div className="w-full h-full flex flex-col justify-center items-center p-2 bg-white rounded">
            {signatureData ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={signatureData} alt="Uploaded Signature" className="max-h-full max-w-full object-contain" />
                <button
                  type="button"
                  onClick={() => onSignatureChange(null, 'uploaded')}
                  className="absolute bottom-1 right-1 p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full border border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-xs text-slate-600 font-medium">Upload png/jpg image file</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>
        )}
      </div>

      {/* Date Field & Validation Status */}
      <div className="mt-4 grid grid-cols-2 gap-3 items-center">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-500" /> Date Signed
          </label>
          <input
            type="date"
            className="w-full px-2 py-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded outline-none focus:border-[#1a2a6c] transition-all"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-end items-stretch pt-5">
          {!isValidated ? (
            <Button
              variant={signatureData && signatoryName ? 'primary' : 'outline'}
              size="sm"
              disabled={!signatureData || !signatoryName}
              onClick={onValidate}
              className="h-7 text-xs"
            >
              Verify Signature
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-1 py-1 px-2.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-[11px] font-medium animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span>Timestamp Secured</span>
            </div>
          )}
        </div>
      </div>

      {timestamp && isValidated && (
        <p className="text-[9px] text-slate-400 text-right mt-1.5 font-mono">
          Secured: {timestamp}
        </p>
      )}
    </div>
  );
};
