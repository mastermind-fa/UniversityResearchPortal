#!/usr/bin/env python3
"""
Simple test script to verify analytics endpoint
"""

import requests
import json

def test_analytics_endpoint():
    """Test the analytics dashboard endpoint"""
    try:
        # Test the analytics dashboard endpoint
        response = requests.get('http://localhost:8000/api/analytics/dashboard')
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Analytics Dashboard Endpoint Working!")
            print(f"📊 Faculty Count: {data.get('faculty_count', 'N/A')}")
            print(f"📊 Active Projects: {data.get('active_projects', 'N/A')}")
            print(f"📊 Total Publications: {data.get('total_publications', 'N/A')}")
            print(f"💰 Total Budget: ${data.get('total_budget', 0):,.2f}")
            print(f"💰 Project Budget: ${data.get('total_project_budget', 0):,.2f}")
            print(f"💰 Funding Sources: ${data.get('total_funding', 0):,.2f}")
            print("\n📋 Full Response:")
            print(json.dumps(data, indent=2))
        else:
            print(f"❌ Analytics endpoint failed with status {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error testing analytics endpoint: {e}")

def test_funding_summary():
    """Test the funding summary endpoint"""
    try:
        response = requests.get('http://localhost:8000/api/funding-sources/summary')
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Funding Summary Endpoint Working!")
            print(f"💰 Total Funding: ${data.get('total_funding', 0):,.2f}")
            print(f"📊 Funding by Type: {data.get('funding_by_type', {})}")
            print(f"📅 Funding by Year: {data.get('funding_by_year', {})}")
        else:
            print(f"❌ Funding summary endpoint failed with status {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error testing funding summary endpoint: {e}")

if __name__ == "__main__":
    print("🧪 Testing Analytics Endpoints...")
    print("=" * 50)
    
    test_analytics_endpoint()
    test_funding_summary()
    
    print("\n" + "=" * 50)
    print("🏁 Testing Complete!")
