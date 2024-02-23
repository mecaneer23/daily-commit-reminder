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

async function getMostRecentRepo(user) {
    const url = `https://api.github.com/users/${user}/repos?per_page=100`;
    return fetch(url)
        .then(async response => {
            data = await response.json();
            if (!response.ok || data.length === 0) {
                return [{ name: "repo_fetch_failed" }];
            }
            return data;
        })
        .then(data => {
            data.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
            return data[0].name;
        })
        .catch(error => console.log('There was a problem with the fetch operation: ' + error.message));
}

async function getMostRecentCommit(user) {
    const repo = await getMostRecentRepo(user)
    const url = `https://api.github.com/repos/${user}/${repo}/commits`;
    return fetch(url)
        .then(response => {
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
            return data[0].commit.author.date;
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

    const commitTime = new Date(await getMostRecentCommit("mecaneer23"));
    console.log("commitTime: ");
    console.log(commitTime);
    console.log(commitTime.toString() + "\n");

    const today = new Date();
    console.log("now: ");
    console.log(today);
    console.log(today.toString() + "\n");

    today.setHours(0, 0, 0, 0);
    console.log("today: ")
    console.log(today);
    console.log(today.toString() + "\n");

    console.log("relativeTime: " + getRelativeTime(commitTime));

    if (commitTime > today) {
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