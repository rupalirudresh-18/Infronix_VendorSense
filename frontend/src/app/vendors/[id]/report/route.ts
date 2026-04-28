import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let vendor: any
  let prediction: any

  try {
    const [vRes, pRes] = await Promise.all([
      fetch(`http://localhost:8000/api/vendors/${params.id}`),
      fetch(`http://localhost:8000/api/vendors/${params.id}/predict`),
    ])
    vendor = await vRes.json()
    prediction = await pRes.json()
  } catch (e) {
    return new NextResponse('Failed to fetch vendor data. Make sure backend is running on port 8000.', { status: 500 })
  }

  const score = vendor.overall_score
  const riskColor =
    score >= 80 ? '#3fb950' :
    score >= 65 ? '#58a6ff' :
    score >= 50 ? '#d29922' : '#f85149'

  const delayColor = prediction.current_delay_probability > 0.5 ? '#f85149' : '#3fb950'
  const delayBg   = prediction.current_delay_probability > 0.5 ? '#fff5f5' : '#f0fff4'
  const delayBorder = prediction.current_delay_probability > 0.5 ? '#f85149' : '#3fb950'

  const metricBar = (val: number, color: string) =>
    `<div style="flex:1;margin:0 12px;height:7px;background:#eee;border-radius:4px;overflow:hidden;">
       <div style="width:${val}%;height:100%;background:${color};border-radius:4px;"></div>
     </div>`

  const recBorderColor = (impact: string) =>
    impact === 'Critical' ? '#f85149' :
    impact === 'High'     ? '#d29922' :
    impact === 'Opportunity' ? '#3fb950' : '#25a370'

  const recImpactColor = (impact: string) =>
    impact === 'Critical' ? '#f85149' :
    impact === 'High'     ? '#d29922' :
    impact === 'Opportunity' ? '#3fb950' : '#888'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>VendorSense Report — ${vendor.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'DM Sans',sans-serif;background:#fff;color:#1a1a2e;padding:48px 52px;font-size:14px;line-height:1.6;}

    /* ── PRINT ── */
    @media print{
      body{padding:24px 28px;}
      .no-print{display:none!important;}
      .page-break{page-break-before:always;}
    }

    /* ── HEADER ── */
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #25a370;margin-bottom:36px;}
    .brand{font-size:11px;color:#25a370;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px;}
    h1{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#1a1a2e;letter-spacing:-.02em;}
    .subtitle{font-size:13px;color:#666;margin-top:5px;}
    .generated{font-size:11px;color:#aaa;margin-top:8px;}

    /* ── SCORE BOX ── */
    .score-box{text-align:center;background:#fafffe;border:2px solid ${riskColor};border-radius:14px;padding:18px 28px;min-width:140px;}
    .score-num{font-family:'Syne',sans-serif;font-size:48px;font-weight:900;color:${riskColor};line-height:1;}
    .score-label{font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:.08em;}
    .risk-badge{display:inline-block;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;background:${riskColor}22;color:${riskColor};border:1px solid ${riskColor};margin-top:10px;}

    /* ── PRINT BUTTON ── */
    .print-btn{display:inline-flex;align-items:center;gap:8px;background:#25a370;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:28px;font-family:'DM Sans',sans-serif;}
    .print-btn:hover{background:#1a845b;}

    /* ── SECTIONS ── */
    .section{margin-bottom:32px;}
    .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#25a370;margin-bottom:14px;padding-bottom:7px;border-bottom:1px solid #e0f5ec;}

    /* ── GRID ── */
    .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:0;}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:24px;}

    /* ── STAT CARDS ── */
    .stat-card{background:#f8fafb;border-radius:10px;padding:14px 16px;border:1px solid #eee;}
    .stat-label{font-size:11px;color:#888;margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em;}
    .stat-value{font-size:22px;font-weight:800;color:#1a1a2e;font-family:'Syne',sans-serif;}

    /* ── METRIC ROWS ── */
    .metric-row{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid #f5f5f5;}
    .metric-label{font-size:13px;color:#444;min-width:160px;}
    .metric-val{font-size:13px;font-weight:700;font-family:monospace;min-width:44px;text-align:right;}

    /* ── SIGNAL ROWS ── */
    .signal-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f5f5f5;font-size:13px;}
    .signal-val{font-weight:700;font-family:monospace;}

    /* ── RECOMMENDATIONS ── */
    .rec-item{display:flex;gap:14px;padding:14px;background:#f9fafb;border-radius:10px;margin-bottom:10px;border-left:4px solid #25a370;}
    .rec-icon{font-size:20px;flex-shrink:0;margin-top:2px;}
    .rec-action{font-size:14px;font-weight:700;color:#1a1a2e;margin-bottom:3px;}
    .rec-detail{font-size:12px;color:#555;line-height:1.55;}
    .rec-impact{font-size:11px;font-weight:700;margin-top:5px;}

    /* ── PREDICTION BOX ── */
    .predict-box{background:${delayBg};border:2px solid ${delayBorder};border-radius:12px;padding:22px 26px;margin-bottom:18px;}
    .predict-headline{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#1a1a2e;line-height:1.3;}
    .predict-headline span{color:${delayColor};}
    .predict-sub{font-size:12px;color:#666;margin-top:7px;}

    /* ── DRIVERS ── */
    .driver-row{display:flex;gap:12px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #f5f5f5;}
    .driver-num{width:24px;height:24px;border-radius:6px;background:#fff0f0;color:#f85149;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .driver-text{font-size:12px;color:#555;line-height:1.5;}

    /* ── INCIDENTS ── */
    .incident-tag{display:inline-block;background:#fff8e1;color:#b7791f;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;margin:3px 3px 3px 0;border:1px solid #f6c333;}

    /* ── FOOTER ── */
    .footer{margin-top:44px;padding-top:16px;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:11px;color:#aaa;}

    /* ── EXPLAINABILITY ── */
    .explain-row{margin-bottom:14px;}
    .explain-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;}
    .explain-key{font-size:13px;font-weight:500;color:#1a1a2e;text-transform:capitalize;}
    .explain-weight{font-size:11px;color:#aaa;margin-left:8px;}
    .explain-val{font-size:13px;font-weight:700;font-family:monospace;}
    .explain-bar-wrap{flex:1;height:6px;background:#eee;border-radius:3px;overflow:hidden;margin-right:10px;}
    .explain-bar{height:100%;border-radius:3px;}
    .explain-impact{font-size:11px;font-weight:700;min-width:54px;text-align:right;}
  </style>
</head>
<body>

  <!-- Print Button (hidden when printing) -->
  <button class="print-btn no-print" onclick="window.print()">🖨 Print / Save as PDF</button>

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="brand">✦ VendorSense · AI Intelligence Report</div>
      <h1>${vendor.name}</h1>
      <div class="subtitle">${vendor.category} &nbsp;·&nbsp; ${vendor.country} &nbsp;·&nbsp; Partner since ${vendor.since}</div>
      <div class="generated">Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;·&nbsp; Vendor ID: ${vendor.id}</div>
    </div>
    <div class="score-box">
      <div class="score-num">${score}</div>
      <div class="score-label">AI Score / 100</div>
      <div class="risk-badge">${vendor.risk_level} Risk</div>
    </div>
  </div>

  <!-- CONTRACT SUMMARY -->
  <div class="section">
    <div class="section-title">Contract Summary</div>
    <div class="grid-4">
      <div class="stat-card">
        <div class="stat-label">Contract Value</div>
        <div class="stat-value" style="font-size:18px;">$${(vendor.contract_value / 1_000_000).toFixed(1)}M</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">On-Time Rate</div>
        <div class="stat-value">${vendor.on_time_rate}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Defect Rate</div>
        <div class="stat-value">${vendor.defect_rate}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Response</div>
        <div class="stat-value" style="font-size:18px;">${vendor.response_time}h</div>
      </div>
    </div>
  </div>

  <!-- PERFORMANCE + EXTERNAL SIGNALS -->
  <div class="grid-2">

    <!-- Performance -->
    <div class="section">
      <div class="section-title">Performance Breakdown</div>
      ${[
        { label: 'Cost Efficiency',      val: vendor.cost_efficiency,      color: '#25a370' },
        { label: 'Delivery Reliability', val: vendor.delivery_reliability, color: '#58a6ff' },
        { label: 'Quality Score',        val: vendor.quality_score,        color: '#d29922' },
        { label: 'Past Performance',     val: vendor.past_performance,     color: '#bc8cff' },
      ].map(m => `
        <div class="metric-row">
          <span class="metric-label">${m.label}</span>
          ${metricBar(m.val, m.color)}
          <span class="metric-val" style="color:${m.color}">${m.val}%</span>
        </div>
      `).join('')}
    </div>

    <!-- External Signals -->
    <div class="section">
      <div class="section-title">External Risk Signals</div>
      <div class="signal-row">
        <span>News Sentiment</span>
        <span class="signal-val" style="color:${vendor.news_sentiment > 0 ? '#3fb950' : '#f85149'}">${vendor.news_sentiment.toFixed(2)}</span>
      </div>
      <div class="signal-row">
        <span>Weather Risk Index</span>
        <span class="signal-val" style="color:${vendor.weather_risk > 0.4 ? '#d29922' : '#3fb950'}">${(vendor.weather_risk * 100).toFixed(0)}%</span>
      </div>
      <div class="signal-row">
        <span>Market Volatility</span>
        <span class="signal-val" style="color:${vendor.market_volatility > 0.5 ? '#f85149' : '#58a6ff'}">${vendor.market_volatility.toFixed(2)}</span>
      </div>
      <div class="signal-row">
        <span>Region Risk</span>
        <span class="signal-val">${vendor.region_risk}</span>
      </div>
      <div class="signal-row">
        <span>Vendor Failure Risk</span>
        <span class="signal-val" style="color:${vendor.failure_risk > 0.3 ? '#f85149' : '#3fb950'}">${(vendor.failure_risk * 100).toFixed(0)}%</span>
      </div>
      ${vendor.recent_incidents?.length > 0 ? `
        <div style="margin-top:14px;">
          <div style="font-size:11px;color:#aaa;margin-bottom:7px;text-transform:uppercase;letter-spacing:.06em;">Recent Incidents</div>
          ${vendor.recent_incidents.map((inc: string) => `<span class="incident-tag">⚠ ${inc}</span>`).join('')}
        </div>` : ''}
    </div>

  </div>

  <!-- AI RECOMMENDATIONS -->
  <div class="section">
    <div class="section-title">AI Recommendations</div>
    ${vendor.recommendations.map((r: any) => `
      <div class="rec-item" style="border-left-color:${recBorderColor(r.impact)};">
        <div>
          <div class="rec-action">${r.action}</div>
          <div class="rec-detail">${r.detail}</div>
          <div class="rec-impact" style="color:${recImpactColor(r.impact)};">Impact: ${r.impact}</div>
        </div>
      </div>
    `).join('')}
  </div>

  <!-- AI EXPLAINABILITY -->
  <div class="section">
    <div class="section-title">🧠 AI Score Explainability</div>
    ${Object.entries(vendor.explainability).map(([key, info]: [string, any]) => {
      const impactColor = info.impact === 'Positive' ? '#3fb950' : info.impact === 'Neutral' ? '#8b949e' : '#f85149'
      const barWidth = typeof info.value === 'number' && info.value <= 1 ? info.value * 100 : info.value
      const displayVal = typeof info.value === 'number' && info.value > 1 ? `${info.value}%` : typeof info.value === 'number' ? info.value.toFixed(2) : info.value
      return `
        <div class="explain-row">
          <div class="explain-top">
            <div>
              <span class="explain-key">${key.replace(/_/g, ' ')}</span>
              <span class="explain-weight">Weight: ${info.weight}</span>
            </div>
            <span class="explain-val" style="color:${impactColor}">${displayVal}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="explain-bar-wrap">
              <div class="explain-bar" style="width:${barWidth}%;background:${impactColor};"></div>
            </div>
            <span class="explain-impact" style="color:${impactColor}">${info.impact}</span>
          </div>
        </div>`
    }).join('')}
  </div>

  <!-- PREDICTION -->
  <div class="section">
    <div class="section-title">🔮 AI Delay Prediction — Next 30 Days</div>
    <div class="predict-box">
      <div class="predict-headline">
        This vendor has a <span>${(prediction.current_delay_probability * 100).toFixed(0)}% chance of delay</span> next month.
      </div>
      <div class="predict-sub">
        Model confidence: ${(prediction.model_confidence * 100).toFixed(0)}%
        &nbsp;·&nbsp;
        Failure risk score: ${(prediction.failure_risk_score * 100).toFixed(0)}%
        &nbsp;·&nbsp;
        Trend: ${vendor.trend}
      </div>
    </div>
    <div style="font-size:12px;color:#555;">
      <div style="font-weight:700;color:#333;margin-bottom:10px;">Key Risk Drivers:</div>
      ${prediction.key_drivers.map((d: string, i: number) => `
        <div class="driver-row">
          <div class="driver-num">${i + 1}</div>
          <div class="driver-text">${d}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <span>VendorSense AI Intelligence Platform &nbsp;·&nbsp; Confidential</span>
    <span>Vendor ID: ${vendor.id} &nbsp;·&nbsp; Auto-generated by AI</span>
  </div>

</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
