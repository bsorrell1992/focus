from django.views import generic
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .apis.google_calendar_api import get_calendar_items
from google_auth_oauthlib.flow import InstalledAppFlow
import openai
import os
import json
import requests
import datetime
from googleapiclient.discovery import build
from google.oauth2 import service_account
from google.oauth2.service_account import Credentials
from google.auth.transport.requests import Request
from dotenv import load_dotenv
from pathlib import Path

dotenv_path = Path('../.env')
print("dotenv_path", dotenv_path)
load_dotenv(dotenv_path=dotenv_path)

openai.api_key = os.getenv("OPENAI_API_KEY")
print("openai.api_key", openai.api_key)



SCOPES = ['https://www.googleapis.com/auth/calendar']
credentials = Credentials.from_service_account_file('common/focus-credentials.json',scopes = SCOPES)

print("credentials", credentials)

# List N Upcoming Events
def list_n_upcoming_events(k):
    gapi = build('calendar', 'v3', credentials=credentials)
    now = datetime.datetime.utcnow().isoformat() + 'Z' # 'Z' indicates UTC time
    events_result = gapi.events().list(calendarId='primary', timeMin=now,
                                       maxResults=k, singleEvents=True,
                                       orderBy='startTime').execute()
    events = events_result.get('items', [])

    if events:
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            print(f"{event['summary']} ({start})")
    else:
        print('No upcoming events found.')

    return events

# Change UX Upon Sign-In
def update_sign_in_status(is_signed_in):
    if is_signed_in:
        # Handle signed-in state
        return list_n_upcoming_events(10)
    else:
        # Handle signed-out state
        return None


class IndexView(generic.TemplateView):
    template_name = "common/index.html"

class LoginViewSet(viewsets.ViewSet):
    @action(
        detail=False,
        methods=["get"],
        permission_classes=[AllowAny],
        url_path="login",
    )
    def login(self, request):

        gapi = build('calendar', 'v3', credentials=credentials)
        print("gapi", gapi)
        events = update_sign_in_status(gapi)
        return Response(
            {"result": events},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[AllowAny],
        url_path="logout",
    )
    def logout(self, request):
        print("logout")
        return Response(
            {},
            status=status.HTTP_200_OK,
        )
class CalendarViewSet(viewsets.ViewSet):
    @action(
        detail=False,
        methods=["get"],
        permission_classes=[AllowAny],
        url_path="get-events",
    )
    def get_events(self, request):
        events = []
        try:
            events = get_calendar_items(20)
        except:
            print("Make sure you have the proper google calendar authentication")
        return Response(
            {"result": events},
            status=status.HTTP_200_OK,
        )
