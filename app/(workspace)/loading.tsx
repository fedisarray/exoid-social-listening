import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <div className="exoid-panel space-y-4 p-5">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-60 w-full" />
      </div>
    </div>
  );
}
