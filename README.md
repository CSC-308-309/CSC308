#Figma Storyboard

https://www.figma.com/files/team/1562171713696228317/project/478828045/user-profile-and-swiping-page-figma?fuid=1562170179457328451

Code linter/style checker:
- We will be using the following to style our code:
  - https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
  - https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
 To install these:
- Open VScode, click the extensions tab on the left, search "Prettier" and install the "Prettier- Code Checker" option
- Search "ESLint" and install 

# Database Setup 

1. **Connecting to the DB**
   - Go to [Neon Tech](https://neon.tech/)
   - In your Neon dashboard, go to the "Connection Details" section and get your connection string
   - In your project's root directory, create a `.env` file if it doesn't exist and add the connection string:
     ```
     DATABASE_CONNECTION_STRING=your_neon_connection_string_here
     ```

2. **Install Dependencies**
   Make sure you have these dependencies installed in your backend:
   ```bash
   npm install pg
