"""
====================================================================
QuickBite Platform — Python Data & Business Analytics Engine
Fetches live database records from REST API and calculates key KPIs
====================================================================
"""

import urllib.request
import json
import sys
from collections import defaultdict

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == 'win32' and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://localhost:5000/api"

def fetch_json(endpoint):
    try:
        req = urllib.request.Request(f"{API_URL}{endpoint}", headers={"User-Agent": "QuickBiteAnalytics/1.0"})
        with urllib.request.urlopen(req, timeout=5) as res:
            return json.loads(res.read().decode("utf-8"))
    except Exception as e:
        print(f"[!] Error fetching {endpoint}: {e}")
        return []

def run_analytics():
    print("=" * 60)
    print("  📊 QuickBite Real-Time Platform Analytics (Python 3)")
    print("=" * 60)

    # 1. Platform Health
    health = fetch_json("/health")
    print(f"\n[•] System Status : {health.get('status', 'OFFLINE')}")
    print(f"[•] Database      : {health.get('mongodb', 'N/A')}")
    print(f"[•] API Version   : {health.get('version', '1.0.0')}")

    # 2. Restaurants & Menus
    restaurants = fetch_json("/restaurants")
    categories = fetch_json("/categories")

    print(f"\n--- Catalog Metrics ---")
    print(f"Total Active Categories  : {len(categories)}")
    print(f"Total Active Restaurants : {len(restaurants)}")
    
    total_menu_items = sum(
        sum(len(cat.get("items", [])) for cat in r.get("menu", []))
        for r in restaurants
    )
    print(f"Total Menu Dishes        : {total_menu_items}")

    # 3. Order KPIs
    orders = fetch_json("/orders")
    print(f"\n--- Order & Revenue Performance ---")
    print(f"Total Orders Placed      : {len(orders)}")

    if not orders:
        print("No orders currently recorded. Place an order via the web app to view live metrics.")
        print("=" * 60)
        return

    total_revenue = sum(o.get("total", 0) for o in orders)
    subtotal_revenue = sum(o.get("subtotal", 0) for o in orders)
    avg_order_value = total_revenue / len(orders) if orders else 0
    total_discounts = sum(o.get("discount", 0) for o in orders)

    print(f"Gross Platform Volume    : ₹{total_revenue:,.2f}")
    print(f"Net Food Volume (ex-fee) : ₹{subtotal_revenue:,.2f}")
    print(f"Average Order Value (AOV): ₹{avg_order_value:,.2f}")
    print(f"Total Discounts Availed  : ₹{total_discounts:,.2f}")

    # Payment Methods Breakdown
    payment_counts = defaultdict(int)
    for o in orders:
        payment_counts[o.get("paymentMethod", "other").upper()] += 1

    print(f"\n--- Payment Distribution ---")
    for method, count in payment_counts.items():
        pct = (count / len(orders)) * 100
        print(f"  • {method:<10} : {count} ({pct:.1f}%)")

    # Top Selling Dishes
    item_sales = defaultdict(lambda: {"qty": 0, "revenue": 0})
    for o in orders:
        for item in o.get("items", []):
            name = item.get("name", "Unknown")
            qty = item.get("qty", 1)
            price = item.get("price", 0)
            item_sales[name]["qty"] += qty
            item_sales[name]["revenue"] += price * qty

    sorted_items = sorted(item_sales.items(), key=lambda x: x[1]["qty"], reverse=True)

    print(f"\n--- Top 3 Bestselling Dishes ---")
    for rank, (name, data) in enumerate(sorted_items[:3], start=1):
        print(f"  {rank}. {name} — {data['qty']} units sold (₹{data['revenue']:,})")

    print("\n" + "=" * 60)
    print("  Analytics summary generated successfully.")
    print("=" * 60)

if __name__ == "__main__":
    run_analytics()
