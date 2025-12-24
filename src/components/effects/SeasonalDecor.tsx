import { Snowfall } from "./Snowfall";
import { ChristmasTree } from "./ChristmasTree";
import { useThemeStore } from "../../stores/themeStore";

export interface SeasonalDecorProps {
    /** Bật/tắt bắt buộc. Nếu không đặt, tự động theo ngày. */
    enabled?: boolean;
    /** Hiển thị tuyết rơi. */
    snow?: boolean;
    /** Hiển thị cây thông Noel. */
    tree?: boolean;
    /** Tháng bắt đầu tự động (1-12). Mặc định: 12 (Tháng 12) */
    startMonth?: number;
    /** Tháng kết thúc tự động (1-12). Mặc định: 1 (Tháng 1) */
    endMonth?: number;
    /** Ngày kết thúc trong tháng kết thúc (bao gồm). Mặc định: 5 */
    endDay?: number;
}

function isFestiveWindow(startMonth = 12, endMonth = 1, endDay = 5) {
    const now = new Date();
    const m = now.getMonth() + 1; // 1-12 (tháng)
    const d = now.getDate();
    if (m === startMonth) return true; // toàn bộ tháng 12
    if (m === endMonth) return d <= endDay; // đến hết ngày 5 tháng 1
    return false;
}

/**
 * Lớp phủ trang trí theo mùa có thể bật/tắt hoặc tự động bật
 * trong dịp lễ. An toàn để tái sử dụng ở mọi cấp trang.
 */
export function SeasonalDecor({
    enabled,
    snow = true,
    tree = true,
    startMonth = 12,
    endMonth = 1,
    endDay = 5,
}: SeasonalDecorProps) {
    const isActive = typeof enabled === "boolean" ? enabled : isFestiveWindow(startMonth, endMonth, endDay);
    if (!isActive) return null;
    const { resolvedTheme } = useThemeStore();
    const snowColor = resolvedTheme === "light"
        ? "rgba(80, 110, 140, 0.9)"      // Dark blue-grey for light mode
        : "rgba(255, 255, 255, 0.92)";   // White for dark mode
    const snowCount = resolvedTheme === "light" ? 100 : 160; // Less density for light mode

    return (
        <>
            {snow && (
                <Snowfall
                    count={snowCount}
                    opacity={0.95}
                    color={snowColor}
                    useSnowflakeShape
                    theme={resolvedTheme}
                />
            )}
            {tree && (
                <>
                    {/* Cây bên phải (kích thước và độ lệch dọc khác nhau) */}
                    <ChristmasTree position="top-right" size={120} wobble rotateDeg={2} style={{ top: 18, right: 22 }} />
                    <ChristmasTree position="bottom-right" size={160} wobble rotateDeg={-1.2} style={{ bottom: 26, right: 14 }} />

                    {/* Cây bên trái (cân đối, không cùng hàng, tránh che tiêu đề) */}
                    <ChristmasTree position="top-left" size={130} wobble rotateDeg={-2} style={{ top: 140, left: 22 }} />
                    <ChristmasTree position="bottom-left" size={118} wobble rotateDeg={1.4} style={{ bottom: 36, left: 28 }} />
                </>
            )}
        </>
    );
}

export default SeasonalDecor;
