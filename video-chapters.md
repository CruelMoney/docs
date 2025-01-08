1. Introduction to Review Queues
   Overview of manual moderation vs. automated moderation
   Why a review queue? Advantages of an organized review process

---

2. Creating Your First Queue
   How to navigate to the “Create New Queue” interface
   Demonstrating date/time filtering and why it’s useful
   Choosing what content flows into the queue (filters on language, flags, etc.)
   Example: ecommerce analyzing reviews for products

---

3. Using multiple queues
   Selecting which projects the queue includes (and how to separate content types)
   Example: a queue for products and one for comments

---

4. Adding metadata to content
   Adding metadata to content to help with filtering
   Improves accuracy
   Adding url to thread
   Example: adding a product ID to a product and contextId, and authorId to a comment

---

5. Reviewing & Resolving Content
   Navigating the moderation dashboard: list view vs. detail view
   Marking items as “resolved” and tips for quickly clearing a backlog
   Correcting AI labels to improve future recommendations: brief overview of the feedback loop

---

6. Monitoring & Analytics
   Using queue charts to track progress over time
   Understanding resolved vs. unresolved stats and label distribution
   Example: pulling insights on recurring policy violations or repeat offenders

---

7. Creating Queue Actions
   What “actions” are and how moderators can use them (approve, reject, escalate, etc.)
   Highlighting custom actions (e.g., “Ban User,” “Send Warning,” “Move to Escalation Queue”)
   Setting up webhooks to trigger events (like “content removed” or “user banned”) in your own system
   Calling actions from your own code
   Example workflow: rejecting spam comments

---

8. Working with Moderators
   Adding moderators to the dashboard and assigning specific queues to each moderator
   Checking moderator stats
   Demo scenario: inviting and assigning moderators to a queue

---

9. Advanced Filtering & Label Management
   Filtering items by context ID or author ID to get conversation-level views
   Filtering items by label and score
   Balancing automation and manual reviews
   Hands-on example: focusing on “Toxic” or “Hate” labels to identify serious violations

---

10. Best Practices & Efficiency Tips
    Keyboard shortcuts and bulk moderation for faster workflows
    Handling large volumes of content and delegating tasks to moderators
    Data privacy considerations (e.g., doNotStore for certain content)

---

11. Wrap-Up & Next Steps
    Practical advice for scaling moderation and refining your models
    Resources, Q&A, and support options

---

9. Real-Life Scenarios & Tutorials
   -- Best practices for handling user accounts within review queues

   Scenario 1: A user-flagging system where community members report problematic content
   Detailed steps for creating a “Flagged Content” action
   Auto-moving flagged items into a specialized queue
   Scenario 2: Escalation flow for sensitive content
   Showing how to set up a queue for senior moderators
   Demonstrating “Escalate” actions and partial resolution

---

Additional Notes
• Each video can include both a “walkthrough” portion (live demo) and a “conceptual” portion (explanations, diagrams).
• Real examples—like stopping user spammers or reviewing toxic comments—give moderators a sense of how to apply these features in practice.
• If you want to dig deeper into solutions for specific platforms, consider bonus chapters dedicated to integrations (e.g., WordPress, Slack, custom webhooks).
This outline strikes a balance between high-level overviews and concrete scenarios, ensuring moderators learn not just the “what,” but also the “why” and “how” for each step.

## Other Scenarios

### Real-world example: setting up a queue for “product reviews” in an e-commerce store

### Multi-Lingual Moderation Scenario

Context: A global marketplace or social platform where users post in many languages.
Discussion: Demonstrate how language detection can route items to specialized queues (e.g., Spanish vs. English).
Highlights:
• Setting up queue filters by language labels.
• Handling cultural nuances and variations (e.g., slang or region-specific terms).
• Checking for correct labeling when the same words appear in multiple languages.

---

### E-Commerce Customer Reviews

Context: Online marketplaces, retail sites, or product review platforms.
Challenges:
Fake or incentivized reviews distorting product ratings.
Potentially offensive or misleading content in user comments.
Review Queue Approach:
Create a “Suspicious Reviews” queue that flags unusual language patterns or spam behavior.
Set up automated labeling for potential policy violations (scams, prohibited items).
Use bulk actions to quickly approve or remove flagged reviews, protecting the site’s reputation.
Practical Example:
A high-volume product listing receives numerous short, repetitive 5-star reviews.
AI flags them for suspicion; moderators confirm whether they’re spam or legitimate.

---

### Healthcare & Medical Forums

Context: Telehealth platforms, mental health support groups, or patient discussion boards.
Challenges:
Medical misinformation and dangerous self-treatment recommendations.
Confidential or patient-identifiable information being shared publicly.
Review Queue Approach:
Use a “Sensitive Info” label that looks for (accidental) patient info leaks, personal data, or mention of prescriptions.
Implement tools to detect harmful suggestions (e.g., self-harm, anti-vaccine misinformation).
Route critical cases to qualified medical professionals or mental health moderators.
Practical Example:
A user shares their private medical records or test results in a forum post.
The queue for “Potential Privacy Violation” catches it; moderator decides to redact or remove violating info.

---

### Finance & Investment Communities

Context: Stock trading forums, cryptocurrency boards, or investment advice apps.
Challenges:
Unverified financial tips, pump-and-dump schemes, marketing spam.
Fraudulent claims about guaranteed returns or hidden fees.
Review Queue Approach:
A queue set to flag suspicious financial advisory content, using keywords like “guaranteed profit,” “unbeatable returns,” or referral link spam.
Escalation for compliance/legal teams if certain regulatory triggers appear (e.g. SEC disclaimers).
Practical Example:
A new account rapidly posts links promising “get-rich-quick” crypto schemes.
Moderation automatically flags them for potential scam; a queue action removes posts and bans user.

---

### Dating & Relationship Apps

Context: Online dating platforms, matchmaking sites, or advice forums for relationships.
Challenges:
Harassment, explicit images, or unsolicited content.
Catfishing attempts—fake profiles with stolen photos.
Review Queue Approach:
Image moderation to detect explicit images or nudity.
A custom action for “Verify Profile” to request additional info or ID from suspicious accounts.
Escalation queue for dealing with repeated harassment or stalking reports.
Practical Example:
Newly registered users upload potentially explicit profile pictures.
AI flags them for a manual moderator review; if confirmed, the photos or entire profile gets taken down.

---
