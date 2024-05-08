# Daily Commit Reminder

Automatically send a user an email at 8pm if they haven't commit to GitHub yet today

## How can I set this up for me?

1. Create a Gmail app password using [this link](https://myaccount.google.com/apppasswords)
2. Fork this repository
3. Go into your fork's settings and add the following SECRETS
   - MAIL_USER = `you@example.com`
   - MAIL_PASSWORD = `paste your password from step 1 here`
   - FROM = `Email Reminder Bot <you@example.com>`
   - TO = `you@example.com`
   - USER = `your_github_username`
