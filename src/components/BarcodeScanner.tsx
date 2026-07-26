// src/components/BarcodeScanner.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { X, Camera, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
}

let globalCameraLock = false;

const stopStream = (stream: MediaStream | null, video: HTMLVideoElement | null) => {
  try {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (video) video.srcObject = null;
  } catch (e) {
    console.warn("Stream stop error:", e);
  }
};

const BarcodeScanner = ({ onScan, onClose }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);
  const scannedRef = useRef(false);
  const controlsRef = useRef<any>(null);

  const [lastCode, setLastCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Must request permission first to get device labels
        await navigator.mediaDevices.getUserMedia({ video: true });
        const all = await navigator.mediaDevices.enumerateDevices();
        const cameras = all.filter((d) => d.kind === "videoinput");
        setDevices(cameras);

     
        const droidcam = cameras.find((d) =>
          d.label.toLowerCase().includes("droidcam")
        );
        setSelectedDeviceId(droidcam?.deviceId ?? cameras[0]?.deviceId ?? "");
      } catch (e) {
        console.error("Could not enumerate devices:", e);
      }
    };
    getDevices();
  }, []);

  const startCamera = useCallback(
    async (deviceId: string) => {
      if (!deviceId) return;

      if (globalCameraLock) {
        await new Promise((r) => setTimeout(r, 400));
        if (!mountedRef.current) return;
      }

      globalCameraLock = true;
      setError(null);
      setIsStarting(true);

      // Stop any existing stream first
      stopStream(streamRef.current, videoRef.current);
      streamRef.current = null;
      try { controlsRef.current?.stop?.(); } catch { /* ignore */ }

      try {
        if (!videoRef.current || !mountedRef.current) {
          globalCameraLock = false;
          return;
        }

        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
        });

        if (!mountedRef.current) {
          stopStream(stream, null);
          globalCameraLock = false;
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;

   
        if (videoRef.current.paused) {
          await videoRef.current.play();
        }
        setIsStarting(false);

        const reader = new BrowserMultiFormatReader();
        controlsRef.current = reader;

        reader.decodeFromVideoElement(
          videoRef.current,
          (result, _err, controls) => {
            if (!mountedRef.current) {
              controls?.stop();
              return;
            }
            if (result && !scannedRef.current) {
              const code = result.getText();
              scannedRef.current = true;
              setLastCode(code);
              setShowSuccess(true);
              onScan(code);

              setTimeout(() => {
                if (mountedRef.current) {
                  scannedRef.current = false;
                  setShowSuccess(false);
                }
              }, 2000);
            }
          }
        );
      } catch (err: any) {
        globalCameraLock = false;
        if (!mountedRef.current) return;
        setIsStarting(false);
        console.error("Camera error:", err.name, err.message);

        switch (err.name) {
          case "NotReadableError":
          case "TrackStartError":
            setError("Camera ត្រូវបានប្រើដោយ app ផ្សេង។\nសូមបិទ apps ដទៃ ហើយចុច Retry។");
            break;
          case "NotAllowedError":
          case "PermissionDeniedError":
            setError("Browser បានបដិសេធ Camera Permission។\nសូម Allow Camera ក្នុង browser settings។");
            break;
          case "NotFoundError":
            setError("រក Camera មិនឃើញ។\nសូមបើក DroidCam Client លើ Laptop ហើយចុច Retry។");
            break;
          default:
            setError(`មិនអាចបើក Camera បាន (${err.name})។\nសូម Reload page ហើយព្យាយាមម្តងទៀត។`);
        }
      }
    },
    [onScan]
  );

  // Start camera when selectedDeviceId is ready
  useEffect(() => {
    mountedRef.current = true;

    if (!selectedDeviceId) return;

    const timer = setTimeout(() => {
      if (mountedRef.current) startCamera(selectedDeviceId);
    }, 150);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      stopStream(streamRef.current, videoRef.current);
      streamRef.current = null;
      globalCameraLock = false;
      try { controlsRef.current?.stop?.(); } catch { /* ignore */ }
    };
  }, [selectedDeviceId, startCamera]);

 
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);
    mountedRef.current = true;
    globalCameraLock = false;
    startCamera(newId);
  };

  const handleRetry = () => {
    stopStream(streamRef.current, videoRef.current);
    streamRef.current = null;
    globalCameraLock = false;
    setError(null);
    setTimeout(() => {
      if (mountedRef.current) startCamera(selectedDeviceId);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-white rounded-2xl overflow-hidden w-[360px] shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-sm">Barcode Scanner</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

       
        {devices.length > 1 && (
          <div className="px-4 py-2 border-b bg-gray-50">
            <div className="relative">
              <select
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 pr-8 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Camera View */}
        <div className="relative bg-black" style={{ minHeight: "260px" }}>
          {error ? (
            <div className="flex flex-col items-center justify-center h-[260px] px-6 text-center gap-3">
              <Camera className="w-12 h-12 text-red-400" />
              <p className="text-white text-xs leading-relaxed whitespace-pre-line">{error}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>
                  បិទ
                </Button>
              </div>
            </div>
          ) : (
            <>
              {isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black gap-3">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-white text-xs">កំពុងបើក Camera...</p>
                </div>
              )}

              <video
                ref={videoRef}
                className="w-full"
                style={{ height: "260px", objectFit: "cover" }}
                muted
                playsInline
              />

              {!isStarting && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-52 h-32">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-blue-400 rounded-tl" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-blue-400 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-blue-400 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-blue-400 rounded-br" />
                    {!showSuccess && (
                      <div
                        className="absolute left-2 right-2 h-0.5 bg-red-500 opacity-80"
                        style={{ animation: "scanLine 2s linear infinite" }}
                      />
                    )}
                  </div>
                </div>
              )}

              {showSuccess && (
                <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                  <div className="bg-green-500 text-white px-6 py-3 rounded-full font-medium text-sm shadow-lg">
                     {lastCode}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 text-center">
          {lastCode ? (
            <p className="text-xs text-green-600 font-medium">
              បានស្កែន: <span className="font-bold">{lastCode}</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              ដាក់ Barcode នៅចំកណ្តាល Frame ពណ៌ខៀវ
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0%   { top: 5%;  }
          50%  { top: 88%; }
          100% { top: 5%;  }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;