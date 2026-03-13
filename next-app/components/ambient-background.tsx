export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

      <div className="absolute -top-48 left-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />

      <div className="absolute top-0 right-[2%] h-[600px] w-[900px] rounded-full bg-primary/20 blur-[160px]" />

      <div className="absolute -bottom-48 right-[10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />

      {/* subtle grid fade */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />

    </div>
  )
}