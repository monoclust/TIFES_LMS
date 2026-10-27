import "server-only";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import { canPerform, type Actor } from "@/lib/access-control";
import { prisma } from "@/lib/db";
import { studentImportRowSchema, type StudentImportRow } from "@/lib/validation";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 5000;

type ImportError = { row: number; field: string; message: string };
type ParsedRow = { row: number; data: StudentImportRow; batchId?: string };
type Analysis = { totalRows: number; validRows: ParsedRow[]; errors: ImportError[] };

const headerAliases: Record<string, keyof StudentImportRow> = {
  studentcode: "studentCode", studentid: "studentCode", admissionno: "studentCode", id: "studentCode",
  name: "name", fullname: "name",
  email: "email", emailaddress: "email",
  phone: "phone", mobile: "phone",
  programmecode: "programmeCode", programcode: "programmeCode", programme: "programmeCode", program: "programmeCode",
  batchcode: "batchCode", batch: "batchCode",
  status: "status",
};

function normalizeRecord(raw: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [header, value] of Object.entries(raw)) {
    const key = header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const field = headerAliases[key];
    if (field) output[field] = field === "status" ? String(value ?? "").trim().toUpperCase() : value == null ? "" : String(value).trim();
  }
  return output;
}

async function readRows(file: File): Promise<{ rows: Array<{ row: number; raw: Record<string, unknown> }>; errors: ImportError[] }> {
  if (!file || file.size <= 0 || file.size > MAX_FILE_BYTES) throw new Error("FILE_SIZE_INVALID");
  const name = file.name.toLowerCase();
  if (!name.endsWith(".csv") && !name.endsWith(".xlsx")) throw new Error("FILE_TYPE_INVALID");
  const bytes = await file.arrayBuffer();

  if (name.endsWith(".csv")) {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
    });
    const errors: ImportError[] = parsed.errors.map((error) => ({
      row: (error.row ?? 0) + 2,
      field: "file",
      message: "CSV parse error: " + error.message,
    }));
    if (parsed.data.length > MAX_ROWS) throw new Error("ROW_LIMIT_EXCEEDED");
    const rows = parsed.data.map((raw, index) => ({ row: index + 2, raw: raw as Record<string, unknown> }));
    return { rows, errors };
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(bytes));
  const sheet = workbook.worksheets[0];
  if (!sheet || sheet.rowCount < 2) return { rows: [], errors: [] };
  if (sheet.rowCount - 1 > MAX_ROWS) throw new Error("ROW_LIMIT_EXCEEDED");
  const headers = sheet.getRow(1).values as Array<unknown>;
  const rows: Array<{ row: number; raw: Record<string, unknown> }> = [];
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const raw: Record<string, unknown> = {};
    for (let column = 1; column < headers.length; column += 1) {
      const header = String(headers[column] ?? "").trim();
      if (header) raw[header] = row.getCell(column).text.trim();
    }
    if (Object.values(raw).some((value) => String(value ?? "").trim() !== "")) rows.push({ row: rowNumber, raw });
  }
  return { rows, errors: [] };
}

