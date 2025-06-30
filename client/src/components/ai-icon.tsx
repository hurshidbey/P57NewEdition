import React from 'react';

interface AiIconProps {
  name: string;
  className?: string;
  size?: number;
  set?: 'ai' | 'ui';
}

// Map icon names to their file paths
const iconMap: Record<string, string> = {
  // AI Icon Set
  'brain': '/attached_assets/Ai Icon Set/074-brain.svg',
  'robot': '/attached_assets/Ai Icon Set/099-robot.svg',
  'cpu': '/attached_assets/Ai Icon Set/100-cpu.svg',
  'network': '/attached_assets/Ai Icon Set/063-network.svg',
  'algorithm': '/attached_assets/Ai Icon Set/094-algorithm.svg',
  'thought': '/attached_assets/Ai Icon Set/070-thought.svg',
  'neural': '/attached_assets/Ai Icon Set/021-network-2.svg',
  'data': '/attached_assets/Ai Icon Set/067-data-analysis.svg',
  'binary': '/attached_assets/Ai Icon Set/073-binary.svg',
  'transfer': '/attached_assets/Ai Icon Set/075-transfer.svg',
  'ai': '/attached_assets/Ai Icon Set/097-artificial-intelligence.svg',
  'database': '/attached_assets/Ai Icon Set/092-database.svg',
  'chat': '/attached_assets/Ai Icon Set/022-chat.svg',
  'teaching': '/attached_assets/Ai Icon Set/011-teaching.svg',
  'prediction': '/attached_assets/Ai Icon Set/010-prediction.svg',
  'detection': '/attached_assets/Ai Icon Set/001-detection.svg',
  'turing': '/attached_assets/Ai Icon Set/007-turing-test.svg',
  'code': '/attached_assets/Ai Icon Set/046-code.svg',
  'cloud': '/attached_assets/Ai Icon Set/082-cloud-computing.svg',
  'chip': '/attached_assets/Ai Icon Set/059-chip.svg',
  'secure': '/attached_assets/Ai Icon Set/064-secure-data.svg',
  'recognition': '/attached_assets/Ai Icon Set/035-recognition.svg',
  'translation': '/attached_assets/Ai Icon Set/030-translation.svg',
  'bot': '/attached_assets/Ai Icon Set/086-bot.svg',
  'science': '/attached_assets/Ai Icon Set/056-science.svg',
  'gaming': '/attached_assets/Ai Icon Set/018-gaming.svg',
  'assistant': '/attached_assets/Ai Icon Set/078-assistant.svg',
  'chess': '/attached_assets/Ai Icon Set/079-chess.svg',
  'android': '/attached_assets/Ai Icon Set/088-android.svg',
  'arm': '/attached_assets/Ai Icon Set/080-mechanical-arm.svg',
  'file': '/attached_assets/Ai Icon Set/062-file-transfer.svg',
  'rocket': '/attached_assets/Ai Icon Set/009-rocket.svg',
  'checklist': '/attached_assets/Ai Icon Set/012-check-list.svg',
  
  // General UI Icons
  'layers': '/attached_assets/General UI Icons Essential Set/layers.svg',
  'link': '/attached_assets/General UI Icons Essential Set/link.svg',
  'broken-link': '/attached_assets/General UI Icons Essential Set/broken-link.svg',
  'compass': '/attached_assets/General UI Icons Essential Set/compass.svg',
  'diamond': '/attached_assets/General UI Icons Essential Set/diamond.svg',
  'hierarchy': '/attached_assets/General UI Icons Essential Set/network.svg',
  'route': '/attached_assets/General UI Icons Essential Set/route.svg',
  'shuffle': '/attached_assets/General UI Icons Essential Set/shuffle.svg',
  'target': '/attached_assets/General UI Icons Essential Set/target.svg',
  'workflow': '/attached_assets/General UI Icons Essential Set/workflow.svg',
  'magic-wand': '/attached_assets/General UI Icons Essential Set/magic-wand.svg',
  'funnel': '/attached_assets/General UI Icons Essential Set/funnel.svg',
  'placeholder': '/attached_assets/General UI Icons Essential Set/placeholder.svg',
  'search': '/attached_assets/General UI Icons Essential Set/search.svg',
  'settings': '/attached_assets/General UI Icons Essential Set/settings.svg',
  'checked': '/attached_assets/General UI Icons Essential Set/checked.svg',
  'close': '/attached_assets/General UI Icons Essential Set/close.svg',
  'info': '/attached_assets/General UI Icons Essential Set/info.svg',
  'warning': '/attached_assets/General UI Icons Essential Set/warning.svg',
  'question': '/attached_assets/General UI Icons Essential Set/question.svg',
  'lightbulb': '/attached_assets/General UI Icons Essential Set/idea.svg',
  'flag': '/attached_assets/General UI Icons Essential Set/flag.svg',
  'pin': '/attached_assets/General UI Icons Essential Set/pin.svg',
  'puzzle': '/attached_assets/General UI Icons Essential Set/puzzle.svg',
  'shield': '/attached_assets/General UI Icons Essential Set/shield.svg',
  'arrow-right': '/attached_assets/General UI Icons Essential Set/next.svg',
  'arrow-left': '/attached_assets/General UI Icons Essential Set/back.svg',
  'chevron-right': '/attached_assets/General UI Icons Essential Set/next.svg',
  'play': '/attached_assets/General UI Icons Essential Set/play-button.svg',
  'pause': '/attached_assets/General UI Icons Essential Set/pause.svg'
};

export function AiIcon({ name, className = "", size = 24, set = 'ai' }: AiIconProps) {
  const iconPath = iconMap[name] || iconMap['ai'];
  
  return (
    <img 
      src={iconPath} 
      alt={name}
      className={className}
      width={size}
      height={size}
      style={{ filter: 'brightness(0) saturate(100%)' }} // Make icons black
    />
  );
}