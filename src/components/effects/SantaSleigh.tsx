import * as React from "react";
import santaGif from "./Santa_Clause.gif";

export interface SantaSleighProps {
    /** Thay đổi giá trị này để kích hoạt lại animation */
    trigger?: number;
    /** Thời lượng (ms) để chạy ngang màn hình */
    durationMs?: number;
    /** Kiểu đường di chuyển */
    path?: "horizontal" | "diagonal";
    /** Vị trí theo trục dọc tính từ trên (px) */
    top?: number;
    /** z-index cho lớp phủ */
    zIndex?: number;
    /** Tùy chọn URL ảnh ngoài (GIF/PNG). Nếu có, dùng ảnh thay cho SVG. */
    imageUrl?: string;
    /** Chiều rộng ảnh (px) khi dùng imageUrl. */
    imageWidth?: number;
    /** Chiều cao ảnh (px) khi dùng imageUrl. */
    imageHeight?: number;
}

/**
 * Lớp phủ animation ông già Noel kéo xe.
 * Kích hoạt khi `trigger` thay đổi. SVG nhẹ, vô hiệu tương tác chuột,
 * tự ẩn sau khi chạy xong.
 */
export function SantaSleigh({
    trigger = 0,
    durationMs = 9000,
    path = "horizontal",
    top = 80,
    zIndex = 50,
    imageUrl,
    imageWidth = 420,
    imageHeight = 90,
}: SantaSleighProps) {
    const [active, setActive] = React.useState(false);
    const timerRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        // Bắt đầu chạy hiệu ứng
        setActive(true);
        timerRef.current = window.setTimeout(() => setActive(false), durationMs + 300);
        return () => {
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [trigger, durationMs]);

    if (!active) return null;

    const isDiagonal = path === "diagonal";

    return (
        <div
            aria-hidden
            className="pointer-events-none fixed left-0 right-0"
            style={{ top, zIndex }}
        >
            <style>{`
        @keyframes santaRideHorizontal {
          0% { transform: translateX(-120%) translateY(0) scale(1); opacity: 1; }
          50% { transform: translateX(0%) translateY(-6px) scale(1.03); opacity: 1; }
          100% { transform: translateX(120%) translateY(0) scale(1); opacity: 1; }
        }
        @keyframes santaRideDiagonal {
          0% { transform: translate(-20%, -40%) scale(0.75); opacity: 0.85; }
          40% { transform: translate(10%, 0%) scale(1.05); opacity: 1; }
          70% { transform: translate(60%, 30%) scale(1.25); opacity: 1; }
          100% { transform: translate(120%, 60%) scale(1.45); opacity: 0; }
        }
        .santa-container {
          width: 100%; display: flex; justify-content: center;
        }
        .santa {
          animation: ${isDiagonal ? "santaRideDiagonal" : "santaRideHorizontal"} ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) both;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
        }
        .reindeer-bob { animation: reindeerBob 2.2s ease-in-out infinite; }
        @keyframes reindeerBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
      `}</style>

            <div className="santa-container">
                {/* Hiển thị ảnh ngoài (GIF/PNG) hoặc dùng GIF mặc định */}
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Santa Sleigh"
                        className="santa"
                        style={{ width: imageWidth, height: imageHeight }}
                    />
                ) : (
                    /* GIF ông già Noel mặc định */
                    <img
                        src={santaGif}
                        alt="Santa Sleigh"
                        className="santa"
                        style={{ width: imageWidth, height: imageHeight }}
                    />
                )}
            </div>
        </div>
    );
}

export default SantaSleigh;
