import { useState, useEffect } from "react";
import { X, Heart, Search, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "mjdocs_onboarding_complete";

interface WelcomeHintsProps {
  show?: boolean;
}

export function WelcomeHints({ show }: WelcomeHintsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed && show !== false) {
      // Small delay to show after page renders
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const hints = [
    {
      icon: Sparkles,
      title: "Welcome to MJDOCS!",
      description: "Find academic notes organized by subject, module, or semester. Let's show you around!",
    },
    {
      icon: Search,
      title: "Search & Filter",
      description: "Use the search bar to find documents by title, description, or tags. Filter by category or semester.",
    },
    {
      icon: Heart,
      title: "Save Favorites",
      description: "Click the heart icon on any document to save it to your favorites for quick access later.",
    },
    {
      icon: Download,
      title: "Download Anytime",
      description: "Download documents instantly. Your download history is saved for easy re-access.",
    },
  ];

  const handleNext = () => {
    if (currentHint < hints.length - 1) {
      setCurrentHint(currentHint + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
  };

  if (!isVisible) return null;

  const CurrentIcon = hints[currentHint].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CurrentIcon className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            {hints[currentHint].title}
          </h2>
          <p className="text-muted-foreground">
            {hints[currentHint].description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {hints.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentHint ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDismiss} className="flex-1">
            Skip
          </Button>
          <Button onClick={handleNext} className="flex-1">
            {currentHint === hints.length - 1 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook to check if user is new
export function useIsNewUser() {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    setIsNew(!completed);
  }, []);

  return isNew;
}

// Function to reset onboarding (for testing)
export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}
