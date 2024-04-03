from __future__ import print_function

import datetime
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']


def get_calendar_items(next_k):
    """Shows basic usage of the Google Calendar API.
    Prints the start and name of the next 10 events on the user's calendar.
    """
    print("get_calendar_items", next_k)
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        print("get_calendar_items here 0", next_k)
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.

    if not creds or not creds.valid:
        try:
            if creds and creds.expired and creds.refresh_token:
                print("get_calendar_items here 1", next_k)
                creds.refresh(Request())
                print("get_calendar_items here 1 -", next_k)
            else:
                print("get_calendar_items here 2", next_k)
                flow = InstalledAppFlow.from_client_secrets_file(
                    'common/apis/credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
        except Exception as e:
            print("error", e)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        print("get_calendar_items here 3", next_k)
        service = build('calendar', 'v3', credentials=creds)

        # Call the Calendar API
        now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
        print('Getting the upcoming 10 events')
        events_result = service.events().list(calendarId='primary', timeMin=now,
                                              maxResults=next_k, singleEvents=True,
                                              orderBy='startTime').execute()
        events = events_result.get('items', [])

        if not events:
            print('No upcoming events found.')
            return

        # Prints the start and name of the next 10 events
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['start'].get('date'))
            print(start, end, event['summary'])
        return events

    except HttpError as error:
        print('An error occurred: %s' % error)

