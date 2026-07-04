from config import FEEDS
from database import (
    setup_database,
    get_all_articles,
    search_articles,
    )
from collector import fetch_and_save

setup_database()    

for source, url in FEEDS.items():
    fetch_and_save(url, source)

choice = input("\nDo you want to search for articles by keyword? (yes/no): ").lower()
if choice == 'yes':
    keyword = input("Enter the keyword to search for: ")
    articles = search_articles(keyword)
else:
    articles = get_all_articles()

print("\nAll Articles\n")

for title, author, published_date, source in articles:

    print(f"Title: {title}")
    print(f"Author: {author}")
    print(f"Published: {published_date}")
    print(f"Source: {source}")
    print("-" * 40)