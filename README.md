# Figma Storyboard

https://www.figma.com/files/team/1562171713696228317/project/478828045/user-profile-and-swiping-page-figma?fuid=1562170179457328451

Code linter/style checker:
- We will be using the following to style our code:
  - https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
  - https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
 To install these:
- Open VScode, click the extensions tab on the left, search "Prettier" and install the "Prettier- Code Checker" option
- Search "ESLint" and install 

# Product Specification
https://docs.google.com/document/d/1cBSxzDnsi8fmFt1OEzrzvhNNLxf60j3GwNR_LEQkPOk/edit?usp=sharing

# Database Setup 
This project uses **PostgreSQL** as the database with support for multiple environments (Production, Development). The database is hosted on [Neon](https://neon.tech/).

## Environment Setup
1. Go to [Neon Tech](https://neon.tech/) and Copy your connection strings from the dashboard (for production and development). It should look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

2. Create a `.env` file in the **root directory** of your project:

```env
DB_TYPE=PRODUCTION/DEVELOPMENT
PRODUCTION_CONNECTION_STRING=
TEST_CONNECTION_STRING= (Optional for local testing)
DEVELOPMENT_CONNECTION_STRING=
PORT=8000
