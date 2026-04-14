import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormErrorProps {
  errors?: string[];
}

export function FormError({ errors }: FormErrorProps) {
  if (!errors || errors.length === 0) return null;

  return (
    <Alert variant="error">
      <AlertDescription>
        {errors.length === 1 ? (
          errors[0]
        ) : (
          <ul className="list-disc pl-4">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}
