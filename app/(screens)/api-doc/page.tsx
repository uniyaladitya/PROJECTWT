import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "@/components/api-doc/react-swagger";

export default async function ApiDocPage() {
  const spec = await getApiDocs();
  return (
    <main className="container mx-auto py-10">
      <ReactSwagger spec={spec} />
    </main>
  );
}
