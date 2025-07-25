import React, { useEffect } from "react";
import { Protocol } from "@shared/types";
import { useProgressContext } from "@/contexts/progress-context";
import { useProtocolsContext } from "@/contexts/protocols-context";
import { trackTierSystemEvent } from "@/utils/analytics";
import ProtocolCardPure from "./protocol-card-pure";

interface ProtocolCardContainerProps {
  protocol: Protocol;
}

// Container component that connects context to the pure component
export default function ProtocolCardContainer({ protocol }: ProtocolCardContainerProps) {
  const { isProtocolCompleted, toggleProtocolCompleted } = useProgressContext();
  const { isProtocolLocked, userTier } = useProtocolsContext();
  
  const isCompleted = isProtocolCompleted(protocol.id);
  const isLocked = isProtocolLocked(protocol.id, protocol.isFreeAccess);

  // Track protocol access attempt (only when locked status changes)
  useEffect(() => {
    if (isLocked) {
      const reason = !protocol.isFreeAccess ? 'premium_only' : 'limit_reached';
      trackTierSystemEvent.protocolBlocked(protocol.id, reason);
      trackTierSystemEvent.upgradePromptShown('protocol_card');
    } else {
      trackTierSystemEvent.protocolAccess(protocol.id, userTier, true);
    }
  }, [protocol.id, isLocked, protocol.isFreeAccess, userTier]);

  const handleToggleComplete = () => {
    toggleProtocolCompleted(protocol.id, 70);
  };

  const handleUpgradeClick = () => {
    trackTierSystemEvent.upgradePromptClicked('protocol_card');
  };

  return (
    <ProtocolCardPure
      protocol={protocol}
      isCompleted={isCompleted}
      isLocked={isLocked}
      onToggleComplete={handleToggleComplete}
      onUpgradeClick={handleUpgradeClick}
    />
  );
}