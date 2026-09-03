// Same glyph as the wordmark icon (public/assets/logo/rhythm-recovery.svg,
// first <path>), isolated to its own tight viewBox. Path length (986.7) was
// measured via SVGPathElement.getTotalLength() in a real browser.
const ICON_PATH =
  "M84 188V151C84 145.667 86.6667 143 92 143H96C101.333 143 104 145.667 104 151V225C104 230.333 106.667 233 112 233H116C121.333 233 124 230.333 124 225V126C124 120.667 126.667 118 132 118H136C141.333 118 144 120.667 144 126V250C144 255.333 146.667 258 152 258H156C161.333 258 164 255.333 164 250V166C164 160.667 166.667 158 172 158H176C181.333 158 184 160.667 184 166V210C184 215.333 186.667 218 192 218H196C201.333 218 204 215.333 204 210V161C204 155.667 206.667 153 212 153C217.333 153 220 155.667 220 161V215C220 220.333 222.667 223 228 223C233.333 223 236 220.333 236 215V176C236 170.667 238.667 168 244 168C249.333 168 252 170.667 252 176V200C252 205.333 254.667 208 260 208C265.333 208 268 205.333 268 200V184C268 178.667 270.667 176 276 176H280C285.333 176 288 178.667 288 184V192C288 197.333 290.667 200 296 200H304";

const PATH_LENGTH = 986.7;

type DailyProgressBarProps = {
  completed: number;
  total: number;
};

export default function DailyProgressBar({ completed, total }: DailyProgressBarProps) {
  const fraction = total > 0 ? Math.min(1, completed / total) : 0;
  const offset = PATH_LENGTH * (1 - fraction);

  return (
    <div className="ds-daily-progress">
      <svg
        className="ds-daily-progress__svg"
        viewBox="81 115 226 146"
        fill="none"
        role="img"
        aria-label={`${completed} of ${total} tasks complete today`}
      >
        <path
          d={ICON_PATH}
          className="ds-daily-progress__track"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={ICON_PATH}
          className="ds-daily-progress__fill"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: PATH_LENGTH, strokeDashoffset: offset }}
        />
      </svg>
      <p className="ds-daily-progress__caption hint">
        {completed} of {total} today
      </p>
    </div>
  );
}
