from playwright.sync_api import sync_playwright
import pandas as pd

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = browser.new_context(
            viewport={"width": 1366, "height": 768},
            user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/114.0.5735.133 Safari/537.36"),
        )
        page = context.new_page()

        checkin_date = '2025-06-23'
        checkout_date = '2025-06-28'
        
        page_url = (
            f'https://www.booking.com/searchresults.en-us.html?'
            f'checkin={checkin_date}&checkout={checkout_date}&selected_currency=USD'
            f'&ss=Paris&ssne=Paris&ssne_untouched=Paris&lang=en-us'
            f'&sb=1&src_elem=sb&src=searchresults&dest_type=city'
            f'&group_adults=1&no_rooms=1&group_children=0&sb_travel_purpose=leisure'
        )
        
        page.goto(page_url, timeout=60000, wait_until="networkidle")

        # Possibly scroll to load more results
        page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
        page.wait_for_timeout(3000)

        # Wait for property cards to appear
        page.wait_for_selector('//div[@data-testid="property-card"]', timeout=30000)

        hotels = page.locator('//div[@data-testid="property-card"]').all()
        print(f'There are: {len(hotels)} hotels.')

        hotels_list = []
        for hotel in hotels:
            hotel_dict = {}

            # Title / Name
            title_locator = hotel.locator('//div[@data-testid="title"]')
            hotel_dict['hotel'] = (
                title_locator.inner_text() if title_locator.count() else "N/A"
            )

            # Price
            price_locator = hotel.locator('//span[@data-testid="price-and-discounted-price"]')
            hotel_dict['price'] = price_locator.inner_text() if price_locator.count() else "N/A"

            # Score
            score_locator = hotel.locator('//div[@data-testid="review-score"]/div[1]')
            hotel_dict['score'] = score_locator.inner_text() if score_locator.count() else "N/A"

            # Avg Review
            avg_review_locator = hotel.locator('//div[@data-testid="review-score"]/div[2]/div[1]')
            hotel_dict['avg review'] = (
                avg_review_locator.inner_text() if avg_review_locator.count() else "N/A"
            )

            # Reviews Count
            reviews_count_locator = hotel.locator('//div[@data-testid="review-score"]/div[2]/div[2]')
            if reviews_count_locator.count():
                txt = reviews_count_locator.inner_text()
                hotel_dict['reviews count'] = txt.split()[0]
            else:
                hotel_dict['reviews count'] = "N/A"

            link_element = hotel.locator('a[data-testid="title-link"]')
            if link_element.count() > 0:
                hotel_dict['link'] = link_element.get_attribute('href')
            else:
                hotel_dict['link'] = "N/A"

            hotels_list.append(hotel_dict)

        df = pd.DataFrame(hotels_list)
        df.to_excel('hotels_list.xlsx', index=False) 
        df.to_csv('hotels_list.csv', index=False) 

        browser.close()

if __name__ == '__main__':
    main()