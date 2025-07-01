import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AiIcon } from "@/components/ai-icon";

interface FormErrors {
  prompt?: string;
  context?: string;
}

export function PromptForm() {
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!prompt.trim()) {
      newErrors.prompt = "Prompt kiritish majburiy";
    } else if (prompt.length < 10) {
      newErrors.prompt = "Prompt kamida 10 ta belgidan iborat bo'lishi kerak";
    }
    
    if (context && context.length > 500) {
      newErrors.context = "Kontekst 500 ta belgidan oshmasligi kerak";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSuccess(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSuccess(false);
      setPrompt("");
      setContext("");
    }, 3000);
  };

  return (
    <Card className="border-2 border-black">
      <div className="bg-black text-white p-4">
        <h4 className="font-bold uppercase">PROMPT YARATISH FORMASI</h4>
      </div>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-bold mb-2">
              PROMPT <span className="text-red-600">*</span>
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (errors.prompt) {
                  setErrors(prev => ({ ...prev, prompt: undefined }));
                }
              }}
              className={`w-full min-h-[100px] p-3 border-2 text-gray-900 bg-white 
                ${errors.prompt ? 'border-red-600' : 'border-black'} 
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2`}
              placeholder="Promptingizni yozing..."
              disabled={isSubmitting}
            />
            {errors.prompt && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AiIcon name="warning" size={16} />
                <span>{errors.prompt}</span>
              </div>
            )}
          </div>

          {/* Context Input */}
          <div>
            <label htmlFor="context" className="block text-sm font-bold mb-2">
              KONTEKST (ixtiyoriy)
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => {
                setContext(e.target.value);
                if (errors.context) {
                  setErrors(prev => ({ ...prev, context: undefined }));
                }
              }}
              className={`w-full min-h-[80px] p-3 border-2 text-gray-900 bg-white 
                ${errors.context ? 'border-red-600' : 'border-black'} 
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2`}
              placeholder="Qo'shimcha kontekst..."
              disabled={isSubmitting}
            />
            {errors.context && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AiIcon name="warning" size={16} />
                <span>{errors.context}</span>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-600">
              {context.length}/500 belgi
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Yuborilmoqda...
              </span>
            ) : success ? (
              <span className="flex items-center gap-2">
                <AiIcon name="checked" size={20} />
                Muvaffaqiyatli yuborildi!
              </span>
            ) : (
              'YUBORISH'
            )}
          </Button>
        </form>

        {success && (
          <Alert className="mt-4 border-2 border-green-600 bg-green-50">
            <AiIcon name="checked" size={20} className="text-green-600" />
            <AlertDescription className="text-green-800">
              Promptingiz muvaffaqiyatli saqlandi!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}