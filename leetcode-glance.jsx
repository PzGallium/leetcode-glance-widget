// LeetCode Stats Widget for Übersicht
// Fetches and displays LeetCode statistics (supports 力扣中国站 leetcode.cn and leetcode.com).

// 内联最小 React 兼容对象，避免 Übersicht 解析 node_modules 时找不到 react
const React = {
  createElement: function (type, props, ...children) {
    const p = props || {};
    if (children.length) p.children = children.length === 1 ? children[0] : children;
    return { type, props: p, key: p.key || null, ref: p.ref || null };
  },
  // <>...</> 会编译为 React.createElement(React.Fragment, ...)，必须提供
  Fragment: function Fragment(props) {
    return props.children;
  },
};

// --- CONFIGURATION ---
const USE_LEETCODE_CN = true;
const LEETCODE_USERNAME = "PzGallium"; // 改成你的力扣/LeetCode 用户名
// 全年日历需登录态：把力扣 Cookie 里的 LEETCODE_SESSION 写入下方路径的文件（一行，仅 token）
// 例: echo "eyJhbGc..." > ~/Library/Application\ Support/Übersicht/widgets/leetcode-glance-widget/.leetcode_cn_session

// --- CORE LOGIC ---
// 确保有 HOME（Übersicht 可能不传环境变量），再跑脚本
const WIDGET_DIR = '$HOME/Library/Application Support/Übersicht/widgets/leetcode-glance-widget';
const command = USE_LEETCODE_CN
  ? `export HOME="\${HOME:-$(eval echo ~)}" && export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH" && export LEETCODE_CN_SESSION_FILE="${WIDGET_DIR}/.leetcode_cn_session" && cd "${WIDGET_DIR}" && node lc-scripts/fetch-lc-cn.mjs "${LEETCODE_USERNAME}"`
  : `curl -s "https://leetcode-stats-api.vercel.app/${LEETCODE_USERNAME}"`;
export { command };

export const refreshFrequency = 300000;

// --- STYLING (JSX-in-CSS) ---
// 参考 LeetCode 图标：深炭灰底、纯白、柔和橙、浅灰，苹果桌面组件感
const LC_ORANGE = '#d4a017';
const LC_ORANGE_BRIGHT = '#e8a317';
const LC_BG_DARK = '#0f0f0f';
const LC_WHITE = '#ffffff';
const LC_GRAY = 'rgba(255,255,255,0.82)';
const LC_BORDER = 'rgba(255,255,255,0.32)';
const LC_ORANGE_TINT = 'rgba(212,160,23,0.28)';

