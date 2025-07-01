import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AiIcon } from "@/components/ai-icon";
import type { SectionContent } from "../components/types";

// Placeholder content - to be filled
export const placeholder: SectionContent = {
  title: "YUKLANMOQDA",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <Alert className="border-2 border-black">
            <AiIcon name="info" size={20} />
            <AlertDescription>
              Bu bo'lim hozircha tayyorlanmoqda. Tez orada to'liq kontent qo'shiladi.
            </AlertDescription>
          </Alert>
        )
      }
    }
  ]
};
