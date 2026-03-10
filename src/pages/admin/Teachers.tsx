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

type Teacher = {
  id: string;
  firstname: string;
  lastname: string;
  middle_initial: string;
  teacher_id: string;
  phone_number: string;
  email: string;
};

type TeacherFormData = Omit<Teacher, "id">;

const EMPTY_FORM: TeacherFormData = {
  firstname: "",
  lastname: "",
  middle_initial: "",
  teacher_id: "",
  phone_number: "",
  email: "",
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pending, setPending] = useState(true);
  const [search, setSearch] = useState("");

  // Dialogs
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [deleteTeacher, setDeleteTeacher] = useState<Teacher | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<TeacherFormData>(EMPTY_FORM);
  const [formPending, setFormPending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadTeachers = useCallback(async () => {
    setPending(true);
    const { data, error } = await supabase.from("teachers").select();
    if (error) toast.error("Failed to load teachers");
    if (data) setTeachers(data);
    setPending(false);
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.firstname?.toLowerCase().includes(q) ||
      t.lastname?.toLowerCase().includes(q) ||
      t.teacher_id?.toLowerCase().includes(q) ||
      t.phone_number?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q)
    );
  });

  // ── Add ──────────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setAddOpen(true);
  };

  const handleAdd = async () => {
    setFormPending(true);
    const { error } = await supabase.from("teachers").insert([formData]);
    setFormPending(false);
    if (error) {
      toast.error("Failed to add teacher: " + error.message);
      return;
    }
    toast.success("Teacher added successfully");
    setAddOpen(false);
    loadTeachers();
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const openEdit = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setFormData({
      firstname: teacher.firstname,
      lastname: teacher.lastname,
      middle_initial: teacher.middle_initial,
      teacher_id: teacher.teacher_id,
      phone_number: teacher.phone_number,
      email: teacher.email,
    });
  };

  const handleEdit = async () => {
    if (!editTeacher) return;
    setFormPending(true);
    const { error } = await supabase
      .from("teachers")
      .update(formData)
      .eq("id", editTeacher.id);
    setFormPending(false);
    if (error) {
      toast.error("Failed to update teacher: " + error.message);
      return;
    }
    toast.success("Teacher updated successfully");
    setEditTeacher(null);
    loadTeachers();
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTeacher) return;
    const { error } = await supabase
      .from("teachers")
      .delete()
      .eq("id", deleteTeacher.id);
    if (error) {
      toast.error("Failed to delete teacher: " + error.message);
      return;
    }
    toast.success("Teacher deleted");
    setDeleteTeacher(null);
    loadTeachers();
  };

  // ── CSV Export ───────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = [
      "teacher_id",
      "firstname",
      "lastname",
      "middle_initial",
      "phone_number",
      "email",
    ];
    const rows = teachers.map((t) =>
      headers.map((h) => {
        const val = (t as Record<string, string>)[h] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teachers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  // ── CSV Import ───────────────────────────────────────────────────────────────
  const CSV_HEADER_MAP: Record<string, keyof TeacherFormData> = {
    "teacher_id": "teacher_id",
    "teacher id": "teacher_id",
    "teacher_no": "teacher_id",
    "teacher no.": "teacher_id",
    "firstname": "firstname",
    "first_name": "firstname",
    "first name": "firstname",
    "lastname": "lastname",
    "last_name": "lastname",
    "last name": "lastname",
    "middle_initial": "middle_initial",
    "m.i.": "middle_initial",
    "mi": "middle_initial",
    "phone_number": "phone_number",
    "phone no.": "phone_number",
    "phone_no": "phone_number",
    "phone": "phone_number",
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

      const records: TeacherFormData[] = [];

      for (const line of lines.slice(1)) {
        if (!line.trim()) continue;
        const values = parseCSVLine(line);

        const row: Partial<TeacherFormData> = {
          teacher_id: "",
          firstname: "",
          lastname: "",
          middle_initial: "",
          phone_number: "",
          email: "",
        };

        mappedFields.forEach((field, i) => {
          if (field) row[field] = values[i] ?? "";
        });

        if (!row.firstname?.trim() && !row.lastname?.trim()) continue;

        records.push(row as TeacherFormData);
      }

      if (records.length === 0) {
        toast.error("No valid teacher rows found in CSV");
        return;
      }

      const { error } = await supabase.from("teachers").insert(records);
      if (error) {
        toast.error("Import failed: " + error.message);
        return;
      }
      toast.success(`${records.length} teacher(s) imported successfully`);
      loadTeachers();
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Form field helper ────────────────────────────────────────────────────────
  const field = (key: keyof TeacherFormData, label: string, placeholder?: string, type = "text") => (
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
        <h1 className="text-2xl font-semibold tracking-tight">Manage Teachers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage all LCC teachers.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search teacher..."
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
              Add Teacher
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-2">
          Showing {filtered.length} of {teachers.length} teachers
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Teacher ID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>M.I.</TableHead>
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
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Loading teachers...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  {search ? "No teachers match your search." : "No teachers found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.teacher_id}</TableCell>
                  <TableCell>{teacher.firstname}</TableCell>
                  <TableCell>{teacher.lastname}</TableCell>
                  <TableCell>{teacher.middle_initial || "N/A"}</TableCell>
                  <TableCell>{teacher.phone_number}</TableCell>
                  <TableCell>{teacher.email || "N/A"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewTeacher(teacher)}>
                          <Eye className="size-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(teacher)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTeacher(teacher)}
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
      <Dialog open={!!viewTeacher} onOpenChange={() => setViewTeacher(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
            <DialogDescription>
              Full information for this teacher record.
            </DialogDescription>
          </DialogHeader>
          {viewTeacher && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Teacher ID", viewTeacher.teacher_id],
                ["First Name", viewTeacher.firstname],
                ["Last Name", viewTeacher.lastname],
                ["Middle Initial", viewTeacher.middle_initial || "N/A"],
                ["Phone Number", viewTeacher.phone_number],
                ["Email", viewTeacher.email || "N/A"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTeacher(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Teacher</DialogTitle>
            <DialogDescription>Fill in the teacher's information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {field("teacher_id", "Teacher ID")}
            <div className="grid grid-cols-2 gap-3">
              {field("firstname", "First Name")}
              {field("lastname", "Last Name")}
            </div>
            {field("middle_initial", "Middle Initial", "e.g. A")}
            {field("phone_number", "Phone Number", "e.g. 09XXXXXXXXX")}
            {field("email", "Email Address", "e.g. teacher@email.com", "email")}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={formPending}>
              {formPending ? "Adding..." : "Add Teacher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!editTeacher} onOpenChange={() => setEditTeacher(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>Update the teacher's information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {field("teacher_id", "Teacher ID")}
            <div className="grid grid-cols-2 gap-3">
              {field("firstname", "First Name")}
              {field("lastname", "Last Name")}
            </div>
            {field("middle_initial", "Middle Initial", "e.g. A")}
            {field("phone_number", "Phone Number", "e.g. 09XXXXXXXXX")}
            {field("email", "Email Address", "e.g. teacher@email.com", "email")}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTeacher(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={formPending}>
              {formPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ──────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTeacher} onOpenChange={() => setDeleteTeacher(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>
                {deleteTeacher?.firstname} {deleteTeacher?.lastname}
              </strong>{" "}
              ({deleteTeacher?.teacher_id}). This action cannot be undone.
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