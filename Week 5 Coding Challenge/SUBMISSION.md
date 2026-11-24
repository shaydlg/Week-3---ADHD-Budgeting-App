# Week 5 Coding Challenge — Submission

## Links
1. **GitHub repository:** https://github.com/shaydlg/Week-3---ADHD-Budgeting-App
2. **Hosted Vercel app:** https://week-3-adhd-budgeting-app-nine.vercel.app
3. **Database diagram:** https://github.com/shaydlg/Week-3---ADHD-Budgeting-App/blob/main/docs/database-diagram.md

## Documents
1. **Notion — Test Case Scenarios Being Tested:** https://app.notion.com/p/Test-Case-Scenarios-Being-Tested-41b4c61688a280a1bfa8ca1886a410ec?source=copy_link
2. Other documents (in this repo):
   - Manual test cases + results: https://github.com/shaydlg/Week-3---ADHD-Budgeting-App/blob/main/Week%205%20Coding%20Challenge/manual-test-cases.md
   - QA findings report: https://github.com/shaydlg/Week-3---ADHD-Budgeting-App/blob/main/Week%205%20Coding%20Challenge/qa-findings.md
   - ADR-0011 (testing & CI pipeline decision): https://github.com/shaydlg/Week-3---ADHD-Budgeting-App/blob/main/docs/adr/0011-testing-and-ci-pipeline.md

## What I did
The goal was to catch any bugs, regressions, and standard violations on every push before they reach users. I opened a new chat in Claude and dogfed it the project docs that live in the designated folder locally, as well as all of the week 5 information necessary to complete this week's work. I also asked Claude to explain everything in plain English and beginner's terms and break down each step as it went through the process.

We conducted 14 unit tests, a Playwright browser smoke test, a Week 1 skills gate check, a coverage gate, and a GitHub Actions pipeline including lint, type-check, tests+coverage, build, and skills. During these tests, a few bugs were brought to the surface. One was adding a bill as a credit card. We created rules to ensure that a credit card's balance is never counted as spendable money, and a card payment only counts once it's added as a bill by the user. We realized credit card bills weren't being included in the bills section, and therefore were not being deducted from the safe-to-spend total. After sifting through how to make this a feasible part of the safe-to-spend total, we decided that this feature needs to get built and applied to the bills section. It is lined up on the backlog. During a PR flow, the CI also caught a bug that had been hiding on my computer. We diagnosed it, fixed it properly and wrote the type ourselves (`{ children: ReactNode }`) so it no longer depends on that build-generated label, and only merged it once it was green.

From there we tested the safety net by deliberately breaking the math. We flipped the math for safe to spend from subtraction to addition, which would tell the users they have more money than they really do by counting bills as money they have instead of money that's leaving. It was pushed to GitHub, the pipeline caught it with 4 unit tests turning red. We undid it, reversed the change back to subtraction, pushed again, and it went green.

Afterward, I manually tested by following use case scenarios & BDDs. Adding a bill & marking a bill as paid were tested. Both worked ultimately, but surfaced some deeper issues:

1. Loading spinners needed to be added to buttons as there was no feedback after clicking on "add a bill" and the update wasn't instantaneous. It felt like there was a glitch instead.
2. Savings shouldn't be counted as spendable as it was initially set up to be (without me realizing). Savings aren't meant to be a part of your safe day-to-day spending money. After calling this out, Claude went on to ask me about money markets and similar financial accounts that could be linked, which was great to bring up. I had Claude adjust the project to ensure that only money from the user's checking account will be a part of this feature.
3. The autofill field when logging in looked broken after picking the browser's suggested email. It became gray and looked disabled, leading to confusing/mixed messaging. A quick styling fix was added.
4. After marking a bill paid, there was supposed to be an undo function that appeared, but that was revealed as missing and added to the backlog to be built.
5. The biggest one was the safe-to-spend number. After marking a bill paid, the safe-to-spend rose by that bill payment amount, instead of remaining untouched. It was telling the user they had more money than they actually do. This was immediately adjusted and reworked in the vision/scope doc.

* There was one bonus finding of being logged out with no error message repeatedly, but it turned out to be a quirk of the testing browser being used within the Claude app. Once I opened up my own browser, the bug was gone.

## What I learned
In general, I went into this week being already a week behind with my other homework and very busy with other work, so I must admit I was relying on Claude to do too much thinking for me. I did have it break things down for me, but I think I was digesting it too quickly. I was able to think the most clearly as I was handling the manual tests myself, which is a pretty obvious statement haha but it made me truly understand why it's important to actively take part in this testing. Sitting back and letting Claude sift through all the tests without ever stepping in to try some on my own is exactly what we agreed we wouldn't do in week 1 - Don't let AI take over your brain. In addition, at the very end, as I was going through my submission checklist, I came across the guided CI/CD pipeline steps and how to cowork with Claude. I had fed this to Claude earlier, but hadn't read through it until the end. So I fed each step to Claude and we walked through whether or not each has actually been accomplished. I realized one big one hadn't been: the BDD scenarios. Claude used my use cases that I fed it from week 2, but we never sat down and figured out how to add the BDD. So that, unfortunately, wasn't added til the end, but realizing that I had missed such a crucial part of the assignment taught me to not brainlessly feed Claude the material and try to understand it a bit first. It's way too easy to get caught in the trap of being overwhelmed and allowing AI to take the reigns as you standby passively. MUST BE STRONGGGG.

As for the tests, these were incredibly helpful in revealing some important issues that had not been thought through thoroughly enough with the initial MVP setup. Part of me feels like I could fall into a rabbit hole of testing to make sure all the holes have been filled. I also hadn't really understood before this how things can work nicely locally, but could work completely differently on a different (clean) machine. I also learned the importance of breaking the safety net & rebuilding it in order to trust it. And, crucially, automated tests only catch what you've told them, but you most likely haven't thought through everything, which is why those manual tests are so important.

I also think that having multiple roles be a part of testing is important. For example, having not just QA people test, but also engineers and designers. As a designer, I have an eye for small details that may go unnoticed for others, as well as the overall feel and emotion that's trying to be conveyed. Each specific role has a strong eye for specific things that they've been trained to notice, and each is very beneficial to get feedback from.