// 位置：改下面 POSITIONING 里的 top/left。例：右上 top: 60px; left: auto; right: 20px; transform: none;
export const className = `
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: 340px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
  background: rgba(15, 15, 15, 0.84);
  backdrop-filter: blur(24px) saturate(1.1);
  -webkit-backdrop-filter: blur(24px) saturate(1.1);
  border-radius: 20px;
  border: 1px solid ${LC_BORDER};
  box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);

  .header {
    background: ${LC_BG_DARK};
    color: ${LC_WHITE};
    padding: 18px 22px 14px 22px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid ${LC_BORDER};
  }

  .leetcode-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }
  .leetcode-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .header-text { flex: 1; }
  .username { font-size: 19px; font-weight: 600; margin: 0; letter-spacing: -0.02em; color: ${LC_WHITE}; }
  .subtitle { font-size: 12px; color: ${LC_GRAY}; margin: 3px 0 0 0; font-weight: 500; }

  .content {
    padding: 22px 22px 18px 22px;
    background: rgba(0,0,0,0.45);
    border-radius: 0 0 20px 20px;
    min-height: 180px;
  }

  .stat-card {
    background: rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 14px 0;
    text-align: center;
    margin-bottom: 14px;
    border: 1px solid rgba(212,160,23,0.16);
  }

  .stat-number { font-size: 25px; font-weight: 700; color: ${LC_ORANGE_BRIGHT}; margin: 0; letter-spacing: -0.02em; }
  .stat-label { font-size: 11px; color: ${LC_GRAY}; margin: 2px 0 0 0; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }

  .section-title { font-size: 13px; font-weight: 600; color: ${LC_ORANGE}; margin: 16px 0 10px 0; letter-spacing: 0.02em; }

  .calendar-wrap {
    padding: 3px 0 10px 0;
  }

  .calendar-months {
    display: grid;
    grid-template-columns: repeat(26, minmax(0, 1fr));
    align-items: end;
    height: 14px;
    margin-bottom: 4px;
  }

  .calendar-month {
    color: ${LC_GRAY};
    font-size: 9.5px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
  }

  .submission-calendar {
    display: grid;
    grid-template-rows: repeat(7, 1fr);
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 2px;
  }

  .calendar-day {
    aspect-ratio: 1 / 1;
    border-radius: 4px;
    background-color: rgba(255,255,255,0.08);
    width: 100%;
    transition: background 0.2s ease;
  }

  .calendar-day.level-0 { background-color: rgba(255,255,255,0.08); }
  .calendar-day.level-1 { background-color: rgba(212,160,23,0.4); }
  .calendar-day.level-2 { background-color: rgba(212,160,23,0.58); }
  .calendar-day.level-3 { background-color: rgba(212,160,23,0.78); }
  .calendar-day.level-4 { background-color: ${LC_ORANGE}; }

  .difficulty-section { margin-top: 10px; }
  .difficulty-item { display: flex; align-items: center; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid ${LC_BORDER}; }
  .difficulty-item:last-child { border-bottom: none; }
  .difficulty-info { display: flex; align-items: center; gap: 8px; }
  .difficulty-dot { width: 8px; height: 8px; border-radius: 50%; }
  .difficulty-dot.easy { background: #34c759; }
  .difficulty-dot.medium { background: #ff9500; }
  .difficulty-dot.hard { background: #ff3b30; }
  .difficulty-name { font-size: 13px; color: ${LC_WHITE}; font-weight: 500; }
  .difficulty-count { font-size: 14px; font-weight: 600; color: ${LC_WHITE}; }

  .error, .loading { color: ${LC_ORANGE}; text-align: center; font-size: 13px; padding: 20px; }
  .error { color: #ff6b6b; }
`;

