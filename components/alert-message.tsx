import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle } from "lucide-react"

interface AlertMessageProps {
    error?: string;
    success?: boolean;
    successMessage?: string;
}
export function AlertMessage({ error, success, successMessage }: AlertMessageProps) {
    if (!error && !success) return null;

    return (
            <Alert
      className={cn(
        "text-sm font-medium animate-in fade-in-50 slide-in-from-top-2 duration-300",
        error ? "border-red-500 text-red-600" : "border-green-500 text-green-600"
      )}
    >
      {error ? (
        <AlertCircle className="h-4 w-4 text-red-600" />
      ) : (
        <CheckCircle className="h-4 w-4 text-green-600" />
      )}
      <AlertDescription>
        {error ? error : (successMessage || "Success!")}
      </AlertDescription>
    </Alert>
  )
}