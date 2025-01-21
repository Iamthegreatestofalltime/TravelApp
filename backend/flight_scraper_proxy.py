import asyncio
import csv
import os
import base64
from dotenv import load_dotenv
from playwright.async_api import async_playwright
from typing import List, Dict, Optional
import pandas as pd

# Load environment variables from .env file
load_dotenv()

class FlightURLBuilder:
    """Class to handle flight URL creation with base64 encoding."""
    
    @staticmethod
    def _create_one_way_bytes(departure: str, destination: str, date: str) -> bytes:
        """Create bytes for one-way flight."""
        return (
            b'\x08\x1c\x10\x02\x1a\x1e\x12\n' + date.encode() +
            b'j\x07\x08\x01\x12\x03' + departure.encode() +
            b'r\x07\x08\x01\x12\x03' + destination.encode() +
            b'@\x01H\x01p\x01\x82\x01\x0b\x08\xfc\x06`\x04\x08'
        )
    
    @staticmethod
    def _modify_base64(encoded_str: str) -> str:
        """Add underscores at the specific position in base64 string."""
        insert_index = len(encoded_str) - 6
        return encoded_str[:insert_index] + '_' * 7 + encoded_str[insert_index:]

    @classmethod
    def build_url(
        cls,
        departure: str,
        destination: str,
        departure_date: str
    ) -> str:
        
        flight_bytes = cls._create_one_way_bytes(departure, destination, departure_date)
        base64_str = base64.b64encode(flight_bytes).decode('utf-8')
        modified_str = cls._modify_base64(base64_str)
        return f'https://www.google.com/travel/flights/search?tfs={modified_str}'

class ProxyConfig:
    """Class to handle proxy configuration from a file."""
    
    def __init__(self, proxies_file: str = 'proxies.txt'):
        self.proxies_file = proxies_file
        self.proxies = self._load_proxies()

    def _load_proxies(self) -> List[str]:
        """Load proxy list from a file."""
        if not os.path.exists(self.proxies_file):
            raise FileNotFoundError(f"{self.proxies_file} not found.")
        
        with open(self.proxies_file, 'r') as file:
            proxies = file.read().splitlines()
        
        return proxies

    def get_next_proxy(self) -> Optional[Dict]:
        """Get the next proxy from the list."""
        if not self.proxies:
            return None
        proxy = self.proxies.pop(0)
        if '@' in proxy:  # Format with authentication
            proxy_url = proxy.split('://')[1]
            username, rest = proxy_url.split(':', 1)
            password, server = rest.split('@')
            return {"server": f"http://{server}", "username": username, "password": password}
        else:  # Format without authentication
            return {"server": f"http://{proxy}"}
    
    def has_proxies_left(self) -> bool:
        """Check if there are more proxies to try."""
        return bool(self.proxies)

async def setup_browser(proxy_settings: Optional[Dict] = None):
    """Initialize and return browser and page objects with proxy settings."""
    p = await async_playwright().start()
    
    browser_settings = {
        "headless": False
    }
    
    if proxy_settings:
        browser_settings["proxy"] = proxy_settings
    
    browser = await p.chromium.launch(**browser_settings)
    page = await browser.new_page()
    
    return p, browser, page


async def extract_flight_element_text(flight, selector: str, aria_label: Optional[str] = None) -> str:
    """Extract text from a flight element using selector and optional aria-label."""
    if aria_label:
        element = await flight.query_selector(f'{selector}[aria-label*="{aria_label}"]')
    else:
        element = await flight.query_selector(selector)
    return await element.inner_text() if element else "N/A"

