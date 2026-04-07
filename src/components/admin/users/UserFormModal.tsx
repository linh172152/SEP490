import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RegisterDTO, AccountResponse } from "@/services/api/types";
import { useI18nStore } from "@/store/useI18nStore";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^(84|0[3|5|7|8|9])\d{8}$/, "Điện thoại không hợp lệ (10 số, b.đầu 0[3,5,7,8,9] hoặc 84)"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["MANAGER", "ADMINISTRATOR"], {
    required_error: "Please select a role",
  }),
  gender: z.string().min(1, "Please select gender"),
  status: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AccountResponse | null; // If null, it's create mode
  onSubmit: (data: RegisterDTO | Partial<RegisterDTO>) => void;
  isSubmitting?: boolean;
}

export function UserFormModal({
  open,
  onOpenChange,
  user,
  onSubmit,
  isSubmitting = false,
}: UserFormModalProps) {
  const { t } = useI18nStore();
  const isEditMode = !!user;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "MANAGER",
      gender: "Male",
      status: "ACTIVE"
    },
  });

  const roleWatch = watch("role");
  const genderWatch = watch("gender");
  const statusWatch = watch("status");

  useEffect(() => {
    if (user && open) {
      reset({
        name: user.FullName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "", // Don't fill password on edit
        role: (user.role as any) === "ADMINISTRATOR" || (user.role as any) === "ADMIN" ? "ADMINISTRATOR" : "MANAGER",
        gender: user.gender || "Male",
        status: user.status || "ACTIVE"
      });
    } else if (!user && open) {
      reset({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "MANAGER",
        gender: "Male",
        status: "ACTIVE"
      });
    }
  }, [user, open, reset]);

  const handleFormSubmit = (values: FormValues) => {
    // If edit mode and password is empty, don't send it
    const dataToSubmit: any = { ...values };
    if (isEditMode && (!dataToSubmit.password || dataToSubmit.password.trim() === "")) {
      delete dataToSubmit.password;
    }
    onSubmit(dataToSubmit as RegisterDTO);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Internal User" : "Create Internal User"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} placeholder="John Doe" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john@example.com"
                disabled={isEditMode}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} placeholder="+1234567890" />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                {isEditMode ? "New Password (Optional)" : "Password"}
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="••••••"
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={roleWatch}
                onValueChange={(val) => setValue("role", val as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="ADMINISTRATOR">ADMINISTRATOR</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={genderWatch}
                onValueChange={(val) => setValue("gender", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isEditMode && (
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={statusWatch}
                  onValueChange={(val) => setValue("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                    <SelectItem value="DELETED">DELETED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