async function analyse(actor: Actor, institutionId: string, file: File): Promise<Analysis> {
  if (!canPerform(actor, "student:manage", { institutionId })) throw new Error("FORBIDDEN");
  const institution = await prisma.institution.findUnique({ where: { id: institutionId }, select: { id: true, status: true } });
  if (!institution || institution.status !== "ACTIVE") throw new Error("INSTITUTION_UNAVAILABLE");

  const parsed = await readRows(file);
  const errors = [...parsed.errors];
  const validRows: ParsedRow[] = [];
  const seenCodes = new Set<string>();
  const seenEmails = new Set<string>();
  const normalizedRows: Array<{ row: number; data: StudentImportRow }> = [];

  for (const item of parsed.rows) {
    const normalized = normalizeRecord(item.raw);
    if (Object.values(normalized).every((value) => String(value ?? "").trim() === "")) continue;
    const result = studentImportRowSchema.safeParse(normalized);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({ row: item.row, field: String(issue.path[0] ?? "row"), message: issue.message });
      }
      continue;
    }
    const codeKey = result.data.studentCode.toLowerCase();
    if (seenCodes.has(codeKey)) {
      errors.push({ row: item.row, field: "studentCode", message: "Duplicate student ID in this file." });
      continue;
    }
    seenCodes.add(codeKey);
    if (result.data.email) {
      const emailKey = result.data.email.toLowerCase();
      if (seenEmails.has(emailKey)) {
        errors.push({ row: item.row, field: "email", message: "Duplicate email address in this file." });
        continue;
      }
      seenEmails.add(emailKey);
    }
    normalizedRows.push({ row: item.row, data: result.data });
  }

  const codes = normalizedRows.map((row) => row.data.studentCode);
  const emails = normalizedRows.map((row) => row.data.email).filter((email): email is string => Boolean(email));
  const [existingStudents, existingEmailRows] = await Promise.all([
    codes.length ? prisma.studentRecord.findMany({
      where: { institutionId, OR: codes.map((studentCode) => ({ studentCode: { equals: studentCode, mode: "insensitive" as const } })) },
      select: { studentCode: true },
    }) : Promise.resolve([]),
    emails.length ? prisma.studentRecord.findMany({
      where: { institutionId, OR: emails.map((email) => ({ email: { equals: email, mode: "insensitive" as const } })) },
      select: { email: true },
    }) : Promise.resolve([]),
  ]);
  const existingCodes = new Set(existingStudents.map((student) => student.studentCode.toLowerCase()));
  const existingEmails = new Set(existingEmailRows.map((student) => student.email?.toLowerCase()).filter((email): email is string => Boolean(email)));

  const batchCodes = [...new Set(normalizedRows.map((row) => row.data.batchCode).filter((code): code is string => Boolean(code)))];
  const programmeCodes = [...new Set(normalizedRows.map((row) => row.data.programmeCode).filter((code): code is string => Boolean(code)))];
  const [batches, programmes] = await Promise.all([
    batchCodes.length ? prisma.batch.findMany({
      where: { institutionId, OR: batchCodes.map((code) => ({ code: { equals: code, mode: "insensitive" as const } })) },
      include: { programme: { select: { id: true, code: true } } },
    }) : Promise.resolve([]),
    programmeCodes.length ? prisma.programme.findMany({
      where: { institutionId, OR: programmeCodes.map((code) => ({ code: { equals: code, mode: "insensitive" as const } })) },
      select: { id: true, code: true },
    }) : Promise.resolve([]),
  ]);
  const batchMap = new Map(batches.map((batch) => [batch.code.toLowerCase(), batch]));
  const programmeMap = new Map(programmes.map((programme) => [programme.code.toLowerCase(), programme]));

  for (const item of normalizedRows) {
    const codeKey = item.data.studentCode.toLowerCase();
    if (existingCodes.has(codeKey)) {
      errors.push({ row: item.row, field: "studentCode", message: "This student ID already exists in the institution." });
      continue;
    }
    if (item.data.email && existingEmails.has(item.data.email.toLowerCase())) {
      errors.push({ row: item.row, field: "email", message: "This email address already exists in the institution." });
      continue;
    }
    let batchId: string | undefined;
    if (item.data.programmeCode && !programmeMap.has(item.data.programmeCode.toLowerCase())) {
      errors.push({ row: item.row, field: "programmeCode", message: "Programme code was not found in this institution." });
      continue;
    }
    if (item.data.batchCode) {
      const batch = batchMap.get(item.data.batchCode.toLowerCase());
      if (!batch) {
        errors.push({ row: item.row, field: "batchCode", message: "Batch code was not found in this institution." });
        continue;
      }
      if (item.data.programmeCode && batch.programme.code.toLowerCase() !== item.data.programmeCode.toLowerCase()) {
        errors.push({ row: item.row, field: "batchCode", message: "Batch does not belong to the specified programme." });
        continue;
      }
      batchId = batch.id;
    }
    validRows.push({ ...item, batchId });
  }

  return { totalRows: parsed.rows.length, validRows, errors };
}

export async function previewStudentImport(actor: Actor, institutionId: string, file: File) {
  const result = await analyse(actor, institutionId, file);
  return {
    totalRows: result.totalRows,
    validRows: result.validRows.length,
    invalidRows: new Set(result.errors.map((error) => error.row)).size,
    errors: result.errors.slice(0, 200),
    preview: result.validRows.slice(0, 25).map((row) => ({
      row: row.row,
      studentCode: row.data.studentCode,
      name: row.data.name,
      email: row.data.email || "",
      programmeCode: row.data.programmeCode || "",
      batchCode: row.data.batchCode || "",
      status: row.data.status,
    })),
  };
}

export async function commitStudentImport(actor: Actor, institutionId: string, file: File) {
  const result = await analyse(actor, institutionId, file);
  if (result.validRows.length === 0) {
    return { imported: 0, enrolled: 0, totalRows: result.totalRows, invalidRows: new Set(result.errors.map((error) => error.row)).size, errors: result.errors.slice(0, 200) };
  }

  const imported = await prisma.$transaction(async (tx) => {
    const data = result.validRows.map((row) => ({
      institutionId,
      studentCode: row.data.studentCode,
      name: row.data.name,
      email: row.data.email || null,
      phone: row.data.phone || null,
      status: row.data.status,
    }));
    await tx.studentRecord.createMany({ data });
    const createdStudents = await tx.studentRecord.findMany({
      where: { institutionId, studentCode: { in: data.map((row) => row.studentCode) } },
      select: { id: true, studentCode: true },
    });
    const idByCode = new Map(createdStudents.map((student) => [student.studentCode.toLowerCase(), student.id]));
    const enrollments = result.validRows.flatMap((row) => {
      if (!row.batchId) return [];
      const studentId = idByCode.get(row.data.studentCode.toLowerCase());
      return studentId ? [{ studentId, batchId: row.batchId }] : [];
    });
    if (enrollments.length) await tx.enrollment.createMany({ data: enrollments });
    await tx.auditLog.create({
      data: {
        institutionId,
        actorUserId: actor.userId,
        action: "STUDENT_IMPORT_COMMITTED",
        targetType: "StudentRecord",
        safeMetadata: { importedCount: data.length, enrollmentCount: enrollments.length, invalidRowCount: result.errors.length },
      },
    });
    return { imported: data.length, enrolled: enrollments.length };
  });

  return { ...imported, totalRows: result.totalRows, invalidRows: new Set(result.errors.map((error) => error.row)).size, errors: result.errors.slice(0, 200) };
}
