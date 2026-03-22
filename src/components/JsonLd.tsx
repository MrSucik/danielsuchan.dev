export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Safe: data is always hardcoded structured data schemas, never user input
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
