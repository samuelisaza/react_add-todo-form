/**
 * Isotipo Bridge Education: arco de medio punto, 7 dovelas trapezoidales.
 * Radio exterior 220u, radio interior 130u, separación 1.4° entre dovelas.
 */

interface LogoProps {
  height?: number;
  color?: string;
  className?: string;
}

function buildArch(): string[] {
  const cx = 250;
  const cy = 250;
  const rOuter = 220;
  const rInner = 130;
  const gap = 1.4;
  const n = 7;
  const keystoneAngle = (180 - (n - 1) * gap) / n; // ≈ 24.514°

  const rad = (deg: number) => (deg * Math.PI) / 180;

  const pt = (r: number, deg: number) => ({
    x: cx + r * Math.cos(rad(deg)),
    y: cy - r * Math.sin(rad(deg)),
  });

  return Array.from({ length: n }, (_, i) => {
    const start = 180 - i * (keystoneAngle + gap);
    const end = start - keystoneAngle;

    const os = pt(rOuter, start);
    const oe = pt(rOuter, end);
    const is_ = pt(rInner, start);
    const ie = pt(rInner, end);

    const f = (v: number) => v.toFixed(3);

    // Outer arc: clockwise in SVG (sweep=1), inner arc: counter-clockwise (sweep=0)
    return [
      `M ${f(os.x)} ${f(os.y)}`,
      `A ${rOuter} ${rOuter} 0 0 1 ${f(oe.x)} ${f(oe.y)}`,
      `L ${f(ie.x)} ${f(ie.y)}`,
      `A ${rInner} ${rInner} 0 0 0 ${f(is_.x)} ${f(is_.y)}`,
      'Z',
    ].join(' ');
  });
}

const keystones = buildArch();

export default function Logo({ height = 48, color = '#FFFFFF', className }: LogoProps) {
  const aspectRatio = 450 / 230;
  const width = height * aspectRatio;

  return (
    <svg
      width={width}
      height={height}
      viewBox="25 25 450 230"
      fill={color}
      aria-label="Bridge Education"
      className={className}
    >
      {keystones.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
