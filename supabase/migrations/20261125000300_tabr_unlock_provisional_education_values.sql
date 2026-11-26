-- Two-conversation workflow (see docs/README.md, decision D-016):
-- educational values are decided by approved education specs, not by the schema.
-- This removes values that 20261125000200 had fixed ahead of any spec:
--   * a default review spacing for skills
--   * a fixed list of allowed lesson component types
--   * a fixed list of assessment dimensions on evidence
-- The columns stay; their contents will come from approved specs (docs/education/).

alter table public.tabr_skills alter column review_intervals_days drop default;
alter table public.tabr_skills alter column review_intervals_days drop not null;

alter table public.tabr_lesson_components drop constraint if exists tabr_lesson_components_component_check;
alter table public.tabr_mastery_evidence drop constraint if exists tabr_mastery_evidence_dimension_check;

comment on column public.tabr_skills.review_intervals_days is 'Retention spacing in days. Set from an approved education spec. PROVISIONAL: no default.';
comment on column public.tabr_lesson_components.component is 'Component type. Catalog defined by approved education specs; app renders only types it implements.';
comment on column public.tabr_mastery_evidence.dimension is 'Assessment dimension. Vocabulary defined by approved education specs.';
comment on type public.tabr_mastery_level is 'Five-level framework from the master brief (section 11). Names and definitions PROVISIONAL until an approved mastery spec.';
