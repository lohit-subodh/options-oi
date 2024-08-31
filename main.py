from nsepython import *
from datetime import datetime, time, date
import pytz
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import nest_asyncio
import uvicorn

LOT_DICT = {
    "NIFTY": 50,
    "BANKNIFTY": 15,
    "FINNIFTY": 40,
    "MIDCPNIFTY": 75
}

HOLIDAYS = [
    date(2024, 1, 22), date(2024, 1, 26), date(2024, 3, 8), date(2024, 3, 25),
    date(2024, 3, 29), date(2024, 4, 11), date(2024, 4, 17), date(2024, 5, 1),
    date(2024, 5, 20), date(2024, 6, 17), date(2024, 7, 17), date(2024, 8, 15),
    date(2024, 10, 2), date(2024, 11, 1), date(2024, 11, 15), date(2024, 12, 25)
]

def is_market_open():
    india_tz = pytz.timezone('Asia/Kolkata')
    current_datetime = datetime.now(india_tz)
    current_date = current_datetime.date()
    current_time = current_datetime.time()
    # Check if it's a weekend
    if current_datetime.weekday() >= 5:  # 5 is Saturday, 6 is Sunday
        return False

    # Check if it's a holiday
    if current_date in HOLIDAYS:
        return False

    # Check if it's within market hours
    market_open = time(9, 15)
    market_close = time(15, 30)
    return market_open <= current_time <= market_close

def find_closest_strike(strike_prices, underlying_value):
    # Implement the logic to find the closest strike price
    pass

def process_option_chain_data(symbol, selected_expiry_date=None):
    lot_size = LOT_DICT.get(symbol, 50)
    
    expiry_dates = expiry_list(symbol)
    selected_expiry_date = selected_expiry_date or expiry_dates[0]
    oi_data, ltp, crontime = oi_chain_builder(symbol, selected_expiry_date, "full")
    underlying_value = ltp
    
    lower_bound = underlying_value - 1500
    upper_bound = underlying_value + 1500
    
    strike_prices, ce_open_interests, pe_open_interests = [], [], []
    ce_open_interests_change, pe_open_interests_change = [], []

    for index, row in oi_data.iterrows():
        if lower_bound <= row['Strike Price'] <= upper_bound and row['Strike Price'] % 100 == 0:
            strike_prices.append(row['Strike Price'])
            ce_open_interests.append((row['CALLS_OI'] * lot_size) / 1e3)  # CALLS_OI for Call Open Interest
            pe_open_interests.append((row['PUTS_OI'] * lot_size) / 1e3)   # PUTS_OI for Put Open Interest
            ce_open_interests_change.append((row['CALLS_Chng in OI'] * lot_size) / 1e3)  # CALLS_CHANGE_OI for Call Open Interest
            pe_open_interests_change.append((row['PUTS_Chng in OI'] * lot_size) / 1e3)   # PUTS_CHANGE_OI for Put Open Interest

    closest_strike = find_closest_strike(strike_prices, underlying_value)
    return {
        'strike_prices': strike_prices,
        'ce_open_interests': ce_open_interests,
        'pe_open_interests': pe_open_interests,
        'expiry_dates': expiry_dates,
        'selected_expiry': selected_expiry_date,
        'ce_open_interests_change': ce_open_interests_change,
        'pe_open_interests_change': pe_open_interests_change,
        'closest_strike': closest_strike if closest_strike is not None else underlying_value,
        'underlying_value': underlying_value
    }

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/api/nifty-options/{symbol}')
def get_nifty_options(symbol: str):
    if symbol:
        processed_data = process_option_chain_data(symbol)
        return JSONResponse(content=processed_data)
    raise HTTPException(status_code=500, detail="Failed to retrieve data")

@app.get('/api/nifty-options/{symbol}/{expiry}')
def get_nifty_options_for_expiry(symbol: str, expiry: str):
    if symbol and expiry:
        processed_data = process_option_chain_data(symbol, expiry)
        return JSONResponse(content=processed_data)
    raise HTTPException(status_code=500, detail="Failed to retrieve data")

@app.get('/api/market-status')
def get_market_status():
    return {"is_open": is_market_open()}

@app.get("/")
def index():
    return "Hello this is the new version!"

if __name__ == "__main__":
    # Apply nest_asyncio
    nest_asyncio.apply()
    # Run the uvicorn server
    uvicorn.run(app, host="127.0.0.1", port=8000)