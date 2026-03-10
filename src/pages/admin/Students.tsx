import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Eye, Trash2, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../../../SupabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

type Student = {
  id: string;
  firstname: string;
  lastname: string;
  middle_initial: string;
  section: string;
  student_number: string;
  phone_number: string;
  email: string;
};

type StudentFormData = Omit<Student, "id">;

const EMPTY_FORM: StudentFormData = {
  firstname: "",
  lastname: "",
  middle_initial: "",
  section: "",
  student_number: "",
  phone_number: "",
  email: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pending, setPending] = useState(true);
  const [search, setSearch] = useState("");

  // Dialogs
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<StudentFormData>(EMPTY_FORM);
  const [formPending, setFormPending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadStudents = useCallback(async () => {
    setPending(true);
    const { data, error } = await supabase.from("students").select();
    if (error) toast.error("Failed to load students");
    if (data) setStudents(data);
    setPending(false);
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.firstname?.toLowerCase().includes(q) ||
      s.lastname?.toLowerCase().includes(q) ||
      s.student_number?.toLowerCase().includes(q) ||
      s.section?.toLowerCase().includes(q) ||
      s.phone_number?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  // ── Add ──────────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setAddOpen(true);
  };

  const handleAdd = async () => {
    setFormPending(true);
    const { error } = await supabase.from("students").insert([formData]);
    setFormPending(false);
    if (error) {
      toast.error("Failed to add student: " + error.message);
      return;
    }
    toast.success("Student added successfully");
    setAddOpen(false);
    loadStudents();
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const openEdit = (student: Student) => {
    setEditStudent(student);
    setFormData({
      firstname: student.firstname,
      lastname: student.lastname,
      middle_initial: student.middle_initial,
      section: student.section,
      student_number: student.student_number,
      phone_number: student.phone_number,
      email: student.email,
    });
  };

  const handleEdit = async () => {
    if (!editStudent) return;
    setFormPending(true);
    const { error } = await supabase
      .from("students")
      .update(formData)
      .eq("id", editStudent.id);
    setFormPending(false);
    if (error) {
      toast.error("Failed to update student: " + error.message);
      return;
    }
    toast.success("Student updated successfully");
    setEditStudent(null);
    loadStudents();
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteStudent) return;
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", deleteStudent.id);
    if (error) {
      toast.error("Failed to delete student: " + error.message);
      return;
    }
    toast.success("Student deleted");
    setDeleteStudent(null);
    loadStudents();
  };

  // ── CSV Export ───────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = [
      "student_number",
      "firstname",
      "lastname",
      "middle_initial",
      "section",
      "phone_number",
      "email",
    ];
    const rows = students.map((s) =>
      headers.map((h) => {
        const val = (s as Record<string, string>)[h] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  // ── CSV Import ───────────────────────────────────────────────────────────────
  const CSV_HEADER_MAP: Record<string, keyof StudentFormData> = {
    "student_number": "student_number",
    "firstname": "firstname",
    "first_name": "firstname",
    "lastname": "lastname",
    "last_name": "lastname",
    "middle_initial": "middle_initial",
    "m.i.": "middle_initial",
    "mi": "middle_initial",
    "section": "section",
    "grade & section": "section",
    "grade_section": "section",
    "phone_number": "phone_number",
    "phone no.": "phone_number",
    "phone_no": "phone_number",
    "phone": "phone_number",
    "student no.": "student_number",
    "student_no": "student_number",
    "first name": "firstname",
    "last name": "lastname",
    "email": "email",
    "email_address": "email",
    "email address": "email",
  };

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    values.push(cur.trim());
    return values;
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
      if (lines.length < 2) {
        toast.error("CSV file is empty or has no data rows");
        return;
      }

      const rawHeaders = parseCSVLine(lines[0]);
      const mappedFields = rawHeaders.map((h) =>
        CSV_HEADER_MAP[h.trim().replace(/^"|"$/g, "").toLowerCase()] ?? null
      );

      const hasFirstName = mappedFields.includes("firstname");
      const hasLastName = mappedFields.includes("lastname");
      if (!hasFirstName || !hasLastName) {
        toast.error(
          "CSV must have at minimum 'FIRST NAME' and 'LAST NAME' columns. " +
          `Found headers: ${rawHeaders.join(", ")}`
        );
        return;
      }

      const records: StudentFormData[] = [];

      for (const line of lines.slice(1)) {
        if (!line.trim()) continue;
        const values = parseCSVLine(line);

        const row: Partial<StudentFormData> = {
          student_number: "",
          firstname: "",
          lastname: "",
          middle_initial: "",
          section: "",
          phone_number: "",
          email: "",
        };

        mappedFields.forEach((field, i) => {
          if (field) row[field] = values[i] ?? "";
        });

        if (!row.firstname?.trim() && !row.lastname?.trim()) continue;

        records.push(row as StudentFormData);
      }

      if (records.length === 0) {
        toast.error("No valid student rows found in CSV");
        return;
      }

      const { error } = await supabase.from("students").insert(records);
      if (error) {
        toast.error("Import failed: " + error.message);
        return;
      }
      toast.success(`${records.length} student(s) imported successfully`);
      loadStudents();
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Form field helper ────────────────────────────────────────────────────────
  const field = (key: keyof StudentFormData, label: string, placeholder?: string, type = "text") => (
    <div className="grid gap-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        placeholder={placeholder ?? label}
        value={formData[key]}
        onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Manage Students</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage all LCC students.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search student..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportCSV}
            />

            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileText className="size-4" />
              Import CSV
            </Button>

            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="size-4" />
              Export CSV
            </Button>

            {search && (
              <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
                <X className="size-4" />
                Clear
              </Button>
            )}

            <Button className="ml-auto" onClick={openAdd}>
              <Plus className="size-4" />
              Add Student
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-2">
          Showing {filtered.length} of {students.length} students
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Student ID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>M.I.</TableHead>
              <TableHead>Grade & Section</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[70px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Loading students...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  {search ? "No students match your search." : "No students found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.student_number}</TableCell>
                  <TableCell>{student.firstname}</TableCell>
                  <TableCell>{student.lastname}</TableCell>
                  <TableCell>{student.middle_initial || "N/A"}</TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell>{student.phone_number}</TableCell>
                  <TableCell>{student.email || "N/A"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewStudent(student)}>
                          <Eye className="size-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(student)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteStudent(student)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── View Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Full information for this student record.
            </DialogDescription>
          </DialogHeader>
          {viewStudent && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Student Number", viewStudent.student_number],
                ["First Name", viewStudent.firstname],
                ["Last Name", viewStudent.lastname],
                ["Middle Initial", viewStudent.middle_initial || "N/A"],
                ["Section", viewStudent.section],
                ["Phone Number", viewStudent.phone_number],
                ["Email", viewStudent.email || "N/A"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewStudent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>Fill in the student's information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {field("student_number", "Student Number")}
            <div className="grid grid-cols-2 gap-3">
              {field("firstname", "First Name")}
              {field("lastname", "Last Name")}
            </div>
            {field("middle_initial", "Middle Initial", "e.g. A")}
            {field("section", "Grade & Section", "e.g. 10-A")}
            {field("phone_number", "Phone Number", "e.g. 09XXXXXXXXX")}
            {field("email", "Email Address", "e.g. student@email.com", "email")}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={formPending}>
              {formPending ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update the student's information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {field("student_number", "Student Number")}
            <div className="grid grid-cols-2 gap-3">
              {field("firstname", "First Name")}
              {field("lastname", "Last Name")}
            </div>
            {field("middle_initial", "Middle Initial", "e.g. A")}
            {field("section", "Grade & Section", "e.g. 10-A")}
            {field("phone_number", "Phone Number", "e.g. 09XXXXXXXXX")}
            {field("email", "Email Address", "e.g. student@email.com", "email")}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStudent(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={formPending}>
              {formPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ──────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>
                {deleteStudent?.firstname} {deleteStudent?.lastname}
              </strong>{" "}
              ({deleteStudent?.student_number}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}