import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const res = await fetch(`http://localhost:8000/api/vendors/${params.id}`)
  const vendor = await res.json()

  const pred = await fetch(`http://localhost:8000/api/vendors/${params.id}/predict`)
  const prediction = await pred.json()

  const score = vendor.overall_score
  const riskColor = score >= 80 ? '#3fb950' : score >= 65 ? '#58a6ff' : score >= 50 ? '#d29922' : '#f85149'

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1a1a2e; padding: 40px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #25a370; margin-bottom: 32px; }
      .brand { font-size: 13px; color: #25a370; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
      h1 { font-size: 26px; font-weight: 800; color: #1a1a2e; }
      .subtitle { font-size: 13px; color: #666; margin-top: 4px; }
      .score-box { text-align: center; background: #f8fffe; border: 2px solid ${riskColor}; border-radius: 12px; padding: 16px 24px; }
      .score-num { font-size: 42px; font-weight: 900; color: ${riskColor}; line-height: 1; }
      .score-label { font-size: 11px; color: #666; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
      .risk-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: ${riskColor}22; color: ${riskColor}; border: 1px solid ${riskColor}; margin-top: 8px; }
      .section { margin-bottom: 28px; }
      .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #25a370; margin-bottom: 14px; padding-bottom: 6px; border-bottom: 1px solid #e8f5f0; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
      .stat-card { background: #f9fafb; border-radius: 8px; padding: 14px 16px; border: 1px solid #eee; }
      .stat-label { font-size: 11px; color: #888; margin-bottom: 4px; }
      .stat-value { font-size: 20px; font-weight: 800; color: #1a1a2e; }
      .metric-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
      .metric-label { font-size: 13px; color: #444; }
      .metric-bar-wrap { flex: 1; margin: 0 16px; height: 6px; background: #eee; border-radius: 3px; overflow: hidden; }
      .metric-bar { height: 100%; border-radius: 3px; }
      .metric-val { font-size: 13px; font-weight: 700; font-family: monospace; min-width: 40px; text-align: right; }
      .rec-item { display: flex; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #25a370; }
      .rec-action { font-size: 13px; font-weight: 700; color: #1a1a2e; }
      .rec-detail { font-size: 12px; color: #666; margin-top: 3px; line-height: 1.5; }
      .rec-impact { font-size: 11px; font-weight: 700; margin-top: 4px; }
      .signal-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
      .signal-val { font-weight: 700; font-family: monospace; }
      .predict-box { background: ${prediction.current_delay_probability > 0.5 ? '#fff5f5' : '#f0fff4'}; border: 2px solid ${prediction.current_delay_probability > 0.5 ? '#f85149' : '#3fb950'}; border-radius: 10px; padding: 20px 24px; margin-bottom: 16px; }
      .predict-headline { font-size: 18px; font-weight: 800; color: #1a1a2e; }
      .predict-headline span { color: ${prediction.current_delay_probability > 0.5 ? '#f85149' : '#3fb950'}; }
      .predict-sub { font-size: 12px; color: #666; margin-top: 6px; }
      .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 11px; color: #aaa; }
      .incident-tag { display: inline-block; background: #fff3cd; color: #856404; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; margin: 3px; border: 1px solid #ffc107; }
      @media print { body { padding: 20px; } }
    </style>
  </head>
  <body>

    <!-- HEADER -->
    <div class="header">
      <div>
        <div class="brand">✦ VendorSense · AI Intelligence Report</div>
        <h1>${vendor.name}</h1>
        <div class="subtitle">${vendor.category} · ${vendor.country} · Partner since ${vendor.since}</div>
        <div class="subtitle" style="margin-top:6px; color:#999;">Generated: ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div>
      </div>
      <div class="score-box">
        <div class="score-num">${score}</div>
        <div class="score-label">AI Score / 100</div>
        <div class="risk-badge">${vendor.risk_level} Risk</div>
      </div>
    </div>

    <!-- SUMMARY STATS -->
    <div class="section">
      <div class="section-title">Contract Summary</div>
      <div class="grid-4">
        <div class="stat-card">
          <div class="stat-label">Contract Value</div>
          <div class="stat-value" style="font-size:16px;">$${(vendor.contract_value/1000000).toFixed(1)}M</div>
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
          <div class="stat-value" style="font-size:16px;">${vendor.response_time}h</div>
        </div>
      </div>
    </div>

    <!-- PERFORMANCE METRICS -->
    <div class="section">
      <div class="section-title">Performance Breakdown</div>
      ${[
        { label: 'Cost Efficiency', val: vendor.cost_efficiency, color: '#25a370' },
        { label: 'Delivery Reliability', val: vendor.delivery_reliability, color: '#58a6ff' },
        { label: 'Quality Score', val: vendor.quality_score, color: '#d29922' },
        { label: 'Past Performance', val: vendor.past_performance, color: '#bc8cff' },
      ].map(m => `
        <div class="metric-row">
          <span class="metric-label">${m.label}</span>
          <div class="metric-bar-wrap"><div class="metric-bar" style="width:${m.val}%;background:${m.color};"></div></div>
          <span class="metric-val" style="color:${m.color}">${m.val}%</span>
        </div>
      `).join('')}
    </div>

    <div class="grid-2">

      <!-- EXTERNAL SIGNALS -->
      <div class="section">
        <div class="section-title">External Risk Signals</div>
        <div class="signal-row"><span>News Sentiment</span><span class="signal-val" style="color:${vendor.news_sentiment > 0 ? '#3fb950':'#f85149'}">${vendor.news_sentiment.toFixed(2)}</span></div>
        <div class="signal-row"><span>Weather Risk</span><span class="signal-val" style="color:${vendor.weather_risk > 0.4 ? '#d29922':'#3fb950'}">${(vendor.weather_risk*100).toFixed(0)}%</span></div>
        <div class="signal-row"><span>Market Volatility</span><span class="signal-val" style="color:${vendor.market_volatility > 0.5 ? '#f85149':'#58a6ff'}">${vendor.market_volatility.toFixed(2)}</span></div>
        <div class="signal-row"><span>Region Risk</span><span class="signal-val">${vendor.region_risk}</span></div>
        <div class="signal-row"><span>Failure Risk</span><span class="signal-val" style="color:${vendor.failure_risk > 0.3 ? '#f85149':'#3fb950'}">${(vendor.failure_risk*100).toFixed(0)}%</span></div>
        ${vendor.recent_incidents?.length > 0 ? `
          <div style="margin-top:12px;">
            <div style="font-size:11px;color:#888;margin-bottom:6px;">RECENT INCIDENTS</div>
            ${vendor.recent_incidents.map((i: string) => `<span class="incident-tag">⚠ ${i}</span>`).join('')}
          </div>` : ''}
      </div>

      <!-- AI RECOMMENDATIONS -->
      <div class="section">
        <div class="section-title">AI Recommendations</div>
        ${vendor.recommendations.map((r: any) => `
          <div class="rec-item">
            <div>
              <div class="rec-action">${r.action}</div>
              <div class="rec-detail">${r.detail}</div>
              <div class="rec-impact" style="color:${r.impact === 'Critical' ? '#f85149' : r.impact === 'High' ? '#d29922' : r.impact === 'Opportunity' ? '#3fb950' : '#888'}">
                Impact: ${r.impact}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

    </div>

    <!-- PREDICTION -->
    <div class="section">
      <div class="section-title">AI Delay Prediction (Next 30 Days)</div>
      <div class="predict-box">
        <div class="predict-headline">
          This vendor has a <span>${(prediction.current_delay_probability * 100).toFixed(0)}% chance of delay</span> next month.
        </div>
        <div class="predict-sub">Model confidence: ${(prediction.model_confidence * 100).toFixed(0)}% · Failure risk score: ${(prediction.failure_risk_score * 100).toFixed(0)}%</div>
      </div>
      <div style="font-size:12px;color:#666;">
        <strong style="display:block;margin-bottom:8px;color:#444;">Key Risk Drivers:</strong>
        ${prediction.key_drivers.map((d: string, i: number) => `
          <div style="padding:5px 0;border-bottom:1px solid #f5f5f5;">
            <span style="font-weight:700;color:#25a370;margin-right:8px;">${i+1}.</span>${d}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <span>VendorSense AI Intelligence Platform · Confidential</span>
      <span>Vendor ID: ${vendor.id} · Report auto-generated by AI</span>
    </div>

  </body>
  </html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="VendorSense-${vendor.name.replace(/\s+/g, '-')}-Report.html"`,
    },
  })
}