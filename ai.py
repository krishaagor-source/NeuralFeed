# from openai import OpenAI
# from config import OPENROUTER_API_KEY

# client = OpenAI(
#     api_key=OPENROUTER_API_KEY,
#     base_url="https://openrouter.ai/api/v1",
# )


# def generate_summary(text):
#     prompt = f"""
# Summarize the following news article in 2-3 sentences.

# {text}
# """

#     try:
#         response = client.chat.completions.create(
#             model="qwen/qwen3-235b-a22b:free",
#             messages=[
#                 {"role": "user", "content": prompt}
#             ],
#         )

#         return response.choices[0].message.content.strip()

#     except Exception as e:
#         print("Summary Error:", e)
#         return ""


# def classify_article(text):
#     prompt = f"""
# Classify this news article into ONLY ONE of these categories:

# AI
# Programming
# Cybersecurity
# Robotics
# Space
# Startups
# Business
# Apple
# Google
# Microsoft
# Science
# Other

# Return ONLY the category.

# Article:

# {text}
# """

#     try:
#         response = client.chat.completions.create(
#             model="meta-llama/llama-3.3-70b-instruct:free",
#             messages=[
#                 {"role": "user", "content": prompt}
#             ],
#         )

#         return response.choices[0].message.content.strip()

#     except Exception as e:
#         print("Category Error:", e)
#         return "Other"