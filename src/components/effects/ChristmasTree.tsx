import type { CSSProperties } from "react";

export interface ChristmasTreeProps {
  /** Vị trí của cây trên khung nhìn */
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Kích thước (px) của SVG cây */
    size?: number;
  /** z-index tùy chọn để xếp lớp */
    zIndex?: number;
  /** Có lắc nhẹ cây hay không */
    wobble?: boolean;
  /** Góc xoay nền (độ), có thể âm để nghiêng. */
    rotateDeg?: number;
  /** className tùy chọn cho phần bọc */
    className?: string;
  /** style nội tuyến tùy chọn cho phần bọc */
    style?: CSSProperties;
}

function posClass(position: ChristmasTreeProps["position"]) {
    switch (position) {
        case "bottom-left": return "left-4 bottom-4";
        case "top-right": return "right-4 top-4";
        case "top-left": return "left-4 top-4";
        case "bottom-right":
        default:
            return "right-4 bottom-4";
    }
}

/**
 * Cây thông Noel SVG đơn giản, tinh tế với đồ trang trí.
 * Đặt cố định làm trang trí, không cản trở tương tác UI.
 */
export function ChristmasTree({
    position = "bottom-right",
    size = 140,
    zIndex = 41,
    wobble = true,
    rotateDeg = 0,
    className,
    style,
}: ChristmasTreeProps) {
    return (
        <div
            aria-hidden
            className={[
                "pointer-events-none fixed",
                posClass(position),
                wobble ? "xmas-wobble" : "",
                className || "",
            ].join(" ")}
            style={{ zIndex, ...(style || {}), ["--base-rot" as any]: `${rotateDeg}deg` }}
        >
            <style>
                {`
          .xmas-wobble { transform: rotate(var(--base-rot, 0deg)); }
          .xmas-wobble > svg {
            animation: xmasWobble 6s ease-in-out infinite;
          }
          @keyframes xmasWobble {
            0%, 100% { transform: rotate(calc(var(--base-rot, 0deg) - 1deg)); }
            50% { transform: rotate(calc(var(--base-rot, 0deg) + 1.5deg)); }
          }
          
          /* Quả châu nhấp nháy với thời gian khác nhau */
          .xmas-twinkle-1 { animation: xmasTwinkle1 1.5s ease-in-out infinite; }
          .xmas-twinkle-2 { animation: xmasTwinkle2 2s ease-in-out infinite; }
          .xmas-twinkle-3 { animation: xmasTwinkle3 1.8s ease-in-out infinite; }
          .xmas-twinkle-4 { animation: xmasTwinkle4 2.2s ease-in-out infinite; }
          .xmas-twinkle-5 { animation: xmasTwinkle5 1.7s ease-in-out infinite; }
          
          @keyframes xmasTwinkle1 {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          @keyframes xmasTwinkle2 {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @keyframes xmasTwinkle3 {
            0%, 100% { opacity: 0.55; }
            50% { opacity: 1; }
          }
          @keyframes xmasTwinkle4 {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          @keyframes xmasTwinkle5 {
            0%, 100% { opacity: 0.65; }
            50% { opacity: 1; }
          }
          
          /* Ngôi sao đập nhịp */
          .xmas-star-pulse {
            animation: starPulse 2.5s ease-in-out infinite;
            transform-origin: center;
          }
          @keyframes starPulse {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
            50% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          }
          
          /* Dây đèn phát sáng */
          .xmas-garland {
            animation: garlandGlow 3s ease-in-out infinite;
          }
          @keyframes garlandGlow {
            0%, 100% { opacity: 0.7; filter: drop-shadow(0 0 2px rgba(255, 213, 79, 0.5)); }
            50% { opacity: 1; filter: drop-shadow(0 0 4px rgba(255, 213, 79, 0.9)); }
          }
          
          /* Quả châu lắc lư */
          .xmas-ornament-swing {
            animation: ornamentSwing 3s ease-in-out infinite;
            transform-origin: top center;
          }
          @keyframes ornamentSwing {
            0%, 100% { transform: rotate(-2deg); }
            50% { transform: rotate(2deg); }
          }
          
          /* Tuyết lấp lánh trên đỉnh */
          .xmas-snow-sparkle {
            animation: snowSparkle 4s ease-in-out infinite;
          }
          @keyframes snowSparkle {
            0%, 100% { opacity: 0.85; }
            50% { opacity: 1; filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8)); }
          }
        `}
            </style>
            <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ngôi sao với hiệu ứng đập nhịp */}
                <g className="xmas-star-pulse" transform="translate(65 0)">
                    <polygon points="10,0 12,8 20,8 14,12 16,20 10,15 4,20 6,12 0,8 8,8" fill="#FFD54F" />
                    <polygon points="10,3 11,8 16,8 12,11 13,16 10,13 7,16 8,11 4,8 9,8" fill="#FFEB3B" opacity="0.8" />
                </g>

                {/* Các lớp cây với hiệu ứng chuyển sắc nhẹ */}
                <defs>
                    <linearGradient id="treeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#388e3c", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#2e7d32", stopOpacity: 1 }} />
                    </linearGradient>
                </defs>

                <polygon points="70,20 110,70 30,70" fill="url(#treeGradient)" />
                <polygon points="70,45 120,100 20,100" fill="url(#treeGradient)" />
                <polygon points="70,70 130,130 10,130" fill="url(#treeGradient)" />

                {/* Mũ tuyết có hiệu ứng lấp lánh */}
                <path className="xmas-snow-sparkle" d="M70 22 C72 25 80 28 90 28 C80 30 60 30 50 28 C60 28 68 25 70 22" fill="#ffffff" opacity="0.85" />
                <path className="xmas-snow-sparkle" d="M70 47 C74 50 86 54 100 54 C86 56 54 56 40 54 C54 54 66 50 70 47" fill="#ffffff" opacity="0.85" />
                <path className="xmas-snow-sparkle" d="M70 73 C76 76 94 82 114 82 C94 84 46 84 26 82 C46 82 64 76 70 73" fill="#ffffff" opacity="0.85" />

                {/* Thân cây */}
                <rect x="62" y="115" width="16" height="18" fill="#6d4c41" />

                {/* Quả châu nhấp nháy đa dạng và lắc lư */}
                <g className="xmas-ornament-swing">
                    <circle cx="85" cy="65" r="4.5" fill="#F44336" className="xmas-twinkle-1" />
                    <circle cx="85" cy="65" r="2.5" fill="#FFCDD2" opacity="0.6" />
                </g>

                <g className="xmas-ornament-swing" style={{ transformOrigin: "56px 62px" }}>
                    <circle cx="56" cy="62" r="4" fill="#42A5F5" className="xmas-twinkle-2" />
                    <circle cx="56" cy="62" r="2" fill="#BBDEFB" opacity="0.6" />
                </g>

                <g className="xmas-ornament-swing" style={{ transformOrigin: "92px 95px" }}>
                    <circle cx="92" cy="95" r="5" fill="#AB47BC" className="xmas-twinkle-3" />
                    <circle cx="92" cy="95" r="2.5" fill="#E1BEE7" opacity="0.6" />
                </g>

                <g className="xmas-ornament-swing" style={{ transformOrigin: "48px 98px" }}>
                    <circle cx="48" cy="98" r="4.5" fill="#FF7043" className="xmas-twinkle-4" />
                    <circle cx="48" cy="98" r="2.2" fill="#FFCCBC" opacity="0.6" />
                </g>

                <g className="xmas-ornament-swing" style={{ transformOrigin: "70px 85px" }}>
                    <circle cx="70" cy="85" r="4" fill="#26C6DA" className="xmas-twinkle-5" />
                    <circle cx="70" cy="85" r="2" fill="#B2EBF2" opacity="0.6" />
                </g>

                {/* Thêm quả châu nhỏ để sinh động hơn */}
                <circle cx="75" cy="55" r="3" fill="#FFC107" className="xmas-twinkle-2" />
                <circle cx="60" cy="78" r="3.5" fill="#E91E63" className="xmas-twinkle-4" />
                <circle cx="80" cy="108" r="3" fill="#9C27B0" className="xmas-twinkle-1" />

                {/* Dây đèn phát sáng */}
                <path className="xmas-garland" d="M40 80 C 60 70, 80 70, 100 80" stroke="#FFD54F" strokeWidth="2" fill="none" opacity="0.9" />
                <path className="xmas-garland" d="M30 105 C 55 92, 85 92, 110 105" stroke="#FFD54F" strokeWidth="2" fill="none" opacity="0.9" />
            </svg>
        </div>
    );
}

export default ChristmasTree;
