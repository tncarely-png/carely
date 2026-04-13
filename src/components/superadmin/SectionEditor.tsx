'use client';

import React, { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface LandingSection {
  type: string;
  [key: string]: any;
}

interface SectionEditorProps {
  sections: LandingSection[];
  onChange: (sections: LandingSection[]) => void;
}

/* ------------------------------------------------------------------ */
/*  Section type definitions                                           */
/* ------------------------------------------------------------------ */

type SectionTypeDef = {
  type: string;
  label: string;
  emoji: string;
  defaultData: () => Record<string, any>;
};

const SECTION_TYPES: SectionTypeDef[] = [
  {
    type: 'hero',
    label: 'Hero',
    emoji: '🦸',
    defaultData: () => ({
      emoji: '🚀',
      title: '',
      subtitle: '',
      description: '',
      ctaText: '',
    }),
  },
  {
    type: 'features',
    label: 'Features',
    emoji: '✨',
    defaultData: () => ({
      title: '',
      items: [{ icon: '🔒', text: '' }],
    }),
  },
  {
    type: 'how-it-works',
    label: 'How it Works',
    emoji: '📋',
    defaultData: () => ({
      title: '',
      steps: [{ icon: '1️⃣', title: '', text: '' }],
    }),
  },
  {
    type: 'trust-badges',
    label: 'Trust Badges',
    emoji: '🏆',
    defaultData: () => ({
      items: [{ icon: '🛡️', text: '' }],
    }),
  },
  {
    type: 'cta',
    label: 'CTA',
    emoji: '📣',
    defaultData: () => ({
      title: '',
      subtitle: '',
      ctaText: '',
      ctaSubtext: '',
    }),
  },
];

function getSectionDef(type: string): SectionTypeDef {
  return SECTION_TYPES.find((s) => s.type === type) ?? SECTION_TYPES[0];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function updateSection(
  sections: LandingSection[],
  index: number,
  patch: Partial<LandingSection>
): LandingSection[] {
  return sections.map((s, i) => (i === index ? { ...s, ...patch } : s));
}

/* ------------------------------------------------------------------ */
/*  Sub-editors (per section type)                                     */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

function Field({ label, value, onChange, placeholder, type }: FieldProps) {
  const isMultiline = placeholder && placeholder.length > 40;
  return (
    <div className="mb-4">
      <Label
        className="block text-xs font-bold mb-1.5 uppercase tracking-wide"
        style={{ color: '#666666' }}
      >
        {label}
      </Label>
      {isMultiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="rounded-lg resize-none text-sm"
          style={{ border: '1px solid #e0e0e0' }}
        />
      ) : (
        <Input
          type={type ?? 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-lg text-sm"
          style={{ border: '1px solid #e0e0e0' }}
        />
      )}
    </div>
  );
}

/* -- Hero -- */
function HeroFields({
  section,
  onUpdate,
}: {
  section: LandingSection;
  onUpdate: (patch: Partial<LandingSection>) => void;
}) {
  return (
    <>
      <Field
        label="Emoji"
        value={section.emoji ?? ''}
        onChange={(v) => onUpdate({ emoji: v })}
        placeholder="🚀"
      />
      <Field
        label="Title"
        value={section.title ?? ''}
        onChange={(v) => onUpdate({ title: v })}
        placeholder="Welcome to Carely"
      />
      <Field
        label="Subtitle"
        value={section.subtitle ?? ''}
        onChange={(v) => onUpdate({ subtitle: v })}
        placeholder="Your digital product store"
      />
      <Field
        label="Description"
        value={section.description ?? ''}
        onChange={(v) => onUpdate({ description: v })}
        placeholder="A longer description of your store and what makes it special for Tunisian customers."
      />
      <Field
        label="CTA Text"
        value={section.ctaText ?? ''}
        onChange={(v) => onUpdate({ ctaText: v })}
        placeholder="Shop Now"
      />
    </>
  );
}

/* -- Features -- */
function FeaturesFields({
  section,
  onUpdate,
}: {
  section: LandingSection;
  onUpdate: (patch: Partial<LandingSection>) => void;
}) {
  const items: Array<{ icon: string; text: string }> = section.items ?? [];

  const updateItem = (idx: number, patch: Partial<{ icon: string; text: string }>) => {
    const newItems = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onUpdate({ items: newItems });
  };

  const addItem = () => {
    onUpdate({ items: [...items, { icon: '📦', text: '' }] });
  };

  const removeItem = (idx: number) => {
    onUpdate({ items: items.filter((_, i) => i !== idx) });
  };

  return (
    <>
      <Field
        label="Section Title"
        value={section.title ?? ''}
        onChange={(v) => onUpdate({ title: v })}
        placeholder="Why Choose Us?"
      />
      <div className="mb-4">
        <Label
          className="block text-xs font-bold mb-2 uppercase tracking-wide"
          style={{ color: '#666666' }}
        >
          Features Items
        </Label>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 rounded-lg"
              style={{ background: '#f9f9f9' }}
            >
              <GripVertical className="w-4 h-4 shrink-0" style={{ color: '#cccccc' }} />
              <Input
                value={item.icon}
                onChange={(e) => updateItem(idx, { icon: e.target.value })}
                placeholder="🔒"
                className="w-14 text-center text-lg rounded-lg shrink-0"
                style={{ border: '1px solid #e0e0e0' }}
              />
              <Input
                value={item.text}
                onChange={(e) => updateItem(idx, { text: e.target.value })}
                placeholder="Feature description…"
                className="flex-1 rounded-lg text-sm"
                style={{ border: '1px solid #e0e0e0' }}
              />
              <button
                onClick={() => removeItem(idx)}
                className="shrink-0 p-1 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                aria-label={`Remove feature ${idx + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={addItem}
          className="mt-2 text-xs rounded-lg"
          style={{ border: '1px dashed #cccccc', color: '#888888' }}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Feature
        </Button>
      </div>
    </>
  );
}

/* -- How It Works -- */
function HowItWorksFields({
  section,
  onUpdate,
}: {
  section: LandingSection;
  onUpdate: (patch: Partial<LandingSection>) => void;
}) {
  const steps: Array<{ icon: string; title: string; text: string }> = section.steps ?? [];

  const updateStep = (
    idx: number,
    patch: Partial<{ icon: string; title: string; text: string }>
  ) => {
    const newSteps = steps.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onUpdate({ steps: newSteps });
  };

  const addStep = () => {
    onUpdate({
      steps: [...steps, { icon: `${steps.length + 1}️⃣`, title: '', text: '' }],
    });
  };

  const removeStep = (idx: number) => {
    onUpdate({ steps: steps.filter((_, i) => i !== idx) });
  };

  return (
    <>
      <Field
        label="Section Title"
        value={section.title ?? ''}
        onChange={(v) => onUpdate({ title: v })}
        placeholder="How It Works"
      />
      <div className="mb-4">
        <Label
          className="block text-xs font-bold mb-2 uppercase tracking-wide"
          style={{ color: '#666666' }}
        >
          Steps
        </Label>
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg"
              style={{ background: '#f9f9f9', border: '1px solid #eeeeee' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <GripVertical className="w-4 h-4 shrink-0" style={{ color: '#cccccc' }} />
                <Input
                  value={step.icon}
                  onChange={(e) => updateStep(idx, { icon: e.target.value })}
                  placeholder="1️⃣"
                  className="w-14 text-center text-lg rounded-lg shrink-0"
                  style={{ border: '1px solid #e0e0e0' }}
                />
                <Input
                  value={step.title}
                  onChange={(e) => updateStep(idx, { title: e.target.value })}
                  placeholder="Step title"
                  className="flex-1 rounded-lg text-sm"
                  style={{ border: '1px solid #e0e0e0' }}
                />
                <button
                  onClick={() => removeStep(idx)}
                  className="shrink-0 p-1 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                  aria-label={`Remove step ${idx + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <Input
                value={step.text}
                onChange={(e) => updateStep(idx, { text: e.target.value })}
                placeholder="Step description…"
                className="rounded-lg text-sm"
                style={{ border: '1px solid #e0e0e0' }}
              />
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={addStep}
          className="mt-2 text-xs rounded-lg"
          style={{ border: '1px dashed #cccccc', color: '#888888' }}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Step
        </Button>
      </div>
    </>
  );
}

/* -- Trust Badges -- */
function TrustBadgesFields({
  section,
  onUpdate,
}: {
  section: LandingSection;
  onUpdate: (patch: Partial<LandingSection>) => void;
}) {
  const items: Array<{ icon: string; text: string }> = section.items ?? [];

  const updateItem = (idx: number, patch: Partial<{ icon: string; text: string }>) => {
    const newItems = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onUpdate({ items: newItems });
  };

  const addItem = () => {
    onUpdate({ items: [...items, { icon: '🛡️', text: '' }] });
  };

  const removeItem = (idx: number) => {
    onUpdate({ items: items.filter((_, i) => i !== idx) });
  };

  return (
    <div className="mb-4">
      <Label
        className="block text-xs font-bold mb-2 uppercase tracking-wide"
        style={{ color: '#666666' }}
      >
        Badge Items
      </Label>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{ background: '#f9f9f9' }}
          >
            <GripVertical className="w-4 h-4 shrink-0" style={{ color: '#cccccc' }} />
            <Input
              value={item.icon}
              onChange={(e) => updateItem(idx, { icon: e.target.value })}
              placeholder="🛡️"
              className="w-14 text-center text-lg rounded-lg shrink-0"
              style={{ border: '1px solid #e0e0e0' }}
            />
            <Input
              value={item.text}
              onChange={(e) => updateItem(idx, { text: e.target.value })}
              placeholder="Badge text…"
              className="flex-1 rounded-lg text-sm"
              style={{ border: '1px solid #e0e0e0' }}
            />
            <button
              onClick={() => removeItem(idx)}
              className="shrink-0 p-1 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
              aria-label={`Remove badge ${idx + 1}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        onClick={addItem}
        className="mt-2 text-xs rounded-lg"
        style={{ border: '1px dashed #cccccc', color: '#888888' }}
      >
        <Plus className="w-3 h-3 mr-1" />
        Add Badge
      </Button>
    </div>
  );
}

/* -- CTA -- */
function CTAFields({
  section,
  onUpdate,
}: {
  section: LandingSection;
  onUpdate: (patch: Partial<LandingSection>) => void;
}) {
  return (
    <>
      <Field
        label="Title"
        value={section.title ?? ''}
        onChange={(v) => onUpdate({ title: v })}
        placeholder="Ready to get started?"
      />
      <Field
        label="Subtitle"
        value={section.subtitle ?? ''}
        onChange={(v) => onUpdate({ subtitle: v })}
        placeholder="Join thousands of happy customers"
      />
      <Field
        label="CTA Button Text"
        value={section.ctaText ?? ''}
        onChange={(v) => onUpdate({ ctaText: v })}
        placeholder="Get Started"
      />
      <Field
        label="CTA Sub-text"
        value={section.ctaSubtext ?? ''}
        onChange={(v) => onUpdate({ ctaSubtext: v })}
        placeholder="No credit card required"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Section renderer                                                   */
/* ------------------------------------------------------------------ */

function renderFields(
  section: LandingSection,
  onUpdate: (patch: Partial<LandingSection>) => void
) {
  switch (section.type) {
    case 'hero':
      return <HeroFields section={section} onUpdate={onUpdate} />;
    case 'features':
      return <FeaturesFields section={section} onUpdate={onUpdate} />;
    case 'how-it-works':
      return <HowItWorksFields section={section} onUpdate={onUpdate} />;
    case 'trust-badges':
      return <TrustBadgesFields section={section} onUpdate={onUpdate} />;
    case 'cta':
      return <CTAFields section={section} onUpdate={onUpdate} />;
    default:
      return (
        <p className="text-sm" style={{ color: '#888888' }}>
          Unknown section type: {section.type}
        </p>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Single section card                                                */
/* ------------------------------------------------------------------ */

function SectionCard({
  section,
  index,
  isFirst,
  isLast,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  section: LandingSection;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<LandingSection>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const def = getSectionDef(section.type);

  return (
    <div className="sa-card overflow-hidden transition-all duration-200">
      {/* Card header — always visible */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        style={{ borderBottom: expanded ? '1px solid #f0f0f0' : 'none' }}
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4" style={{ color: '#cccccc' }} />
          <span className="text-base">{def.emoji}</span>
          <Badge
            variant="secondary"
            className="text-xs font-bold rounded-md px-2 py-0.5"
            style={{ background: '#f0f0f0', color: '#333333' }}
          >
            {def.label}
          </Badge>
          <span className="text-xs" style={{ color: '#aaaaaa' }}>
            #{index + 1}
          </span>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Move Up */}
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move section up"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" style={{ color: '#666666' }} />
          </button>

          {/* Move Down */}
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move section down"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" style={{ color: '#666666' }} />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Delete section"
            title="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Expand / Collapse */}
          <div className="w-px h-5 mx-1" style={{ background: '#e5e5e5' }} />
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={expanded ? 'Collapse section' : 'Expand section'}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" style={{ color: '#888888' }} />
            ) : (
              <ChevronDown className="w-4 h-4" style={{ color: '#888888' }} />
            )}
          </button>
        </div>
      </div>

      {/* Card body — collapsible fields */}
      {expanded && (
        <div className="px-4 py-4">
          {renderFields(section, onUpdate)}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main SectionEditor                                                 */
/* ------------------------------------------------------------------ */

export default function SectionEditor({
  sections,
  onChange,
}: SectionEditorProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const handleUpdate = useCallback(
    (index: number, patch: Partial<LandingSection>) => {
      onChange(updateSection(sections, index, patch));
    },
    [sections, onChange]
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const next = [...sections];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      onChange(next);
    },
    [sections, onChange]
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= sections.length - 1) return;
      const next = [...sections];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      onChange(next);
    },
    [sections, onChange]
  );

  const handleDelete = useCallback(
    (index: number) => {
      onChange(sections.filter((_, i) => i !== index));
    },
    [sections, onChange]
  );

  const handleAdd = useCallback(
    (typeDef: SectionTypeDef) => {
      const newSection: LandingSection = {
        type: typeDef.type,
        ...typeDef.defaultData(),
      };
      onChange([...sections, newSection]);
      setAddMenuOpen(false);
    },
    [sections, onChange]
  );

  return (
    <div className="space-y-4">
      {/* Section list */}
      {sections.length > 0 && (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <SectionCard
              key={`${section.type}-${index}`}
              section={section}
              index={index}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
              onUpdate={(patch) => handleUpdate(index, patch)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              onDelete={() => handleDelete(index)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {sections.length === 0 && (
        <div className="text-center py-12 sa-card">
          <p className="text-4xl mb-3">🧩</p>
          <p className="text-sm font-bold mb-1" style={{ color: '#000000' }}>
            No sections yet
          </p>
          <p className="text-xs" style={{ color: '#888888' }}>
            Add your first section to start building the landing page.
          </p>
        </div>
      )}

      {/* Add Section button + dropdown */}
      <div className="relative">
        <Button
          className="sa-btn-primary w-full flex items-center justify-center gap-2"
          onClick={() => setAddMenuOpen((prev) => !prev)}
        >
          <Plus className="w-4 h-4" />
          Add Section
        </Button>

        {/* Dropdown */}
        {addMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setAddMenuOpen(false)}
            />

            {/* Menu */}
            <div
              className="absolute bottom-full left-0 right-0 mb-2 z-50 sa-card p-1"
              style={{
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              }}
            >
              {SECTION_TYPES.map((st) => (
                <button
                  key={st.type}
                  onClick={() => handleAdd(st)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">{st.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span
                      className="block text-sm font-bold"
                      style={{ color: '#000000' }}
                    >
                      {st.label}
                    </span>
                    <span
                      className="block text-xs truncate"
                      style={{ color: '#999999' }}
                    >
                      {st.type}
                    </span>
                  </div>
                  <Plus className="w-3.5 h-3.5" style={{ color: '#cccccc' }} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
