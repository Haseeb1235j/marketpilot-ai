import { TOOLS_DIRECTORY } from '../data/toolsDirectory';
import { analyzeChart } from './analysisEngine';

export const TOOL_ENGINE_REGISTRY = {};

// Populate registry using static tools directory and attach operational methods
TOOLS_DIRECTORY.forEach(tool => {
  TOOL_ENGINE_REGISTRY[tool.id] = {
    ...tool,
    
    // Core run function
    analyze: (candles, timeframe, symbol, marketType, chartSource) => {
      return analyzeChart({
        candles,
        selectedTool: tool.id,
        selectedTimeframe: timeframe,
        selectedSymbol: symbol,
        marketType,
        chartSource
      });
    },

    // UI Overlay directions
    buildOverlays: (analysisResult) => {
      return analysisResult?.overlays || [];
    },

    // Video step instructions
    buildVideoSteps: (analysisResult) => {
      return analysisResult?.videoSteps || [];
    },

    // Beginner context
    beginnerExplanation: (analysisResult) => {
      return analysisResult?.beginnerExplanation || "This tool helps traders analyze market patterns. Study how it responds to historical support and resistance zones.";
    },

    // Risk warning context
    riskNote: (analysisResult) => {
      return analysisResult?.riskNote || "Relying on a single technical tool without analyzing the overall market structure or volume context can lead to false interpretations.";
    }
  };
});

export function getToolFromRegistry(toolId) {
  return TOOL_ENGINE_REGISTRY[toolId] || TOOL_ENGINE_REGISTRY['rsi'];
}