class ScheduleViewSet(viewsets.ViewSet):
    @action(

        detail=False,
        methods=["get"],
        permission_classes=[AllowAny],
        url_path="compute-schedule",
    )

    def compute_schedule(self, request):
        newSchedule = []

        calendar_items = request.GET.getlist("events[]")
        todos = request.GET.getlist("todos[]")
        calendar_items = [json.loads(event) for event in calendar_items]
        todos = [json.loads(todo) for todo in todos]
        current_datetime = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
        prompt = "Given the following schedule: \n"
        for event in calendar_items:
            if event["type"] != "todo":
                start = event['start']['d']['d']
                start_date = start[0:10]
                start_time = start[11:16]

                end = event['end']['d']['d']
                end_date = end[0:10]
                end_time = end[11:16]

                prompt += "'" + event["title"] + "'" + " "
                if (start_date == end_date):
                    prompt += "on " + start_date + " from " + start_time + " " + end_time + ";" + "\n"
                else:
                    prompt += "from " + start_date + " at " + start_time + " until " + end_date + " at " + end_time + ";" + "\n"

        prompt += "\n And Given these todo items: \n"
        for event in todos:
            due = event["due"]
            prompt += "'" + event["title"] + "' "
            if due != "null":
                due_date = due[0:10]
                due_time = due[11:16]
                prompt += "due before " + due_date + ", " + due_time + "\n"
            else:
                prompt += '\n'
        prompt += "Please plan the todo items (including repeated todo items) according to the schedule. "
        prompt += "It is currently " + current_datetime +". Please only schedule todo items for from now onward and no more than a week in the future. Make sure that the end time of a task is before the due date and due time if stated. Try to plan todos for reasonable hours between 9 am to 12 pm"
        example_p = "The following is an example input and output: \n"
        example_p += "input:\nGiven the following schedule:\n'Running with friends'; 2023-05-15; 10:00 to 12:00,\n"
        example_p += "'Walking the dog'; 2023-05-15; 13:00 to 14:00;,\n'Eating with mom'; 2023-05-16; 12:00 to 13:00;\
                        ,\n'going to work'; 2023-05-17; 09:00 to 17:00;,\n"
        example_p += "'going to work'; 2023-05-18; 9:00 to 17:00;,\n'Exercise'; 2023-05-18; 17:00 to 18:00;,\n'Boot camp'; 2023-05-18 18:00 to 2023-05-19 18:00;,\n"
        example_p += "Given the following todo items:\n'Laundry' due before 2023-05-16, 12:00,\n'Dusting' due before 2023-05-15, 24:00,\n'Washing dishes' due before 2023-05-17, 20:00,\n'Throw trash' due before 2023-05-15, 24:00,\n"
        example_p += "'practicing the cello' due before 2023-05-16, 18:00,\n'Laundry' due before 2023-06-16, 15:00,\n'wrapping gifts' due before 2023-05-21, 01:00,\n'prepare meal' due before 2023-05-20, 16:00,\n'practicing cello' due before 2023-05-22, 12:00,\n"
        example_p += "Please plan the todo items (including repeated todo items) according to the schedule. It is currently 2023-05-15 00:00. Please only schedule todo items for from now onward and no more than a week in the future. Make sure that the end time of a task is before the due date and due time if stated. Try to plan todos for reasonable hours between 9 am to 12 pm"
        example_r = ""
        example_r += "'Laundry'; 2023-05-15; 09:00 to 10:00;,\n'Dusting'; 2023-05-15; 18:00 to 19:00;,\n'Washing dishes', 2023-05-17; 18:00 pm to 18:30;,\n"
        example_r += "'Throw trash'; 2023-05-15; 19:00 to 19:30;,\n'practicing the cello'; 2023-05-16; 14:00 to 16:00;,\n'Laundry; 2023-05-16; 10:00 to 11:00;,\n'wrapping gifts'; 2023-05-20; 13:00 to 14:00;,\n"
        example_r += "'prepare meal'; 2023-05-20; 15:00 to 15:30;,\n'practicing cello'; 2023-05-21; 12:00 to 13:00;"

        prompt += "Assign all “todo items without a given time” a date and time and add into the schedule above without any conflicts for the week in the format: 'Event name'; date; time;. Make sure that the todos are given realistic time frames to complete depending on todo item. Make sure that there aren't too many events on one day. Restrict the output just the todo items. Do not provide any other feedback."
        completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a calendar assistant that will take events planned at a certain date and time as well as events that have not been planned yet, and create a balanced schedule by giving new times to the not planned events."},
            {"role": "system", "name": "example_user", "content": example_p},
            {"role": "system", "name": "example_assistant", "content": example_r},
            {"role": "user", "content": prompt}
            ]

        )

        print("prompt", prompt)

        output = completion.choices[0].message.content

        response = openai.Completion.create(
        model="text-davinci-003",
        prompt="A table that categorizes each event and its corresponding day and time from the text as follows: " + output + '"' + "in the following format for each event: '|Event|Day|Starttime to Endtime|\n'. Some examples are '|going to the mall|2023-05-17|11:00 to 13:00|\n', '|Finding a job|2023-05-27|09:00 to 12:00|\n', '|Bake sale|2021-12-13|07:00 to 11:00|\n', '|Playing with friends|2022-12-09|11:15 to 15:00|\n', and '|Going to the gym|2023-04-12|06:30 to 08:30|\n'" ,
        temperature=0,
        max_tokens=100,
        top_p=1.0,
        frequency_penalty=0.0,
        presence_penalty=0.0
        )
        output2 = response.choices[0].text.strip()
        tokens = output2.split('\n')
        for item in tokens:
            event_info = item.split('|')
            times = event_info[3].split(' ')
            starttime = times[0]
            endtime = times[2]
            if len(starttime) < 3:
                starttime = starttime + ":00"
            if len(starttime) < 5:
                starttime = "0" + starttime
            if len(endtime) < 3:
                endtime = endtime + ":00"
            if len(endtime) < 5:
                endtime = "0" + endtime
            event = {"title": event_info[1], "starttime": event_info[2] + "T" + starttime + ":00.000Z", "endtime":event_info[2] + "T" + endtime + ":00.000Z"}

            newSchedule.append(event)




        return Response(
            {"result": newSchedule},
            status=status.HTTP_200_OK,
        )

    def generate_tips(self, request):
        todo = request.GET.getlist("todos[]")
        title = todo['title']
        example_p1 = "Walking my dog"
        example_r1 = "Use this time to get some exercise\nMake sure to bring treats\nGive your dog proper food\nTry to keep your dog away from dirt"
        example_p2 = "Go shopping"
        example_r2 = "Bring reusable bags\nCreate a shopping list\nWhat stores do you need to go to\nBring coupons"
        completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an assistant that will give useful tips depending on the provided task. Only list 4 tips max. Only list the tips and do not provide any other information."},
            {"role": "system", "name": "example_user", "content": example_p1},
            {"role": "system", "name": "example_assistant", "content": example_r1},
             {"role": "system", "name": "example_user", "content": example_p2},
            {"role": "system", "name": "example_assistant", "content": example_r2},
            {"role": "user", "content": title}
            ]
        )

        output = completion.choices[0].message.content
        tips = output.split('\n')
        return Response(
            {"result": tips},
            status=status.HTTP_200_OK,
        )

