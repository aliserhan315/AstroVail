export interface StarDetectionResult {
  starFound: boolean;
  message: string;
  starName: string;
  imageAnalyzed: boolean;
  centerCoordinates?: { ra: number; dec: number };
  ai: {
    message: string;
    confidence: "high" | "medium" | "low";
    tips?: string[];
    context?: string;
    source: string;
  };
}