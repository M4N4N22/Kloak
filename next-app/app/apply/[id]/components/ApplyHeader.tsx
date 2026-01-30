"use client";

type Props = {
  name: string;
  description: string;
};

export function ApplyHeader({ name, description }: Props) {
  return (
    <div className="mb-12 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">
        Applying for
      </p>

      <h1 className="text-3xl font-medium tracking-tight">
        {name}
      </h1>

      <p className="text-[#666666] text-sm">
        {description}
      </p>
    </div>
  );
}
