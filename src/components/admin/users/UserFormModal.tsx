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
  phone: z.string().regex(/^(84|0[3|5|7|8|9])\d{8}$/, "Invalid phone number (10 digits starting with 0[3,5,7,8,9] or 84)"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.string().min(1, "Please select a role"),
  gender: z.string().min(1, "Please select gender"),
  status: z.string().optional(),
  roomId: z.number().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AccountResponse | null; // If null, it's create mode
  onSubmit: (data: RegisterDTO | Partial<RegisterDTO>) => void;
  isSubmitting?: boolean;
  allowedRoles?: string[];
}

const MOCK_ROOMS = [
  { id: 1, name: "Room 101 - A" },
  { id: 2, name: "Room 102 - B" },
  { id: 3, name: "Room 201 - VIP" },
  { id: 4, name: "Room 205 - C" },
];

export function UserFormModal({
  open,
  onOpenChange,
  user,
  onSubmit,
  isSubmitting = false,
  allowedRoles = ["MANAGER", "ADMINISTRATOR"],
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
      role: allowedRoles[0] || "MANAGER",
      gender: "Male",
      status: "ACTIVE",
      roomId: undefined
    },
  });

  const roleWatch = watch("role");
  const genderWatch = watch("gender");
  const statusWatch = watch("status");
  const roomIdWatch = watch("roomId");

  useEffect(() => {
    if (user && open) {
      reset({
        name: user.FullName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "", // Don't fill password on edit
        role: user.role || allowedRoles[0],
        gender: user.gender || "Male",
        status: user.status || "ACTIVE",
        roomId: user.roomId
      });
    } else if (!user && open) {
      reset({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: allowedRoles[0] || "MANAGER",
        gender: "Male",
        status: "ACTIVE",
        roomId: undefined
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
             {isEditMode ? t('user_modal.edit_title') : t('user_modal.create_title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('user_modal.full_name')}</Label>
              <Input id="name" {...register("name")} placeholder={t('user_modal.placeholders.name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">{t('user_modal.email')}</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder={t('user_modal.placeholders.email')}
                disabled={isEditMode}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">{t('user_modal.phone')}</Label>
              <Input id="phone" {...register("phone")} placeholder={t('user_modal.placeholders.phone')} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                {isEditMode ? t('user_modal.new_password') : t('user_modal.password')}
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder={t('user_modal.placeholders.password')}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">{t('user_modal.role')}</Label>
              <Select
                value={roleWatch}
                onValueChange={(val) => setValue("role", val as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('user_modal.placeholders.role')} />
                </SelectTrigger>
                <SelectContent>
                  {allowedRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>

            {roleWatch === "CAREGIVER" && (
              <div className="grid gap-2">
                <Label htmlFor="roomId">{t('user_modal.room_assignment')}</Label>
                <Select
                  value={roomIdWatch?.toString()}
                  onValueChange={(val) => setValue("roomId", parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('user_modal.room_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_ROOMS.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground italic">
                  {t('user_modal.room_note')}
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="gender">{t('user_modal.gender')}</Label>
              <Select
                value={genderWatch}
                onValueChange={(val) => setValue("gender", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('user_modal.placeholders.gender')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">{t('user_modal.gender_options.male')}</SelectItem>
                  <SelectItem value="Female">{t('user_modal.gender_options.female')}</SelectItem>
                  <SelectItem value="Other">{t('user_modal.gender_options.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isEditMode && (
              <div className="grid gap-2">
                <Label htmlFor="status">{t('user_modal.status')}</Label>
                <Select
                  value={statusWatch}
                  onValueChange={(val) => setValue("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t('common.active')}</SelectItem>
                    <SelectItem value="INACTIVE">{t('common.inactive')}</SelectItem>
                    <SelectItem value="DELETED">{t('common.deleted')}</SelectItem>
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
              {t('user_modal.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('user_modal.saving') : t('user_modal.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
