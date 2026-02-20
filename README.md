# Getting Started
!!! PLEASE NOTE !!!
DO NOT UPLOAD EXCESSIVE PHOTOS OR VIDEOS (in quantity or size) AS WE CANNOT AFFORD FOR THESE TO BE SAVED IN THE S3 BUCKET.
Thank you for your cooperation.

## As a user
### New to the site?
Start by signing up and creating an account. You will be prompted to enter some basic information about yourself and your musical interests.

### Returning user?
Log in to your account to see your information and interact with other users.

### Guide to the site
- Home: Match with people here! Select a "match mode" (Concert Buddies or Musicians) depending on whether or not you're looking for a concert buddy or someone to jam with.
- Profile: Update and add any changes to your personal profile here
- Messages: Converse with friends
- Notifications: See any recent activity that you might have missed
- Events: Find music events in your area


## As a developer
Good luck.


# Figma Storyboard

https://www.figma.com/files/team/1562171713696228317/project/478828045/user-profile-and-swiping-page-figma?fuid=1562170179457328451

Code linter/style checker:
- We will be using the following to style our code:
  - https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
  - https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
 To install these:
- Open VScode, click the extensions tab on the left, search "Prettier" and install the "Prettier- Code Checker" option
- Search "ESLint" and install 

# Deployment Link
https://ashy-hill-04c3bda0f.6.azurestaticapps.net/

# Product Specification
https://docs.google.com/document/d/1cBSxzDnsi8fmFt1OEzrzvhNNLxf60j3GwNR_LEQkPOk/edit?usp=sharing

# Code Covergae Report
<img width="727" height="360" alt="image" src="https://github.com/user-attachments/assets/7c41a39e-915f-4033-b2af-860cfab8469f" />

# Final 308 Demo with Narration 
https://youtu.be/d43Ztc0KPag

# Database Setup 
This project uses **PostgreSQL** as the database with support for multiple environments (Production, Development). The database is hosted on [Neon](https://neon.tech/).

## Environment Setup
1. Go to [Neon Tech](https://neon.tech/) and Copy your connection strings from the dashboard (for production and development). It should look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

2. Create a `.env` file in the **root directory** of your project:

```env
DEVELOPMENT_CONNECTION_STRING=
PORT=8000
DB_TYPE=DEVELOPMENT
JWT_SECRET=
