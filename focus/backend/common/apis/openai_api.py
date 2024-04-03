import os
import openai
openai.api_key = os.getenv("OPENAI_API_KEY")

# query = "It's almost 11pm now, and I go to sleep at 2am. \
#     There are things on my to-do list: \
#     create t-shirt design that takes about 20 minutes, \
#     work on a project for an hour,\
#     draw for an hour, \
#     cook for 20 minutes, \
#     Can you estimate my energy level after doing each task, and help me create a schedule that maintains my energy level high most of the time?\
#     Can you also provide some helpful tips for each of my todo items?"

def get_chatgpt_response(query):
    completion = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "assistant", "content": query}
    ]
    )
    print(completion.choices[0].message.content)
    return completion.choices[0].message.content
