import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function ContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <Skeleton className="h-10 w-3/4" />
      
      {/* Metadata skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
      
      {/* Content paragraphs skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      
      {/* Card skeleton */}
      <div className="border-2 border-gray-200 p-6 space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      
      {/* Code example skeleton */}
      <div className="border-2 border-gray-200">
        <Skeleton className="h-12 w-full" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Progress bar skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-2 w-full" />
      </div>
      
      {/* Search skeleton */}
      <Skeleton className="h-10 w-full" />
      
      {/* Navigation skeleton */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-12 w-full" />
            {i === 0 && (
              <div className="ml-6 space-y-1">
                <Skeleton className="h-10 w-11/12" />
                <Skeleton className="h-10 w-11/12" />
                <Skeleton className="h-10 w-11/12" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}