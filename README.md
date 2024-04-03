https://github.com/StanfordCS194/spr23-Team23/wiki


<b> Instructions: </b>

1. Setup and run the frontend app

Open a new command line window and go to the project's directory `/focus`

`npm install`

`npm run start`

1. Setup the backend app

In another window, under the project's directory `/focus`

`python -m venv focus-venv`

Make sure the virtualenv is activated `source focus-venv/bin/activate`

Run `make compile_install_requirements` to install the requirements


3. Run the backend app

With the virtualenv enabled, go to the backend directory

Create the migrations for users app: `python manage.py makemigrations`

Run the migrations: `python manage.py migrate`

Run the project: `python manage.py runserver`

Open a browser and go to `http://localhost:8000` to see the project running

**Installation Errors:**

If you encounter a node-sass error while running "npm install", try:

**Make sure you have Node version 16.13.2**

`npm i sass-loader@10.2.0`

`npm install node-sass@6.0.1`

`npm install`

If you haven't install postgresql, run this:

`brew install postgresql`


If you have error while running `python manage.py makemigration`. Try:

`sudo python manage.py makemigration`

`sudo python manage.py migrate`


<b> Notes for developers: </b>

Calendar JS library we are using is https://www.npmjs.com/package/@toast-ui/react-calendar
Documentation found here: https://github.com/nhn/tui.calendar/blob/main/docs/en/guide/getting-started.md