const renderCalendar = (submissionCalendar) => {
  if (!submissionCalendar) {
    return <p className="loading">No submission data available.</p>;
  }
  const days = [];
  const daysToShow = 182; // Last six months
  for (let i = 0; i < daysToShow; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (daysToShow - 1 - i));
    days.push(date);
  }
  const columnCount = Math.ceil(daysToShow / 7);
  const monthLabels = days.reduce((labels, date, index) => {
    const isFirstVisibleDay = index === 0;
    const isFirstDayOfMonth = date.getDate() === 1;
    if (!isFirstVisibleDay && !isFirstDayOfMonth) return labels;

    const column = Math.floor(index / 7) + 1;
    const label = date.toLocaleDateString('en-US', { month: 'short' });
    labels.push({ column, span: Math.min(3, columnCount - column + 1), label });
    return labels;
  }, []);
  const getColorLevel = (count) => {
    if (count === 0) return 'level-0';
    if (count <= 2) return 'level-1';
    if (count <= 5) return 'level-2';
    if (count <= 9) return 'level-3';
    return 'level-4';
  };
  return (
    <div className="calendar-wrap">
      <div className="calendar-months" style={{gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`}}>
        {monthLabels.map(({ column, span, label }, index) => (
          <span
            key={`${label}-${index}`}
            className="calendar-month"
            style={{gridColumn: `${column} / span ${span}`}}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="submission-calendar">
        {days.map((date, index) => {
          const utcMidnight = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
          const timestamp = Math.floor(utcMidnight.getTime() / 1000);
          const count = submissionCalendar[timestamp] || 0;
          const levelClass = getColorLevel(count);
          const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const tooltip = `${count} submissions on ${dateString}`;
          return (
            <div
              key={index}
              className={`calendar-day ${levelClass}`}
              title={tooltip}
            />
          );
        })}
      </div>
    </div>
  );
};

export const render = ({ output, error }) => {
  if (error || !output || output.trim() === '') {
    const errText = error != null ? (typeof error === "string" ? error : (error.message || String(error))) : "";
    return (
      <div>
        <div className="header"><div className="leetcode-icon"><img src="leetcode-glance-widget/assets/leetcode-icon.png" alt="LeetCode" /></div><div className="header-text"><h1 className="username">LeetCode</h1><p className="subtitle">No Data</p></div></div>
        <div className="content"><div className="error">Could not fetch data.{errText ? <><br /><small>{errText}</small></> : null}</div></div>
      </div>
    );
  }
  if (output.includes('error') || output.includes('<!DOCTYPE')) {
    return (
      <div>
        <div className="header"><div className="leetcode-icon"><img src="leetcode-glance-widget/assets/leetcode-icon.png" alt="LeetCode" /></div><div className="header-text"><h1 className="username">API Error</h1><p className="subtitle">Invalid Response</p></div></div>
        <div className="content"><div className="error">API error.</div></div>
      </div>
    );
  }
  try {
    const data = JSON.parse(output);
    const isSuccess = data.status === "success" || (typeof data.totalSolved === "number");
    if (!isSuccess) {
      return (
        <div>
          <div className="header"><div className="leetcode-icon"><img src="leetcode-glance-widget/assets/leetcode-icon.png" alt="LeetCode" /></div><div className="header-text"><h1 className="username">LeetCode</h1><p className="subtitle">Fetch Failed</p></div></div>
          <div className="content"><div className="error">Failed to fetch data for user "{LEETCODE_USERNAME}".</div></div>
        </div>
      );
    }
    const { totalSolved, acceptanceRate, ranking, submissionCalendar } = data;
    const rankNum = typeof ranking === "number" ? ranking : (ranking !== "N/A" && ranking != null ? Number(ranking) : null);
    const rankText = rankNum != null && !Number.isNaN(rankNum)
      ? (rankNum >= 10000 && rankNum % 10000 === 0 ? rankNum.toLocaleString() + "+" : rankNum.toLocaleString())
      : (ranking !== "N/A" && ranking != null ? String(ranking) : null);
    return (
      <div>
        <div className="header">
          <div className="leetcode-icon"><img src="leetcode-glance-widget/assets/leetcode-icon.png" alt="LeetCode" /></div>
          <div className="header-text">
            <h1 className="username">{LEETCODE_USERNAME}</h1>
            <p className="subtitle">LeetCode Stats {rankText != null && <span style={{marginLeft:8}}>Rank #{rankText}</span>}</p>
          </div>
        </div>
        <div className="content">
          <div style={{display: 'flex', gap: 16, marginBottom: 18}}>
            <div className="stat-card" style={{flex: 1, marginBottom: 0}}>
              <h2 className="stat-number">{totalSolved}</h2>
              <p className="stat-label">Total Solved</p>
            </div>
            {acceptanceRate != null && (
              <div className="stat-card" style={{flex: 1, marginBottom: 0}}>
                <h2 className="stat-number">{acceptanceRate}%</h2>
                <p className="stat-label">Acceptance</p>
              </div>
            )}
          </div>
          <h3 className="section-title">Last 6 Months</h3>
          {renderCalendar(submissionCalendar)}
        </div>
      </div>
    );
  } catch (e) {
    return (
      <div>
        <div className="header"><div className="leetcode-icon"><img src="leetcode-glance-widget/assets/leetcode-icon.png" alt="LeetCode" /></div><div className="header-text"><h1 className="username">LeetCode</h1><p className="subtitle">Loading...</p></div></div>
        <div className="content"><div className="loading">Fetching data...</div></div>
      </div>
    );
  }
};