async def scrape_flight_info(flight, page) -> Dict[str, str]:
    """Extract all relevant information from a single flight element."""
    departure_time = await extract_flight_element_text(flight, 'span', "Departure time")
    arrival_time = await extract_flight_element_text(flight, 'span', "Arrival time")
    airline = await extract_flight_element_text(flight, ".sSHqwe")
    duration = await extract_flight_element_text(flight, "div.gvkrdb")
    stops = await extract_flight_element_text(flight, "div.EfT7Ae span.ogfYpf")
    price = await extract_flight_element_text(flight, "div.FpEdX span")
    co2_emissions = await extract_flight_element_text(flight, "div.O7CXue")
    emissions_variation = await extract_flight_element_text(flight, "div.N6PNV")

    # Click on the flight element to reveal more details (e.g., booking link)
    await flight.click()  # This simulates the click to reveal the booking link
    
    # Wait for the booking link to appear (update with the correct selector)
    await page.wait_for_selector("#yDmH0d > c-wiz.zQTmif.SSPGKf > div > div:nth-child(2) > c-wiz > div.cKvRXe > c-wiz > div.PSZ8D.EA71Tc > div.FXkZv > div.XwbuFf > div > div:nth-child(2) > div:nth-child(4) > ul > li:nth-child(1) > div")
    
    # Extract the booking link from the page (adjust the selector if necessary)
    booking_link_element = await page.query_selector("#yDmH0d > c-wiz.zQTmif.SSPGKf > div > div:nth-child(2) > c-wiz > div.cKvRXe > c-wiz > div.PSZ8D.EA71Tc > div.FXkZv > div.XwbuFf > div > div:nth-child(2) > div:nth-child(4) > ul > li:nth-child(1) > div")
    
    # Extract the href (booking URL) from the element
    booking_link = await booking_link_element.get_attribute("href") if booking_link_element else "N/A"

    return {
        "Departure Time": departure_time,
        "Arrival Time": arrival_time,
        "Airline Company": airline,
        "Flight Duration": duration,
        "Stops": stops,
        "Price": price,
        "co2 emissions": co2_emissions,
        "emissions variation": emissions_variation,
        "Booking Link": booking_link  # Include the booking link in the data
    }


def clean_csv(filename: str):
    """Clean unwanted characters from the saved CSV file."""
    data = pd.read_csv(filename, encoding="utf-8")
    
    def clean_text(value):
        if isinstance(value, str):
            return value.replace('Â', '').replace(' ', ' ').replace('Ã', '').replace('¶', '').strip()
        return value

    cleaned_data = data.applymap(clean_text)
    cleaned_file_path = f"{filename}"
    cleaned_data.to_csv(cleaned_file_path, index=False)
    print(f"Cleaned CSV saved to: {cleaned_file_path}")

def save_to_csv(data: List[Dict[str, str]], filename: str = "flight_data_proxy.csv") -> None:
    """Save flight data to a CSV file."""
    if not data:
        return
    
    headers = list(data[0].keys())
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)
    
    # Clean the saved CSV
    clean_csv(filename)

async def scrape_flight_data(one_way_url):
    flight_data = []
    proxy_config = ProxyConfig('proxies.txt')  # Load proxies from proxies.txt

    while proxy_config.has_proxies_left():
        proxy_settings = proxy_config.get_next_proxy()
        print(f"Trying proxy: {proxy_settings['server']}")
        
        # Setup browser and page with current proxy
        playwright, browser, page = await setup_browser(proxy_settings)
        
        try:
            await page.goto(one_way_url)
            # Wait for flight data to load
            await page.wait_for_selector(".pIav2d")
            
            # Get all flights and extract their information
            flights = await page.query_selector_all(".pIav2d")
            for flight in flights:
                flight_info = await scrape_flight_info(flight, page)
                flight_data.append(flight_info)
            
            # Save the extracted data in CSV format
            save_to_csv(flight_data)
            break  # If successful, break out of the loop

        except Exception as e:
            print(f"Error with proxy {proxy_settings['server']}: {e}")
        finally:
            await browser.close()
            await playwright.stop()

if __name__ == "__main__":
    one_way_url = FlightURLBuilder.build_url(
        departure="SFO",
        destination="LAX",
        departure_date="2025-06-25"
    )
    print("One-way URL:", one_way_url)

    # Run the scraper
    asyncio.run(scrape_flight_data(one_way_url))