from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random
import math
from datetime import datetime, timedelta
import json

app = FastAPI(title="VendorSense API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Data Models ───────────────────────────────────────────────────────────────

class VendorScoreRequest(BaseModel):
    vendor_id: str

class RecommendationRequest(BaseModel):
    vendor_id: str
    context: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    vendor_id: Optional[str] = None

# ─── Simulated Vendor Database ─────────────────────────────────────────────────

VENDORS = {
    "V001": {
        "id": "V001",
        "name": "Apex Logistics",
        "category": "Logistics & Shipping",
        "country": "United States",
        "since": 2018,
        "contract_value": 2400000,
        "cost_efficiency": 82,
        "delivery_reliability": 54,
        "quality_score": 78,
        "past_performance": 61,
        "response_time": 4.2,
        "defect_rate": 3.1,
        "on_time_rate": 54,
        "news_sentiment": -0.42,
        "weather_risk": 0.61,
        "market_volatility": 0.55,
        "recent_incidents": ["Port strike impact Q3", "Delay spike Oct-Nov"],
        "region_risk": "High",
        "delay_probability": 0.78,
        "failure_risk": 0.34,
        "trend": "declining",
    },
    "V002": {
        "id": "V002",
        "name": "SwiftSupply Co.",
        "category": "Raw Materials",
        "country": "Germany",
        "since": 2015,
        "contract_value": 1800000,
        "cost_efficiency": 91,
        "delivery_reliability": 88,
        "quality_score": 94,
        "past_performance": 90,
        "response_time": 1.8,
        "defect_rate": 0.8,
        "on_time_rate": 91,
        "news_sentiment": 0.31,
        "weather_risk": 0.18,
        "market_volatility": 0.22,
        "recent_incidents": [],
        "region_risk": "Low",
        "delay_probability": 0.12,
        "failure_risk": 0.06,
        "trend": "stable",
    },
    "V003": {
        "id": "V003",
        "name": "NovaTech Parts",
        "category": "Electronics Components",
        "country": "Taiwan",
        "since": 2020,
        "contract_value": 3100000,
        "cost_efficiency": 74,
        "delivery_reliability": 71,
        "quality_score": 86,
        "past_performance": 77,
        "response_time": 2.9,
        "defect_rate": 1.9,
        "on_time_rate": 73,
        "news_sentiment": 0.08,
        "weather_risk": 0.44,
        "market_volatility": 0.67,
        "recent_incidents": ["Semiconductor shortage Q2"],
        "region_risk": "Medium",
        "delay_probability": 0.41,
        "failure_risk": 0.18,
        "trend": "improving",
    },
    "V004": {
        "id": "V004",
        "name": "GreenLeaf Packaging",
        "category": "Packaging",
        "country": "India",
        "since": 2021,
        "contract_value": 950000,
        "cost_efficiency": 88,
        "delivery_reliability": 79,
        "quality_score": 81,
        "past_performance": 83,
        "response_time": 2.1,
        "defect_rate": 1.4,
        "on_time_rate": 82,
        "news_sentiment": 0.19,
        "weather_risk": 0.38,
        "market_volatility": 0.31,
        "recent_incidents": [],
        "region_risk": "Low-Medium",
        "delay_probability": 0.24,
        "failure_risk": 0.11,
        "trend": "stable",
    },
    "V005": {
        "id": "V005",
        "name": "Meridian Steel Works",
        "category": "Industrial Materials",
        "country": "Brazil",
        "since": 2017,
        "contract_value": 4200000,
        "cost_efficiency": 66,
        "delivery_reliability": 62,
        "quality_score": 69,
        "past_performance": 64,
        "response_time": 5.8,
        "defect_rate": 4.2,
        "on_time_rate": 61,
        "news_sentiment": -0.28,
        "weather_risk": 0.52,
        "market_volatility": 0.71,
        "recent_incidents": ["Labor disputes Q1", "Quality audit fail Q2", "Logistics delay Q3"],
        "region_risk": "High",
        "delay_probability": 0.65,
        "failure_risk": 0.41,
        "trend": "declining",
    },
}

def compute_overall_score(v: dict) -> float:
    weights = {
        "cost_efficiency": 0.20,
        "delivery_reliability": 0.30,
        "quality_score": 0.25,
        "past_performance": 0.15,
    }
    base = sum(v[k] * w for k, w in weights.items())
    sentiment_bonus = v["news_sentiment"] * 5
    weather_penalty = v["weather_risk"] * -8
    market_penalty = v["market_volatility"] * -5
    return round(max(0, min(100, base + sentiment_bonus + weather_penalty + market_penalty)), 1)

def get_risk_level(score: float) -> str:
    if score >= 80: return "Low"
    if score >= 65: return "Medium"
    if score >= 50: return "High"
    return "Critical"

def generate_timeseries(vendor: dict, months: int = 12):
    base = compute_overall_score(vendor)
    trend = vendor["trend"]
    data = []
    now = datetime.now()
    for i in range(months):
        month = (now - timedelta(days=30 * (months - i))).strftime("%b %Y")
        if trend == "declining":
            val = base + (months - i) * 1.5 + random.uniform(-4, 4)
        elif trend == "improving":
            val = base - (months - i) * 1.2 + random.uniform(-4, 4)
        else:
            val = base + random.uniform(-5, 5)
        data.append({"month": month, "score": round(max(20, min(100, val)), 1)})
    return data

def get_recommendations(vendor: dict) -> list:
    recs = []
    score = compute_overall_score(vendor)
    if vendor["delivery_reliability"] < 65:
        recs.append({
            "type": "warning",
            "action": "Diversify suppliers",
            "detail": f"Delivery reliability at {vendor['delivery_reliability']}% — reduce dependency by onboarding a backup vendor.",
            "impact": "High"
        })
    if vendor["cost_efficiency"] < 75:
        recs.append({
            "type": "negotiate",
            "action": "Renegotiate pricing",
            "detail": "Cost efficiency below threshold. Benchmark against SwiftSupply Co. and request volume discount.",
            "impact": "Medium"
        })
    if vendor["delay_probability"] > 0.5:
        recs.append({
            "type": "critical",
            "action": f"Issue formal performance review",
            "detail": f"AI predicts {int(vendor['delay_probability']*100)}% delay probability next 30 days. Escalate to vendor account manager immediately.",
            "impact": "Critical"
        })
    if vendor["news_sentiment"] < -0.2:
        recs.append({
            "type": "monitor",
            "action": "Monitor news & geopolitical signals",
            "detail": "Negative news sentiment detected in vendor's region. Track for supply chain disruption signals.",
            "impact": "Medium"
        })
    if score >= 80:
        recs.append({
            "type": "positive",
            "action": "Expand partnership",
            "detail": "Strong performance metrics. Consider increasing contract volume or adding new product categories.",
            "impact": "Opportunity"
        })
    if not recs:
        recs.append({
            "type": "positive",
            "action": "Maintain current contract",
            "detail": "Vendor performance is stable. Schedule quarterly review to sustain engagement.",
            "impact": "Low"
        })
    return recs

# ─── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/vendors")
def list_vendors():
    result = []
    for v in VENDORS.values():
        score = compute_overall_score(v)
        result.append({
            "id": v["id"],
            "name": v["name"],
            "category": v["category"],
            "country": v["country"],
            "score": score,
            "risk_level": get_risk_level(score),
            "delay_probability": v["delay_probability"],
            "failure_risk": v["failure_risk"],
            "trend": v["trend"],
            "contract_value": v["contract_value"],
        })
    return result

@app.get("/api/vendors/{vendor_id}")
def get_vendor(vendor_id: str):
    v = VENDORS.get(vendor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")
    score = compute_overall_score(v)
    return {
        **v,
        "overall_score": score,
        "risk_level": get_risk_level(score),
        "timeseries": generate_timeseries(v),
        "recommendations": get_recommendations(v),
        "explainability": {
            "cost_efficiency": {"value": v["cost_efficiency"], "weight": "20%", "impact": "Positive" if v["cost_efficiency"] > 75 else "Negative"},
            "delivery_reliability": {"value": v["delivery_reliability"], "weight": "30%", "impact": "Positive" if v["delivery_reliability"] > 75 else "Negative"},
            "quality_score": {"value": v["quality_score"], "weight": "25%", "impact": "Positive" if v["quality_score"] > 75 else "Negative"},
            "past_performance": {"value": v["past_performance"], "weight": "15%", "impact": "Positive" if v["past_performance"] > 75 else "Negative"},
            "news_sentiment": {"value": v["news_sentiment"], "weight": "External", "impact": "Positive" if v["news_sentiment"] > 0 else "Negative"},
            "weather_risk": {"value": v["weather_risk"], "weight": "External", "impact": "Negative" if v["weather_risk"] > 0.4 else "Neutral"},
            "market_volatility": {"value": v["market_volatility"], "weight": "External", "impact": "Negative" if v["market_volatility"] > 0.5 else "Neutral"},
        }
    }

@app.get("/api/dashboard/stats")
def dashboard_stats():
    all_vendors = list(VENDORS.values())
    scores = [compute_overall_score(v) for v in all_vendors]
    high_risk = [v for v in all_vendors if v["delay_probability"] > 0.5]
    return {
        "total_vendors": len(all_vendors),
        "avg_score": round(sum(scores) / len(scores), 1),
        "high_risk_count": len(high_risk),
        "total_spend": sum(v["contract_value"] for v in all_vendors),
        "alerts": [
            {"vendor": v["name"], "message": f"{int(v['delay_probability']*100)}% delay risk next month", "severity": "critical"}
            for v in all_vendors if v["delay_probability"] > 0.5
        ],
        "top_vendor": max(VENDORS.values(), key=lambda v: compute_overall_score(v))["name"],
    }

@app.post("/api/chat")
def chat(req: ChatRequest):
    vendor = VENDORS.get(req.vendor_id) if req.vendor_id else None
    msg = req.message.lower()

    if vendor:
        score = compute_overall_score(vendor)
        name = vendor["name"]

        if any(w in msg for w in ["risk", "delay", "fail"]):
            reply = (
                f"**{name}** has a **{int(vendor['delay_probability']*100)}% probability of delay** next month. "
                f"Key risk factors: delivery reliability at {vendor['delivery_reliability']}%, "
                f"news sentiment score of {vendor['news_sentiment']:.2f}, and weather risk index of {vendor['weather_risk']:.2f}. "
                f"Region classified as **{vendor['region_risk']} Risk**."
            )
        elif any(w in msg for w in ["score", "perform", "rating"]):
            reply = (
                f"**{name}** has an overall AI score of **{score}/100** ({get_risk_level(score)} risk). "
                f"Breakdown: Cost Efficiency {vendor['cost_efficiency']}%, Delivery Reliability {vendor['delivery_reliability']}%, "
                f"Quality {vendor['quality_score']}%, Past Performance {vendor['past_performance']}%."
            )
        elif any(w in msg for w in ["recommend", "suggest", "action", "should"]):
            recs = get_recommendations(vendor)
            rec_text = "; ".join([f"**{r['action']}** ({r['impact']} impact)" for r in recs[:2]])
            reply = f"For **{name}**, I recommend: {rec_text}. These are based on current performance trends and external risk signals."
        elif any(w in msg for w in ["news", "sentiment", "external"]):
            reply = (
                f"External signals for **{name}**: News sentiment is **{vendor['news_sentiment']:.2f}** "
                f"({'negative' if vendor['news_sentiment'] < 0 else 'positive'}), "
                f"weather disruption risk is **{vendor['weather_risk']:.0%}**, "
                f"and market volatility index is **{vendor['market_volatility']:.2f}**. "
                f"Recent incidents: {', '.join(vendor['recent_incidents']) if vendor['recent_incidents'] else 'None recorded'}."
            )
        else:
            reply = (
                f"**{name}** is a {vendor['category']} vendor from {vendor['country']}, "
                f"active since {vendor['since']} with a ${vendor['contract_value']:,} contract. "
                f"Overall AI score: **{score}/100**. Ask me about their risk, performance, or recommendations."
            )
    else:
        if any(w in msg for w in ["best", "top", "recommend"]):
            top = max(VENDORS.values(), key=lambda v: compute_overall_score(v))
            reply = f"The top-performing vendor is **{top['name']}** with a score of **{compute_overall_score(top)}/100**. They have excellent delivery reliability and low external risk signals."
        elif any(w in msg for w in ["risk", "danger", "alert"]):
            risky = [v for v in VENDORS.values() if v["delay_probability"] > 0.5]
            names = ", ".join([v["name"] for v in risky])
            reply = f"High-risk vendors requiring immediate attention: **{names}**. These vendors have >50% predicted delay probability next month."
        elif any(w in msg for w in ["spend", "cost", "budget"]):
            total = sum(v["contract_value"] for v in VENDORS.values())
            reply = f"Total vendor spend across all {len(VENDORS)} vendors is **${total:,}**. Meridian Steel Works has the highest contract at $4.2M but also the lowest performance score."
        else:
            reply = "I'm VendorSense AI. Ask me about vendor risks, scores, recommendations, or external signals. Select a specific vendor for detailed analysis."

    return {"reply": reply, "timestamp": datetime.now().isoformat()}

@app.get("/api/vendors/{vendor_id}/predict")
def predict_vendor(vendor_id: str):
    v = VENDORS.get(vendor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")

    # Simulate 6-month forecast
    base_delay = v["delay_probability"]
    forecast = []
    now = datetime.now()
    for i in range(1, 7):
        month = (now + timedelta(days=30 * i)).strftime("%b %Y")
        noise = random.uniform(-0.08, 0.08)
        if v["trend"] == "declining":
            prob = min(0.95, base_delay + i * 0.03 + noise)
        elif v["trend"] == "improving":
            prob = max(0.05, base_delay - i * 0.025 + noise)
        else:
            prob = max(0.05, min(0.95, base_delay + noise))
        forecast.append({"month": month, "delay_probability": round(prob, 3)})

    return {
        "vendor_id": vendor_id,
        "vendor_name": v["name"],
        "current_delay_probability": v["delay_probability"],
        "failure_risk_score": v["failure_risk"],
        "forecast": forecast,
        "model_confidence": 0.84,
        "key_drivers": [
            f"Delivery reliability: {v['delivery_reliability']}%",
            f"News sentiment: {v['news_sentiment']:.2f}",
            f"Weather risk index: {v['weather_risk']:.2f}",
            f"Market volatility: {v['market_volatility']:.2f}",
        ]
    }
