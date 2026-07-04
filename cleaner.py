from bs4 import BeautifulSoup


def clean_text(text):
    """
    Removes HTML tags from text.
    """

    soup = BeautifulSoup(text, "html.parser")
    return soup.get_text(" ", strip=True)