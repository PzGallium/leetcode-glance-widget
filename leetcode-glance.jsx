// LeetCode Stats Widget for Übersicht
// Fetches and displays LeetCode statistics (supports 力扣中国站 leetcode.cn and leetcode.com).

// --- CONFIGURATION ---
const USE_LEETCODE_CN = true;
const LEETCODE_USERNAME = "YourUsername"; // 改成你的力扣/LeetCode 用户名

// --- CORE LOGIC ---
const command = USE_LEETCODE_CN
  ? `export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH" && export LEETCODE_CN_SESSION_FILE="$HOME/Library/Application Support/Übersicht/widgets/lc-scripts/.leetcode_cn_session" && cd "$HOME/Library/Application Support/Übersicht/widgets" && node lc-scripts/fetch-lc-cn.mjs "${LEETCODE_USERNAME}"`
  : `curl -s "https://leetcode-stats-api.vercel.app/${LEETCODE_USERNAME}"`;
export { command };

export const refreshFrequency = 300000;

// --- STYLING (JSX-in-CSS) ---
// LeetCode 品牌色：橙 #FEA116，黑 #1a1a1a（图标两色）
const LEETCODE_ORANGE = '#FEA116';
const LEETCODE_BLACK = '#1a1a1a';

// 位置：改下面 POSITIONING 里的 top/left。例：右上 top: 60px; left: auto; right: 20px; transform: none;
export const className = `
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: 340px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
  background: rgba(26, 26, 26, 0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  border: 1.5px solid rgba(254, 161, 22, 0.35);
  box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(.4,0,.2,1);

  .header {
    background: ${LEETCODE_BLACK};
    color: #fff;
    padding: 20px 24px 12px 24px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 2px solid ${LEETCODE_ORANGE};
  }

  .leetcode-icon {
    width: 36px;
    height: 36px;
    background: ${LEETCODE_ORANGE};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
    color: ${LEETCODE_BLACK};
    box-shadow: 0 2px 8px rgba(254, 161, 22, 0.4);
  }

  .header-text { flex: 1; }
  .username { font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
  .subtitle { font-size: 13px; opacity: 0.85; margin: 2px 0 0 0; }

  .content {
    padding: 24px 24px 18px 24px;
    background: rgba(0,0,0,0.25);
    border-radius: 0 0 24px 24px;
    min-height: 180px;
  }

  .stat-card {
    background: rgba(254, 161, 22, 0.12);
    border-radius: 14px;
    padding: 16px 0;
    text-align: center;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    border: 1px solid rgba(254, 161, 22, 0.2);
  }

  .stat-number { font-size: 26px; font-weight: 700; color: ${LEETCODE_ORANGE}; margin: 0; }
  .stat-label { font-size: 12px; color: rgba(255,255,255,0.75); margin: 2px 0 0 0; font-weight: 500; }

  .section-title { font-size: 14px; font-weight: 600; color: ${LEETCODE_ORANGE}; margin: 18px 0 10px 0; }

  .submission-calendar {
    display: grid;
    grid-template-rows: repeat(7, 1fr);
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 2px;
    padding: 5px 0 10px 0;
  }

  .calendar-day {
    aspect-ratio: 1 / 1;
    border-radius: 4px;
    background-color: rgba(26, 26, 26, 0.8);
    width: 100%;
    transition: background 0.2s;
  }

  .calendar-day.level-0 { background-color: rgba(26, 26, 26, 0.6); }
  .calendar-day.level-1 { background-color: rgba(254, 161, 22, 0.35); }
  .calendar-day.level-2 { background-color: rgba(254, 161, 22, 0.55); }
  .calendar-day.level-3 { background-color: rgba(254, 161, 22, 0.75); }
  .calendar-day.level-4 { background-color: ${LEETCODE_ORANGE}; }

  .difficulty-section { margin-top: 10px; }
  .difficulty-item { display: flex; align-items: center; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .difficulty-item:last-child { border-bottom: none; }
  .difficulty-info { display: flex; align-items: center; gap: 8px; }
  .difficulty-dot { width: 8px; height: 8px; border-radius: 50%; }
  .difficulty-dot.easy { background: #00e6a3; }
  .difficulty-dot.medium { background: #ffc01e; }
  .difficulty-dot.hard { background: #ff375f; }
  .difficulty-name { font-size: 13px; color: #fff; font-weight: 500; }
  .difficulty-count { font-size: 14px; font-weight: 600; color: #fff; }

  .error, .loading { color: ${LEETCODE_ORANGE}; text-align: center; font-size: 13px; padding: 20px; }
  .error { color: #ff6b6b; }
`;

const renderCalendar = (submissionCalendar) => {
  if (!submissionCalendar) {
    return <p className="loading">No submission data available.</p>;
  }
  const days = [];
  const daysToShow = 182;
  for (let i = 0; i < daysToShow; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (daysToShow - 1 - i));
    days.push(date);
  }
  const getColorLevel = (count) => {
    if (count === 0) return 'level-0';
    if (count <= 2) return 'level-1';
    if (count <= 5) return 'level-2';
    if (count <= 9) return 'level-3';
    return 'level-4';
  };
  return (
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
  );
};

export const render = ({ output, error }) => {
  if (error || !output || output.trim() === '') {
    const errText = error != null ? (typeof error === "string" ? error : (error.message || String(error))) : "";
    return (
      <div>
        <div className="header"><div className="leetcode-icon">LC</div><div className="header-text"><h1 className="username">LeetCode</h1><p className="subtitle">No Data</p></div></div>
        <div className="content"><div className="error">Could not fetch data.{errText ? <><br /><small>{errText}</small></> : null}</div></div>
      </div>
    );
  }
  if (output.includes('error') || output.includes('<!DOCTYPE')) {
    return (
      <div>
        <div className="header"><div className="leetcode-icon">LC</div><div className="header-text"><h1 className="username">API Error</h1><p className="subtitle">Invalid Response</p></div></div>
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
          <div className="header"><div className="leetcode-icon">LC</div><div className="header-text"><h1 className="username">LeetCode</h1><p className="subtitle">Fetch Failed</p></div></div>
          <div className="content"><div className="error">Failed to fetch data for user "{LEETCODE_USERNAME}".</div></div>
        </div>
      );
    }
    const { totalSolved, acceptanceRate, ranking, submissionCalendar } = data;
    return (
      <div>
        <div className="header">
          <div className="leetcode-icon">LC</div>
          <div className="header-text">
            <h1 className="username">{LEETCODE_USERNAME}</h1>
            <p className="subtitle">LeetCode Stats {ranking && ranking !== "N/A" && <span style={{marginLeft:8}}>Rank #{ranking.toLocaleString()}</span>}</p>
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
          <h3 className="section-title">Submission Calendar</h3>
          {renderCalendar(submissionCalendar)}
        </div>
      </div>
    );
  } catch (e) {
    return (
      <div>
        <div className="header"><div className="leetcode-icon">LC</div><div className="header-text"><h1 className="username">LeetCode</h1><p className="subtitle">Loading...</p></div></div>
        <div className="content"><div className="loading">Fetching data...</div></div>
      </div>
    );
  }
};
