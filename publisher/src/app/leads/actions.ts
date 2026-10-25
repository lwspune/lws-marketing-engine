"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fail, fromRpcError, ok, type Result } from "@/lib/publishing/result";

/** Correct a lead's name, course and class (owners only; the database checks). Blank clears it. */
export async function updateLead(input: { leadId: string; name: string; course: string; classLevel: string }): Promise<Result<null>> {
  const parsed = z.object({
    leadId: z.string().uuid(),
    name: z.string().trim().max(200, "Names can be up to 200 characters."),
    course: z.string().trim().max(80, "Courses can be up to 80 characters."),
    classLevel: z.string().trim().max(20, "Classes can be up to 20 characters."),
  }).safeParse(input);
  if (!parsed.success) return fail("invalid_input", parsed.error.issues.map((i) => i.message).join("; "));
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", "Please sign in again.");
  const { error } = await supabase.rpc("update_lead", {
    p_lead: parsed.data.leadId, p_name: parsed.data.name, p_course: parsed.data.course, p_class: parsed.data.classLevel,
  });
  if (error) return fromRpcError(error);
  revalidatePath("/leads");
  return ok(null);
}

/** Remove a wrong lead; its chat becomes Not a lead so the hourly job never adds it back (owners only). */
export async function removeLead(input: { leadId: string }): Promise<Result<null>> {
  const parsed = z.object({ leadId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return fail("invalid_input", "Unknown lead.");
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("unauthorized", "Please sign in again.");
  const { error } = await supabase.rpc("remove_lead", { p_lead: parsed.data.leadId });
  if (error) return fromRpcError(error);
  revalidatePath("/leads");
  revalidatePath("/inbox");
  return ok(null);
}
