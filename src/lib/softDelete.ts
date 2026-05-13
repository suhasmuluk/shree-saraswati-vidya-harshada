import { supabase } from '@/integrations/supabase/client';

export type EntityType = 'student' | 'teacher' | 'staff';

const tableMap: Record<EntityType, 'students' | 'teachers' | 'staff'> = {
  student: 'students',
  teacher: 'teachers',
  staff: 'staff',
};

/**
 * Check whether an entity is referenced by other modules.
 * If yes, hard delete is forbidden — caller should archive instead.
 */
export async function hasLinkedRecords(type: EntityType, id: string): Promise<boolean> {
  if (type === 'student') {
    const checks = await Promise.all([
      supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('student_id', id),
      supabase.from('fees').select('id', { count: 'exact', head: true }).eq('student_id', id),
      supabase.from('exam_results').select('id', { count: 'exact', head: true }).eq('student_id', id),
      supabase.from('student_achievements').select('id', { count: 'exact', head: true }).eq('student_id', id),
      supabase.from('siblings').select('id', { count: 'exact', head: true }).eq('student_id', id),
    ]);
    return checks.some((c) => (c.count ?? 0) > 0);
  }
  if (type === 'teacher' || type === 'staff') {
    const personType = type === 'teacher' ? 'teacher' : 'staff';
    const checks = await Promise.all([
      supabase.from('staff_attendance').select('id', { count: 'exact', head: true }).eq('person_id', id).eq('person_type', personType),
      supabase.from('salaries').select('id', { count: 'exact', head: true }).eq('person_id', id).eq('person_type', personType),
    ]);
    return checks.some((c) => (c.count ?? 0) > 0);
  }
  return false;
}

async function writeAudit(params: {
  type: EntityType;
  id: string;
  name?: string;
  action: 'archive' | 'restore' | 'soft_delete';
  reason: string;
}) {
  const { data: userRes } = await supabase.auth.getUser();
  await supabase.from('audit_logs').insert({
    entity_type: params.type,
    entity_id: params.id,
    entity_name: params.name ?? null,
    action: params.action,
    reason: params.reason,
    performed_by: userRes.user?.id ?? null,
  });
}

/** Archive (soft) — keeps the record but hides it from active lists. */
export async function archiveEntity(type: EntityType, id: string, name: string, reason: string) {
  const table = tableMap[type];
  const { error } = await supabase
    .from(table)
    .update({
      is_active: false,
      status: 'archived',
      archived_at: new Date().toISOString(),
      archive_reason: reason,
    })
    .eq('id', id);
  if (error) throw error;
  await writeAudit({ type, id, name, action: 'archive', reason });
}

/** Restore an archived record. */
export async function restoreEntity(type: EntityType, id: string, name: string) {
  const table = tableMap[type];
  const { error } = await supabase
    .from(table)
    .update({
      is_active: true,
      is_deleted: false,
      status: 'active',
      archived_at: null,
      archive_reason: null,
      deleted_at: null,
    })
    .eq('id', id);
  if (error) throw error;
  await writeAudit({ type, id, name, action: 'restore', reason: 'Restored to active' });
}

/**
 * Soft delete — marks is_deleted. Only allowed when the record has no linked
 * historical data; otherwise archive instead.
 */
export async function softDeleteEntity(type: EntityType, id: string, name: string, reason: string) {
  const linked = await hasLinkedRecords(type, id);
  if (linked) {
    // Auto-promote to archive to preserve referential integrity
    await archiveEntity(type, id, name, reason);
    return { archivedInstead: true };
  }
  const table = tableMap[type];
  const { error } = await supabase
    .from(table)
    .update({
      is_deleted: true,
      is_active: false,
      status: 'deleted',
      deleted_at: new Date().toISOString(),
      archive_reason: reason,
    })
    .eq('id', id);
  if (error) throw error;
  await writeAudit({ type, id, name, action: 'soft_delete', reason });
  return { archivedInstead: false };
}
