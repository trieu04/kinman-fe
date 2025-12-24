import * as React from "react";

export interface SnowfallProps {
    /** Số lượng bông tuyết. Tỷ lệ theo kích thước màn hình. */
    count?: number;
    /** Màu bông tuyết (hỗ trợ rgba cho hiệu ứng mềm). */
    color?: string;
    /** Hệ số tốc độ rơi tổng thể. */
    speed?: number;
    /** Hệ số độ mờ [0,1]. */
    opacity?: number;
    /** Tùy chọn z-index cho lớp phủ. */
    zIndex?: number;
    /** className tùy chọn áp dụng cho phần bọc. */
    className?: string;
    /** style tùy chọn cho phần bọc. */
    style?: React.CSSProperties;
    /** Dùng hình bông tuyết thay vì hình tròn đơn giản. */
    useSnowflakeShape?: boolean;
    /** Chủ đề để chọn màu phù hợp. */
    theme?: "light" | "dark";
}

interface Flake {
    x: number;
    y: number;
    r: number; // bán kính
    vx: number;
    vy: number;
    alpha: number;
    rotation: number; // góc xoay để tạo đa dạng
}

/**
 * Lớp phủ tuyết rơi nhẹ dùng canvas.
 * - Sử dụng requestAnimationFrame để chuyển động mượt
 * - Vô hiệu tương tác chuột (pointer-events) để không cản UI
 * - Tự động phản hồi khi thay đổi kích thước cửa sổ
 */
export function Snowfall({
    count = 120,
    color = "rgba(255,255,255,0.9)",
    speed = 1,
    opacity = 1,
    zIndex = 40,
    className,
    style,
    useSnowflakeShape = true,
    theme = "dark",
}: SnowfallProps) {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const flakesRef = React.useRef<Flake[]>([]);
    const rafRef = React.useRef<number | null>(null);

    const drawSnowflake = React.useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rotation: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Vẽ bông tuyết 6 cánh
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 * i) / 6);

            // Nhánh chính
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -r);
            ctx.lineWidth = theme === "light" ? 1.8 : 1.2;
            ctx.strokeStyle = color;
            ctx.stroke();

            // Nhánh phụ
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.5);
            ctx.lineTo(-r * 0.3, -r * 0.7);
            ctx.moveTo(0, -r * 0.5);
            ctx.lineTo(r * 0.3, -r * 0.7);
            ctx.lineWidth = theme === "light" ? 1.4 : 0.8;
            ctx.stroke();

            ctx.restore();
        }

        // Điểm trung tâm
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.restore();
    }, [color, theme]);

    const draw = React.useCallback((ctx: CanvasRenderingContext2D) => {
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const f of flakesRef.current) {
            // cập nhật
            f.x += f.vx * speed;
            f.y += f.vy * speed;
            f.rotation += 0.01 * speed; // xoay nhẹ khi rơi

            // lặp lại theo chiều dọc
            if (f.y - f.r > canvas.height) {
                f.y = -f.r;
                f.x = Math.random() * canvas.width;
            }
            // trôi ngang theo gió nhẹ
            if (f.x + f.r < 0) f.x = canvas.width + f.r;
            if (f.x - f.r > canvas.width) f.x = -f.r;

            // vẽ
            ctx.globalAlpha = f.alpha * opacity;

            if (useSnowflakeShape) {
                drawSnowflake(ctx, f.x, f.y, f.r, f.rotation);
            } else {
                // Dự phòng là hình tròn
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();

                if (theme === "light") {
                    ctx.lineWidth = 1.2;
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }
            }

            ctx.globalAlpha = 1;
        }
    }, [color, opacity, speed, useSnowflakeShape, drawSnowflake, theme]);

    const loop = React.useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        draw(ctx);
        rafRef.current = window.requestAnimationFrame(loop);
    }, [draw]);

    const initFlakes = React.useCallback((w: number, h: number) => {
        const density = count;
        const flakes: Flake[] = [];
        for (let i = 0; i < density; i++) {
            // Kích thước nhỏ hơn cho chế độ sáng
            const r = theme === "light"
                ? Math.random() * 2.5 + 1.8   // 1.8-4.3px cho chế độ sáng
                : Math.random() * 2.2 + 0.8; // 0.8-3px cho chế độ tối
            const vx = (Math.random() - 0.5) * 0.6; // trôi ngang nhẹ
            const vy = theme === "light"
                ? Math.random() * 2.2 + 1.2  // 1.2-3.4 nhanh hơn cho chế độ sáng
                : Math.random() * 1.5 + 0.6; // 0.6-2.1 cho chế độ tối
            const alpha = theme === "light"
                ? Math.random() * 0.3 + 0.7  // 0.7-1.0 cho chế độ sáng (độ mờ cao hơn)
                : Math.random() * 0.6 + 0.4; // 0.4-1.0 cho chế độ tối
            const rotation = Math.random() * Math.PI * 2; // góc xoay ban đầu ngẫu nhiên
            flakes.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r,
                vx,
                vy,
                alpha,
                rotation,
            });
        }
        flakesRef.current = flakes;
    }, [count, theme]);

    const resize = React.useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initFlakes(canvas.width, canvas.height);
    }, [initFlakes]);

    React.useEffect(() => {
        resize();
        rafRef.current = window.requestAnimationFrame(loop);
        window.addEventListener("resize", resize);
        return () => {
            if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [loop, resize]);

    return (
        <div
            aria-hidden
            className={
                [
                    "pointer-events-none fixed inset-0",
                    className || "",
                ].join(" ")
            }
            style={{ zIndex, ...style }}
        >
            <canvas ref={canvasRef} />
        </div>
    );
}

export default Snowfall;
