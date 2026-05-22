import { Chip } from "./Chip";

/**
 * Phase 7v — flattened to pill chips so it matches the rest of the wizard.
 * Phase 7ab — header/tooltip moved out; this component renders only the chip
 * row and the parent `Section` owns the label.
 */

interface EthnicityOption {
  value: string;
  label: string;
  desc: string;
}

const ETHNICITY_OPTIONS: EthnicityOption[] = [
  { value: "Match the attached brand model", label: "Match my model", desc: "Use the brand model's natural look" },
  { value: "Globally diverse", label: "Globally diverse", desc: "Mixed casting across regions" },
  { value: "Mixed-heritage", label: "Mixed heritage", desc: "Multi-ethnic features" },
  { value: "Pan-European", label: "Pan-European", desc: "Northern + Mediterranean European" },
  { value: "East Asian", label: "East Asian", desc: "Chinese / Japanese / Korean" },
  { value: "South Asian", label: "South Asian", desc: "Indian / Pakistani / Sri Lankan" },
  { value: "Black", label: "Black", desc: "African / African-diaspora" },
  { value: "Latine", label: "Latine", desc: "Latin American heritage" },
  { value: "Middle Eastern", label: "Middle Eastern", desc: "MENA region heritage" },
];

interface Props {
  value: string | undefined;
  onChange: (next: string | undefined) => void;
}

export function EthnicityChips({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-2.5">
      {ETHNICITY_OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <span key={o.value} title={o.desc}>
            <Chip
              active={active}
              onClick={() => onChange(active ? undefined : o.value)}
            >
              {o.label}
            </Chip>
          </span>
        );
      })}
    </div>
  );
}
