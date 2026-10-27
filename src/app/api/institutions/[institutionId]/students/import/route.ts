import { NextResponse } from "next/server";
import { getCurrentActor } from "@/lib/current-actor";
import { commitStudentImport, previewStudentImport } from "@/lib/student-import-service";

export async function POST(request: Request, context: { params: Promise<{ institutionId: string }> }) {
  const actor = await getCurrentActor();
  if (!actor) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { institutionId } = await context.params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected a multipart form with an import file." }, { status: 400 });
  }
  const mode = formData.get("mode");
  const file = formData.get("file");
  if (mode !== "preview" && mode !== "commit") return NextResponse.json({ error: "Invalid import mode." }, { status: 400 });
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") return NextResponse.json({ error: "Choose a CSV or XLSX file." }, { status: 400 });

  try {
    const result = mode === "preview"
      ? await previewStudentImport(actor, institutionId, file)
      : await commitStudentImport(actor, institutionId, file);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "FORBIDDEN") return NextResponse.json({ error: "You cannot import students for this institution." }, { status: 403 });
    if (message === "INSTITUTION_UNAVAILABLE") return NextResponse.json({ error: "The institution is unavailable." }, { status: 404 });
    if (message === "FILE_SIZE_INVALID" || message === "ROW_LIMIT_EXCEEDED") return NextResponse.json({ error: "The file exceeds the allowed size or row limit." }, { status: 413 });
    if (message === "FILE_TYPE_INVALID") return NextResponse.json({ error: "Only CSV and XLSX files are supported." }, { status: 415 });
    if (message === "P2002") return NextResponse.json({ error: "A record changed during import. Preview the file again before committing." }, { status: 409 });
    return NextResponse.json({ error: "The import could not be processed. Check the file format and try again." }, { status: 400 });
  }
}
