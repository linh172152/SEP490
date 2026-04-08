import { WellnessHub } from "@/components/dashboard/wellness/WellnessHub";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wellness Center | Admin Dashboard",
  description: "Manage exercise scripts and track activity history.",
};

export default function AdminWellnessPage() {
  return <WellnessHub />;
}
