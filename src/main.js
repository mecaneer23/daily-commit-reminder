const nodemailer = require("nodemailer");
require("dotenv").config();

function getRelativeTime(timestamp) {
    const DAY_MILLISECONDS = 1000 * 60 * 60 * 24;
    const rtf = new Intl.RelativeTimeFormat('en', {
        numeric: 'auto',
    });
    const daysDifference = Math.round(
        (timestamp - new Date().getTime()) / DAY_MILLISECONDS,
    );

    return rtf.format(daysDifference, 'day');
}

async function getMostRecentCommit(user) {
    const url = `https://api.github.com/users/${user}/events/public`;
    return fetch(url)
        .then(async response => {
            if (!response.ok) {
                return [{
                    commit: {
                        message: "Fetching commits failed",
                        author: {
                            date: new Date().toISOString(),
                        }
                    },
                    html_url: "https://mecaneer23.github.io/most-recent-git-commit",
                    sha: "Try again"
                }];
            }
            return response.json();
        })
        .then(data => {
            return data[0].created_at;
        })
        .catch(error => console.log('There was a problem with the fetch operation: ' + error.message));
}

(async () => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    });

    const commitTime = new Date(await getMostRecentCommit(process.env.GITHUB_USERNAME));
    console.log("commitTime: ");
    console.log(commitTime);
    console.log(commitTime.toString() + "\n");

    const today = new Date();
    console.log("now: ");
    console.log(today);
    console.log(today.toString() + "\n");

    today.setUTCHours(-18, 0, 0, 0);
    console.log("today: ")
    console.log(today);
    console.log(today.toString() + "\n");

    const relTime = getRelativeTime(commitTime);
    console.log("relativeTime: " + relTime + "\n");

    if (relTime == "today") {
        console.log("Nice job! You committed today.");
        return;
    }
    console.log("Sending email...");
    await transporter.sendMail({
        from: process.env.FROM,
        to: process.env.TO,
        subject: "Daily GitHub Commit Reminder",
        html: `
        <p>The last time you committed to GitHub was ${getRelativeTime(commitTime)}.</p>
        <p>You should make a commit :)</p>
    `,
    });
})();
