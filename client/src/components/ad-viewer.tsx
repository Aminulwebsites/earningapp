import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, Clock, Lock, Settings, Copy, ExternalLink, CheckCircle, X } from "lucide-react";

interface AdViewerProps {
  ads: any[];
  sessionId: string;
  onAdComplete: () => void;
}

export default function AdViewer({ ads, sessionId, onAdComplete }: AdViewerProps) {
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [currentAdView, setCurrentAdView] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const [showAdMobDetails, setShowAdMobDetails] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const { toast } = useToast();
  const adContainerRef = useRef<HTMLDivElement>(null);

  // AdMob Configuration
  const adMobConfig = {
    appId: "earnrupeeca-app-pub-3367275049693713~2891916242",
    adUnitId: "1ca-app-pub-3367275049693713/9201840585",
    publisherId: "ca-pub-3367275049693713"
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWatching && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setCanComplete(true);
            setIsWatching(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWatching]);

  const loadRealAdMobAd = () => {
    try {
      // Clear any existing ads
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }

      // Create the ad element for rewarded video ads
      const adElement = document.createElement('ins');
      adElement.className = 'adsbygoogle';
      adElement.style.display = 'block';
      adElement.style.width = '100%';
      adElement.style.height = '100%';
      adElement.setAttribute('data-ad-client', adMobConfig.publisherId);
      adElement.setAttribute('data-ad-slot', '9201840585'); // Extract just the slot number
      adElement.setAttribute('data-ad-format', 'fluid');
      adElement.setAttribute('data-layout-key', '-fb+5w+4e-db+86');

      if (adContainerRef.current) {
        adContainerRef.current.appendChild(adElement);
        
        // Push the ad with error handling
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          
          // Wait for ad to load
          setTimeout(() => {
            const hasAd = adElement.querySelector('iframe') || adElement.innerHTML.includes('google');
            if (hasAd) {
              setAdLoaded(true);
              setAdError(null);
              toast({
                title: "Advertisement Loaded",
                description: "Video ad ready - earnings enabled",
              });
            } else {
              setAdError("No ads available right now. Please try again later.");
              toast({
                title: "No Ads Available",
                description: "No advertisements available currently",
                variant: "destructive",
              });
            }
          }, 2000);
          
        } catch (pushError) {
          console.error('AdSense push error:', pushError);
          setAdError("Failed to load AdMob ads.");
          toast({
            title: "Ad Loading Failed",
            description: "Could not connect to ad servers",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('AdMob loading error:', error);
      setAdError("AdMob service unavailable.");
      toast({
        title: "Service Unavailable",
        description: "Advertisement service is not available",
        variant: "destructive",
      });
    }
  };

  const selectAd = async (ad: any) => {
    setShowAdMobDetails(true);
    setAdLoaded(false);
    setTimeRemaining(ad.duration); // Set timer to actual ad duration
    setAdError(null);
    
    // Load real AdMob ad first
    setTimeout(() => {
      loadRealAdMobAd();
    }, 1000);

    // Wait for ad to load before starting tracking
    setTimeout(async () => {
      // Only proceed if real ad loaded successfully
      if (!adLoaded && !adError) {
        setAdError("Ad failed to load - cannot continue");
        setShowAdMobDetails(false);
        toast({
          title: "Cannot Start",
          description: "No ad loaded. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (adError) {
        setShowAdMobDetails(false);
        toast({
          title: "Ad Unavailable",
          description: adError,
          variant: "destructive",
        });
        return;
      }

      // Only start earning tracking if real ad is loaded
      try {
        const response = await apiRequest("POST", `/api/ads/${ad.id}/start`, {});
        const adView = await response.json();
        
        setCurrentAd(ad);
        setCurrentAdView(adView);
        setTimeRemaining(ad.duration);
        setIsWatching(true);
        setCanComplete(false);
        setShowAdMobDetails(false);
        setShowCloseButton(false);
        
        toast({
          title: "Advertisement Started",
          description: `Watch the ad for ${ad.duration} seconds to earn ₹${ad.earnings}`,
        });
      } catch (error: any) {
        setShowAdMobDetails(false);
        toast({
          title: "Error",
          description: error.message || "Failed to start earning tracking",
          variant: "destructive",
        });
      }
    }, 4000);
  };

  const completeAd = async () => {
    if (!currentAdView || !canComplete || timeRemaining > 0) {
      toast({
        title: "Cannot Complete Yet",
        description: `Please wait ${timeRemaining} more seconds`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", `/api/ads/views/${currentAdView.id}/complete`, {});
      const completedView = await response.json();
      
      toast({
        title: "Ad Completed!",
        description: `You earned ₹${completedView.earnings}`,
      });
      
      setShowCloseButton(true);
      onAdComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete ad",
        variant: "destructive",
      });
    }
  };

  const closeAd = () => {
    setCurrentAd(null);
    setCurrentAdView(null);
    setTimeRemaining(0);
    setIsWatching(false);
    setCanComplete(false);
    setShowCloseButton(false);
    setAdLoaded(false);
    setAdError(null);
  };

  const progressPercentage = currentAd ? 
    Math.round(((currentAd.duration - timeRemaining) / currentAd.duration) * 100) : 0;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Watch Ads & Earn</h2>
        <p className="text-sm text-gray-500 mt-1">Complete ads to earn rupees instantly</p>
      </div>
      
      <CardContent className="p-6">
        {/* AdMob Configuration Display */}
        {showAdMobDetails && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Settings className="h-5 w-5" />
                AdMob Integration Details
              </CardTitle>
              <p className="text-sm text-blue-600">
                Use these details to configure your AdMob integration on third-party mediation platforms:
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-blue-700 mb-1 block">
                  AdMob App ID
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-white border border-blue-200 rounded text-sm font-mono">
                    {adMobConfig.appId}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(adMobConfig.appId, "AdMob App ID")}
                    className="border-blue-200"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-blue-700 mb-1 block">
                  AdMob Ad Unit ID
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 p-2 bg-white border border-blue-200 rounded text-sm font-mono">
                    {adMobConfig.adUnitId}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(adMobConfig.adUnitId, "AdMob Ad Unit ID")}
                    className="border-blue-200"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-xs text-blue-600 mb-2 font-medium">Integration Steps:</p>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Sign in to your third-party mediation platform</li>
                  <li>2. Navigate to AdMob integration settings</li>
                  <li>3. Enter the App ID and Ad Unit ID above</li>
                  <li>4. Configure ad placement and targeting</li>
                  <li>5. Test the integration before going live</li>
                </ol>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="text-xs text-blue-600">
                  {adLoaded ? "Connected Successfully" : 
                   adError ? "Connection Error" : 
                   "Connecting to ad network..."}
                </div>
                {adLoaded && <CheckCircle className="h-3 w-3 text-green-600" />}
              </div>
            </CardContent>
          </Card>
        )}

        {currentAd && (
          <div className="bg-white border-2 border-gray-200 rounded-lg aspect-video flex items-center justify-center mb-6 relative overflow-hidden">
            {/* Real Ad Container Only */}
            {adLoaded && !adError ? (
              <div className="w-full h-full relative">
                <div 
                  ref={adContainerRef}
                  className="w-full h-full"
                />
                
                {/* Ad Overlay Info */}
                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs z-10">
                  <CheckCircle className="inline h-3 w-3 mr-1" />
                  Live Ad - Earnings Active
                </div>
                
                {/* Ad timer overlay */}
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm z-10">
                  <Clock className="inline h-3 w-3 mr-1" />
                  <span>0:{timeRemaining.toString().padStart(2, '0')}</span>
                </div>

                {/* Close button after completion */}
                {showCloseButton && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded-lg text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ad Completed!</h3>
                      <p className="text-gray-600 mb-4">You have earned your reward</p>
                      <Button onClick={closeAd} className="bg-green-600 hover:bg-green-700">
                        <X className="h-4 w-4 mr-2" />
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-600">
                  {adError ? (
                    <>
                      <div className="text-red-600 mb-2">⚠️</div>
                      <p className="font-medium">Ad Not Available</p>
                      <p className="text-sm">{adError}</p>
                      <p className="text-xs mt-2">No earnings possible without real ads</p>
                    </>
                  ) : (
                    <>
                      <div className="animate-spin mb-2">⏳</div>
                      <p className="font-medium">Loading Advertisement...</p>
                      <p className="text-sm">Please wait for video ad</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad progress and controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Ad Progress</span>
            </div>
            <span className="text-sm text-gray-500">{progressPercentage}% Complete</span>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-600">
              <span>Earning: </span>
              <span className="font-semibold text-primary">
                ₹{currentAd?.earnings || "0.00"}
              </span>
            </div>
            {!showCloseButton ? (
              <Button 
                onClick={completeAd}
                disabled={!canComplete || !adLoaded || timeRemaining > 0}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {timeRemaining > 0 && <Lock className="h-4 w-4 mr-2" />}
                {timeRemaining > 0 ? `Wait ${timeRemaining}s` : 
                 canComplete && adLoaded ? "Complete & Earn" : "Loading..."}
              </Button>
            ) : (
              <Button 
                onClick={closeAd}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Close Ad
              </Button>
            )}
          </div>
        </div>

        {/* Single Watch Ad Button */}
        {!currentAd && !showAdMobDetails && ads && ads.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => selectAd(ads[0])}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg"
            >
              <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21 6 3"></polygon>
              </svg>
              Watch Ad & Earn ₹{ads[0]?.earnings || "0.00"}
            </Button>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
